import { NextRequest, NextResponse } from "next/server";
import { escapeHtml } from "@/lib/escape-html";
import { Resend } from "resend";
import { submissions } from "@/lib/admin-store";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@ateliersupplygroup.com.au";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@ateliersupplygroup.com.au";

function adminHtml(name: string, email: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 24px">Capability Statement Request</h1>
    <div style="background:#111110;padding:24px">
      <p style="color:#e8e0d0;margin:0 0 8px"><strong style="color:#a08060">Name:</strong> ${name}</p>
      <p style="color:#e8e0d0;margin:0"><strong style="color:#a08060">Email:</strong> ${email}</p>
    </div>
    <p style="color:#6b6560;font-size:13px;line-height:1.7;margin-top:24px">Send the capability statement to the address above.</p>
  </div>
</body>
</html>`;
}

function clientHtml(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0c0b;margin:0;padding:40px 20px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto">
    <p style="color:#b8934a;letter-spacing:0.15em;font-size:11px;font-family:Arial,sans-serif;margin-bottom:8px">ATELIER SUPPLY GROUP</p>
    <h1 style="color:#e8e0d0;font-weight:300;font-size:28px;margin:0 0 12px">Thank you, ${name.split(" ")[0]}.</h1>
    <p style="color:#a08060;font-size:15px;line-height:1.7;margin:0 0 24px">We've received your request for our capability statement. Our team will send it through to you shortly.</p>
    <p style="color:#6b6560;font-size:13px;line-height:1.7">Atelier Supply Group<br>www.ateliersupplygroup.com.au</p>
  </div>
</body>
</html>`;
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
      const [adminResult, clientResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `Capability Statement request from ${name}`,
          html: adminHtml(escapeHtml(name), escapeHtml(email)),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Your Atelier Capability Statement",
          html: clientHtml(escapeHtml(name)),
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
