import { NextRequest, NextResponse } from "next/server";
import { saveUpload, listUploads, deleteUpload } from "@/lib/uploads";
import { referencedImages } from "@/lib/media-inventory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const uploads = (await listUploads()).map((f) => ({ ...f, source: "upload" as const, usedBy: "" }));
  // ?with=site also lists the pictures the site's own files provide.
  if (req.nextUrl.searchParams.get("with") !== "site") return NextResponse.json(uploads);

  const have = new Set(uploads.map((f) => f.url));
  const site = (await referencedImages())
    .filter((i) => !have.has(i.url))
    .map((i) => ({ name: i.name, url: i.url, size: 0, modifiedAt: "", source: "site" as const, usedBy: i.usedBy }));
  return NextResponse.json([...uploads, ...site]);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const uploaded: string[] = [];

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      uploaded.push(await saveUpload(value, "media"));
    }
  }

  return NextResponse.json({ uploaded });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  // One file, or a batch from the library's bulk selection.
  const items: string[] = Array.isArray(body.items) ? body.items : [body.url || body.name];
  let removed = 0;
  for (const it of items) {
    if (!it) continue;
    await deleteUpload(it);
    removed++;
  }
  return NextResponse.json({ ok: true, removed });
}
