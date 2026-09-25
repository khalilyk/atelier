import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";
import { escapeHtml } from "@/lib/escape-html";

// Consolidated project enquiries are sent to the Atelier project inbox(es).
const PROJECT_EMAILS = (process.env.ENQUIRY_EMAILS ?? "ambert@ateliersupplygroup.com.au,info@ateliersupplygroup.com.au")
  .split(",").map(e => e.trim()).filter(Boolean);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@ateliersupplygroup.com.au";

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

function itemsHtml(items: Item[], siteUrl = "") {
  return items.map(item => {
    const detail = item.custom
      ? `${item.tagline ? `<div style="color:#a08060;font-size:13px;margin-top:4px">${item.tagline}</div>` : ""}${item.heroImg ? `<div style="margin-top:8px"><img src="${siteUrl}${item.heroImg}" alt="Reference" style="max-width:160px;border-radius:6px;display:block"/></div>` : ""}`
      : "";
    return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#e8e0d0;font-family:Georgia,serif">${item.name}${item.custom ? ` <span style="color:#b8934a;font-size:10px;font-family:Arial,sans-serif;letter-spacing:0.08em">· SEEN ELSEWHERE</span>` : ""}${detail}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#a08060;font-family:Georgia,serif">${item.categoryLabel}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#a08060;font-family:Georgia,serif">${item.size}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#e8e0d0;font-family:Georgia,serif">${item.qty} ${item.qty === 1 ? item.unit : item.unit + "s"}</td>
    </tr>
  `;
  }).join("");
}

function adminHtml(items: Item[], name: string, email: string, phone: string, company: string, message: string, siteUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 32px">New Enquiry Basket</h1>

    <table style="width:100%;border-collapse:collapse;background:#1a1815;margin-bottom:32px">
      <thead>
        <tr style="background:#111110">
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">PRODUCT</th>
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">CATEGORY</th>
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">SIZE</th>
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">QTY</th>
        </tr>
      </thead>
      <tbody>${itemsHtml(items, siteUrl)}</tbody>
    </table>

    <div style="background:#111110;padding:24px;margin-bottom:24px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 16px">CLIENT DETAILS</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Name:</strong> ${name}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Email:</strong> ${email}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Phone:</strong> ${phone || "-"}</p>
      <p style="color:#e8e0d0;margin:0"><strong style="color:#a08060">Company:</strong> ${company || "-"}</p>
    </div>

    ${message ? `<div style="background:#111110;padding:24px"><p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 12px">MESSAGE</p><p style="color:#e8e0d0;line-height:1.7;margin:0">${message}</p></div>` : ""}
  </div>
</body>
</html>`;
}

function clientHtml(items: Item[], name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 12px">Thank you, ${name.split(" ")[0]}.</h1>
    <p style="color:#a08060;font-size:15px;line-height:1.7;margin:0 0 32px">We've received your enquiry and will be in touch shortly with pricing, availability and any further details.</p>

    <table style="width:100%;border-collapse:collapse;background:#1a1815;margin-bottom:32px">
      <thead>
        <tr style="background:#111110">
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">PRODUCT</th>
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">SIZE</th>
          <th style="padding:10px 16px;text-align:left;color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;font-weight:400">QTY</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#e8e0d0;font-family:Georgia,serif">${item.name}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#a08060;font-family:Georgia,serif">${item.size}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2520;color:#e8e0d0;font-family:Georgia,serif">${item.qty} ${item.qty === 1 ? item.unit : item.unit + "s"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <p style="color:#6b6560;font-size:13px;line-height:1.7">Atelier Supply Group<br>www.ateliersupplygroup.com.au</p>
  </div>
</body>
</html>`;
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
          html: adminHtml(safeItems, escapeHtml(name), escapeHtml(email), escapeHtml(phone), escapeHtml(company), escapeHtml(message), siteUrl),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Your Atelier Enquiry",
          html: clientHtml(safeItems, escapeHtml(name)),
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
