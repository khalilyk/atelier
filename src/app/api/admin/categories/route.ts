import { NextRequest, NextResponse } from "next/server";
import { customCategories } from "@/lib/admin-store";
import { RESERVED_SLUGS, slugify, templateDefaults, type CustomCategory, type CategoryTemplate } from "@/lib/categories";
import { CATEGORY_META } from "@/app/classic/data";
import { getContent } from "@/lib/get-content";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

const TEMPLATES: CategoryTemplate[] = ["windows-doors", "joinery"];
const EDITABLE: (keyof CustomCategory)[] = [
  "label", "template", "published", "showInNav", "showOnLanding", "comingSoon", "order",
  "heroEyebrow", "heroIntro", "heroCta", "heroImg",
  "storyEyebrow", "storyHeadline", "storyBody", "storyImg",
  "processHeadline", "processSteps",
  "rangeHeadline", "rangeIntro", "cardCta",
  "featureTiles", "faqs", "ctaHeadline", "ctaBody",
  "landingQuote", "landingBody", "landingImg", "layout",
];

export async function GET() {
  return NextResponse.json(await customCategories.list());
}

/** The wanted slug, or the first free -2, -3 ... after it. */
async function freeSlug(wanted: string) {
  if (!RESERVED_SLUGS.has(wanted) && !(await customCategories.exists(wanted))) return wanted;
  for (let n = 2; n < 100; n++) {
    const candidate = `${wanted}-${n}`;
    if (!RESERVED_SLUGS.has(candidate) && !(await customCategories.exists(candidate))) return candidate;
  }
  return "";
}

// Create: { label, template, slug? } — or copy an existing one with { duplicateOf }.
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── Copying one of the three built-in categories makes a new editable
  // category from its current wording and images.
  if (body.duplicateBuiltIn) {
    const from = String(body.duplicateBuiltIn);
    const meta = CATEGORY_META[from];
    if (!meta) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const t = await getContent();
    const label = String(body.label ?? `${meta.label} (copy)`).trim() || `${meta.label} (copy)`;
    const slug = await freeSlug(slugify(String(body.slug || label)));
    if (!slug) return NextResponse.json({ error: "Could not find a free web address for the copy." }, { status: 400 });

    // Windows & doors has its own layout; the others share the joinery one.
    const template: CategoryTemplate = from === "windows-doors" ? "windows-doors" : "joinery";
    const paragraphs = (meta.story ?? meta.body).join("\n");
    const now = new Date().toISOString();

    const copy: CustomCategory = {
      ...templateDefaults(template, label),
      slug, label, template,
      heroIntro: t(`category.${from}.intro`) || meta.body.join(" "),
      heroImg: t(`category.${from}.heroImg`) || meta.heroImg,
      storyHeadline: t(`category.${from}.headline`) || meta.headline,
      storyBody: t(`category.${from}.story`) || paragraphs,
      storyImg: t(`category.${from}.storyImg`) || meta.storyImg,
      faqs: t(`category.${from}.faqs`) || "",
      published: false, showInNav: false, showOnLanding: false,
      createdAt: now, updatedAt: now,
    };
    await customCategories.put(copy);
    return NextResponse.json(copy);
  }

  // ── A copy keeps every field except its identity, and starts unpublished so
  // it cannot appear on the site or in the navigation by accident.
  if (body.duplicateOf) {
    const source = (await customCategories.list()).find((c) => c.slug === slugify(String(body.duplicateOf)));
    if (!source) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const label = String(body.label ?? `${source.label} (copy)`).trim() || `${source.label} (copy)`;
    const slug = await freeSlug(slugify(String(body.slug || label)));
    if (!slug) return NextResponse.json({ error: "Could not find a free web address for the copy." }, { status: 400 });

    const now = new Date().toISOString();
    const copy: CustomCategory = {
      ...source, slug, label,
      published: false, showInNav: false, showOnLanding: false,
      createdAt: now, updatedAt: now,
    };
    await customCategories.put(copy);
    return NextResponse.json(copy);
  }

  const label = String(body.label ?? "").trim();
  const template = body.template as CategoryTemplate;
  const slug = slugify(String(body.slug || label));
  if (label.length < 2) return NextResponse.json({ error: "Enter a category name." }, { status: 400 });
  if (!TEMPLATES.includes(template)) return NextResponse.json({ error: "Choose a template." }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "Enter a valid URL slug." }, { status: 400 });
  if (RESERVED_SLUGS.has(slug)) return NextResponse.json({ error: `"${slug}" is already used by the site. Choose another slug.` }, { status: 400 });

  if (await customCategories.exists(slug)) return NextResponse.json({ error: `A category with the slug "${slug}" already exists.` }, { status: 400 });

  const now = new Date().toISOString();
  const item: CustomCategory = {
    slug, label, template, ...templateDefaults(template, label),
    createdAt: now, updatedAt: now,
  };
  await customCategories.put(item);
  return NextResponse.json(item);
}

// Update: { slug, ...fields }
// The editor always sends the complete record, so the update is written as-is
// (whitelisted) without re-reading the store - no stale-read race.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const slug = String(body.slug ?? "");
  if (!slug || slug !== slugify(slug)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  if (!(await customCategories.exists(slug))) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  if (!TEMPLATES.includes(body.template)) return NextResponse.json({ error: "Invalid template" }, { status: 400 });

  const label = String(body.label ?? "").trim();
  const next = { ...templateDefaults(body.template, label || slug), slug, createdAt: String(body.createdAt || new Date().toISOString()) } as Record<string, unknown>;
  for (const k of EDITABLE) if (k in body) next[k] = body[k];
  for (const k of ["published", "showInNav", "showOnLanding", "comingSoon"] as const) next[k] = !!next[k];
  next.label = label || slug;
  next.order = Number(next.order) || 0;
  next.updatedAt = new Date().toISOString();
  await customCategories.put(next as CustomCategory);
  return NextResponse.json(next);
}

// Delete: { slug }  (its products stay in the products store but become unreachable)
export async function DELETE(req: NextRequest) {
  await snapshot("categories");
  const { slug } = await req.json();
  if (!(await customCategories.exists(String(slug)))) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  await customCategories.remove(String(slug));
  return NextResponse.json({ ok: true });
}
