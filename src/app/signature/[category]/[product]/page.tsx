import { pageMetadata, breadcrumbLd, productLd } from "@/lib/seo";
import { productSummary } from "@/lib/seo-catalog";
import JsonLd from "../../../components/JsonLd";
import { getProduct, signatureOverrideCategory, type ProductData } from "../../data";
import { getProductOverrides } from "@/lib/get-content";
import { resolveProduct } from "@/lib/product-content";
import type { ProductData as ClassicProductData } from "../../../classic/data";

async function load(category: string, product: string) {
  return resolveProduct(getProduct(category, product) as ClassicProductData | null, signatureOverrideCategory(category), product, await getProductOverrides()) as ProductData | null;
}
import { notFound } from "next/navigation";
import PageClient from "./PageClient";

type Props = { params: Promise<{ category: string; product: string }> };

export async function generateMetadata({ params }: Props) {
  const { category, product } = await params;
  const data = await load(category, product);
  if (!data) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    path: `/signature/${category}/${product}`,
    title: `${data.name} | Signature Luxe ${data.categoryLabel}`,
    description: productSummary(data),
    image: data.heroImg,
  });
}

export default async function Page({ params }: Props) {
  const { category, product } = await params;
  const data = await load(category, product);
  if (!data) notFound();
  const ld = data ? [
    breadcrumbLd([["Home", "/"], ["Signature", "/signature"], [data.categoryLabel, `/signature/${category}`], [data.name, `/signature/${category}/${product}`]]),
    productLd({ name: data.name, description: productSummary(data), path: `/signature/${category}/${product}`, image: data.heroImg, category: `Signature Luxe ${data.categoryLabel}` }),
  ] : null;
  return (
    <>
      <JsonLd data={ld} />
      <PageClient params={params} />
    </>
  );
}
