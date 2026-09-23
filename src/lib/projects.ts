// Projects (the portfolio). Client-safe: no server imports.
//
// A project's body is built from the same blocks as the rest of the site, so a
// case study can mix text, photo galleries and calls to action.

export type Project = {
  slug: string;
  title: string;
  location: string;      // "Vaucluse, Sydney"
  year: string;          // "2025", or a range
  client: string;        // architect, builder or developer
  scope: string;         // "Windows & doors, custom joinery"
  summary: string;       // card text and meta description fallback
  coverImage: string;
  coverAlt: string;
  gallery: string;        // "image URL :: caption", one per line
  tags: string[];
  body: string;          // block JSON (see page-blocks.ts)
  published: boolean;
  /** Listed with a "Coming soon" badge and no link through to the project. */
  comingSoon?: boolean;
  order: number;         // lower shows first; 0 falls back to the year
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
};

export const PROJECT_RESERVED = new Set(["", "new", "admin", "api", "tag", "page"]);

export function projectSlug(s: string) {
  return (s || "")
    .toLowerCase().trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const parseTags = (s: string) =>
  [...new Set((s || "").split(",").map((t) => t.trim()).filter(Boolean))];

export function emptyProject(title: string): Omit<Project, "createdAt" | "updatedAt"> {
  return {
    slug: projectSlug(title),
    title,
    location: "",
    year: String(new Date().getFullYear()),
    client: "",
    scope: "",
    summary: "",
    coverImage: "",
    coverAlt: "",
    gallery: "",
    tags: [],
    body: "",
    published: false,
    comingSoon: false,
    order: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}

/** The line under a project's name on a card: location and year. */
export const projectMeta = (p: Pick<Project, "location" | "year">) =>
  [p.location, p.year].filter(Boolean).join(" · ");

/** Hand-ordered first, then newest year, then most recently added. */
export const sortProjects = (projects: Project[]) =>
  [...projects].sort((a, b) =>
    (a.order || 9999) - (b.order || 9999) ||
    (b.year || "").localeCompare(a.year || "") ||
    b.createdAt.localeCompare(a.createdAt));

/** The gallery as [url, caption] pairs, blanks dropped. */
export const galleryRows = (gallery: string): [string, string][] =>
  (gallery || "").split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => l.split("::").map((c) => c.trim()))
    .filter((r) => r[0])
    .map((r) => [r[0], r[1] ?? ""] as [string, string]);

export const allTags = (projects: Project[]) =>
  [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
