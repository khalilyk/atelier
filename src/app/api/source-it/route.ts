import { NextRequest, NextResponse } from "next/server";
import { escapeHtml } from "@/lib/escape-html";
import { company as companyStore, Company } from "@/lib/admin-store";
import { emailShell, panel, dataRows, paragraph, itemsTable } from "@/lib/email-layout";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";
import { saveUpload } from "@/lib/uploads";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@ateliersupplygroup.com.au";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

type Item = { name: string; details: string };

function abs(url: string, siteUrl: string) {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}

function adminHtml(o: {
  name: string; email: string; phone: string; company: string;
  projectType: string; location: string; timeline: string;
  items: Item[]; message: string; files: string[]; siteUrl: string; c: Company;
}) {
  const rows = o.items.filter((i) => i.name || i.details).map((i) => [i.name || "-", i.details || "-"]);

  const filesHtml = o.files.map((f) => {
    const url = abs(f, o.siteUrl);
    const isImg = /\.(png|jpe?g|gif|webp|avif)$/i.test(f);
    return isImg
      ? `<a href="${url}" target="_blank" style="display:inline-block;margin:0 8px 8px 0;"><img src="${url}" alt="Reference" width="150" style="display:block;max-width:150px;border:0;" /></a>`
      : `<a href="${url}" target="_blank" style="color:#b8934a;display:block;margin-bottom:6px;text-decoration:none;">${f.split("/").pop()}</a>`;
  }).join("");

  const body = [
    panel("Contact", dataRows([
      ["Name", o.name],
      ["Email", `<a href="mailto:${o.email}" style="color:#e8e0d0;">${o.email}</a>`],
      ["Phone", o.phone ? `<a href="tel:${o.phone.replace(/[^+\d]/g, "")}" style="color:#e8e0d0;">${o.phone}</a>` : ""],
      ["Company", o.company],
    ])),
    panel("Project", dataRows([
      ["Type", o.projectType],
      ["Location", o.location],
      ["Timeline", o.timeline],
    ])),
    rows.length ? itemsTable(["Item", "Details"], rows) : "",
    o.message ? panel("Notes", paragraph(o.message)) : "",
    filesHtml ? panel("Attachments", filesHtml) : "",
  ].join("");

  return emailShell({
    preheader: `Source It request from ${o.name || o.email}`,
    eyebrow: "Source it",
    heading: "Products Required",
    intro: "A visitor submitted a Source It request through the website.",
    body, company: o.c, siteUrl: o.siteUrl,
  });
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
        html: adminHtml({ name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone), company: escapeHtml(company), projectType: escapeHtml(projectType), location: escapeHtml(location), timeline: escapeHtml(timeline), items: cleanItems.map((i) => ({ ...i, name: escapeHtml(i.name), details: escapeHtml(i.details) })), message: escapeHtml(message), files: files.map((f) => escapeHtml(f)), siteUrl, c: await companyStore.get() }),
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
