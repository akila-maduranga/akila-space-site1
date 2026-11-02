import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

const DEFAULT_PASSWORD = "admin123";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";
    const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    const match = a.length === b.length && timingSafeEqual(a, b);

    if (!match) {
      return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
    }

    // Session token derived from the password + server salt
    const token = createHash("sha256")
      .update(`${expected}::cosmosfolio::v1`)
      .digest("hex");

    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
