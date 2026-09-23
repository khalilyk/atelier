// Block layouts for the site pages (Home, About, Classic, Signature, Contact):
// the Pages admin group each belongs to, and which content fields belong to
// each section. Client-safe.
import type { PageKind } from "./section-layout";

export type SitePage = "home" | "about" | "classic" | "signature" | "contact";

export const SITE_PAGES: { kind: SitePage; group: string; label: string; path: string }[] = [
  { kind: "home", group: "Homepage", label: "Home", path: "/" },
  { kind: "about", group: "About", label: "About", path: "/about" },
  { kind: "classic", group: "Classic Landing", label: "Classic", path: "/classic" },
  { kind: "signature", group: "Signature Landing", label: "Signature", path: "/signature" },
  { kind: "contact", group: "Contact", label: "Contact", path: "/contact" },
];

export const pageLayoutKey = (kind: SitePage) => `page.${kind}.layout`;
export const SITE_PAGE_BY_GROUP = Object.fromEntries(SITE_PAGES.map((p) => [p.group, p]));

const range = (n: number, f: (i: number) => string[]) => Array.from({ length: n }, (_, i) => f(i + 1)).flat();

export const PAGE_SECTION_KEYS: Partial<Record<PageKind, Record<string, string[]>>> = {
  home: {
    offering: ["home.offering"],
    hero: ["home.hero.classic.image", "home.hero.signature.image"],
    about: ["home.about.eyebrow", "home.about.headline", "home.about.body"],
    difference: ["difference.eyebrow", ...range(4, (n) => [`difference.${n}.title`, `difference.${n}.desc`])],
    projects: ["home.projects.link"],
    journal: ["home.journal.eyebrow", "home.journal.headline", "home.journal.link", "home.journal.button", "home.journal.items"],
    cta: ["home.cta.headline", "home.cta.body", "home.cta.button", "home.cta.link"],
  },
  about: {
    hero: ["about.hero.headline", "about.hero.body"],
    story: ["about.story.headline", "about.story.body"],
    capability: ["about.capability.headline", "about.capability.body"],
    process: ["about.process.headline", "about.process.intro", ...range(4, (n) => [`about.process.${n}.title`, `about.process.${n}.body`])],
  },
  classic: {
    hero: ["classic.hero.body"],
    categories: ["classic.windows-doors.quote", "classic.windows-doors.body", "classic.joinery.quote", "classic.joinery.body", "classic.bathrooms.quote", "classic.bathrooms.body"],
    why: ["classic.why.headline", "classic.why.body"],
    closing: ["classic.cta.headline", "classic.cta.body", "classic.signature.headline", "classic.signature.body"],
  },
};

/** New content fields and one layout field per site page, for the registry. */
export function pageCopyFields() {
  const out: { key: string; group: string; label: string; default: string; multiline?: boolean; image?: boolean; layout?: boolean }[] = [
    { key: "projects.eyebrow", group: "Projects", label: "Eyebrow", default: "PROJECTS" },
    { key: "projects.headline", group: "Projects", label: "Headline (one line per row)", multiline: true, default: "Spaces that\ninspire." },
    { key: "projects.heroImg", group: "Projects", label: "Hero image", image: true, default: "/Atelier_Classic.png" },
    { key: "projects.intro", group: "Projects", label: "Intro", multiline: true, default: "We collaborate with leading architects, designers and developers to deliver timeless interiors across commercial and residential spaces." },
    { key: "projects.empty", group: "Projects", label: "Message when there are no projects yet", multiline: true, default: "Our first case studies are being prepared. Check back soon." },
    { key: "projects.cta.eyebrow", group: "Projects", label: "Project footer - eyebrow", default: "Atelier Supply Group" },
    { key: "projects.cta.headline", group: "Projects", label: "Project footer - headline", default: "Planning something similar?" },
    { key: "projects.cta.body", group: "Projects", label: "Project footer - text", multiline: true, default: "Send us your plans and we will help specify windows, doors, joinery or a bathroom package." },
    { key: "projects.cta.button", group: "Projects", label: "Project footer - button", default: "Start your project" },
    { key: "projects.cta.img", group: "Projects", label: "Project footer - background image", image: true, default: "/Atelier_Classic.png" },
    { key: "home.projects.link", group: "Homepage", label: "Projects section - where \"View All Projects\" goes", default: "/projects" },
    { key: "journal.eyebrow", group: "Journal", label: "Eyebrow", default: "JOURNAL" },
    { key: "journal.headline", group: "Journal", label: "Headline (one line per row)", multiline: true, default: "Insights. Inspiration.\nIdeas that shape spaces." },
    { key: "journal.heroImg", group: "Journal", label: "Hero image", image: true, default: "/Atelier_Classic.png" },
    { key: "journal.intro", group: "Journal", label: "Intro", multiline: true, default: "Notes on materials, detailing and the projects we are working on." },
    { key: "journal.empty", group: "Journal", label: "Message when there are no posts yet", multiline: true, default: "The first articles are being written. Check back soon." },
    { key: "journal.cta.eyebrow", group: "Journal", label: "Article footer - eyebrow", default: "Atelier Supply Group" },
    { key: "journal.cta.headline", group: "Journal", label: "Article footer - headline", default: "Planning a project?" },
    { key: "journal.cta.body", group: "Journal", label: "Article footer - text", multiline: true, default: "Send us your plans and we will help specify windows, doors, joinery or a bathroom package." },
    { key: "journal.cta.button", group: "Journal", label: "Article footer - button", default: "Start your project" },
    { key: "journal.cta.img", group: "Journal", label: "Article footer - background image", image: true, default: "/Atelier_Classic.png" },
    { key: "home.journal.eyebrow", group: "Homepage", label: "Journal - eyebrow", default: "Journal" },
    { key: "home.journal.headline", group: "Homepage", label: "Journal - headline (one line per row)", multiline: true, default: "Insights. Inspiration.\nIdeas that shape spaces." },
    { key: "home.journal.button", group: "Homepage", label: "Journal - button label", default: "View All Articles" },
    { key: "home.journal.link", group: "Homepage", label: "Journal - button link", default: "/journal" },
    {
      key: "home.journal.items", group: "Homepage", label: "Journal - placeholder articles, used until you publish posts (Title :: Description :: Image URL :: Link, one per line)", multiline: true,
      default: [
        "Design Notes :: Timeless materials and considered details. :: /Atelier_Classic.png :: /journal",
        "Project Spotlight :: An inside look at our latest projects. :: /Atelier_Signature.png :: /journal",
        "Material Stories :: Exploring the craft and process behind the pieces. :: /Atelier_Classic.png :: /journal",
      ].join("\n"),
    },
    { key: "home.cta.headline", group: "Homepage", label: "Call to action - headline (one line per row)", multiline: true, default: "Creating something\nextraordinary?" },
    { key: "home.cta.body", group: "Homepage", label: "Call to action - text", multiline: true, default: "Whether it's a single room or an entire building, we help bring your vision to life with precision and care." },
    { key: "home.cta.button", group: "Homepage", label: "Call to action - button label", default: "Start Your Project" },
    { key: "home.cta.link", group: "Homepage", label: "Call to action - button link", default: "/quote" },
  ];
  for (const p of SITE_PAGES) out.push({ key: pageLayoutKey(p.kind), group: p.group, label: "Page blocks", default: "", layout: true });
  return out;
}
