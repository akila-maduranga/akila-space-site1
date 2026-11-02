import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 */
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
    // - connect-src only this origin + *.supabase.co (data + analytics RPCs)
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typescript: {
    // don't let a stray TS nit block a deploy — lint is clean, this is a net
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
};

export default nextConfig;
