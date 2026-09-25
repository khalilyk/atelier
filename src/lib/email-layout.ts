import { Company } from "@/lib/admin-store";

/**
 * One shell for every email the site sends: logo header, content, contact
 * footer.
 *
 * Mail clients are hostile to CSS, so the rules here are deliberate:
 *
 * - Tables with `bgcolor` attributes, not divs. Outlook's Word renderer drops
 *   `background` in CSS but honours the attribute, so a stripped stylesheet
 *   still leaves the palette intact.
 * - `color-scheme` / `supported-color-schemes` declare that the email handles
 *   both appearances. Without them Apple Mail and Outlook decide the email is
 *   "light" and re-colour it themselves after dark, which is exactly the
 *   drift we are avoiding - the palette is already dark, so nothing should be
 *   inverted at any hour.
 * - `[data-ogsc]` / `[data-ogsb]` re-assert the colours for Outlook.com, which
 *   rewrites them regardless of the declarations above.
 * - Every colour is stated inline on the element that uses it. Nothing is
 *   inherited, because inheritance is the first thing a client breaks.
 */

const INK = "#0d0c0b";       // page behind the email
const PANEL = "#1a1815";     // content card
const PANEL_DEEP = "#111110"; // inset blocks inside the card
const RULE = "#2a2520";
const GOLD = "#b8934a";
const CREAM = "#e8e0d0";
const MUTED = "#a08060";
const FAINT = "#9b9288";

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";

/** Outer gutter, and the inner padding of the card. Kept in one place so
 *  every email lines up along the same edges. */
const GUTTER = 24;
const PAD = 32;

export type ShellOpts = {
  /** Sits under the subject line in the inbox preview. */
  preheader: string;
  eyebrow?: string;
  heading: string;
  /** Lead paragraph under the heading. */
  intro?: string;
  /** Pre-built HTML blocks - use panel()/dataRows()/itemsTable() below. */
  body?: string;
  cta?: { href: string; label: string };
  company: Company;
  siteUrl: string;
};

export function emailShell(o: ShellOpts): string {
  const site = o.siteUrl.replace(/\/+$/, "");
  const logo = `${site}/Atelier-logo.png`;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${esc(o.heading)}</title>
<style type="text/css">
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  /* Outlook.com rewrites colours whatever the declarations above say. */
  [data-ogsc] .asg-ink, [data-ogsb] .asg-ink { background-color:${INK} !important; }
  [data-ogsc] .asg-panel, [data-ogsb] .asg-panel { background-color:${PANEL} !important; }
  [data-ogsc] .asg-deep, [data-ogsb] .asg-deep { background-color:${PANEL_DEEP} !important; }
  [data-ogsc] .asg-cream { color:${CREAM} !important; }
  [data-ogsc] .asg-gold { color:${GOLD} !important; }
  [data-ogsc] .asg-muted { color:${MUTED} !important; }
  [data-ogsc] .asg-faint { color:${FAINT} !important; }
  @media only screen and (max-width:620px) {
    .asg-pad { padding-left:20px !important; padding-right:20px !important; }
    .asg-h1 { font-size:24px !important; }
    .asg-stack { display:block !important; width:100% !important; }
  }
</style>
</head>
<body class="asg-ink" bgcolor="${INK}" style="margin:0;padding:0;background-color:${INK};">
  <div style="display:none;font-size:1px;color:${INK};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(o.preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="asg-ink" bgcolor="${INK}" style="background-color:${INK};">
    <tr>
      <td align="center" style="padding:${GUTTER}px ${GUTTER}px 40px ${GUTTER}px;">

        <table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:620px;max-width:620px;">

          <!-- Logo. Cream on the brand dark, which is how the mark is drawn. -->
          <tr>
            <td align="center" style="padding:16px 0 28px 0;">
              <a href="${site}" target="_blank" style="text-decoration:none;">
                <img src="${logo}" width="150" height="96" alt="Atelier Supply Group"
                     style="display:block;width:150px;height:auto;border:0;" />
              </a>
            </td>
          </tr>

          <tr>
            <td class="asg-panel" bgcolor="${PANEL}" style="background-color:${PANEL};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="asg-pad" style="padding:${PAD}px ${PAD}px 8px ${PAD}px;">
                    ${o.eyebrow ? `<p class="asg-gold" style="margin:0 0 10px 0;color:${GOLD};font-family:${SANS};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;">${esc(o.eyebrow)}</p>` : ""}
                    <h1 class="asg-h1 asg-cream" style="margin:0;color:${CREAM};font-family:${SERIF};font-size:28px;font-weight:normal;line-height:1.2;">${esc(o.heading)}</h1>
                    ${o.intro ? `<p class="asg-muted" style="margin:14px 0 0 0;color:${MUTED};font-family:${SERIF};font-size:15px;line-height:1.75;">${o.intro}</p>` : ""}
                  </td>
                </tr>
                ${o.body ? `<tr><td class="asg-pad" style="padding:24px ${PAD}px 0 ${PAD}px;">${o.body}</td></tr>` : ""}
                ${o.cta ? `<tr><td class="asg-pad" style="padding:28px ${PAD}px 0 ${PAD}px;">${button(o.cta.href, o.cta.label)}</td></tr>` : ""}
                <tr><td style="padding:0 ${PAD}px ${PAD}px ${PAD}px;"></td></tr>
              </table>
            </td>
          </tr>

          ${footer(o.company, site)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Full-width button. The link itself is the block, so the whole bar is
 *  tappable rather than just the words. */
export function button(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr><td align="center" bgcolor="${GOLD}" style="background-color:${GOLD};">
      <a href="${href}" target="_blank" style="display:block;padding:16px 24px;color:${INK};font-family:${SANS};font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;font-weight:bold;text-align:center;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

/** A labelled inset block inside the card. */
export function panel(label: string, inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="asg-deep" bgcolor="${PANEL_DEEP}" style="background-color:${PANEL_DEEP};margin-bottom:16px;">
    <tr><td style="padding:22px 24px;">
      <p class="asg-gold" style="margin:0 0 14px 0;color:${GOLD};font-family:${SANS};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;">${esc(label)}</p>
      ${inner}
    </td></tr>
  </table>`;
}

/** Label/value lines, already escaped by the caller where needed. */
export function dataRows(rows: [string, string][]): string {
  return rows.map(([k, v]) => `<p class="asg-cream" style="margin:0 0 8px 0;color:${CREAM};font-family:${SERIF};font-size:15px;line-height:1.6;"><span class="asg-muted" style="color:${MUTED};">${esc(k)}:</span> ${v || "-"}</p>`).join("");
}

export function paragraph(text: string): string {
  return `<p class="asg-cream" style="margin:0 0 8px 0;color:${CREAM};font-family:${SERIF};font-size:15px;line-height:1.75;">${text}</p>`;
}

/** Product table used by the enquiry and quote emails. */
export function itemsTable(head: string[], rows: string[][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="asg-deep" bgcolor="${PANEL_DEEP}" style="background-color:${PANEL_DEEP};margin-bottom:16px;">
    <tr>${head.map(h => `<th align="left" class="asg-gold" style="padding:12px 16px;color:${GOLD};font-family:${SANS};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:normal;">${esc(h)}</th>`).join("")}</tr>
    ${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 1 ? "asg-muted" : "asg-cream"}" style="padding:12px 16px;border-top:1px solid ${RULE};color:${i === 1 ? MUTED : CREAM};font-family:${SERIF};font-size:15px;line-height:1.5;">${c}</td>`).join("")}</tr>`).join("")}
  </table>`;
}

/** Contact details, on every email: three centred lines, separated by
 *  middots so the block stays compact. */
function footer(c: Company, site: string): string {
  const ig = c.instagram ? `https://www.instagram.com/${c.instagram.replace(/^@/, "")}` : "";
  const tel = c.phone.replace(/[^+\d]/g, "");
  const link = (href: string, text: string) => `<a href="${href}" target="_blank" style="color:${FAINT};text-decoration:none;white-space:nowrap;">${esc(text)}</a>`;
  const dot = ` <span style="color:${RULE};">&middot;</span> `;

  const reach = [
    link(`tel:${tel}`, c.phone),
    link(`mailto:${c.email}`, c.email),
    link(site, c.website),
    ig ? link(ig, c.instagram) : "",
  ].filter(Boolean).join(dot);

  const legal = [c.location, c.abn].filter(Boolean).map(esc).join(dot);

  return `<tr>
    <td class="asg-pad" style="padding:26px ${PAD}px 0 ${PAD}px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid ${RULE};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="asg-pad" align="center" style="padding:18px ${PAD}px 4px ${PAD}px;text-align:center;">
      <p class="asg-cream" style="margin:0 0 8px 0;color:${CREAM};font-family:${SERIF};font-size:14px;line-height:1.5;text-align:center;">${esc(c.name)}</p>
      <p class="asg-faint" style="margin:0 0 6px 0;color:${FAINT};font-family:${SANS};font-size:12px;line-height:1.9;text-align:center;">${reach}</p>
      ${legal ? `<p class="asg-faint" style="margin:0;color:${FAINT};font-family:${SANS};font-size:11px;line-height:1.7;text-align:center;">${legal}</p>` : ""}
    </td>
  </tr>
  <tr><td style="padding:0 ${PAD}px 12px ${PAD}px;"></td></tr>`;
}

function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
