import map from "./og-map.json";

/**
 * Social scrapers cap the image they will fetch well below a megabyte, so the
 * full-size photograph on the page cannot double as its share image - WhatsApp
 * and iMessage just render a blank card. scripts/build-og-images.mjs renders a
 * 1200x630 copy of each one into public/og and records it here.
 */
const OG: Record<string, string> = map;

export const shareImage = (src: string): string => {
  if (!src || /^https?:/.test(src)) return src;
  return OG[decodeURI(src)] ?? src;
};

export const SHARE_W = 1200;
export const SHARE_H = 630;
