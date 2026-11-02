import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "admin123";

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

/**
 * Configuration health check for the admin dashboard. Answers three
 * questions the dashboard needs to warn its owner about:
 *  - publicConfigured : are the NEXT_PUBLIC_* vars set? (public site reads)
 *  - serviceConfigured: is the service-role key set? (admin writes)
 *  - dbReachable      : can the server actually query Supabase?
 * Knowing exactly which of these is false turns "my edits don't save" into
 * an actionable message instead of silent failure.
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({
      ok: true,
      publicConfigured: Boolean(url),
      serviceConfigured: false,
      dbReachable: false,
      detail:
        "SUPABASE_SERVICE_ROLE_KEY is not set on the server — admin edits are NOT being saved. Add it in Vercel → Settings → Environment Variables, then redeploy.",
    });
  }

  try {
    const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { error } = await sb.from("page_sections").select("key", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      publicConfigured: true,
      serviceConfigured: true,
      dbReachable: true,
      detail: "Supabase connected — edits save straight to the database.",
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      publicConfigured: true,
      serviceConfigured: true,
      dbReachable: false,
      detail:
        err instanceof Error
          ? `Supabase rejected the server connection: ${err.message}`
          : "Supabase rejected the server connection.",
    });
  }
}
