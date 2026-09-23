// Journal (blog) posts. Client-safe: no server imports.
//
// A post's body is built from the same blocks as the rest of the site, so it
// can mix text, images, galleries and calls to action.

export type JournalPost = {
  slug: string;
  title: string;
  subtitle: string;      // shown under the title and used as the excerpt fallback
  excerpt: string;       // card text and meta description fallback
  coverImage: string;
  coverAlt: string;
  tags: string[];
  body: string;          // block JSON (see page-blocks.ts)
  published: boolean;
  /** Listed with a "Coming soon" badge and no link through to the article. */
  comingSoon?: boolean;
  publishedAt: string;   // ISO date; used for ordering and shown on the post
  readMinutes: number;   // 0 = work it out from the body
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
};

export const JOURNAL_RESERVED = new Set(["", "new", "admin", "api", "tag", "page"]);

export function journalSlug(s: string) {
  return (s || "")
    .toLowerCase().trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const parseTags = (s: string) =>
  [...new Set((s || "").split(",").map((t) => t.trim()).filter(Boolean))];

export function emptyPost(title: string): Omit<JournalPost, "createdAt" | "updatedAt"> {
  return {
    slug: journalSlug(title),
    title,
    subtitle: "",
    excerpt: "",
    coverImage: "",
    coverAlt: "",
    tags: [],
    body: "",
    published: false,
    comingSoon: false,
    publishedAt: new Date().toISOString().slice(0, 10),
    readMinutes: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}

/** Rough reading time from the post's block text. */
export function readingMinutes(post: Pick<JournalPost, "body" | "subtitle" | "readMinutes">): number {
  if (post.readMinutes > 0) return post.readMinutes;
  let words = (post.subtitle || "").split(/\s+/).length;
  try {
    for (const b of JSON.parse(post.body || "[]") as { data?: Record<string, string> }[]) {
      for (const v of Object.values(b.data ?? {})) words += String(v).split(/\s+/).length;
    }
  } catch { /* body not set yet */ }
  return Math.max(1, Math.round(words / 200));
}

export const postDate = (p: Pick<JournalPost, "publishedAt">) =>
  new Date(p.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

/** The one byline for every article. */
export const JOURNAL_AUTHOR = "Atelier Supply Group";

/** Newest first. */
export const sortPosts = (posts: JournalPost[]) =>
  [...posts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) ||
    b.createdAt.localeCompare(a.createdAt));

export const allTags = (posts: JournalPost[]) =>
  [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
