import { NextRequest, NextResponse } from "next/server";
import { saveUpload, listUploads, deleteUpload } from "@/lib/uploads";
import { referencedImages } from "@/lib/media-inventory";
import { documents } from "@/lib/admin-store";
import { RESOURCES } from "@/lib/download-token";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const all = (await listUploads()).map((f) => ({ ...f, source: "upload" as const, usedBy: "" }));
  // ?with=site also lists the pictures and documents the site itself provides.
  if (req.nextUrl.searchParams.get("with") !== "site") return NextResponse.json(all);

  // A file uploaded to replace a gated document is shown as that document,
  // not twice, so hide the raw upload behind it.
  const swapped = new Set((await documents.list().catch(() => [])).map((d) => d.url));
  const uploads = all.filter((f) => !swapped.has(f.url));

  const have = new Set(uploads.map((f) => f.url));
  const site = (await referencedImages())
    .filter((i) => i.resource || !have.has(i.url))
    .map((i) => ({
      name: i.name, url: i.url, size: 0, modifiedAt: "", source: "site" as const,
      usedBy: i.usedBy, kind: i.kind, resource: i.resource, replaced: i.replaced,
    }));
  return NextResponse.json([...uploads, ...site]);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Replacing a gated document: the file is uploaded and pointed at that resource.
  const resource = String(formData.get("resource") ?? "");
  const uploaded: string[] = [];

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      uploaded.push(await saveUpload(value, "media"));
    }
  }

  if (resource && RESOURCES[resource] && uploaded[0]) {
    await documents.put({
      resource,
      url: uploaded[0],
      name: RESOURCES[resource].filename,
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ uploaded, resource: resource || undefined });
}

/** Put a gated document back to the one that ships with the site. */
export async function PATCH(req: NextRequest) {
  const { resource, action } = await req.json();
  if (!resource || !RESOURCES[String(resource)]) {
    return NextResponse.json({ error: "Unknown document" }, { status: 400 });
  }
  if (action === "restore") await documents.remove(String(resource));
  return NextResponse.json({ ok: true });
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
