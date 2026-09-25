import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { submissions, company as companyStore, Company } from "@/lib/admin-store";
import { emailShell, itemsTable, panel, dataRows, paragraph } from "@/lib/email-layout";
import { escapeHtml } from "@/lib/escape-html";

// Consolidated project enquiries are sent to the Atelier project inbox(es).
const PROJECT_EMAILS = (process.env.ENQUIRY_EMAILS ?? "info@ateliersupplygroup.com.au")
  .split(",").map(e => e.trim()).filter(Boolean);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

type Item = {
  name: string;
  categoryLabel: string;
  size: string;
  qty: number;
  unit: string;
  custom?: boolean;
  tagline?: string;
  heroImg?: string;
};

function rowsFor(items: Item[], siteUrl = ""): string[][] {
  return items.map((item) => {
    const extra = item.custom
      ? `${item.tagline ? `<div style="color:#a08060;font-size:13px;margin-top:4px">${item.tagline}</div>` : ""}${item.heroImg ? `<div style="margin-top:8px"><img src="${siteUrl}${item.heroImg}" alt="Reference" width="160" style="display:block;max-width:160px;border:0;" /></div>` : ""}`
      : "";
    const name = `${item.name}${item.custom ? ` <span style="color:#b8934a;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.08em">· SEEN ELSEWHERE</span>` : ""}${extra}`;
    return [name, item.categoryLabel, item.size, `${item.qty} ${item.qty === 1 ? item.unit : item.unit + "s"}`];
  });
}

function adminHtml(items: Item[], name: string, email: string, phone: string, companyName: string, message: string, siteUrl: string, c: Company) {
  const blocks = [
    items.length ? itemsTable(["Product", "Category", "Size", "Qty"], rowsFor(items, siteUrl)) : "",
    panel("Client details", dataRows([
      ["Name", name],
      ["Email", `<a href="mailto:${email}" style="color:#e8e0d0;">${email}</a>`],
      ["Phone", phone ? `<a href="tel:${phone.replace(/[^+\d]/g, "")}" style="color:#e8e0d0;">${phone}</a>` : ""],
      ["Company", companyName],
    ])),
    message ? panel("Message", paragraph(message)) : "",
  ].join("");
  return emailShell({
    preheader: `${items.length ? `${items.length} package${items.length === 1 ? "" : "s"}` : "Quote request"} from ${name}`,
    eyebrow: "New enquiry",
    heading: items.length ? "New Enquiry Basket" : "New Quote Request",
    intro: "Submitted through the website. The details are below and the enquiry is saved in the admin.",
    body: blocks, company: c, siteUrl,
  });
}

function clientHtml(items: Item[], name: string, siteUrl: string, c: Company) {
  return emailShell({
    preheader: "We have received your enquiry and will be in touch shortly.",
    eyebrow: "Atelier Supply Group",
    heading: `Thank you, ${name.split(" ")[0] || name}.`,
    intro: "We&rsquo;ve received your enquiry and will be in touch shortly with pricing, availability and any further details.",
    body: items.length ? itemsTable(["Product", "Size", "Qty"], items.map((i) => [i.name, i.size, `${i.qty} ${i.qty === 1 ? i.unit : i.unit + "s"}`])) : "",
    cta: { href: siteUrl, label: "Explore the collections" },
    company: c, siteUrl,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message } = body;
    // Basket enquiries carry package items; the contact-page quote form has none.
    const items = Array.isArray(body.items) ? body.items : [];

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;

    // Persist first so the enquiry is never lost, even if email delivery fails
    try { await submissions.create({ items, name, email, phone, company, message }); } catch (err) { console.error("Submission save failed", err); }

    let emailFailed = false;
    try {
      if (!process.env.RESEND_API_KEY) throw new Error("No RESEND_API_KEY configured");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const c = await companyStore.get();
      // Visitor-supplied text is escaped before it goes into HTML email.
      const safeItems = (items as Item[]).map((it) => ({
        ...it,
        name: escapeHtml(it.name), categoryLabel: escapeHtml(it.categoryLabel), size: escapeHtml(it.size),
        unit: escapeHtml(it.unit), tagline: it.tagline ? escapeHtml(it.tagline) : it.tagline,
        heroImg: it.heroImg && /^(\/|https:\/\/)[^"'<>\s]*$/.test(it.heroImg) ? it.heroImg : undefined,
      }));
      const subject = items.length
        ? `Project Enquiry - ${items.length} package${items.length === 1 ? "" : "s"} from ${name}`
        : `Quote Request from ${name}`;
      const [adminResult, clientResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: PROJECT_EMAILS,
          subject,
          html: adminHtml(safeItems, escapeHtml(name), escapeHtml(email), escapeHtml(phone), escapeHtml(company), escapeHtml(message), siteUrl, c),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Your Atelier Enquiry",
          html: clientHtml(safeItems, escapeHtml(name), siteUrl, c),
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

    // The enquiry is saved regardless; report success so the visitor isn't blocked
    return NextResponse.json({ ok: true, emailed: !emailFailed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
