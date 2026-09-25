import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { admins, company as companyStore, Company } from "@/lib/admin-store";
import { emailShell, paragraph } from "@/lib/email-layout";
import { generateResetToken, hashToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function resetHtml(name: string, link: string, siteUrl: string, c: Company) {
  return emailShell({
    preheader: "Reset your Atelier admin password. The link is valid for one hour.",
    eyebrow: "Admin",
    heading: "Reset your password",
    intro: `Hi ${name || "there"}, we received a request to reset your admin password. This link is valid for one hour.`,
    body: paragraph(`<span style="color:#6b6560;font-size:12px;">If you didn&rsquo;t request this, you can safely ignore this email &mdash; your password won&rsquo;t change.</span>`)
        + `<p style="margin:12px 0 0 0;color:#4a4540;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;word-break:break-all;">${link}</p>`,
    cta: { href: link, label: "Reset password" },
    company: c, siteUrl,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const admin = email ? await admins.findByEmail(email) : null;

    // Only act if the account exists - but always respond the same way (no enumeration)
    if (admin) {
      const token = generateResetToken();
      const resetTokenHash = await hashToken(token);
      await admins.update(admin.id, { resetTokenHash, resetTokenExpiry: Date.now() + TOKEN_TTL_MS });

      const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;
      const link = `${siteUrl}/admin/reset?token=${token}`;

      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: admin.email,
          subject: "Reset your Atelier admin password",
          html: resetHtml(admin.name, link, siteUrl, await companyStore.get()),
        });
      } catch (err) {
        // Email not configured / failed - log the link so the account owner can retrieve it from server logs
        console.error("Password reset email failed to send. Reset link:", link, err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
