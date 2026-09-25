import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { submissions, company as companyStore, Company } from "@/lib/admin-store";
import { saveUpload } from "@/lib/uploads";
import { escapeHtml } from "@/lib/escape-html";
import { emailShell, panel, dataRows, paragraph } from "@/lib/email-layout";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@ateliersupplygroup.com.au";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

function adminHtml(opts: { name: string; email: string; phone: string; productName: string; message: string; imageUrl: string; siteUrl: string; c: Company }) {
  const { name, email, phone, productName, message, imageUrl, siteUrl, c } = opts;
  const imgSrc = imageUrl.startsWith("http") ? imageUrl : `${siteUrl}${imageUrl}`;
  const body = [
    productName ? panel("Item", paragraph(productName)) : "",
    panel("Description", paragraph(message || "-")),
    imageUrl ? panel("Reference image", `<a href="${imgSrc}" target="_blank" style="color:#b8934a;text-decoration:none;"><img src="${imgSrc}" alt="Reference" width="520" style="display:block;width:100%;max-width:520px;border:0;margin-bottom:10px;" />View full image &rarr;</a>`) : "",
    panel("From", dataRows([
      ["Name", name],
      ["Email", `<a href="mailto:${email}" style="color:#e8e0d0;">${email}</a>`],
      ["Phone", phone ? `<a href="tel:${phone.replace(/[^+\d]/g, "")}" style="color:#e8e0d0;">${phone}</a>` : ""],
    ])),
  ].join("");
  return emailShell({
    preheader: `Source request${productName ? ` - ${productName}` : ""} from ${name || email}`,
    eyebrow: "Source request",
    heading: "Source Request",
    intro: "A visitor spotted an item that isn&rsquo;t in our collection yet.",
    body, company: c, siteUrl,
  });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const phone = (form.get("phone") as string) || "";
    const productName = (form.get("productName") as string) || "";
    const message = (form.get("message") as string) || "";
    const image = form.get("image") as File | null;

    if (!email || !message) {
      return NextResponse.json({ error: "Please include your email and a description." }, { status: 400 });
    }

    // Save reference image (if provided)
    let imageUrl = "";
    if (image && image.size > 0) {
      imageUrl = await saveUpload(image, "source");
    }

    const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;

    // Email the team - don't fail the request if mail isn't configured
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Source Request${productName ? ` - ${productName}` : ""} from ${name || email}`,
        html: adminHtml({ name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone), productName: escapeHtml(productName), message: escapeHtml(message), imageUrl, siteUrl, c: await companyStore.get() }),
      });
    } catch (err) {
      console.error("Source request email failed", err);
    }

    // Record it in the admin submissions list
    try {
      await submissions.create({
        name: name || "(not provided)",
        email,
        phone,
        company: "",
        message: `SOURCE REQUEST${productName ? ` - ${productName}` : ""}\n\n${message}${imageUrl ? `\n\nReference image: ${imageUrl}` : ""}`,
        items: imageUrl ? [{ type: "reference-image", url: imageUrl }] : [],
      });
    } catch (err) {
      console.error("Source request save failed", err);
    }

    return NextResponse.json({ ok: true, imageUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
