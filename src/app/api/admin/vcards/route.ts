import { NextRequest, NextResponse } from "next/server";
import { vcards } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await vcards.list());
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const item = await vcards.create(data);
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  await vcards.update(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await snapshot("vcards.json");
  const { id } = await req.json();
  await vcards.delete(id);
  return NextResponse.json({ ok: true });
}
