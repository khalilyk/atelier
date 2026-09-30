import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/admin-auth";
import { can, isSuperAdmin, roleLabel, type Area } from "@/lib/roles";
import { activity } from "@/lib/admin-store";

export type Caller = { id: string; email: string; role: string };

/** The signed-in caller, or null. */
export async function caller(req: NextRequest): Promise<Caller | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;
  return { id: String(payload.id ?? ""), email: String(payload.email ?? ""), role: String(payload.role ?? "") };
}

const VERB: Record<string, string> = { POST: "Created", PATCH: "Updated", PUT: "Updated", DELETE: "Deleted" };

/** "/api/admin/journal" -> "Journal"; "/api/admin/custom-pages" -> "Custom pages". */
function areaName(pathname: string): string {
  const part = pathname.replace("/api/admin/", "").split("/")[0] ?? "";
  const words = part.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Whatever the request carried that names the thing changed. The body is read
 * from a clone, so the route still gets to read it.
 */
async function describe(req: NextRequest): Promise<string> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return "";
  try {
    const body = await req.clone().json();
    if (!body || typeof body !== "object") return "";
    const b = body as Record<string, unknown>;
    const name = b.title ?? b.name ?? b.slug ?? b.label ?? b.id ?? b.resource ?? "";
    const extra = typeof b.published === "boolean" ? (b.published ? " (published)" : " (draft)") : "";
    return `${String(name).slice(0, 80)}${extra}`.trim();
  } catch {
    return "";
  }
}

/**
 * Gate a route on an area. The middleware already establishes that someone is
 * signed in; this is what stops an editor calling an admin-only endpoint by
 * hand, which the sidebar alone cannot.
 *
 * Anything that changes something is recorded, unless a Super Admin did it -
 * the log exists so an owner can see what everyone else has been doing.
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

  const verb = VERB[req.method];
  if (verb && !isSuperAdmin(me.role)) {
    // Recorded before the work runs, so a change is never missed; a failed
    // save therefore shows as an attempt, which is the safer way round.
    try {
      await activity.add({
        at: new Date().toISOString(),
        actor: me.email,
        email: me.email,
        role: roleLabel(me.role),
        action: verb,
        area: areaName(req.nextUrl.pathname),
        detail: await describe(req),
        path: req.nextUrl.pathname,
      });
    } catch (err) {
      // Never let the log stop someone doing their job.
      console.error("Activity log failed", err);
    }
  }

  return { me };
}
