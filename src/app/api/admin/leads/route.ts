import { NextRequest, NextResponse } from "next/server";
import { leads } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";
import { requireArea } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  return NextResponse.json(await leads.list());
}

export async function DELETE(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  await snapshot("leads");
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await leads.remove(id);
  return NextResponse.json({ ok: true });
}
