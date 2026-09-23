import { pageMetadata, breadcrumbLd, collectionLd, faqLd } from "@/lib/seo";
import { classicCategoryProducts, customCategory, productSummary } from "@/lib/seo-catalog";
import { getContent } from "@/lib/get-content";
import { rows } from "@/lib/categories";
import { parseBlocks } from "@/lib/page-blocks";
import { layoutKey } from "@/lib/category-copy";
import JsonLd from "../../components/JsonLd";
import { CATEGORY_META } from "../data";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>>; params: Promise<{ category: string }> };

const TITLES: Record<string, string> = {
  "windows-doors": "Aluminium Windows & Doors",
  joinery: "Custom Joinery: Kitchens, Wardrobes & Vanities",
  bathrooms: "Bathroom Packages",
};

async function info(category: string) {
  const meta = CATEGORY_META[category];
  if (meta) return { label: meta.label, title: TITLES[category] || meta.label, description: meta.body.join(" "), image: meta.heroImg };
  const c = await customCategory(category);
  if (!c) return null;
  return { label: c.label, title: c.label, description: c.heroIntro || c.storyBody || c.label, image: c.heroImg };
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const i = await info(category);
  if (!i) return { title: "Not found", robots: { index: false } };
  return pageMetadata({ path: `/classic/${category}`, title: `${i.title} | Classic Collection`, description: i.description, image: i.image });
}

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;
  const preview = (await searchParams).preview === "1";
  const i = await info(category);
  if (!i && !preview) notFound();
  let ld: (object | null)[] = [];
  if (i) {
    const products = await classicCategoryProducts(category);
    const items = products
      .filter((p) => category !== "bathrooms" || p.data.packageStyle)
      .map((p) => ({ name: p.data.name, path: `/classic/${category}/${p.slug}` }));
    // FAQs from every visible FAQ block on the page (page FAQs and added FAQ blocks).
    const t = await getContent();
    const custom = CATEGORY_META[category] ? null : await customCategory(category);
    const kind = custom ? "custom" : (category as "windows-doors" | "joinery" | "bathrooms");
    const blocks = parseBlocks(custom ? custom.layout : t(layoutKey(category)), kind);
    const faqKey = custom ? "faqs" : category === "bathrooms" ? "bath.faqs" : "category.joinery.faqs";
    const toFaqs = (raw: string) => rows(raw).map(([q, a]) => ({ q: q || "", a: a || "" }));
    const faqs: { q: string; a: string }[] = [];
    for (const b of blocks) {
      if (b.hidden) continue;
      if (b.type === "g-faq") faqs.push(...toFaqs(b.data.faqs || ""));
      else if (b.type === "faqs" && kind !== "windows-doors") {
        const fallback = custom ? custom.faqs : t(faqKey);
        faqs.push(...toFaqs(b.data[faqKey] ?? fallback));
      }
    }
    ld = [
      breadcrumbLd([["Home", "/"], ["Classic", "/classic"], [i.label, `/classic/${category}`]]),
      collectionLd({ name: `Classic ${i.label}`, description: i.description || productSummary({}), path: `/classic/${category}`, items }),
      faqLd(faqs),
    ];
  }
  return (
    <>
      <JsonLd data={ld} />
      <PageClient params={params} />
    </>
  );
}
