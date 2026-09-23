import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await products.get(), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { collection, catId, productId, ...data } = body;

  if (collection === "classic" && productId) {
    await products.updateClassicProduct(catId, productId, data);
  } else if (collection === "classic") {
    await products.updateClassicCategory(catId, data);
  } else if (collection === "signature") {
    await products.updateSignatureCategory(catId, data);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const { catId, ...product } = await req.json();
  await products.addClassicProduct(catId, product);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  await snapshot("products.json");
  const { catId, productId } = await req.json();
  await products.deleteClassicProduct(catId, productId);
  return NextResponse.json({ ok: true });
}
