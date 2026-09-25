import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { admins } from "@/lib/admin-store";
import { generateResetToken, hashToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@ateliersupplygroup.com.au";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function resetHtml(name: string, link: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:520px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:26px;margin:0 0 16px">Reset your password</h1>
    <p style="color:#a08060;font-size:15px;line-height:1.7;margin:0 0 28px">Hi ${name || "there"}, we received a request to reset your admin password. This link is valid for one hour.</p>
    <a href="${link}" style="display:inline-block;background:#b8934a;color:#fff;text-decoration:none;padding:14px 28px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.08em">RESET PASSWORD →</a>
    <p style="color:#6b6560;font-size:12px;line-height:1.7;margin:28px 0 0">If you didn't request this, you can safely ignore this email - your password won't change.</p>
    <p style="color:#4a4540;font-size:11px;line-height:1.6;margin:16px 0 0;word-break:break-all">${link}</p>
  </div>
</body></html>`;
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
          html: resetHtml(admin.name, link),
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
