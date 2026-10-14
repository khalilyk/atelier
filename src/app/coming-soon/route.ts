import { NextResponse } from "next/server";
import { getCompany } from "@/lib/get-content";
import { SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Shown in place of the website while SITE_OFFLINE is set.
 *
 * A route handler rather than a page, because the status code is the point:
 * 503 tells a search engine the site is briefly away and the real pages
 * should be kept, where a 200 on every address would invite Google to index
 * this page in their place. A page cannot set its own status; this can.
 */
export async function GET() {
  // While the site is live this address is nothing: the holding page exists
  // only for the time the switch is on.
  if (process.env.SITE_OFFLINE !== "1") {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const c = await getCompany();
  const tel = (c.phone ?? "").replace(/[^+\d]/g, "");
  const instagram = c.instagram ? `https://www.instagram.com/${c.instagram.replace(/^@/, "")}` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(SITE_NAME)}</title>
<meta name="description" content="Our website is being updated. We will be back shortly." />
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" href="/icon.png" type="image/png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; background: #2c2620; color: #efe7d8;
    font-family: "Jost", Arial, sans-serif; font-weight: 300;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 80px 24px;
  }
  img.logo { width: 190px; height: auto; margin-bottom: 56px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #b8934a; margin: 0 0 24px; }
  h1 {
    font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300;
    font-size: clamp(32px, 6vw, 62px); line-height: 1.08; margin: 0 0 28px; max-width: 16ch;
  }
  .rule { width: 40px; height: 1px; background: #b8934a; margin: 0 0 32px; }
  p.lead { color: #b7ab97; max-width: 30rem; line-height: 1.9; font-size: 15px; margin: 0 0 48px; }
  .contact { display: flex; flex-direction: column; gap: 12px; align-items: center; }
  .contact a { color: #efe7d8; text-decoration: none; font-size: 15px; padding: 4px 0; }
  .contact a.email { border-bottom: 1px solid rgba(184,147,74,.5); }
  .contact a.quiet { color: #b7ab97; }
  .contact a:hover { color: #b8934a; }
  .place { color: #6b6257; font-size: 12px; margin-top: 64px; }
</style>
</head>
<body>
  <img class="logo" src="/Atelier-logo.png" alt="${esc(SITE_NAME)}" />
  <p class="eyebrow">Coming soon</p>
  <h1>Something considered<br />is on its way.</h1>
  <div class="rule"></div>
  <p class="lead">
    Our new website is being prepared. In the meantime our team is still here &mdash;
    send through your plans or a brief and we will come straight back to you.
  </p>
  <div class="contact">
    ${c.email ? `<a class="email" href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""}
    ${c.phone ? `<a class="quiet" href="tel:${esc(tel)}">${esc(c.phone)}</a>` : ""}
    ${instagram ? `<a class="quiet" href="${esc(instagram)}" target="_blank" rel="noopener noreferrer">${esc(c.instagram)}</a>` : ""}
  </div>
  ${c.location ? `<p class="place">${esc(c.location)}</p>` : ""}
</body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "86400",
      "Cache-Control": "no-store",
    },
  });
}
