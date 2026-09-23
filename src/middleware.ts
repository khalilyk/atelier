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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  if (isApi ? PUBLIC_ADMIN_APIS.has(pathname) : PUBLIC_ADMIN_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token && (await verifyToken(token))) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
