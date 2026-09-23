import { NextRequest, NextResponse } from "next/server";
import { submissions } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await submissions.list(), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  await submissions.update(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await snapshot("submissions");
  const { id } = await req.json();
  await submissions.delete(id);
  return NextResponse.json({ ok: true });
}
