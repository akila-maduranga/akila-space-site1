import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_PASSWORD = "admin123";
const MAX_ATTEMPTS = 3;
const LOCK_HOURS = 24;

/* ────────────────────────────────────────────────────────────
   Brute-force protection: 3 wrong passwords from one source
   → 24-hour lockout for that source.

   The lock state lives in the `admin_auth_attempts` table (created by
   supabase/schema.sql) when Supabase is configured — so it survives
   across serverless instances. Only a salted SHA-256 hash of the IP is
   stored, never the IP itself. Without Supabase (demo mode) an
   in-memory map is used — best effort on serverless, exact on a single
   local server.
   ──────────────────────────────────────────────────────────── */

interface LockState {
  failedCount: number;
  lockedUntil: Date | null;
}

function clientIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip =
    fwd.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return createHash("sha256").update(`${ip}::cosmosfolio::lockout-salt`).digest("hex");
}

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// demo-mode fallback (single server)
const memoryAttempts = new Map<string, LockState>();

async function getLock(sb: SupabaseClient | null, ipHash: string): Promise<LockState> {
  if (!sb) {
    const m = memoryAttempts.get(ipHash);
    return m ? { failedCount: m.failedCount, lockedUntil: m.lockedUntil } : { failedCount: 0, lockedUntil: null };
  }
  const { data } = await sb
    .from("admin_auth_attempts")
    .select("failed_count, locked_until")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  if (!data) return { failedCount: 0, lockedUntil: null };
  return {
    failedCount: Number(data.failed_count) || 0,
    lockedUntil: data.locked_until ? new Date(String(data.locked_until)) : null,
  };
}

async function recordFailure(sb: SupabaseClient | null, ipHash: string, prev: LockState): Promise<LockState> {
  // a previous lock that has already expired means we start counting fresh
  const expired = prev.lockedUntil !== null && prev.lockedUntil.getTime() <= Date.now();
  const failedCount = expired ? 1 : prev.failedCount + 1;
  const lockedUntil =
    failedCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_HOURS * 60 * 60 * 1000) : null;

  if (!sb) {
    memoryAttempts.set(ipHash, { failedCount, lockedUntil });
    return { failedCount, lockedUntil };
  }
  const { error } = await sb.from("admin_auth_attempts").upsert({
    ip_hash: ipHash,
    failed_count: failedCount,
    locked_until: lockedUntil ? lockedUntil.toISOString() : null,
    last_attempt_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { failedCount, lockedUntil };
}

async function clearFailures(sb: SupabaseClient | null, ipHash: string): Promise<void> {
  if (!sb) {
    memoryAttempts.delete(ipHash);
    return;
  }
  await sb.from("admin_auth_attempts").delete().eq("ip_hash", ipHash);
}

/** timing-safe compare that also hides the password's length */
function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";
    const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

    const sb = serviceClient();
    const ipHash = clientIpHash(req);

    // 1. is this source locked out?
    let lock: LockState;
    try {
      lock = await getLock(sb, ipHash);
    } catch {
      // lock table unreachable — fail closed-ish: allow the attempt but
      // skip persistence (better than locking the owner out entirely)
      lock = { failedCount: 0, lockedUntil: null };
    }
    if (lock.lockedUntil && lock.lockedUntil.getTime() > Date.now()) {
      const hoursLeft = Math.max(
        1,
        Math.ceil((lock.lockedUntil.getTime() - Date.now()) / (60 * 60 * 1000))
      );
      return NextResponse.json(
        {
          ok: false,
          locked: true,
          error: `Too many failed attempts — locked for 24 hours (about ${hoursLeft}h left).`,
        },
        { status: 429, headers: { "Retry-After": String(hoursLeft * 3600) } }
      );
    }

    // 2. verify the password
    if (!safeEqual(password, expected)) {
      // small fixed delay to slow down online brute force
      await sleep(250);
      let next: LockState;
      try {
        next = await recordFailure(sb, ipHash, lock);
      } catch {
        next = { failedCount: lock.failedCount + 1, lockedUntil: null };
      }
      if (next.lockedUntil) {
        return NextResponse.json(
          {
            ok: false,
            locked: true,
            error: "Too many failed attempts — this device is locked out for 24 hours.",
          },
          { status: 429 }
        );
      }
      const left = Math.max(0, MAX_ATTEMPTS - next.failedCount);
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid password — ${left} attempt${left === 1 ? "" : "s"} left before a 24-hour lockout.`,
        },
        { status: 401 }
      );
    }

    // 3. success — reset the counter and issue the session token
    try {
      await clearFailures(sb, ipHash);
    } catch {
      /* clearing is best-effort; the lock still expires on its own */
    }

    const token = createHash("sha256")
      .update(`${expected}::cosmosfolio::v1`)
      .digest("hex");

    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
