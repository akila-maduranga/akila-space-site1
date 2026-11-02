import { NextResponse } from "next/server";
import { Resend } from "resend";

/* POST /api/email-forward — Resend "email.received" webhook
   Forwards mail for any @CONTACT_DOMAIN address to your private inbox,
   with the original sender shown in the display name, subject and a banner.

   Env vars:
     RESEND_API_KEY         required
     CONTACT_FORWARD_TO     optional (default below)
     CONTACT_DOMAIN         optional (default: akila.space)
     RESEND_WEBHOOK_SECRET  optional but recommended — verifies the webhook */

const DEFAULT_FORWARD_TO = "akilamaduranga91@gmail.com";
const DEFAULT_DOMAIN = "akila.space";

interface ReceivedEvent {
  type?: string;
  data?: { email_id?: string; to?: string[] };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

// 'John Doe <john@example.com>' -> { name: 'John Doe', address: 'john@example.com' }
function parseAddress(raw: string) {
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const address = (m ? m[2] : raw).trim();
  const name = (m ? m[1] : "").trim() || address;
  return { name, address };
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, configured: false });
  }

  const resend = new Resend(apiKey);
  const raw = await req.text();

  let event: ReceivedEvent;
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (secret) {
      // Signature check (confirm the method name in Resend's webhook docs)
      event = resend.webhooks.verify({
        payload: raw,
        headers: {
          id: req.headers.get("svix-id") ?? "",
          timestamp: req.headers.get("svix-timestamp") ?? "",
          signature: req.headers.get("svix-signature") ?? "",
        },
        webhookSecret: secret,
      }) as ReceivedEvent;
    } else {
      event = JSON.parse(raw);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (event.type !== "email.received" || !event.data?.email_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Only forward mail addressed to your own domain
  const domain = (process.env.CONTACT_DOMAIN || DEFAULT_DOMAIN).toLowerCase();
  const recipients = (event.data.to ?? []).map((t) =>
    parseAddress(String(t)).address.toLowerCase()
  );
  if (!recipients.some((t) => t.endsWith(`@${domain}`))) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Fetch the full message (the webhook only has metadata)
  const { data: mail, error: getError } = await resend.emails.receiving.get(
    event.data.email_id
  );
  if (getError || !mail) {
    return NextResponse.json(
      { ok: false, error: getError?.message ?? "Fetch failed" },
      { status: 500 }
    );
  }

  const sender = parseAddress(String(mail.from));
  const subject = mail.subject || "(no subject)";
  const toAddr = recipients.find((t) => t.endsWith(`@${domain}`)) ?? `contact@${domain}`;
  const safeName = sender.name.replace(/[<>"\\,;]/g, "").slice(0, 60) || "Unknown";

  const banner = `
    <div style="padding:12px 14px;margin-bottom:16px;background:#f3f4f6;border-left:4px solid #6366f1;font-family:Arial,sans-serif;font-size:14px;color:#111">
      <div><strong>From:</strong> ${esc(sender.name)} &lt;${esc(sender.address)}&gt;</div>
      <div><strong>To:</strong> ${esc(toAddr)}</div>
      <div><strong>Subject:</strong> ${esc(subject)}</div>
    </div>`;
  const textBanner =
    `From: ${sender.name} <${sender.address}>\nTo: ${toAddr}\nSubject: ${subject}\n` +
    `------------------------------\n\n`;

  const { error } = await resend.emails.send({
    from: `${safeName} via ${domain} <contact@${domain}>`,
    to: process.env.CONTACT_FORWARD_TO || DEFAULT_FORWARD_TO,
    replyTo: sender.address,
    subject: `[${safeName}] ${subject}`,
    html: banner + (mail.html ?? `<pre style="font-family:inherit">${esc(mail.text ?? "")}</pre>`),
    text: textBanner + (mail.text ?? ""),
  });

  if (error) {
    // 500 makes Resend retry the webhook
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
