import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { gatherReport, renderReport, reportRecipients } from "@/lib/monthly-report";
import { SITE_NAME } from "@/lib/seo";
import { caller } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/roles";
import { admins as adminStore } from "@/lib/admin-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FROM_EMAIL = process.env.FROM_EMAIL ?? "info@ateliersupplygroup.com.au";

/**
 * Last month's traffic and enquiries, emailed to everyone who can sign in.
 * Run by the Vercel cron in vercel.json on the first of the month; Vercel
 * sends `Authorization: Bearer $CRON_SECRET`.
 *
 * `?test=1` sends only to the signed-in Super Admin asking for it, so the
 * report can be checked without mailing the team.
 */
export async function GET(req: NextRequest) {
  const isTest = req.nextUrl.searchParams.get("test") === "1";
  const secret = process.env.CRON_SECRET;
  const fromCron = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;

  let only: { name: string; email: string } | null = null;
  if (!fromCron) {
    // Not the cron: only a signed-in Super Admin may fire it, and only at
    // themselves, so nobody can mail the team by hitting a URL.
    const me = await caller(req);
    if (!me || !isSuperAdmin(me.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isTest) return NextResponse.json({ error: "Use ?test=1 to send yourself a preview" }, { status: 400 });
    const found = (await reportRecipients()).find((r) => r.email === me.email);
    only = found ?? { name: me.email, email: me.email };
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "No RESEND_API_KEY configured" }, { status: 503 });
  }

  const supers = new Set((await adminStore.list()).filter((a) => isSuperAdmin(a.role)).map((a) => a.email));
  const siteUrl = process.env.SITE_URL ?? new URL(req.url).origin;
  const report = await gatherReport(new Date(), isTest ? (req.nextUrl.searchParams.get("month") ?? undefined) : undefined);
  // A test never reaches the team, however it was triggered.
  const everyone = await reportRecipients();
  const recipients = only
    ? [only]
    : isTest
      ? everyone.filter((r) => supers.has(r.email))
      : everyone;
  if (!recipients.length) return NextResponse.json({ ok: true, sent: 0, note: "nobody to send to" });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const results = await Promise.all(recipients.map(async (person) => {
    // Addressed one at a time: each is greeted by name, and nobody sees
    // anyone else's address.
    const html = await renderReport(report, siteUrl, person.name.split(" ")[0] || undefined);
    const { error } = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: person.email,
      subject: `${SITE_NAME} — ${report.label}${only ? " (test)" : ""}`,
      html,
    });
    if (error) console.error("Monthly report failed for", person.email, error);
    return { email: person.email, ok: !error };
  }));

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: sent > 0,
    month: report.label,
    sent,
    failed: results.filter((r) => !r.ok).map((r) => r.email),
    views: report.views,
    enquiries: report.enquiries.length,
  });
}
