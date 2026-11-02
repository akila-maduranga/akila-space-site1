import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { Resend } from "resend";

/* ────────────────────────────────────────────────────────────
   POST /api/contact — public contact form → your private inbox

   Environment variables (see .env.example / SETUP guide):
     RESEND_API_KEY      required — resend.com API key (re_...)
     CONTACT_FROM_EMAIL  optional — "Portfolio Contact <contact@akila.space>"
     CONTACT_TO_EMAIL    optional — private inbox that receives the mail

   Without RESEND_API_KEY the route answers 503 { configured: false }
   so the form can fall back to a plain mailto: link.
   ──────────────────────────────────────────────────────────── */

const DEFAULT_FROM = "Portfolio Contact <contact@akila.space>";
const DEFAULT_TO = "akilamaduranga91@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** per-source rate limit — best effort (in-memory, like the login
 *  route's demo fallback; serverless instances each keep their own
 *  counter, which is enough to blunt casual spam) */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function overLimit(ipHash: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ipHash) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ipHash, recent);
    return true;
  }
  recent.push(now);
  hits.set(ipHash, recent);
  // keep the map small even under fake-IP spraying
  if (hits.size > 5000) hits.clear();
  return false;
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "Email is not configured on this deployment (missing RESEND_API_KEY).",
      },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // honeypot — real visitors never see or fill this field
  if (str(body.website, 200)) {
    // silently accept so the bot thinks it worked
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name, 100);
  const email = str(body.email, 200);
  const subject = str(body.subject, 150);
  const message = str(body.message, 5000);

  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please add your name, a valid email, and a message." },
      { status: 400 }
    );
  }

  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip =
    fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  if (overLimit(ipHash)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages from this device — try again in an hour." },
      { status: 429 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO,
    replyTo: email, // "Reply" in Gmail goes straight to the visitor
    subject: subject ? `Portfolio: ${subject}` : `Portfolio message from ${name}`,
    text: [
      `From: ${name} <${email}>`,
      subject ? `Subject: ${subject}` : "",
      "",
      message,
      "",
      "— sent from the contact form on your portfolio site",
    ]
      .filter((l) => l !== "")
      .join("\n"),
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "The message could not be sent. Please email me directly instead." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
