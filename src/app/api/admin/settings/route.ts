import { NextRequest, NextResponse } from "next/server";
import { settings } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await settings.get());
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  await settings.update(data);
  return NextResponse.json({ ok: true });
}
