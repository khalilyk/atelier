import "server-only";
import { ALL_PRODUCTS } from "@/app/classic/data";
import { listProducts as listSignature } from "@/app/signature/data";
import { getContentOverrides, getImages, getPublishedCategories } from "./get-content";
import { journal, projects, customPages, productContent } from "./admin-store";
import { hasHotspots } from "./hotspots";

/** One picture the site uses, wherever it comes from. */
export type SiteImage = { url: string; name: string; source: "site"; usedBy: string };

const isImage = (u: unknown): u is string =>
  typeof u === "string" && /^(\/|https?:\/\/)/.test(u) && /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(u);

const fileName = (u: string) => decodeURIComponent(u.split("?")[0].split("/").pop() || u);

/** Pull every image URL out of a block list's JSON. */
const IMG_IN_TEXT = /(?:\/|https?:\/\/)[^\s"'()]+\.(?:png|jpe?g|webp|avif|gif|svg)/gi;

function fromBlocks(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const out: string[] = [];
  try {
    for (const b of JSON.parse(raw) as { data?: Record<string, string> }[]) {
      for (const value of Object.values(b.data ?? {})) {
        if (typeof value !== "string") continue;
        // Rows ("image :: caption") and hotspot JSON both hide URLs inside strings.
        for (const m of value.match(IMG_IN_TEXT) ?? []) out.push(m);
      }
    }
  } catch { /* not valid block JSON */ }
  return out;
}

/**
 * Every picture the website refers to - product photos, project and article
 * covers, category art, page images and filled picture slots. These live in the
 * site's own files rather than the uploads folder, so they are listed read-only.
 */
export async function referencedImages(): Promise<SiteImage[]> {
  const found = new Map<string, string>(); // url -> what uses it
  const add = (url: unknown, usedBy: string) => {
    if (isImage(url) && !found.has(url)) found.set(url, usedBy);
  };

  // Products, both collections, with any admin edits applied
  const overrides = await productContent.get().catch(() => ({}));
  const eachProduct = (label: string, data: Record<string, unknown>) => {
    add(data.heroImg, label);
    add(data.storyImg, label);
    for (const g of (data.gallery as string[]) ?? []) add(g, label);
    const hs = data.hotspots;
    if (hasHotspots(hs as never)) {
      const block = hs as { image?: string; spots?: { image?: string }[] };
      add(block.image, label);
      for (const s of block.spots ?? []) add(s.image, label);
    }
    const project = data.projectExample as { img?: string } | undefined;
    add(project?.img, label);
    for (const u of fromBlocks(data.blocks)) add(u, label);
  };

  for (const [cat, products] of Object.entries(ALL_PRODUCTS)) {
    for (const [slug, data] of Object.entries(products)) {
      eachProduct(`Product · ${data.name || slug}`, { ...data, ...(overrides as Record<string, object>)[`${cat}/${slug}`] });
    }
  }
  for (const { slug, data } of listSignature("windows-doors")) {
    eachProduct(`Signature · ${data.name || slug}`, data as unknown as Record<string, unknown>);
  }
  // Products that only exist as an admin override
  for (const [key, ov] of Object.entries(overrides as Record<string, Record<string, unknown>>)) {
    eachProduct(`Product · ${key.split("/")[1] ?? key}`, ov);
  }

  for (const p of await projects.list().catch(() => [])) {
    add(p.coverImage, `Project · ${p.title}`);
    add(p.ogImage, `Project · ${p.title}`);
    for (const line of (p.gallery || "").split("\n")) add(line.split("::")[0]?.trim(), `Project · ${p.title}`);
    for (const u of fromBlocks(p.body)) add(u, `Project · ${p.title}`);
  }

  for (const a of await journal.list().catch(() => [])) {
    add(a.coverImage, `Article · ${a.title}`);
    add(a.ogImage, `Article · ${a.title}`);
    for (const u of fromBlocks(a.body)) add(u, `Article · ${a.title}`);
  }

  for (const pg of await customPages.list().catch(() => [])) {
    add(pg.heroImage, `Page · ${pg.title}`);
    add(pg.ogImage, `Page · ${pg.title}`);
    for (const u of fromBlocks(pg.body)) add(u, `Page · ${pg.title}`);
  }

  for (const c of await getPublishedCategories()) {
    add(c.heroImg, `Category · ${c.label}`);
    add(c.storyImg, `Category · ${c.label}`);
    add(c.landingImg, `Category · ${c.label}`);
    for (const line of (c.featureTiles || "").split("\n")) {
      const img = line.split("::")[3]?.trim();
      add(img, `Category · ${c.label}`);
    }
  }

  // Page wording holds image fields too, and filled picture slots
  for (const [key, value] of Object.entries(await getContentOverrides())) {
    if (isImage(value)) add(value, `Page content · ${key}`);
    else for (const u of fromBlocks(value)) add(u, `Page content · ${key}`);
  }
  for (const [key, url] of Object.entries(await getImages())) add(url, `Picture slot · ${key}`);

  return [...found.entries()]
    .map(([url, usedBy]) => ({ url, name: fileName(url), source: "site" as const, usedBy }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
