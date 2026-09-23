import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { analytics } from "@/lib/admin-store";
import { COOKIE_NAME, verifyToken } from "@/lib/admin-auth";
import { dayKey, type ViewEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/** Paths that are never counted. */
const IGNORED = /^\/(admin|api|_next)/;

/**
 * A visitor id that cannot be traced back to a person: the address, browser and
 * a secret, hashed together with today's date. It changes every day, so it
 * counts people without following them.
 */
function visitorId(req: NextRequest, day: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
  const ua = req.headers.get("user-agent") ?? "";
  const secret = process.env.ADMIN_JWT_SECRET ?? "atelier";
  return createHash("sha256").update(`${ip}|${ua}|${day}|${secret}`).digest("hex").slice(0, 16);
}

function deviceFrom(ua: string): ViewEvent["device"] {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** The city header arrives percent-encoded, e.g. "Sydney" or "New%20York". */
function cityFrom(raw: string | null) {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim().slice(0, 60);
  } catch {
    return raw.trim().slice(0, 60);
  }
}

/** The referring site's host, or "" when someone arrived directly or from us. */
function refHost(referrer: string, host: string) {
  try {
    if (!referrer) return "";
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    return h && h !== host.replace(/^www\./, "") ? h : "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Anyone signed in to the admin is us, not a visitor.
    const session = req.cookies.get(COOKIE_NAME)?.value;
    if (session && (await verifyToken(session))) return NextResponse.json({ ok: true, skipped: "admin" });

    // Local and preview builds share the live store; only the real site counts.
    const host = (req.headers.get("host") ?? "").toLowerCase();
    if (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host) || host.endsWith(".vercel.app")) {
      return NextResponse.json({ ok: true, skipped: "not the live site" });
    }

    const body = await req.json();
    const raw = String(body.path ?? "/");
    const path = raw.split("?")[0].slice(0, 200) || "/";
    if (IGNORED.test(path)) return NextResponse.json({ ok: true });

    // Bots identify themselves; there is no point counting them.
    const ua = req.headers.get("user-agent") ?? "";
    if (/bot|crawler|spider|crawling|preview|monitor|curl|wget|headless/i.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    const day = dayKey();
    const event: ViewEvent = {
      path,
      ref: refHost(String(body.ref ?? ""), req.headers.get("host") ?? ""),
      country: (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase(),
      city: cityFrom(req.headers.get("x-vercel-ip-city")),
      device: deviceFrom(ua),
      visitor: visitorId(req, day),
      at: new Date().toISOString(),
    };
    await analytics.track(day, event);
    return NextResponse.json({ ok: true });
  } catch {
    // Never let a counting problem affect the page.
    return NextResponse.json({ ok: false });
  }
}
