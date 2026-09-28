import { NextRequest, NextResponse } from "next/server";
import { company } from "@/lib/admin-store";
import { requireArea } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  return NextResponse.json(await company.get());
}

export async function PATCH(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  const data = await req.json();
  await company.update(data);
  return NextResponse.json(await company.get());
}
