import { NextRequest, NextResponse } from "next/server";
import { productContent, customCategories } from "@/lib/admin-store";
import { ALL_PRODUCTS } from "@/app/classic/data";
import { listProducts as listSignature, signatureOverrideCategory } from "@/app/signature/data";
import { snapshot } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";

const CLASSIC_CATEGORIES = ["windows-doors", "joinery", "bathrooms"];
// Signature products are edited under their own prefix (edits only, no new products).
const SIGNATURE = { [signatureOverrideCategory("windows-doors")]: "windows-doors" } as Record<string, string>;

// Built-in categories plus any created in Admin > Categories.
async function allCategories() {
  const custom = await customCategories.list();
  return {
    slugs: [...CLASSIC_CATEGORIES, ...custom.map((c) => c.slug), ...Object.keys(SIGNATURE)],
    templates: Object.fromEntries(custom.map((c) => [c.slug, c.template])) as Record<string, string>,
    labels: { ...Object.fromEntries(custom.map((c) => [c.slug, c.label])), [signatureOverrideCategory("windows-doors")]: "Signature Windows & Doors" } as Record<string, string>,
  };
}

export async function GET() {
  const overrides = await productContent.get();
  const { slugs, labels, templates } = await allCategories();
  const catalog = slugs.map((category) => ({
    category,
    label: labels[category],
    template: templates[category],
    products: SIGNATURE[category]
      ? listSignature(SIGNATURE[category])
      : Object.entries(ALL_PRODUCTS[category] ?? {}).map(([slug, data]) => ({ slug, data })),
  }));
  return NextResponse.json({ catalog, overrides });
}

export async function PATCH(req: NextRequest) {
  await snapshot("product-content.json");
  const data = await req.json();
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  // Accept keys whose category is a valid classic category (allows custom/new
  // slugs as well as overrides on code products).
  const { slugs } = await allCategories();
  const clean: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    const cat = k.split("/")[0];
    const slug = k.slice(cat.length + 1);
    if (slugs.includes(cat) && slug && v && typeof v === "object" && Object.keys(v as object).length > 0) {
      clean[k] = v as Record<string, unknown>;
    }
  }
  await productContent.set(clean);
  return NextResponse.json({ ok: true });
}
