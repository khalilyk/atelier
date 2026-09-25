import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";
import { saveUpload } from "@/lib/uploads";
import { escapeHtml } from "@/lib/escape-html";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@ateliersupplygroup.com.au";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@ateliersupplygroup.com.au";

function adminHtml(opts: { name: string; email: string; phone: string; productName: string; message: string; imageUrl: string; siteUrl: string }) {
  const { name, email, phone, productName, message, imageUrl, siteUrl } = opts;
  const imgSrc = imageUrl.startsWith("http") ? imageUrl : `${siteUrl}${imageUrl}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 8px">Source Request</h1>
    <p style="color:#a08060;font-size:14px;margin:0 0 32px">A visitor spotted an item that isn't in our collection yet.</p>

    ${productName ? `<div style="background:#111110;padding:24px;margin-bottom:24px"><p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 12px">ITEM</p><p style="color:#e8e0d0;line-height:1.7;margin:0;font-size:16px">${productName}</p></div>` : ""}

    <div style="background:#111110;padding:24px;margin-bottom:24px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 12px">DESCRIPTION</p>
      <p style="color:#e8e0d0;line-height:1.7;margin:0">${message || "-"}</p>
    </div>

    ${imageUrl ? `<div style="background:#111110;padding:24px;margin-bottom:24px"><p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 12px">REFERENCE IMAGE</p><a href="${imgSrc}" style="color:#b8934a"><img src="${imgSrc}" alt="Reference" style="max-width:100%;border-radius:8px;display:block;margin-bottom:8px"/>View full image →</a></div>` : ""}

    <div style="background:#111110;padding:24px">
      <p style="color:#b8934a;font-size:10px;letter-spacing:0.12em;font-family:Arial,sans-serif;margin:0 0 16px">FROM</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Name:</strong> ${name || "-"}</p>
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Email:</strong> ${email}</p>
      <p style="color:#e8e0d0;margin:0"><strong style="color:#a08060">Phone:</strong> ${phone || "-"}</p>
    </div>
  </div>
</body>
</html>`;
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
        html: adminHtml({ name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone), productName: escapeHtml(productName), message: escapeHtml(message), imageUrl, siteUrl }),
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
