import { NextRequest, NextResponse } from "next/server";
import { images } from "@/lib/admin-store";
import { IMAGE_SLOTS, SLOT_BY_KEY } from "@/lib/image-slots";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ slots: IMAGE_SLOTS, images: await images.get() });
}

// Merge a partial map of slotKey -> url. Send "" to clear a slot.
export async function PATCH(req: NextRequest) {
  await snapshot("images");
  const patch = await req.json();
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Expected an object" }, { status: 400 });
  }
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(patch)) if (SLOT_BY_KEY[k]) clean[k] = typeof v === "string" ? v : "";
  await images.update(clean);
  return NextResponse.json({ ok: true, applied: clean });
}
