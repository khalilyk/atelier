import { NextRequest, NextResponse } from "next/server";
import { activity } from "@/lib/admin-store";
import { requireArea } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

/** The log is for owners: it records what everyone else has been doing. */
export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "accounts");
  if (gate.error) return gate.error;
  const limit = Math.min(500, Number(req.nextUrl.searchParams.get("limit") ?? 100) || 100);
  return NextResponse.json(await activity.recent(limit));
}
