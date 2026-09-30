import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { admins, company as companyStore } from "@/lib/admin-store";
import { hashPassword, generateResetToken, hashToken } from "@/lib/admin-auth";
import { emailShell, paragraph } from "@/lib/email-layout";
import { SITE_NAME } from "@/lib/seo";
import { snapshot } from "@/lib/blob-backup";
import { normaliseRole, isSuperAdmin, type Role } from "@/lib/roles";
import { requireArea, caller } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

/** An invitation stays usable longer than a forgotten-password link. */
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * New people are invited, not handed a password: a password mailed in plain
 * text lives in an inbox forever. They set their own through the same reset
 * page a forgotten password uses.
 */
async function sendSetPasswordEmail(
  req: NextRequest,
  person: { id: string; name: string; email: string },
  kind: "invite" | "reset",
) {
  const token = generateResetToken();
  await admins.update(person.id, {
    resetTokenHash: await hashToken(token),
    resetTokenExpiry: Date.now() + INVITE_TTL_MS,
  });

  const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;
  const link = `${siteUrl}/admin/reset?token=${token}`;
  const first = person.name.split(" ")[0] || person.name;
  const c = await companyStore.get();

  if (!process.env.RESEND_API_KEY) throw new Error("No RESEND_API_KEY configured");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    // The trading name, as every other email uses - c.name is the legal
    // entity and reads "... Pty Ltd" in an inbox.
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    to: person.email,
    subject: kind === "invite" ? `Your ${SITE_NAME} admin account` : "Set a new admin password",
    html: emailShell({
      preheader: kind === "invite"
        ? "Choose a password and your account is ready."
        : "Choose a new password for the admin.",
      eyebrow: "Admin",
      heading: kind === "invite" ? `Welcome, ${first}.` : `Hello, ${first}.`,
      intro: kind === "invite"
        ? `An account has been created for you on the ${SITE_NAME} website admin. Choose a password and you are in.`
        : "A new password has been requested for your admin account. Choose one below.",
      body: paragraph("The link is valid for seven days. If it expires, ask a Super Admin to send another.")
        + `<p style="margin:12px 0 0 0;color:#4a4540;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;word-break:break-all;">${link}</p>`,
      cta: { href: link, label: kind === "invite" ? "Set your password" : "Choose a new password" },
      company: c,
      siteUrl,
    }),
  });
  if (error) throw new Error(typeof error === "string" ? error : "The email could not be sent");
}

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
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "A name and email are required" }, { status: 400 });
  }
  if (await admins.findByEmail(email)) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  // With no password given, the account starts unusable until they set one
  // from the emailed link. The random hash is never a valid sign-in.
  const passwordHash = await hashPassword(password || generateResetToken());
  const item = await admins.create({ name, email, role: normaliseRole(role) as Role, passwordHash });

  let invited = false;
  if (!password) {
    try {
      await sendSetPasswordEmail(req, item, "invite");
      invited = true;
    } catch (err) {
      console.error("Invite email failed", err);
      // The account exists; say so rather than pretending it was sent.
      return NextResponse.json({ ...item, passwordHash: undefined, invited: false,
        warning: "The account was created, but the invitation email could not be sent. Send it again from their row." });
    }
  }
  return NextResponse.json({ ...item, passwordHash: undefined, invited });
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

/** Send, or re-send, the set-a-password email for someone. */
export async function PUT(req: NextRequest) {
  const gate = await requireArea(req, "accounts");
  if (gate.error) return gate.error;

  const { id } = await req.json();
  const person = (await admins.list()).find((a) => a.id === id);
  if (!person) return NextResponse.json({ error: "No such person" }, { status: 404 });

  try {
    await sendSetPasswordEmail(req, person, "reset");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset email failed", err);
    return NextResponse.json({ error: "The email could not be sent" }, { status: 502 });
  }
}
