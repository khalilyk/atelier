import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/admin-store";
import { hashPassword } from "@/lib/admin-auth";
import { snapshot } from "@/lib/blob-backup";
import { normaliseRole, isSuperAdmin, type Role } from "@/lib/roles";
import { requireArea, caller } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

/** Only a Super Admin manages accounts, so "accounts" gates the whole route. */
export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "accounts");
  if (gate.error) return gate.error;
  return NextResponse.json((await admins.list()).map(a => ({ ...a, passwordHash: undefined, resetTokenHash: undefined, resetTokenExpiry: undefined })));
}

export async function POST(req: NextRequest) {
  const gate = await requireArea(req, "accounts");
  if (gate.error) return gate.error;

  const { name, email, role, password } = await req.json();
  if (!password) return NextResponse.json({ error: "A password is required" }, { status: 400 });
  if (await admins.findByEmail(email)) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const item = await admins.create({ name, email, role: normaliseRole(role) as Role, passwordHash });
  return NextResponse.json({ ...item, passwordHash: undefined });
}

export async function PATCH(req: NextRequest) {
  // Everyone may change their own name, email and password from Your Account.
  // Editing anyone else, or any role at all, is a Super Admin's job.
  const me = await caller(req);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, password, ...data } = await req.json();
  const own = me.id === id;
  const boss = isSuperAdmin(me.role);
  if (!own && !boss) return NextResponse.json({ error: "Only a Super Admin can edit other accounts" }, { status: 403 });
  if ("role" in data && !boss) return NextResponse.json({ error: "Only a Super Admin can change a role" }, { status: 403 });

  const update: Record<string, unknown> = { ...data };
  if ("role" in update) update.role = normaliseRole(update.role as string);

  // The last Super Admin has to stay one, or nobody can manage accounts again.
  if (update.role && update.role !== "super-admin") {
    const bosses = (await admins.list()).filter((a) => isSuperAdmin(a.role));
    if (bosses.length === 1 && bosses[0].id === id) {
      return NextResponse.json({ error: "This is the only Super Admin - promote someone else first" }, { status: 400 });
    }
  }

  if (password) update.passwordHash = await hashPassword(password);
  await admins.update(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const gate = await requireArea(req, "accounts");
  if (gate.error) return gate.error;

  const { id } = await req.json();
  if (gate.me.id === id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  const bosses = (await admins.list()).filter((a) => isSuperAdmin(a.role));
  if (bosses.length === 1 && bosses[0].id === id) {
    return NextResponse.json({ error: "This is the only Super Admin" }, { status: 400 });
  }

  await snapshot("admins.json");
  await admins.delete(id);
  return NextResponse.json({ ok: true });
}
