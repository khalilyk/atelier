// Standalone pages you create yourself - a warranty page, trade terms, a
// landing page - each with its own web address and built from blocks.
// Client-safe: no server imports.

export type CustomPage = {
  slug: string;
  title: string;
  subtitle: string;       // shown under the title
  heroImage: string;      // optional banner
  heroAlt: string;
  body: string;           // block JSON (see page-blocks.ts)
  published: boolean;
  showInNav: boolean;     // add it to the footer links
  order: number;          // lower shows first in the footer
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
};

/** Addresses the site already uses, at the top level. */
export const PAGE_RESERVED = new Set([
  "", "about", "admin", "api", "classic", "signature", "contact", "quote",
  "journal", "projects", "components", "context", "icon.png", "llms.txt",
  "robots.txt", "sitemap.xml", "favicon.ico", "new", "page", "tag", "_next",
]);

export function pageSlug(s: string) {
  return (s || "")
    .toLowerCase().trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function emptyCustomPage(title: string): Omit<CustomPage, "createdAt" | "updatedAt"> {
  return {
    slug: pageSlug(title),
    title,
    subtitle: "",
    heroImage: "",
    heroAlt: "",
    body: "",
    published: false,
    showInNav: false,
    order: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}

/** Hand-ordered first, then alphabetical. */
export const sortCustomPages = (pages: CustomPage[]) =>
  [...pages].sort((a, b) =>
    (a.order || 9999) - (b.order || 9999) ||
    a.title.localeCompare(b.title));
