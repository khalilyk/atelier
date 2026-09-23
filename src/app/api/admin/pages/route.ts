import { NextRequest, NextResponse } from "next/server";
import { pages } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await pages.list());
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  // { slug, ... } saves the search listing for one address, creating it if new.
  if (body.slug) {
    await pages.setSeo(
      String(body.slug),
      String(body.title ?? ""),
      String(body.metaTitle ?? ""),
      String(body.metaDesc ?? ""),
    );
    return NextResponse.json({ ok: true });
  }
  const { id, ...data } = body;
  await pages.update(id, data);
  return NextResponse.json({ ok: true });
}
