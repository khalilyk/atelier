import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/admin-auth";
import { can, type Area } from "@/lib/roles";

export type Caller = { id: string; email: string; role: string };

/** The signed-in caller, or null. */
export async function caller(req: NextRequest): Promise<Caller | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;
  return { id: String(payload.id ?? ""), email: String(payload.email ?? ""), role: String(payload.role ?? "") };
}

/**
 * Gate a route on an area. The middleware already establishes that someone is
 * signed in; this is what stops an editor calling an admin-only endpoint by
 * hand, which the sidebar alone cannot.
 *
 *   const gate = await require(req, "business");
 *   if (gate.error) return gate.error;
 */
export async function requireArea(
  req: NextRequest,
  area: Area,
): Promise<{ me: Caller; error?: never } | { me?: never; error: NextResponse }> {
  const me = await caller(req);
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!can(me.role, area)) {
    return { error: NextResponse.json({ error: "You do not have access to this" }, { status: 403 }) };
  }
  return { me };
}
