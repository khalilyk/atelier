// Block editing for product pages. Client-safe.
//
// Block data is text (field -> string). These helpers convert product fields
// (lists, label/value pairs, the project example) to and from that text, and
// list which fields each product page section edits.
import type { ProductData } from "@/app/classic/data";
import type { FieldSpec } from "./page-blocks";

export type ProductKind = "p-joinery" | "p-windows" | "p-bathroom";

const LISTS = new Set(["configurations", "performance", "glassOptions", "finishOptions", "sizes", "story", "gallery"]);
const PAIRS = new Set(["details", "profiles", "fixedInclusions"]);
const PROJECT = "projectExample.";

export const isProductKey = (key: string) =>
  !key.includes(".") || key.startsWith(PROJECT);

type Loose = Record<string, unknown>;

/** Product field -> editable text. */
export function productValue(d: Partial<ProductData>, key: string): string {
  const o = d as Loose;
  if (key.startsWith(PROJECT)) return String((d.projectExample as Loose | undefined)?.[key.slice(PROJECT.length)] ?? "");
  const v = o[key];
  if (LISTS.has(key)) return Array.isArray(v) ? (v as string[]).join("\n") : "";
  if (PAIRS.has(key)) return Array.isArray(v) ? (v as { label: string; value: string }[]).map((p) => `${p.label} :: ${p.value}`).join("\n") : "";
  return typeof v === "string" ? v : "";
}

const toLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/** Apply a block's text fields to a product (content keys are ignored). */
export function applyProductText(d: ProductData, map: Record<string, string>): ProductData {
  const out = { ...d } as Loose;
  const project = { ...((d.projectExample as Loose | undefined) ?? {}) } as Loose;
  let touchedProject = false;
  for (const [key, v] of Object.entries(map || {})) {
    if (!isProductKey(key)) continue;
    if (key.startsWith(PROJECT)) { project[key.slice(PROJECT.length)] = v; touchedProject = true; continue; }
    if (LISTS.has(key)) out[key] = toLines(v);
    else if (PAIRS.has(key)) out[key] = toLines(v).map((l) => { const [label = "", ...rest] = l.split("::"); return { label: label.trim(), value: rest.join("::").trim() }; });
    else out[key] = v;
  }
  if (touchedProject) out.projectExample = project;
  return out as ProductData;
}

const T = (key: string, label: string): FieldSpec => ({ key, label, kind: "text" });
const A = (key: string, label: string, hint?: string): FieldSpec => ({ key, label, kind: "textarea", hint });
const I = (key: string, label: string): FieldSpec => ({ key, label, kind: "image" });
const L = (key: string, label: string, item = "Item"): FieldSpec => ({ key, label, kind: "rows", columns: [{ label: item }] });
const P = (key: string, label: string): FieldSpec => ({ key, label, kind: "rows", columns: [{ label: "Label" }, { label: "Value" }] });
const G = (key: string, label: string): FieldSpec => ({ key, label, kind: "rows", columns: [{ label: "Image", image: true }] });

export const PRODUCT_SECTION_FIELDS: Record<ProductKind, Record<string, FieldSpec[]>> = {
  "p-joinery": {
    hero: [T("name", "Name"), A("tagline", "Tagline"), I("heroImg", "Hero image")],
    description: [A("description", "Description")],
    sample: [I("storyImg", "Sample project image")],
    renders: [G("gallery", "Renders & drawings")],
  },
  "p-windows": {
    hero: [T("name", "Name"), A("tagline", "Tagline"), T("certification", "Certification"), I("heroImg", "Hero image")],
    description: [A("description", "Description")],
    configurations: [L("configurations", "Configurations", "Configuration")],
    profiles: [P("profiles", "Frame profiles")],
    performance: [L("performance", "Performance features", "Feature")],
    options: [L("glassOptions", "Glass options", "Option"), L("finishOptions", "Finish options", "Option")],
    project: [T("projectExample.title", "Title"), T("projectExample.location", "Location"), A("projectExample.desc", "Description"), I("projectExample.img", "Image")],
    gallery: [G("gallery", "Gallery")],
  },
  "p-bathroom": {
    hero: [T("name", "Name"), T("packageStyle", "Package style"), A("tagline", "Tagline"), I("heroImg", "Hero image")],
    story: [A("story", "Story", "One paragraph per line."), I("storyImg", "Story image")],
    palette: [A("bath.pkg.palette.body", "Intro")],
    room: [A("bath.pkg.room.body", "Intro")],
    included: [P("fixedInclusions", "Fixed inclusions")],
    tapware: [T("bath.pkg.tapware.headline", "Headline"), A("bath.pkg.tapware.body", "Body")],
    certified: [T("bath.pkg.certified.headline", "Headline"), A("bath.pkg.certified.body", "Body"), L("bath.pkg.certified.points", "Points", "Point")],
    inspiration: [G("gallery", "Inspiration photos")],
    building: [T("bath.bwc.headline", "Headline"), A("bath.bwc.body", "Body", "One paragraph per line."), T("bath.bwc.cta", "Button label")],
  },
};

/** Which page layout a product uses. */
export function productKind(category: string, data: { packageStyle?: string }, template?: "windows-doors" | "joinery"): ProductKind | null {
  if (category === "bathrooms") return data.packageStyle ? "p-bathroom" : null;
  if (category === "windows-doors" || category.startsWith("signature-") || template === "windows-doors") return "p-windows";
  if (category === "joinery" || template === "joinery") return "p-joinery";
  return null;
}
