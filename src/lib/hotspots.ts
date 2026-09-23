// Product hotspot image: a full-width photo with numbered points. Each point
// opens a card with its own title, text, optional photo and link.
export type Hotspot = {
  id: string;
  x: number; // % from the left of the image
  y: number; // % from the top of the image
  title: string;
  text: string;      // paragraphs separated by blank lines
  image?: string;    // optional close-up shown at the top of the card
  linkUrl?: string;
  linkLabel?: string;
};

/**
 * How tall the hotspot section is on screen. "auto" shows the whole picture at
 * its natural height; the others are a share of the visitor's screen height and
 * crop the middle of the image to fit.
 */
export const HOTSPOT_HEIGHTS: { value: string; label: string; vh?: number }[] = [
  { value: "auto", label: "Full image (natural height)" },
  { value: "three-quarter", label: "Three quarter section", vh: 75 },
  { value: "half", label: "Half section", vh: 50 },
  { value: "quarter", label: "Quarter section", vh: 25 },
  { value: "custom", label: "Custom height", vh: 60 },
];

/** Section height in vh, or 0 for the natural image height. */
export function hotspotHeightVh(b?: { height?: string; heightVh?: number } | null): number {
  if (!b || !b.height || b.height === "auto") return 0;
  if (b.height === "custom") return Math.min(90, Math.max(10, Number(b.heightVh) || 60));
  // "full" was removed; anything still set to it drops to the next size down.
  if (b.height === "full") return 75;
  return HOTSPOT_HEIGHTS.find((h) => h.value === b.height)?.vh ?? 0;
}

export type HotspotBlock = {
  image: string;
  /** One of HOTSPOT_HEIGHTS; defaults to "auto". */
  height?: string;
  /** Height in vh when height is "custom" (10-100). */
  heightVh?: number;
  alt?: string;
  eyebrow?: string;
  heading?: string;
  spots: Hotspot[];
};

export const hasHotspots = (b?: HotspotBlock | null): b is HotspotBlock =>
  !!b && !!b.image && Array.isArray(b.spots) && b.spots.length > 0;

export const newSpotId = () => Math.random().toString(36).slice(2, 10);
