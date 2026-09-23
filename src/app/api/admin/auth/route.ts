import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/admin-store";
import { comparePassword, hashPassword, signToken, verifyToken, COOKIE_NAME } from "@/lib/admin-auth";

// POST /api/admin/auth - login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  let admin = await admins.findByEmail(email);

  // First-time setup: if no password hash, set it (bootstrap).
  // Use the just-computed hash in memory rather than re-reading - a re-read can
  // return a stale value (Blob read-after-write lag) and falsely reject the login.
  if (admin && !admin.passwordHash) {
    const hash = await hashPassword(password);
    await admins.update(admin.id, { passwordHash: hash });
    admin = { ...admin, passwordHash: hash };
  }

  if (!admin || !(await comparePassword(password, admin.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({ id: admin.id, email: admin.email, role: admin.role });

  const res = NextResponse.json({ ok: true, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

// DELETE /api/admin/auth - logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}

// GET /api/admin/auth - get current user
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ admin: null });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ admin: null });
  const admin = await admins.findById(payload.id as string);
  if (!admin) return NextResponse.json({ admin: null });
  return NextResponse.json({ admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
}
