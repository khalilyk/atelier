import { NextRequest, NextResponse } from "next/server";
import { joinerySettings } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await joinerySettings.get());
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  await joinerySettings.update(data);
  return NextResponse.json(await joinerySettings.get());
}
