import { NextResponse } from "next/server";
import { Resend } from "resend";

/* ────────────────────────────────────────────────────────────
   POST /api/email-forward — Resend "email.received" webhook

   Every mail that lands on your domain's Resend MX record
   (any address @akila.space, e.g. contact@akila.space) is
   forwarded to your private Gmail inbox automatically.

   Setup: Resend Dashboard → Webhooks → Create Webhook
     Endpoint:        https://akila.space/api/email-forward
     Selected event:  email.received

   Environment variables (see .env.example / SETUP guide):
     RESEND_API_KEY        required — resend.com API key (re_...)
     CONTACT_FORWARD_TO    optional — private inbox (default Gmail)
     CONTACT_DOMAIN        optional — only mail for this domain is
                           forwarded (default: akila.space)

   The endpoint is deliberately harmless to strangers: it only
   re-sends emails that already exist inside your own Resend
   account (identified by Resend's email_id), and only to your
   own private address.
   ──────────────────────────────────────────────────────────── */

const DEFAULT_FORWARD_TO = "akilamaduranga91@gmail.com";
const DEFAULT_DOMAIN = "akila.space";

interface ReceivedEvent {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // nothing we can do — but answer 200 so Resend doesn't retry forever
    return NextResponse.json({ ok: false, configured: false });
  }

  let event: ReceivedEvent;
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (event.type !== "email.received" || !event.data?.email_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // only forward mail addressed to your own domain
  const domain = (process.env.CONTACT_DOMAIN || DEFAULT_DOMAIN).toLowerCase();
  const recipients: string[] = Array.isArray(event.data.to)
    ? event.data.to.map((t) => String(t).toLowerCase())
    : [];
  if (!recipients.some((t) => t.endsWith(`@${domain}`))) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.receiving.forward({
    emailId: event.data.email_id,
    to: process.env.CONTACT_FORWARD_TO || DEFAULT_FORWARD_TO,
    from: `contact@${domain}`,
  });

  if (error) {
    // 500 makes Resend retry the webhook a few times — transient
    // failures (e.g. cold start) recover on their own
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
