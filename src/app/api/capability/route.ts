import { NextRequest, NextResponse } from "next/server";
import { escapeHtml } from "@/lib/escape-html";
import { company as companyStore, Company } from "@/lib/admin-store";
import { emailShell, panel, dataRows } from "@/lib/email-layout";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@ateliersupplygroup.com.au";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

function adminHtml(name: string, email: string, siteUrl: string, c: Company) {
  return emailShell({
    preheader: `${name} requested the capability statement.`,
    eyebrow: "New request",
    heading: "Capability Statement Request",
    intro: "Send the capability statement to the address below.",
    body: panel("From", dataRows([
      ["Name", name],
      ["Email", `<a href="mailto:${email}" style="color:#e8e0d0;">${email}</a>`],
    ])),
    company: c, siteUrl,
  });
}

function clientHtml(name: string, siteUrl: string, c: Company) {
  return emailShell({
    preheader: "We have received your request for our capability statement.",
    eyebrow: "Atelier Supply Group",
    heading: `Thank you, ${name.split(" ")[0] || name}.`,
    intro: "We&rsquo;ve received your request for our capability statement. Our team will send it through to you shortly.",
    company: c, siteUrl,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Persist first so the request is never lost, even if email delivery fails
    try {
      await submissions.create({
        name, email, phone: "", company: "",
        message: "Capability Statement request",
        items: [{ name: "Capability Statement", categoryLabel: "Document", size: "-", qty: 1, unit: "request" }],
      });
    } catch (err) { console.error("Capability request save failed", err); }

    let emailFailed = false;
    try {
      if (!process.env.RESEND_API_KEY) throw new Error("No RESEND_API_KEY configured");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const c = await companyStore.get();
      const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;
      const [adminResult, clientResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `Capability Statement request from ${name}`,
          html: adminHtml(escapeHtml(name), escapeHtml(email), siteUrl, c),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Your Atelier Capability Statement",
          html: clientHtml(escapeHtml(name), siteUrl, c),
        }),
      ]);
      if (adminResult.error || clientResult.error) {
        emailFailed = true;
        console.error("Resend error", adminResult.error, clientResult.error);
      }
    } catch (err) {
      emailFailed = true;
      console.error("Resend threw", err);
    }

    return NextResponse.json({ ok: true, emailed: !emailFailed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
