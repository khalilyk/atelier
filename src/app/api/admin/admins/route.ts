import { NextRequest, NextResponse } from "next/server";
import { admins } from "@/lib/admin-store";
import { hashPassword, verifyToken, COOKIE_NAME } from "@/lib/admin-auth";
import { snapshot } from "@/lib/blob-backup";
import { isOwner, ROLE_KEYS, type Role } from "@/lib/roles";

export const dynamic = "force-dynamic";

/**
 * The middleware only establishes that the caller is signed in. Accounts are
 * the one place where the role has to be checked as well: without this an
 * editor could promote themselves, change the owner's password or delete them.
 */
async function requireOwner(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isOwner(payload.role as string)) {
    return { error: NextResponse.json({ error: "Only an owner can manage accounts" }, { status: 403 }) };
  }
  return { payload };
}

const cleanRole = (role: unknown): Role =>
  ROLE_KEYS.includes(role as Role) ? (role as Role) : "editor";

export async function GET() {
  return NextResponse.json((await admins.list()).map(a => ({ ...a, passwordHash: undefined, resetTokenHash: undefined, resetTokenExpiry: undefined })));
}

export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (gate.error) return gate.error;

  const { name, email, role, password } = await req.json();
  if (!password) return NextResponse.json({ error: "A password is required" }, { status: 400 });
  if (await admins.findByEmail(email)) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const item = await admins.create({ name, email, role: cleanRole(role), passwordHash });
  return NextResponse.json({ ...item, passwordHash: undefined });
}

export async function PATCH(req: NextRequest) {
  // Anyone may edit their own name, email and password from Your Account.
  // Editing someone else, or touching a role, is an owner's job.
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, password, ...data } = await req.json();
  const own = payload.id === id;
  const owner = isOwner(payload.role as string);
  if (!own && !owner) {
    return NextResponse.json({ error: "Only an owner can edit other accounts" }, { status: 403 });
  }
  if ("role" in data && !owner) {
    return NextResponse.json({ error: "Only an owner can change a role" }, { status: 403 });
  }

  const update: Record<string, unknown> = { ...data };
  if ("role" in update) update.role = cleanRole(update.role);

  // The last owner must stay an owner, or nobody can manage accounts again.
  if (update.role && !isOwner(update.role as string)) {
    const all = await admins.list();
    const owners = all.filter((a) => isOwner(a.role));
    if (owners.length === 1 && owners[0].id === id) {
      return NextResponse.json({ error: "This is the only owner - promote someone else first" }, { status: 400 });
    }
  }

  if (password) update.passwordHash = await hashPassword(password);
  await admins.update(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const gate = await requireOwner(req);
  if (gate.error) return gate.error;
  const { payload } = gate;

  const { id } = await req.json();
  if (payload!.id === id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const all = await admins.list();
  const owners = all.filter((a) => isOwner(a.role));
  if (owners.length === 1 && owners[0].id === id) {
    return NextResponse.json({ error: "This is the only owner" }, { status: 400 });
  }

  await snapshot("admins.json");
  await admins.delete(id);
  return NextResponse.json({ ok: true });
}
