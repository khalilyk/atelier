import { getPublishedPosts } from "@/lib/get-content";
import { pageMetadata, breadcrumbLd, abs } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import { JOURNAL_AUTHOR } from "@/lib/journal";
import JournalList from "./JournalList";

export function generateMetadata() {
  return pageMetadata({
    path: "/journal",
    title: "Journal",
    description: "Notes on materials, detailing and the projects we are working on: windows and doors, custom joinery and bathroom packages for Australian homes.",
  });
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [posts, params] = await Promise.all([getPublishedPosts(), searchParams]);
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Journal", "/journal"]]),
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Atelier Supply Group Journal",
          url: abs("/journal"),
          blogPost: posts.slice(0, 20).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: abs(`/journal/${p.slug}`),
            datePublished: p.publishedAt,
            description: p.excerpt || p.subtitle || undefined,
            keywords: p.tags.join(", ") || undefined,
            dateModified: p.updatedAt?.slice(0, 10) || p.publishedAt,
            author: { "@type": "Organization", name: JOURNAL_AUTHOR },
          })),
        },
      ]} />
      <JournalList posts={posts} tag={tag} />
    </>
  );
}
