import { NextRequest, NextResponse } from "next/server";
import { quotes } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";
import { requireArea } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  return NextResponse.json(await quotes.list());
}

export async function POST(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  const data = await req.json();
  const item = await quotes.create({
    status: data.status ?? "draft",
    clientName: data.clientName ?? "",
    clientEmail: data.clientEmail ?? "",
    clientPhone: data.clientPhone ?? "",
    clientCompany: data.clientCompany ?? "",
    projectAddress: data.projectAddress ?? "",
    items: Array.isArray(data.items) ? data.items : [],
    notes: data.notes ?? "",
    taxRate: typeof data.taxRate === "number" ? data.taxRate : 0.1,
    sourceSubmissionId: data.sourceSubmissionId,
  });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await quotes.update(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const gate = await requireArea(req, "business");
  if (gate.error) return gate.error;

  await snapshot("quotes.json");
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await quotes.remove(id);
  return NextResponse.json({ ok: true });
}
