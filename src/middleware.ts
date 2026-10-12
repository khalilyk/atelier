import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/admin-auth";

// Admin pages AND admin APIs require a valid session. Only the endpoints a
// signed-out user genuinely needs stay open.
const PUBLIC_ADMIN_PAGES = new Set(["/admin/login", "/admin/reset"]);
const PUBLIC_ADMIN_APIS = new Set([
  "/api/admin/auth",   // login (POST), logout (DELETE), current user (GET -> null when signed out)
  "/api/admin/forgot", // request a password reset email
  "/api/admin/reset",  // complete a password reset with an emailed token
]);

/**
 * With SITE_OFFLINE set, the public site is replaced by the coming-soon page.
 * The admin keeps working, and anyone signed in still sees the real site, so
 * the team can carry on while visitors cannot.
 */
const OFFLINE = process.env.SITE_OFFLINE === "1";

/** Paths the coming-soon page itself needs, plus the admin and its own API. */
function alwaysAllowed(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/_next") ||
    pathname === "/coming-soon" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    // The verification file has to stay reachable or the property un-verifies.
    pathname.startsWith("/google") ||
    // Fonts, photography and the logo on the coming-soon page.
    /\.(png|jpe?g|webp|avif|svg|ico|woff2?|css|js|txt|xml|pdf)$/i.test(pathname)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (OFFLINE && !alwaysAllowed(pathname) && !session) {
    // The destination answers 503 itself, which is what reaches the visitor:
    // a search engine then treats this as the site being briefly away and
    // keeps the real pages, rather than indexing this one in their place.
    return NextResponse.rewrite(new URL("/coming-soon", req.url));
  }

  if (!isAdminPath) return NextResponse.next();

  const isApi = pathname.startsWith("/api/admin");
  if (isApi ? PUBLIC_ADMIN_APIS.has(pathname) : PUBLIC_ADMIN_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  if (session) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  // Everything except the Next internals and files with an extension, so the
  // switch can cover the whole site without touching every asset request.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
