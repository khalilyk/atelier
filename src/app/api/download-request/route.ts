import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { leads, company as companyStore } from "@/lib/admin-store";
import { RESOURCES, downloadPath } from "@/lib/download-token";
import { escapeHtml } from "@/lib/escape-html";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@atelier.thisisnn.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Who gets told about a new download. Same inbox(es) as the enquiry form.
const NOTIFY_EMAILS = (process.env.DOWNLOAD_NOTIFY_EMAILS ?? process.env.ENQUIRY_EMAILS ?? "ambert@ateliersupplygroup.com.au,info@ateliersupplygroup.com.au")
  .split(",").map((e) => e.trim()).filter(Boolean);

function notifyHtml(o: { name: string; email: string; label: string; when: string; adminUrl: string }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#f5f0e8;margin:0;padding:32px 20px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px">
    <p style="color:#b8934a;letter-spacing:0.14em;font-size:11px;margin:0 0 10px">NEW DOWNLOAD</p>
    <h1 style="color:#2c2620;font-weight:400;font-size:22px;margin:0 0 20px;font-family:Georgia,serif">${o.name} downloaded the ${o.label}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4b443c">
      <tr><td style="padding:6px 0;color:#8a8178;width:110px">Name</td><td style="padding:6px 0">${o.name}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178">Email</td><td style="padding:6px 0"><a href="mailto:${o.email}" style="color:#b8934a;text-decoration:none">${o.email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#8a8178">Guide</td><td style="padding:6px 0">${o.label}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8178">When</td><td style="padding:6px 0">${o.when}</td></tr>
    </table>
    <p style="margin:24px 0 0">
      <a href="${o.adminUrl}" style="display:inline-block;background:#b8934a;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:12px;letter-spacing:0.1em">VIEW ALL DOWNLOAD LEADS</a>
    </p>
    <p style="color:#8a8178;font-size:12px;line-height:1.7;margin:20px 0 0">Reply to this email to contact them directly.</p>
  </div>
</body></html>`;
}

function thankYouHtml(opts: {
  firstName: string; label: string; fileUrl: string; siteUrl: string;
  email: string; phone: string; website: string;
}) {
  const { firstName, label, fileUrl, siteUrl, email, phone, website } = opts;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin:0 0 8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 24px">Thank you, ${firstName}.</h1>

    <p style="color:#c9bfae;font-size:15px;line-height:1.8;margin:0 0 18px">
      Here is your copy of the <strong style="color:#e8e0d0">${label}</strong>. We hope it helps as you work through your selections.
    </p>

    <p style="margin:0 0 28px">
      <a href="${siteUrl}${fileUrl}"
         style="display:inline-block;background:#b8934a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">
        Download the collection
      </a>
    </p>

    <p style="color:#c9bfae;font-size:15px;line-height:1.8;margin:0 0 18px">
      If you have any questions, or you would like help specifying a particular project, just reply to this email and our team will come back to you.
    </p>

    <p style="color:#c9bfae;font-size:15px;line-height:1.8;margin:0 0 32px">
      We are always happy to talk through materials, finishes and detailing before anything is decided.
    </p>

    <div style="border-top:1px solid #2a2520;padding-top:22px">
      <p style="color:#a08060;font-size:13px;line-height:1.8;margin:0">
        <strong style="color:#e8e0d0">Atelier Supply Group</strong><br/>
        <a href="mailto:${email}" style="color:#a08060;text-decoration:none">${email}</a><br/>
        ${phone}<br/>
        <a href="https://${website}" style="color:#a08060;text-decoration:none">${website}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, resource } = await req.json();
    const key = String(resource);
    const res = RESOURCES[key];
    if (!res) return NextResponse.json({ error: "Unknown resource" }, { status: 400 });

    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (cleanName.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!EMAIL_RE.test(cleanEmail)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    // Signed, expiring link - the file itself is not publicly reachable.
    const fileUrl = downloadPath(key);

    // Record the lead first - the capture must never be lost to a mail failure.
    try {
      await leads.add({ name: cleanName, email: cleanEmail, resource: res.label });
    } catch (err) {
      console.error("Lead save failed", err);
    }

    // Thank-you email to the person who requested it (best effort).
    try {
      if (!process.env.RESEND_API_KEY) throw new Error("No RESEND_API_KEY configured");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;
      const c = await companyStore.get();
      const when = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" });
      const [visitor, notice] = await Promise.all([
        // Thank-you to the person who asked for it.
        resend.emails.send({
          from: `Atelier Supply Group <${FROM_EMAIL}>`,
          to: cleanEmail,
          replyTo: c.email,
          subject: `Your copy of the ${res.label}`,
          html: thankYouHtml({
            firstName: escapeHtml(cleanName.split(" ")[0] || cleanName),
            label: res.label,
            fileUrl,
            siteUrl,
            email: c.email,
            phone: c.phone,
            website: c.website,
          }),
        }),
        // Notification to the team.
        NOTIFY_EMAILS.length
          ? resend.emails.send({
              from: `Atelier Website <${FROM_EMAIL}>`,
              to: NOTIFY_EMAILS,
              replyTo: cleanEmail,
              subject: `New download: ${res.label} - ${cleanName}`,
              html: notifyHtml({
                name: escapeHtml(cleanName),
                email: escapeHtml(cleanEmail),
                label: res.label,
                when,
                adminUrl: `${siteUrl}/admin/leads`,
              }),
            })
          : Promise.resolve({ error: null }),
      ]);
      if (visitor.error || notice.error) console.error("Download emails", visitor.error, notice.error);
    } catch (err) {
      // Never block the download on an email problem.
      console.error("Thank-you email failed", err);
    }

    return NextResponse.json({ url: fileUrl, label: res.label });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
