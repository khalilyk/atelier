import { notFound } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import JsonLd from "../components/JsonLd";
import PageView from "./PageView";
import { getPublishedCustomPages } from "@/lib/get-content";
import { abs, breadcrumbLd, pageMetadata, truncate } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return (await getPublishedCustomPages()).find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await load(slug);
  if (!page) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    path: `/${page.slug}`,
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.subtitle || page.title,
    image: page.ogImage || page.heroImage || undefined,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await load(slug);
  // Anything that is not one of your pages is a genuine 404.
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb={page.title} />
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], [page.title, `/${page.slug}`]]),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: truncate(page.metaDescription || page.subtitle || "", 300),
          url: abs(`/${page.slug}`),
          isPartOf: { "@id": abs("/#website") },
        },
      ]} />

      <PageView page={page} />

      <SiteFooter />
    </div>
  );
}
