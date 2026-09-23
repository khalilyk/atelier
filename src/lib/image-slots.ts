// Registry of every CMS-managed image slot on the site.
//
// A slot is a named position where a real project photo will eventually go.
// Until one is uploaded the slot is EMPTY, which means:
//   • live site  - the image is not rendered at all (hidden)
//   • admin      - a plain beige tile with the slot label (no logo)
//
// Add a slot here, then render it with <ManagedImage slot="..." /> and it
// appears in Admin > Images automatically with drag-and-drop upload.

import { listPackages, listProducts } from "@/app/classic/data";

export type ImageSlot = {
  key: string;
  group: string;
  label: string;
  /** Guidance shown under the tile in the admin (aspect ratio, subject, etc). */
  note?: string;
};

function buildSlots(): ImageSlot[] {
  const slots: ImageSlot[] = [];

  // ── Marketing / CTA backgrounds ────────────────────────────────────────────
  slots.push({
    key: "cta.joinery-collection.bg",
    group: "Marketing - CTAs",
    label: "Joinery Collection download - background",
    note: "Wide joinery/cabinetry photo. Text sits over a dark overlay.",
  });
  slots.push({
    key: "cta.joinery-colour-collection.bg",
    group: "Marketing - CTAs",
    label: "Colour Collection download - background",
    note: "Wide, moodier joinery photo. Text sits over a dark overlay.",
  });

  // ── Bathroom packages ──────────────────────────────────────────────────────
  for (const { slug, data } of listPackages("bathrooms")) {
    const group = `Bathroom - ${data.name}`;
    slots.push({ key: `bath.${slug}.room`, group, label: "The Room - interactive render", note: "Wide room render (4:3). Hotspots sit on top of this image." });
    slots.push({ key: `bath.${slug}.hero`, group, label: "Hero photo", note: "Full-bleed room photo (landscape)." });
    (data.fixedInclusions ?? []).forEach((f, i) => {
      slots.push({ key: `bath.${slug}.item.${i}`, group, label: `Product photo - ${f.label}`, note: f.value });
    });
  }

  // ── Custom joinery rooms ───────────────────────────────────────────────────
  for (const { slug, data } of listProducts("joinery")) {
    const group = `Joinery - ${data.name}`;
    slots.push({ key: `joinery.${slug}.hero`, group, label: "Hero photo", note: "Full-bleed room photo (landscape)." });
    slots.push({ key: `joinery.${slug}.sample`, group, label: "Sample project photo", note: "Portrait or square works best." });
    for (let i = 0; i < 3; i++) {
      slots.push({ key: `joinery.${slug}.render.${i}`, group, label: `Render / drawing ${i + 1}`, note: "Renders and shop drawings for this room." });
    }
  }

  return slots;
}

export const IMAGE_SLOTS: ImageSlot[] = buildSlots();

export const SLOT_BY_KEY: Record<string, ImageSlot> = Object.fromEntries(
  IMAGE_SLOTS.map((s) => [s.key, s])
);

/** Groups in registry order, for the admin listing. */
export function slotGroups(): { group: string; slots: ImageSlot[] }[] {
  const out: { group: string; slots: ImageSlot[] }[] = [];
  for (const s of IMAGE_SLOTS) {
    let g = out.find((x) => x.group === s.group);
    if (!g) { g = { group: s.group, slots: [] }; out.push(g); }
    g.slots.push(s);
  }
  return out;
}
