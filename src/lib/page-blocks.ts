// Block-based category pages. Client-safe.
//
// A page is an ordered list of blocks. Each block has a type, a unique id, an
// optional hidden flag and its own data (field -> text). The page's own
// sections ("story", "range" ...) are block types that read their data with a
// fallback to the page's existing content, so a page with no saved blocks looks
// exactly as before. Generic blocks (text, gallery ...) can be added anywhere.

import { PAGE_SECTIONS, type PageKind } from "./section-layout";

export type Block = { uid: string; type: string; hidden?: boolean; data: Record<string, string> };

export type FieldKind = "text" | "textarea" | "image" | "rows" | "select" | "hotspots";
export type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  columns?: { label: string; image?: boolean; long?: boolean }[]; // for "rows" (parts joined with ::)
  options?: { value: string; label: string }[];                   // for "select"
  hint?: string;
};

export type GenericType = { type: string; label: string; description: string; fields: FieldSpec[]; defaults: Record<string, string> };

const T = (key: string, label: string): FieldSpec => ({ key, label, kind: "text" });
const A = (key: string, label: string, hint?: string): FieldSpec => ({ key, label, kind: "textarea", hint });
const I = (key: string, label: string): FieldSpec => ({ key, label, kind: "image" });
const R = (key: string, label: string, columns: FieldSpec["columns"]): FieldSpec => ({ key, label, kind: "rows", columns });

// ── Generic blocks (available on every category page) ───────────────────────
export const GENERIC_BLOCKS: GenericType[] = [
  {
    type: "g-text", label: "Text", description: "Eyebrow, headline and paragraphs.",
    fields: [T("eyebrow", "Eyebrow"), T("headline", "Headline"), A("body", "Body", "One paragraph per line."),
      { key: "align", label: "Alignment", kind: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Centre" }] },
      { key: "tone", label: "Background", kind: "select", options: [{ value: "light", label: "Light" }, { value: "sand", label: "Sand" }, { value: "dark", label: "Dark" }] }],
    defaults: { eyebrow: "NEW SECTION", headline: "A new headline.", body: "Write your text here.", align: "left", tone: "light" },
  },
  {
    type: "g-text-image", label: "Text + image", description: "Split layout with a photo on one side.",
    fields: [T("eyebrow", "Eyebrow"), T("headline", "Headline"), A("body", "Body", "One paragraph per line."), I("image", "Image"),
      { key: "side", label: "Image side", kind: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      T("button", "Button label (optional)"), T("link", "Button link")],
    defaults: { eyebrow: "THE DETAIL", headline: "A new headline.", body: "Write your text here.", image: "/Atelier_Classic.png", side: "left", button: "", link: "/contact" },
  },
  {
    type: "g-image", label: "Full-width image", description: "One large photo with an optional caption.",
    fields: [I("image", "Image"), T("caption", "Caption (optional)")],
    defaults: { image: "/Atelier_Classic.png", caption: "" },
  },
  {
    type: "g-gallery", label: "Gallery", description: "A grid of photos.",
    fields: [T("eyebrow", "Eyebrow"), T("headline", "Headline"), R("images", "Photos", [{ label: "Image", image: true }, { label: "Caption" }])],
    defaults: { eyebrow: "GALLERY", headline: "", images: "/Atelier_Classic.png :: \n/Atelier_Signature.png :: \n/vanities/OJS243-1200.jpg :: " },
  },
  {
    type: "g-tiles", label: "Image tiles", description: "Large image links with a title and button.",
    fields: [R("tiles", "Tiles", [{ label: "Title" }, { label: "Description", long: true }, { label: "Link" }, { label: "Button" }, { label: "Image", image: true }])],
    defaults: { tiles: "Colour Card :: Our finishes :: /classic/colour-card :: View the Colour Card :: /Atelier_Classic.png" },
  },
  {
    type: "g-steps", label: "Steps", description: "Numbered cards, e.g. a process.",
    fields: [T("eyebrow", "Eyebrow"), T("headline", "Headline"), R("steps", "Steps", [{ label: "Title" }, { label: "Description", long: true }])],
    defaults: { eyebrow: "THE PROCESS", headline: "How it works.", steps: "Share your plans :: Send us your drawings.\nWe specify :: We resolve every detail.\nWe deliver :: Inspected and delivered to site." },
  },
  {
    type: "g-faq", label: "FAQs", description: "Expandable questions and answers.",
    fields: [T("headline", "Headline"), R("faqs", "Questions", [{ label: "Question" }, { label: "Answer", long: true }])],
    defaults: { headline: "Questions, answered.", faqs: "Your question? :: Your answer." },
  },
  {
    type: "g-hotspots", label: "Image with hotspots", description: "A photo with numbered points that open a card.",
    fields: [
      T("eyebrow", "Eyebrow"), T("headline", "Headline"),
      { key: "hotspots", label: "Photo and points", kind: "hotspots" },
    ],
    defaults: { eyebrow: "", headline: "", hotspots: "" },
  },
  {
    type: "g-cta", label: "Call to action", description: "Centred headline and button over an image.",
    fields: [T("eyebrow", "Eyebrow"), T("headline", "Headline"), A("body", "Body", "One paragraph per line."), T("button", "Button label"), T("link", "Button link"), I("image", "Background image")],
    defaults: { eyebrow: "Atelier Classic", headline: "Ready to start?", body: "Send us your plans and we'll take it from there.", button: "Start Your Project Today", link: "/quote", image: "/Atelier_Classic.png" },
  },
];

export const GENERIC_BY_TYPE = Object.fromEntries(GENERIC_BLOCKS.map((g) => [g.type, g]));

// ── Page-specific block fields ───────────────────────────────────────────────
// Built-in pages: field keys are the page's content keys (Pages editor).
// Custom categories: field keys are the category's own fields.
export const CUSTOM_FIELDS: Record<string, FieldSpec[]> = {
  hero: [T("heroEyebrow", "Eyebrow"), A("heroIntro", "Intro"), T("heroCta", "Button label (blank hides it)"), I("heroImg", "Hero image")],
  story: [T("storyEyebrow", "Eyebrow"), T("storyHeadline", "Headline"), A("storyBody", "Body", "One paragraph per line."), I("storyImg", "Story image")],
  process: [T("processHeadline", "Headline"), R("processSteps", "Steps", [{ label: "Title" }, { label: "Description", long: true }])],
  range: [T("rangeHeadline", "Headline"), A("rangeIntro", "Intro"), T("cardCta", "Card button label")],
  tiles: [R("featureTiles", "Tiles", [{ label: "Title" }, { label: "Description", long: true }, { label: "Link" }, { label: "Image", image: true }])],
  building: [T("ctaHeadline", "Headline"), A("ctaBody", "Body")],
  faqs: [R("faqs", "Questions", [{ label: "Question" }, { label: "Answer", long: true }])],
};

/** Turn a registry label like "Tiles (Title :: Description :: Image URL, one per line)" into a field spec. */
export function specFromRegistry(f: { key: string; label: string; multiline?: boolean; image?: boolean }): FieldSpec {
  if (f.image) return I(f.key, f.label);
  const m = f.label.match(/^(.*?)\s*\(([^()]*::[^()]*?)(?:,\s*one per line)?\)\s*$/);
  if (m) {
    const columns = m[2].split("::").map((c) => c.trim()).map((c) => ({
      label: c.replace(/\s*URL$/i, ""),
      image: /image/i.test(c),
      long: /description|answer|paragraph|text/i.test(c),
    }));
    return R(f.key, m[1], columns);
  }
  const single = f.label.match(/^(.*?)\s*\((?:[A-Za-z ]+,\s*)?one per line\)\s*$/);
  if (single && !/paragraph/i.test(f.label)) return R(f.key, single[1], [{ label: "Item" }]);
  return f.multiline ? A(f.key, f.label) : T(f.key, f.label);
}

// ── Storage ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

export function sectionLabel(kind: PageKind, type: string) {
  return PAGE_SECTIONS[kind].find((d) => d.id === type)?.label ?? GENERIC_BY_TYPE[type]?.label ?? type;
}

export const isPinned = (kind: PageKind, type: string) => !!PAGE_SECTIONS[kind].find((d) => d.id === type)?.pinned;

/** Default page: the page's own sections, in their usual order, with no data of their own. */
export const defaultBlocks = (kind: PageKind): Block[] =>
  PAGE_SECTIONS[kind].map((d) => ({ uid: d.id, type: d.id, data: {} }));

/**
 * Read a stored page. Accepts the block JSON, the older "one id per line"
 * layout, or nothing (default page). Unknown types are dropped and the pinned
 * hero is kept first.
 */
export function parseBlocks(raw: string | undefined, kind: PageKind): Block[] {
  const own = new Set(PAGE_SECTIONS[kind].map((d) => d.id));
  const valid = (t: string) => own.has(t) || !!GENERIC_BY_TYPE[t];
  let blocks: Block[] = [];
  const text = (raw || "").trim();
  if (text.startsWith("[")) {
    try {
      const arr = JSON.parse(text) as Block[];
      blocks = arr
        .filter((b) => b && typeof b.type === "string" && valid(b.type))
        .map((b) => ({ uid: String(b.uid || uid()), type: b.type, hidden: !!b.hidden, data: b.data && typeof b.data === "object" ? b.data : {} }));
    } catch { blocks = []; }
  } else if (text) {
    const seen = new Set<string>();
    for (const line of text.split("\n")) {
      const t = line.trim();
      const hidden = t.startsWith("!");
      const id = hidden ? t.slice(1).trim() : t;
      if (!own.has(id) || seen.has(id)) continue;
      seen.add(id);
      blocks.push({ uid: id, type: id, hidden, data: {} });
    }
    for (const d of PAGE_SECTIONS[kind]) if (!seen.has(d.id)) blocks.push({ uid: d.id, type: d.id, data: {} });
  }
  if (!blocks.length) blocks = defaultBlocks(kind);
  const pinned = PAGE_SECTIONS[kind].filter((d) => d.pinned).map((d) => d.id);
  const head = pinned.map((p) => blocks.find((b) => b.type === p) ?? { uid: p, type: p, data: {} }).map((b) => ({ ...b, hidden: false }));
  return [...head, ...blocks.filter((b) => !pinned.includes(b.type))];
}

export function serializeBlocks(blocks: Block[], kind: PageKind): string {
  const def = defaultBlocks(kind);
  const same = blocks.length === def.length && blocks.every((b, i) => b.type === def[i].type && b.uid === def[i].uid && !b.hidden && !Object.keys(b.data).length);
  return same ? "" : JSON.stringify(blocks);
}

export const newBlock = (type: string): Block => ({ uid: uid(), type, data: { ...(GENERIC_BY_TYPE[type]?.defaults ?? {}) } });

/** A copy of a block with its own id. Page sections copy their current values so the copy stands alone. */
export const duplicateBlock = (b: Block, resolved: Record<string, string>): Block => ({ uid: uid(), type: b.type, hidden: b.hidden, data: { ...resolved, ...b.data } });

/** Value accessor for a block: its own data first, then the page's content. */
export const blockValue = (b: Block, fallback: (key: string) => string) => (key: string) =>
  b.data[key] !== undefined ? b.data[key] : fallback(key);
