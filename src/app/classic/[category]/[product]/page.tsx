import { pageMetadata, breadcrumbLd, productLd } from "@/lib/seo";
import { bathAvailable, classicProduct, customCategory, productSummary } from "@/lib/seo-catalog";
import JsonLd from "../../../components/JsonLd";
import { CATEGORY_META } from "../../data";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>>; params: Promise<{ category: string; product: string }> };

async function info(category: string, slug: string) {
  const data = await classicProduct(category, slug);
  if (!data) return null;
  const label = CATEGORY_META[category]?.label || (await customCategory(category))?.label || data.categoryLabel;
  const comingSoon = !!data.comingSoon || (category === "bathrooms" && !!data.packageStyle && !(await bathAvailable()).has(slug));
  return { data, label, comingSoon };
}

export async function generateMetadata({ params }: Props) {
  const { category, product } = await params;
  const i = await info(category, product);
  if (!i) return { title: "Not found", robots: { index: false } };
  const { data, label } = i;
  const suffix = data.packageStyle ? `${data.packageStyle} Bathroom Package` : label;
  return pageMetadata({
    path: `/classic/${category}/${product}`,
    title: `${data.name} | ${suffix}`,
    description: productSummary(data),
    image: data.heroImg || undefined,
    noindex: i.comingSoon,
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { category, product } = await params;
  const preview = (await searchParams).preview === "1";
  const i = await info(category, product);
  if (!i && !preview) notFound();
  // A product marked "coming soon" has no page yet. Preview still works while
  // signed in, so it can be checked before it opens.
  if (i?.data.comingSoon && !preview) notFound();
  const ld = i && !i.comingSoon ? [
    breadcrumbLd([["Home", "/"], ["Classic", "/classic"], [i.label, `/classic/${category}`], [i.data.name, `/classic/${category}/${product}`]]),
    productLd({ name: i.data.name, description: productSummary(i.data), path: `/classic/${category}/${product}`, image: i.data.heroImg || undefined, category: i.label }),
  ] : null;
  return (
    <>
      <JsonLd data={ld} />
      <PageClient params={params} />
    </>
  );
}
