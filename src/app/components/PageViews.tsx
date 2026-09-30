"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const OPT_OUT = "asg-notrack";

/**
 * Records one page view per visit, including when navigating between pages.
 * Fails quietly: analytics must never get in the way of the site.
 *
 * Three kinds of visit are never counted, so the numbers are people:
 * an automated browser, a page nobody actually looked at, and any device that
 * has opted out by visiting the site once with ?notrack.
 */
export default function PageViews() {
  const pathname = usePathname();
  const last = useRef<string>("");

  useEffect(() => {
    // ?notrack silences this browser for good; ?track undoes it.
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.has("notrack")) window.localStorage.setItem(OPT_OUT, "1");
      if (q.has("track")) window.localStorage.removeItem(OPT_OUT);
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    if (!pathname || pathname === last.current) return;

    // Playwright, Puppeteer and the like set this; a person's browser does not.
    if (navigator.webdriver) return;
    // A prerender or a background tab is not someone reading the page.
    if (document.visibilityState !== "visible") return;
    try {
      if (window.localStorage.getItem(OPT_OUT)) return;
    } catch { /* private mode: carry on */ }

    last.current = pathname;
    const body = JSON.stringify({ path: pathname, ref: document.referrer });
    try {
      // A beacon still arrives if the visitor leaves straight away.
      if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      else void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    } catch { /* ignore */ }
  }, [pathname]);

  return null;
}
