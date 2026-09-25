import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { leads, company as companyStore, Company } from "@/lib/admin-store";
import { emailShell, panel, dataRows, paragraph } from "@/lib/email-layout";
import { RESOURCES, downloadPath } from "@/lib/download-token";
import { escapeHtml } from "@/lib/escape-html";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Who gets told about a new download. Same inbox(es) as the enquiry form.
const NOTIFY_EMAILS = (process.env.DOWNLOAD_NOTIFY_EMAILS ?? process.env.ENQUIRY_EMAILS ?? "info@ateliersupplygroup.com.au")
  .split(",").map((e) => e.trim()).filter(Boolean);

function notifyHtml(o: { name: string; email: string; label: string; when: string; adminUrl: string; siteUrl: string; c: Company }) {
  return emailShell({
    preheader: `${o.name} downloaded the ${o.label}`,
    eyebrow: "New download",
    heading: `${o.name} downloaded the ${o.label}`,
    intro: "The lead is saved in the admin. Reply to this email to contact them directly.",
    body: panel("Lead details", dataRows([
      ["Name", o.name],
      ["Email", `<a href="mailto:${o.email}" style="color:#e8e0d0;">${o.email}</a>`],
      ["Guide", o.label],
      ["When", o.when],
    ])),
    cta: { href: o.adminUrl, label: "View all download leads" },
    company: o.c, siteUrl: o.siteUrl,
  });
}

function thankYouHtml(opts: { firstName: string; label: string; fileUrl: string; siteUrl: string; c: Company }) {
  const { firstName, label, fileUrl, siteUrl, c } = opts;
  return emailShell({
    preheader: `Your copy of the ${label} is ready to download.`,
    eyebrow: "Atelier Supply Group",
    heading: `Thank you, ${firstName}.`,
    intro: `Here is your copy of the <strong style="color:#e8e0d0;">${label}</strong>. We hope it helps as you work through your selections.`,
    body: paragraph("If you have any questions, or you would like help specifying a particular project, just reply to this email and our team will come back to you.")
        + paragraph("We are always happy to talk through materials, finishes and detailing before anything is decided."),
    cta: { href: `${siteUrl}${fileUrl}`, label: "Download the collection" },
    company: c, siteUrl,
  });
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
            c,
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
                siteUrl,
                c,
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
