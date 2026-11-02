import { NextResponse } from "next/server";

/**
 * Tiny public endpoint that reports the visitor's country, derived from
 * edge/proxy headers. On Vercel this is `x-vercel-ip-country` (ISO 3166-1
 * alpha-2, e.g. "LK"); Cloudflare uses `cf-ipcountry`. Used only for the
 * anonymous click/visit analytics — no IP address is ever read, stored or
 * returned by this route.
 */
export async function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    "";

  const clean = country.trim().toUpperCase().slice(0, 2);

  return NextResponse.json(
    { country: /^[A-Z]{2}$/.test(clean) ? clean.toLowerCase() : "unknown" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
