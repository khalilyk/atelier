// One view of every public, indexable URL with its title and description.
// Feeds the sitemap, llms.txt and per-page metadata.
import { CATEGORY_META, ALL_PRODUCTS, getProduct, WD_FAMILIES, type ProductData } from "@/app/classic/data";
import { listProducts as listSignature } from "@/app/signature/data";
import { getContent, getProductOverrides, getPublishedCategories, getPublishedPosts, getPublishedProjects, getPublishedCustomPages } from "./get-content";
import { mergeList, resolveProduct } from "./product-content";
import { lines, rows, type CustomCategory } from "./categories";

export const productSummary = (d: Partial<ProductData>) =>
  [d.description || d.tagline, d.story?.[0]].filter(Boolean).join(" ").trim() || d.tagline || d.name || "";

export type CatalogEntry = { path: string; title: string; description: string; group: string; image?: string };

export async function bathAvailable(): Promise<Set<string>> {
  const t = await getContent();
  return new Set(lines(t("bath.available")));
}

export async function customCategory(slug: string): Promise<CustomCategory | null> {
  return (await getPublishedCategories()).find((c) => c.slug === slug) ?? null;
}

export function customFaqs(c: CustomCategory) {
  return rows(c.faqs).map(([q, a]) => ({ q: q || "", a: a || "" }));
}

/** Resolve a classic product (built-in or custom category) with admin overrides. */
export async function classicProduct(category: string, slug: string): Promise<ProductData | null> {
  const overrides = await getProductOverrides();
  const builtIn = !!CATEGORY_META[category];
  if (!builtIn && !(await customCategory(category))) return null;
  return resolveProduct(builtIn ? getProduct(category, slug) : null, category, slug, overrides);
}

export async function classicCategoryProducts(category: string) {
  const overrides = await getProductOverrides();
  const base = ALL_PRODUCTS[category] ? Object.entries(ALL_PRODUCTS[category]).map(([slug, data]) => ({ slug, data })) : [];
  return mergeList(base, category, overrides);
}

export async function publicCatalog(): Promise<CatalogEntry[]> {
  const [cats, available] = await Promise.all([getPublishedCategories(), bathAvailable()]);
  const out: CatalogEntry[] = [
    { path: "/", title: "Atelier Supply Group", description: "Windows, doors, custom joinery and bathroom packages for Australian homes.", group: "Pages" },
    { path: "/classic", title: "Classic Collection", description: "Specification-led windows and doors, custom joinery and coordinated bathroom packages.", group: "Pages" },
    { path: "/signature", title: "Signature Luxe Collection", description: "Premium thermally broken and panoramic aluminium systems for high-end homes.", group: "Pages" },
    { path: "/signature/windows-doors", title: "Signature Luxe Windows & Doors", description: "Thermally broken and ultra-slim panoramic window and door systems.", group: "Pages" },
    { path: "/about", title: "About Atelier Supply Group", description: "Who we are and how we deliver projects Australia-wide.", group: "Pages" },
    { path: "/contact", title: "Contact", description: "Send your plans for a project-specific proposal.", group: "Pages" },
    { path: "/journal", title: "Journal", description: "Notes on materials, detailing and the projects we are working on.", group: "Pages" },
    { path: "/projects", title: "Projects", description: "Completed projects: windows and doors, custom joinery and bathroom packages.", group: "Pages" },
    { path: "/classic/colour-card", title: "Colours & Finishes", description: "Powdercoat finishes for aluminium windows and doors.", group: "Resources" },
    { path: "/classic/joinery-colour-card", title: "Joinery Colour Collection", description: "Woodgrain, solid colour and specialty finishes for custom joinery.", group: "Resources" },
    { path: "/classic/stone-collection", title: "Stone Collection", description: "Natural and engineered stone for benchtops and vanities.", group: "Resources" },
    { path: "/classic/door-hardware", title: "Door Hardware & Accessories", description: "Handles, locks and operating hardware for Classic systems.", group: "Resources" },
  ];

  for (const [cat, meta] of Object.entries(CATEGORY_META)) {
    out.push({ path: `/classic/${cat}`, title: `Classic ${meta.label}`, description: meta.body.join(" "), group: "Classic collections", image: meta.heroImg });
    for (const { slug, data } of await classicCategoryProducts(cat)) {
      if (cat === "bathrooms" && data.packageStyle && !available.has(slug)) continue;
      if (data.comingSoon) continue;
      out.push({ path: `/classic/${cat}/${slug}`, title: data.name, description: productSummary(data), group: meta.label, image: data.heroImg });
    }
  }
  for (const f of WD_FAMILIES) {
    out.push({ path: `/classic/windows-doors/series/${f.slug}`, title: `${f.name} Windows & Doors`, description: f.desc, group: "Windows & Doors" });
  }
  for (const c of cats) {
    // Anything still marked "coming soon" is not offered to search engines.
    if (c.comingSoon) continue;
    out.push({ path: `/classic/${c.slug}`, title: `Classic ${c.label}`, description: c.heroIntro, group: "Classic collections", image: c.heroImg });
    for (const { slug, data } of await classicCategoryProducts(c.slug)) {
      if (data.comingSoon) continue;
      out.push({ path: `/classic/${c.slug}/${slug}`, title: data.name, description: productSummary(data), group: c.label, image: data.heroImg });
    }
  }
  for (const post of await getPublishedPosts()) {
    if (post.comingSoon) continue;
    out.push({ path: `/journal/${post.slug}`, title: post.title, description: post.excerpt || post.subtitle || post.title, group: "Journal", image: post.coverImage || undefined });
  }
  for (const p of await getPublishedProjects()) {
    if (p.comingSoon) continue;
    out.push({ path: `/projects/${p.slug}`, title: p.title, description: p.summary || [p.location, p.year].filter(Boolean).join(" · ") || p.title, group: "Projects", image: p.coverImage || undefined });
  }
  for (const p of await getPublishedCustomPages()) {
    out.push({ path: `/${p.slug}`, title: p.title, description: p.metaDescription || p.subtitle || p.title, group: "Pages", image: p.heroImage || undefined });
  }
  for (const { slug, data } of listSignature("windows-doors")) {
    out.push({ path: `/signature/windows-doors/${slug}`, title: data.name, description: productSummary(data), group: "Signature Luxe", image: data.heroImg });
  }
  return out;
}
