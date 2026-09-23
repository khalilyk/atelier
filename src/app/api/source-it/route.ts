import { NextRequest, NextResponse } from "next/server";
import { escapeHtml } from "@/lib/escape-html";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";
import { saveUpload } from "@/lib/uploads";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@atelier.thisisnn.com";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@atelier.thisisnn.com";

type Item = { name: string; details: string };

function abs(url: string, siteUrl: string) {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}

function adminHtml(o: {
  name: string; email: string; phone: string; company: string;
  projectType: string; location: string; timeline: string;
  items: Item[]; message: string; files: string[]; siteUrl: string;
}) {
  const itemsRows = o.items.filter(i => i.name || i.details).map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #2a2520;color:#e8e0d0;font-family:Georgia,serif">${i.name || "-"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #2a2520;color:#a08060;font-family:Georgia,serif">${i.details || "-"}</td>
    </tr>`).join("");

  const filesHtml = o.files.map(f => {
    const url = abs(f, o.siteUrl);
    const isImg = /\.(png|jpe?g|gif|webp|avif)$/i.test(f);
    return isImg
      ? `<a href="${url}" style="display:inline-block;margin:0 8px 8px 0"><img src="${url}" alt="Reference" style="max-width:150px;border-radius:6px;display:block"/></a>`
      : `<a href="${url}" style="color:#b8934a;display:block;margin-bottom:6px">📎 ${f.split("/").pop()}</a>`;
  }).join("");

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:640px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 6px">Source It Request</h1>
    <p style="color:#a08060;font-size:14px;margin:0 0 28px">A client is looking for products to be sourced.</p>

    <div style="background:#111110;padding:24px;margin-bottom:20px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 14px">CONTACT</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Name:</strong> ${o.name}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Email:</strong> ${o.email}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Phone:</strong> ${o.phone || "-"}</p>
      <p style="color:#e8e0d0;margin:0"><strong style="color:#a08060">Company:</strong> ${o.company || "-"}</p>
    </div>

    <div style="background:#111110;padding:24px;margin-bottom:20px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 14px">PROJECT</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Type:</strong> ${o.projectType || "-"}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Location:</strong> ${o.location || "-"}</p>
      <p style="color:#e8e0d0;margin:0"><strong style="color:#a08060">Needed:</strong> ${o.timeline || "-"}</p>
    </div>

    ${itemsRows ? `<div style="background:#111110;padding:24px;margin-bottom:20px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 14px">PRODUCTS REQUIRED</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="padding:8px 14px;text-align:left;color:#7a6a55;font-size:10px;letter-spacing:0.1em;font-family:Arial,sans-serif;font-weight:400">ITEM</th>
          <th style="padding:8px 14px;text-align:left;color:#7a6a55;font-size:10px;letter-spacing:0.1em;font-family:Arial,sans-serif;font-weight:400">DETAILS</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>` : ""}

    ${o.message ? `<div style="background:#111110;padding:24px;margin-bottom:20px"><p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 12px">NOTES</p><p style="color:#e8e0d0;line-height:1.7;margin:0">${o.message}</p></div>` : ""}

    ${filesHtml ? `<div style="background:#111110;padding:24px"><p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 14px">REFERENCES</p>${filesHtml}</div>` : ""}
  </div>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const phone = (form.get("phone") as string) || "";
    const company = (form.get("company") as string) || "";
    const projectType = (form.get("projectType") as string) || "";
    const location = (form.get("location") as string) || "";
    const timeline = (form.get("timeline") as string) || "";
    const message = (form.get("message") as string) || "";

    let items: Item[] = [];
    try { items = JSON.parse((form.get("items") as string) || "[]"); } catch { items = []; }

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Please include your name, email and phone." }, { status: 400 });
    }

    // Save any reference files (images or documents)
    const rawFiles = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    const files: string[] = [];
    for (const f of rawFiles) {
      try { files.push(await saveUpload(f, "sourceit")); } catch (err) { console.error("file upload failed", err); }
    }

    const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;

    // Persist first so the request is never lost
    const cleanItems = items.filter(i => i.name || i.details);
    try {
      await submissions.create({
        name, email, phone, company,
        message: `SOURCE IT REQUEST\nProject: ${projectType || "-"} · ${location || "-"} · needed ${timeline || "-"}\n\n`
          + (cleanItems.length ? `Products:\n${cleanItems.map(i => `• ${i.name}${i.details ? ` - ${i.details}` : ""}`).join("\n")}\n\n` : "")
          + (message ? `Notes: ${message}\n\n` : "")
          + (files.length ? `References:\n${files.join("\n")}` : ""),
        items: [...cleanItems.map(i => ({ ...i, type: "requested-product" })), ...files.map(url => ({ type: "reference-file", url }))],
      });
    } catch (err) { console.error("Source It save failed", err); }

    // Email the team (non-fatal)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Source It - ${name}${location ? ` · ${location}` : ""}`,
        html: adminHtml({ name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone), company: escapeHtml(company), projectType: escapeHtml(projectType), location: escapeHtml(location), timeline: escapeHtml(timeline), items: cleanItems.map((i) => ({ ...i, name: escapeHtml(i.name), details: escapeHtml(i.details) })), message: escapeHtml(message), files: files.map((f) => escapeHtml(f)), siteUrl }),
      });
    } catch (err) {
      console.error("Source It email failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
