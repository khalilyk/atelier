import { NextRequest, NextResponse } from "next/server";
import { leads } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await leads.list());
}

export async function DELETE(req: NextRequest) {
  await snapshot("leads");
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await leads.remove(id);
  return NextResponse.json({ ok: true });
}
