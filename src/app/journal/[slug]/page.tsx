import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import JsonLd from "../../components/JsonLd";
import ArticleView from "../ArticleView";
import ReadingProgress from "./ReadingProgress";
import { getContent, getPublishedPosts } from "@/lib/get-content";
import { abs, breadcrumbLd, pageMetadata, truncate } from "@/lib/seo";
import { JOURNAL_AUTHOR } from "@/lib/journal";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const posts = await getPublishedPosts();
  const post = posts.find((p) => p.slug === slug) ?? null;
  return { post, posts };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { post } = await load(slug);
  if (!post) return { title: "Not found", robots: { index: false } };
  return {
    ...(await pageMetadata({
      path: `/journal/${post.slug}`,
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || post.subtitle || post.title,
      image: post.ogImage || post.coverImage || undefined,
    })),
    keywords: post.tags.length ? post.tags : undefined,
    ...(post.comingSoon ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { post, posts } = await load(slug);
  if (!post) notFound();
  const t = await getContent();

  // Posts sharing a tag come first, then the most recent ones, so there is
  // always something to read next.
  const others = posts.filter((p) => p.slug !== post.slug && !p.comingSoon);
  const sameTag = others.filter((p) => p.tags.some((tag) => post.tags.includes(tag)));
  const related = [...sameTag, ...others.filter((p) => !sameTag.includes(p))].slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <ReadingProgress />
      <SiteHeader variant="solid" breadcrumb="Journal" />
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Journal", "/journal"], [post.title, `/journal/${post.slug}`]]),
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: truncate(post.metaDescription || post.excerpt || post.subtitle || "", 300),
          image: post.ogImage || post.coverImage ? abs(post.ogImage || post.coverImage) : undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt?.slice(0, 10) || post.publishedAt,
          keywords: post.tags.join(", ") || undefined,
          wordCount: undefined,
          articleSection: post.tags[0] || undefined,
          mainEntityOfPage: abs(`/journal/${post.slug}`),
          author: { "@type": "Organization", name: JOURNAL_AUTHOR, url: abs("/") },
          publisher: { "@id": abs("/#organization") },
        },
      ]} />

      <ArticleView post={post} />

      {/* ── RELATED: two halves, full width ── */}
      {related.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
          {related.map((p, i) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[42vh] md:min-h-[440px]">
              {p.coverImage && <Image src={p.coverImage} alt={p.coverAlt || p.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
              <div className="relative z-10 max-w-md">
                <p className="type-label text-[#d9b877] mb-3" style={{ letterSpacing: "0.16em" }}>KEEP READING</p>
                <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 300, lineHeight: 1.1 }}>{p.title}</h2>
                {(p.excerpt || p.subtitle) && (
                  <p className="type-body text-white/75 mb-5" style={{ lineHeight: 1.75, fontSize: "14px" }}>{p.excerpt || p.subtitle}</p>
                )}
                {/* The left half points left, the right half points right. */}
                <span className={`arrow-link type-button text-white border-b border-white/50 pb-px w-fit inline-block ${i === 0 ? "arrow-left" : ""}`} style={{ letterSpacing: "0.1em" }}>
                  {i === 0 ? <><span className="arrow">←</span>&nbsp; Read the article</> : <>Read the article &nbsp;<span className="arrow">→</span></>}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* ── CLOSING CTA - same treatment as the other pages ── */}
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        {t("journal.cta.img") && <Image src={t("journal.cta.img")} alt="" fill className="object-cover object-center" />}
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">{t("journal.cta.eyebrow")}</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{t("journal.cta.headline")}</h2>
          <p className="type-body text-stone-600 mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>{t("journal.cta.body")}</p>
          <Link href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            {t("journal.cta.button")} &nbsp;<span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
