"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Records one page view per visit, including when navigating between pages.
 * Fails quietly: analytics must never get in the way of the site.
 */
export default function PageViews() {
  const pathname = usePathname();
  const last = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
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
