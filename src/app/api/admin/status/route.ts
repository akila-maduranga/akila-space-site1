import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "admin123";

/** Supabase/PostgREST errors are plain objects, not Error instances.
 *  HEAD-request errors can arrive with an EMPTY message — never let that
 *  collapse into a falsy "no error". */
function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const m = String((err as { message: unknown }).message).trim();
    if (m) return m;
    // empty message but an error OBJECT exists — keep it truthy
    const code = (err as { code?: unknown }).code;
    return code ? String(code) : "unknown Supabase error";
  }
  return String(err) || "unknown error";
}

function authorize(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const expectedToken = createHash("sha256")
    .update(`${expected}::cosmosfolio::v1`)
    .digest("hex");
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken);
  return a.length === b.length && a.equals(b);
}

/** Decodes the "role" claim out of a Supabase key (JWT) without verifying it. */
function keyRole(key: string | undefined): string | null {
  if (!key) return null;
  const part = key.split(".")[1];
  if (!part) return null;
  try {
    const json = JSON.parse(
      Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    return typeof json?.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

const MISSING_TABLES =
  /relation .* does not exist|schema cache|PGRST205|42P01|Could not find the table/i;

/**
 * Configuration health check for the admin dashboard.
 *
 * It walks the EXACT paths an edit takes and reports the first one that
 * breaks — so "my edits don't save / the site doesn't change" always comes
 * with an actionable reason instead of silent failure:
 *
 *   1. env vars set at all?                        (publicConfigured / serviceConfigured)
 *   2. SUPABASE_SERVICE_ROLE_KEY actually a
 *      service-role key? (the #1 mistake: pasting
 *      the anon key into it → every write silently
 *      rejected by RLS while reads keep working)   (serviceKeyRole)
 *   3. tables from supabase/schema.sql exist?      (tablesPresent)
 *   4. can the service key WRITE?
 *      (harmless UPDATE matching zero rows)        (writeProbeOk)
 *   5. can the PUBLIC site read with the anon key?
 *      (wrong anon key OR missing RLS read
 *      policies → silent demo-content fallback)   (anonReadable)
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const serviceRole = keyRole(serviceKey);
  const anonRole = keyRole(anonKey);

  const base = {
    ok: true,
    publicConfigured: Boolean(url && anonKey),
    serviceConfigured: Boolean(serviceKey),
    dbReachable: false,
    tablesPresent: false,
    writeProbeOk: false,
    anonReadable: false,
    serviceKeyRole: serviceRole ?? "unknown",
    anonKeyRole: anonRole ?? "unknown",
    detail: "",
  };

  if (!url || !serviceKey || !anonKey) {
    return NextResponse.json({
      ...base,
      detail:
        "Supabase env vars are missing on the server. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then REDEPLOY (env var changes only apply to new builds — NEXT_PUBLIC_* values are baked in at build time).",
    });
  }

  // ── probe 1: service read (reachability + tables + section count) ──
  const service: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  let readErr: string | null = null;
  let sectionCount = 0;
  try {
    const { count, error } = await service
      .from("page_sections")
      .select("key", { count: "exact" });
    if (error) throw error;
    sectionCount = count ?? 0;
  } catch (err) {
    readErr = errMsg(err);
  }

  // ── probe 2: harmless write (UPDATE matching zero rows) ────────────
  let writeErr: string | null = null;
  if (!readErr || MISSING_TABLES.test(readErr)) {
    try {
      const { error } = await service
        .from("page_sections")
        .update({ visible: true })
        .eq("key", "__cosmosfolio_probe__");
      if (error) throw error;
    } catch (err) {
      writeErr = errMsg(err);
    }
  }

  // ── probe 3: the public site's read path (anon key + RLS) ─────────
  let anonErr: string | null = null;
  let anonRows = -1;
  try {
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await anon.from("page_sections").select("key").limit(1);
    if (error) throw error;
    anonRows = (data || []).length;
  } catch (err) {
    anonErr = errMsg(err);
  }

  // ── diagnose, most actionable first ─────────────────────────────────
  const respond = (patch: Partial<typeof base> & { detail: string }) =>
    NextResponse.json({ ...base, ...patch });

  // wrong key pasted into the service slot (reads may work, writes never do)
  if (serviceRole === "anon" || serviceKey === anonKey) {
    return respond({
      dbReachable: readErr === null,
      tablesPresent: readErr === null,
      detail:
        "SUPABASE_SERVICE_ROLE_KEY contains the anon (public) key, not the service_role key — the database rejects every admin write while reads keep working. Copy the service_role key from Supabase → Settings → API → service_role (secret), put it in SUPABASE_SERVICE_ROLE_KEY and redeploy.",
    });
  }

  // the service key leaked into the public anon slot — rotate it
  if (anonRole === "service_role") {
    return respond({
      dbReachable: readErr === null,
      tablesPresent: readErr === null,
      detail:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY contains the service_role key — that key is exposed to every visitor's browser. Rotate it in Supabase → Settings → API, set the anon (publishable) key there instead, and redeploy.",
    });
  }

  // tables never created / schema.sql run failed halfway
  const anyErr = readErr || writeErr;
  if (anyErr && MISSING_TABLES.test(anyErr)) {
    return respond({
      dbReachable: true,
      detail:
        "The database is reachable but the portfolio tables don't exist — supabase/schema.sql was never fully run (a failed run rolls back). Open the Supabase SQL Editor, paste the WHOLE supabase/schema.sql file and Run it. It is safe to re-run at any time.",
    });
  }

  // generic read failure (bad URL, bad key, network)
  if (readErr) {
    return respond({
      detail: `The server can't query Supabase: ${readErr}. Double-check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API), then redeploy.`,
    });
  }

  // service key can't write (RLS / permissions / wrong role claim)
  if (writeErr) {
    return respond({
      dbReachable: true,
      tablesPresent: true,
      detail: `Edits can't be saved — the service key is not allowed to write: ${writeErr}. Verify SUPABASE_SERVICE_ROLE_KEY is the service_role key from Supabase → Settings → API.`,
    });
  }

  // public read path broken (wrong anon key)
  if (anonErr) {
    return respond({
      dbReachable: true,
      tablesPresent: true,
      writeProbeOk: true,
      detail: `Edits save, but the public site can't read the database with the anon key (${anonErr}) — so visitors (and this dashboard) silently see built-in demo content instead of your data. Check NEXT_PUBLIC_SUPABASE_ANON_KEY, and remember NEXT_PUBLIC_* values only take effect after a redeploy.`,
    });
  }

  // RLS with a missing read policy doesn't error — it silently returns
  // ZERO rows. If the DB has sections but the anon key sees none, the
  // public site is rendering demo content right now.
  if (anonRows === 0 && sectionCount > 0) {
    return respond({
      dbReachable: true,
      tablesPresent: true,
      writeProbeOk: true,
      detail:
        "The anon key can query the tables but sees 0 rows — the RLS read policies are missing (supabase/schema.sql was not fully run). Visitors and this dashboard are seeing built-in demo content, which is why edits look like they don't stick. Re-run the whole supabase/schema.sql in the Supabase SQL Editor — it is safe to re-run.",
    });
  }

  return respond({
    dbReachable: true,
    tablesPresent: true,
    writeProbeOk: true,
    anonReadable: true,
    detail: "Supabase connected — service writes and public reads both verified.",
  });
}
