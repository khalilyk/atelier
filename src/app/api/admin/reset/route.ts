import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/admin-store";
import { hashToken, hashPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function findByToken(token: string) {
  if (!token) return null;
  const hash = await hashToken(token);
  const all = await admins.list();
  return all.find(a => a.resetTokenHash && a.resetTokenHash === hash && (a.resetTokenExpiry ?? 0) > Date.now()) || null;
}

// GET - validate a token (used by the reset page to show a valid/expired state)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const admin = await findByToken(token);
  return NextResponse.json({ valid: !!admin }, { headers: { "Cache-Control": "no-store" } });
}

// POST - set a new password using a valid token
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    const admin = await findByToken(token);
    if (!admin) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    await admins.update(admin.id, { passwordHash, resetTokenHash: "", resetTokenExpiry: 0 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
