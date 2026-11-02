import type { NextConfig } from "next";

/**
 * Security headers applied to every response (source project config —
 * the packaged ZIP ships the same headers without `output: standalone`).
 */

/**
 * connect-src must allow the Supabase REST origin the client actually
 * talks to. Hard-coding https://*.supabase.co silently breaks public reads
 * (the browser blocks them → the site falls back to demo content) for any
 * project not on that domain — e.g. self-hosted Supabase. Derive it from
 * the configured URL instead; fall back to the wildcard when unset.
 */
function supabaseConnectSrc(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const u = new URL(url);
      const scheme = u.protocol.replace(":", "");
      const ws = scheme === "https" ? "wss" : "ws";
      return `${scheme}://${u.host} ${ws}://${u.host}`;
    } catch {
      /* malformed URL — fall through to the default */
    }
  }
  return "https://*.supabase.co wss://*.supabase.co";
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    // Content-Security-Policy: tuned for what this app actually loads.
    // - 'unsafe-inline' script is required by Next.js inline bootstrap
    // - 'unsafe-inline' style is required by framer-motion/Vanta inline styles
    // - img-src https: covers Cloudflare R2 photo URLs and brand icons
    // - connect-src: this origin + the configured Supabase origin (see
    //   supabaseConnectSrc above — never hard-code the Supabase domain)
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src 'self' ${supabaseConnectSrc()}`,
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // belt-and-braces with the page's own noindex metadata
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
  // E2E only (never set in production): proxies a mock Supabase through
  // this origin so the headless test browser can reach it same-origin.
  async rewrites() {
    if (process.env.E2E_MOCK_URL) {
      return [
        {
          source: "/mock-api/:path*",
          destination: `${process.env.E2E_MOCK_URL}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
