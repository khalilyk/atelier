import { NextRequest, NextResponse } from "next/server";
import { content } from "@/lib/admin-store";
import { CONTENT_REGISTRY } from "@/lib/content-registry";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const overrides = await content.get();
  return NextResponse.json({ registry: CONTENT_REGISTRY, overrides });
}

export async function PATCH(req: NextRequest) {
  await snapshot("content.json");
  const data = await req.json();
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // Only accept known keys.
  const allowed = new Set(CONTENT_REGISTRY.map((f) => f.key));
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (allowed.has(k) && typeof v === "string") clean[k] = v;
  }
  await content.set(clean);
  return NextResponse.json({ ok: true });
}
