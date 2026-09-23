import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/admin-store";
import { hashPassword, verifyToken, COOKIE_NAME } from "@/lib/admin-auth";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json((await admins.list()).map(a => ({ ...a, passwordHash: undefined, resetTokenHash: undefined, resetTokenExpiry: undefined })));
}

export async function POST(req: NextRequest) {
  const { name, email, role, password } = await req.json();
  if (await admins.findByEmail(email)) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const item = await admins.create({ name, email, role, passwordHash });
  return NextResponse.json({ ...item, passwordHash: undefined });
}

export async function PATCH(req: NextRequest) {
  const { id, password, ...data } = await req.json();

  // Verify requester is super-admin
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const update: Record<string, unknown> = { ...data };
  if (password) update.passwordHash = await hashPassword(password);
  await admins.update(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await snapshot("admins.json");
  const { id } = await req.json();
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.id === id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }
  await admins.delete(id);
  return NextResponse.json({ ok: true });
}
