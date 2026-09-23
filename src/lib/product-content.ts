import type { ProductData } from "@/app/classic/data";

// Each override entry holds only the fields an editor changed for a code
// product, OR a full custom (added) product marked __custom, OR a hide flag
// __deleted for a code product. Keyed by `${category}/${slug}`.
export type ProductOverride = Partial<ProductData> & { __custom?: boolean; __deleted?: boolean };
export type ProductOverrides = Record<string, ProductOverride>;

const META = new Set(["__custom", "__deleted"]);

export function overrideKey(category: string, slug: string): string {
  return `${category}/${slug}`;
}

/** Overlay an editor's override onto a code product (per-field; arrays replace whole). */
export function mergeProduct(
  data: ProductData,
  category: string,
  slug: string,
  overrides: ProductOverrides | undefined
): ProductData {
  const o = overrides?.[overrideKey(category, slug)];
  if (!o) return data;
  const merged: ProductData = { ...data };
  for (const [k, v] of Object.entries(o)) {
    if (META.has(k)) continue;
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    (merged as Record<string, unknown>)[k] = v;
  }
  return merged;
}

/** Resolve a single product for a page: applies override, returns null if hidden, builds custom if code has none. */
export function resolveProduct(
  base: ProductData | null,
  category: string,
  slug: string,
  overrides: ProductOverrides | undefined
): ProductData | null {
  const o = overrides?.[overrideKey(category, slug)];
  if (o?.__deleted) return null;
  if (!base) {
    if (o?.__custom) return stripMeta(o) as ProductData;
    return null;
  }
  return mergeProduct(base, category, slug, overrides);
}

function stripMeta(o: ProductOverride): Partial<ProductData> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (!META.has(k)) out[k] = v;
  return out as Partial<ProductData>;
}

/** Merge a category list: hide __deleted, apply overrides, append __custom products. */
export function mergeList(
  items: { slug: string; data: ProductData }[],
  category: string,
  overrides: ProductOverrides | undefined
): { slug: string; data: ProductData }[] {
  if (!overrides) return items;
  const existing = new Set(items.map((i) => i.slug));
  const out = items
    .filter((it) => !overrides[overrideKey(category, it.slug)]?.__deleted)
    .map((it) => ({ ...it, data: mergeProduct(it.data, category, it.slug, overrides) }));

  // Append custom products for this category that aren't shadowing a code slug.
  const prefix = `${category}/`;
  for (const [key, o] of Object.entries(overrides)) {
    if (!o?.__custom || o.__deleted) continue;
    if (!key.startsWith(prefix)) continue;
    const slug = key.slice(prefix.length);
    if (existing.has(slug)) continue;
    out.push({ slug, data: stripMeta(o) as ProductData });
  }
  return out;
}

const DEFAULT_IMG = "/Atelier_Classic.png";

/**
 * Admin-created products can be saved before their photos exist. Fill any empty
 * image fields so pages never hand an empty src to next/image.
 */
export function withImageFallbacks(data: ProductData, fallback = DEFAULT_IMG): ProductData {
  const hero = data.heroImg || fallback;
  const story = data.storyImg || hero;
  const gallery = (data.gallery ?? []).filter(Boolean);
  return {
    ...data,
    heroImg: hero,
    storyImg: story,
    gallery: gallery.length ? gallery : undefined,
    story: (Array.isArray(data.story) && data.story.length ? data.story : [data.description ?? data.tagline ?? "", ""]) as ProductData["story"],
    details: Array.isArray(data.details) ? data.details : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    projectExample: data.projectExample?.img ? data.projectExample : undefined,
  };
}
