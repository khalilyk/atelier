import { NextRequest, NextResponse } from "next/server";
import { company } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await company.get());
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  await company.update(data);
  return NextResponse.json(await company.get());
}
