import { NextRequest, NextResponse } from "next/server";
import { pages } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await pages.list());
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  await pages.update(id, data);
  return NextResponse.json({ ok: true });
}
