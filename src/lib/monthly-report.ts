import { admins, company as companyStore, analytics, submissions, leads, quotes } from "@/lib/admin-store";
import { mergeSummaries, top, countryName, cityName, type DaySummary } from "@/lib/analytics";
import { emailShell, panel, itemsTable, paragraph } from "@/lib/email-layout";
import { SITE_NAME } from "@/lib/seo";

/** The calendar month before `now`, as YYYY-MM plus a readable label. */
export function lastMonth(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const label = d.toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
  return { key, label };
}

const pct = (now: number, before: number) => {
  if (!before) return now ? "new" : "–";
  const change = Math.round(((now - before) / before) * 100);
  return `${change > 0 ? "+" : ""}${change}%`;
};

/** Everything the report states, gathered once so the email and any preview agree. */
export async function gatherReport(now = new Date(), monthKey?: string) {
  // A test can ask for a particular month; the cron always reports the one
  // that just ended.
  const base = monthKey
    ? new Date(Date.UTC(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 1))
    : now;
  const { key, label } = lastMonth(base);
  const prev = lastMonth(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - 1, 1)));

  const all: DaySummary[] = await analytics.summaries().catch(() => []);
  const inMonth = (m: string) => all.filter((d) => d.day.startsWith(m));
  const totals = mergeSummaries(inMonth(key));
  const before = mergeSummaries(inMonth(prev.key));

  // Everything captured that month, counted by when it arrived.
  const started = `${key}-01`;
  const ended = `${key}-31`;
  const within = (iso?: string) => !!iso && iso.slice(0, 10) >= started && iso.slice(0, 10) <= ended;

  const [subs, dl, qs] = await Promise.all([
    submissions.list().catch(() => []),
    leads.list().catch(() => []),
    quotes.list().catch(() => []),
  ]);

  const monthSubs = subs.filter((s) => within(s.createdAt));
  const monthLeads = dl.filter((l) => within(l.createdAt));
  const monthQuotes = qs.filter((q) => within(q.createdAt));

  return {
    key, label, prevLabel: prev.label,
    views: totals.views, visitors: totals.visitors,
    viewsChange: pct(totals.views, before.views),
    visitorsChange: pct(totals.visitors, before.visitors),
    pages: top(totals.paths, 5),
    refs: top(totals.refs, 5),
    places: top(totals.cities, 5),
    countries: top(totals.countries, 3),
    devices: top(totals.devices, 3),
    enquiries: monthSubs,
    downloads: monthLeads,
    quotes: monthQuotes,
    quiet: totals.views === 0 && monthSubs.length === 0 && monthLeads.length === 0 && monthQuotes.length === 0,
  };
}

export type Report = Awaited<ReturnType<typeof gatherReport>>;

const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function renderReport(report: Report, siteUrl: string, firstName?: string) {
  const c = await companyStore.get();
  const num = (n: number) => n.toLocaleString("en-AU");

  const headline = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
    <tr>
      ${[
        ["Page views", num(report.views), report.viewsChange],
        ["Visitors", num(report.visitors), report.visitorsChange],
        ["Enquiries", num(report.enquiries.length), ""],
      ].map(([label, value, change]) => `
      <td width="33%" valign="top" style="padding:0 8px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111110" style="background-color:#111110;">
          <tr><td style="padding:18px 16px;">
            <p style="margin:0;color:#e8e0d0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.1;">${value}</p>
            <p style="margin:6px 0 0 0;color:#b8934a;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;">${label}</p>
            ${change ? `<p style="margin:4px 0 0 0;color:#9b9288;font-family:Arial,Helvetica,sans-serif;font-size:11px;">${change} on ${esc(report.prevLabel)}</p>` : ""}
          </td></tr>
        </table>
      </td>`).join("")}
    </tr>
  </table>`;

  const listPanel = (label: string, rows: [string, number][], fmt: (k: string) => string = (k) => k) =>
    rows.length
      ? panel(label, itemsTable(["", "Views"], rows.map(([k, v]) => [esc(fmt(k)), num(v)])))
      : "";

  const enquiryPanel = report.enquiries.length
    ? panel(`Enquiries (${report.enquiries.length})`, itemsTable(
        ["Name", "Email", "When"],
        report.enquiries.slice(0, 10).map((s) => [
          esc(s.name ?? ""),
          `<a href="mailto:${esc(s.email ?? "")}" style="color:#e8e0d0;">${esc(s.email ?? "")}</a>`,
          (s.createdAt ?? "").slice(0, 10),
        ]),
      ) + (report.enquiries.length > 10 ? paragraph(`<span style="color:#9b9288;font-size:13px;">and ${report.enquiries.length - 10} more in the admin.</span>`) : ""))
    : "";

  const body = report.quiet
    ? paragraph("There was no recorded activity last month. If that looks wrong, check that the site is reachable and that analytics is switched on.")
    : [
        headline,
        listPanel("Most read", report.pages),
        listPanel("Where people came from", report.refs),
        listPanel("Cities", report.places, cityName),
        listPanel("Countries", report.countries, countryName),
        enquiryPanel,
        report.downloads.length || report.quotes.length
          ? panel("Also this month", itemsTable(["", "Count"], [
              ["Guide downloads", num(report.downloads.length)],
              ["Quotes built", num(report.quotes.length)],
            ]))
          : "",
      ].join("");

  return emailShell({
    preheader: report.quiet
      ? `No recorded activity in ${report.label}.`
      : `${num(report.views)} page views and ${num(report.enquiries.length)} enquiries in ${report.label}.`,
    eyebrow: "Monthly report",
    heading: firstName ? `${report.label}, ${firstName}.` : report.label,
    intro: report.quiet
      ? `Here is the ${esc(report.label)} summary for the ${SITE_NAME} website.`
      : `How the ${SITE_NAME} website did last month, and who got in touch.`,
    body,
    cta: { href: `${siteUrl}/admin/analytics`, label: "Open the full analytics" },
    company: c,
    siteUrl,
  });
}

/** Everyone who can sign in, so the report reaches the whole team. */
export async function reportRecipients(): Promise<{ name: string; email: string }[]> {
  return (await admins.list()).map((a) => ({ name: a.name, email: a.email }));
}
