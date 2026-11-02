import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEED_EXPERIENCES, SEED_PAGES, SEED_PHOTOS, SEED_POSTS, SEED_PROFILE, SEED_PROJECTS, SEED_SKILLS, SEED_SOCIAL_LINKS } from "@/lib/seed";

const DEFAULT_PASSWORD = "admin123";

/** Supabase/PostgREST errors are plain objects, not Error instances — pull
 *  the message out without collapsing everything to "[object Object]". */
function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
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

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured on the server. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function slugId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type Payload = Record<string, unknown>;

export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sb: SupabaseClient;
  try {
    sb = serviceClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server misconfigured" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const action: string = body.action;
  const payload: Payload = body.payload || {};

  try {
    switch (action) {
      case "save_profile": {
        const { id, ...rest } = payload as unknown as typeof SEED_PROFILE & { id: string };
        const row = {
          ...rest,
          roles: rest.roles,
        };
        const { error } = await sb.from("profile").upsert({ id: id || "profile-1", ...row });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_project": {
        const p = payload as unknown as (typeof SEED_PROJECTS)[number];
        const { error } = await sb.from("projects").upsert({
          ...p,
          id: p.id || slugId("proj"),
          tech: p.tech,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, id: p.id || slugId("proj") });
      }

      case "delete_project": {
        const { error } = await sb.from("projects").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_link": {
        const l = payload as unknown as (typeof SEED_SOCIAL_LINKS)[number];
        const { error } = await sb.from("social_links").upsert({
          ...l,
          id: l.id || slugId("link"),
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "delete_link": {
        const { error } = await sb.from("social_links").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_skill": {
        const s = payload as unknown as (typeof SEED_SKILLS)[number];
        const { error } = await sb.from("skills").upsert({
          ...s,
          id: s.id || slugId("skill"),
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "delete_skill": {
        const { error } = await sb.from("skills").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_experience": {
        const e = payload as unknown as (typeof SEED_EXPERIENCES)[number];
        const { error } = await sb.from("experiences").upsert({
          ...e,
          id: e.id || slugId("exp"),
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "delete_experience": {
        const { error } = await sb.from("experiences").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_photo": {
        const p = payload as unknown as (typeof SEED_PHOTOS)[number];
        const { error } = await sb.from("photos").upsert({
          ...p,
          id: p.id || slugId("photo"),
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, id: p.id || slugId("photo") });
      }

      case "delete_photo": {
        const { error } = await sb.from("photos").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_post": {
        const p = payload as unknown as (typeof SEED_POSTS)[number];
        const { error } = await sb.from("posts").upsert({
          ...p,
          id: p.id || slugId("post"),
          tags: p.tags,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, id: p.id || slugId("post") });
      }

      case "delete_post": {
        const { error } = await sb.from("posts").delete().eq("id", String(payload.id));
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "save_page": {
        const p = payload as unknown as (typeof SEED_PAGES)[number];
        const { error } = await sb.from("page_sections").upsert({
          key: p.key,
          label: p.label,
          description: p.description ?? "",
          visible: p.visible !== false,
          sort_order: Number(p.sort_order) || 0,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case "seed_content": {
        // Insert seed rows only if the tables are empty
        const { count } = await sb.from("profile").select("id", { count: "exact", head: true });
        if ((count ?? 0) === 0) {
          await sb.from("profile").insert(SEED_PROFILE);
        }
        const { count: projCount } = await sb
          .from("projects")
          .select("id", { count: "exact", head: true });
        if ((projCount ?? 0) === 0) {
          await sb.from("projects").insert(SEED_PROJECTS);
        }
        const { count: linkCount } = await sb
          .from("social_links")
          .select("id", { count: "exact", head: true });
        if ((linkCount ?? 0) === 0) {
          await sb.from("social_links").insert(SEED_SOCIAL_LINKS);
        }
        const { count: skillCount } = await sb
          .from("skills")
          .select("id", { count: "exact", head: true });
        if ((skillCount ?? 0) === 0) {
          await sb.from("skills").insert(SEED_SKILLS);
        }
        const { count: expCount } = await sb
          .from("experiences")
          .select("id", { count: "exact", head: true });
        if ((expCount ?? 0) === 0) {
          await sb.from("experiences").insert(SEED_EXPERIENCES);
        }
        const { count: photoCount } = await sb
          .from("photos")
          .select("id", { count: "exact", head: true });
        if ((photoCount ?? 0) === 0) {
          await sb.from("photos").insert(SEED_PHOTOS);
        }
        const { count: postCount } = await sb
          .from("posts")
          .select("id", { count: "exact", head: true });
        if ((postCount ?? 0) === 0) {
          await sb.from("posts").insert(SEED_POSTS);
        }
        const { count: pageCount } = await sb
          .from("page_sections")
          .select("key", { count: "exact", head: true });
        if ((pageCount ?? 0) === 0) {
          await sb.from("page_sections").insert(SEED_PAGES);
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: errMsg(err) },
      { status: 500 }
    );
  }
}
