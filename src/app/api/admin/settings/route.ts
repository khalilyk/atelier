import { NextRequest, NextResponse } from "next/server";
import { settings } from "@/lib/admin-store";
import { requireArea } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "content");
  if (gate.error) return gate.error;

  return NextResponse.json(await settings.get());
}

export async function PATCH(req: NextRequest) {
  const gate = await requireArea(req, "content");
  if (gate.error) return gate.error;

  const data = await req.json();
  await settings.update(data);
  return NextResponse.json({ ok: true });
}
