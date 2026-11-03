import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Served in place of the website while SITE_OFFLINE is set: a blank white
 * page, nothing on it.
 *
 * A route handler rather than a page, because the status code is the point.
 * 503 tells a search engine the site is briefly away and the real pages
 * should be kept, where a 200 on every address would invite Google to index
 * an empty page in their place. A page cannot set its own status; this can.
 */
export async function GET() {
  // While the site is live this address is nothing: the holding page exists
  // only for the time the switch is on.
  if (process.env.SITE_OFFLINE !== "1") {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title></title>
<meta name="robots" content="noindex, nofollow" />
<style>html,body{margin:0;padding:0;height:100%;background:#fff;}</style>
</head>
<body></body>
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
