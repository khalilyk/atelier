"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useT } from "../components/ContentProvider";
import { allTags, postDate, readingMinutes, type JournalPost } from "@/lib/journal";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function Card({ post, big }: { post: JournalPost; big?: boolean }) {
  // An article still being written is listed, but does not open.
  const soon = !!post.comingSoon;
  const shell = `group flex flex-col ${big ? "md:col-span-2 md:flex-row md:gap-10 md:items-center" : ""}`;
  const inner = (
    <>
      <div className={`relative overflow-hidden rounded-2xl bg-stone-200 ${big ? "w-full md:w-1/2 aspect-[4/3]" : "w-full aspect-[4/3]"}`}>
        {post.coverImage && (
          <Image src={post.coverImage} alt={post.coverAlt || post.title} fill sizes={big ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"} className={`object-cover transition-transform duration-700 ${soon ? "" : "group-hover:scale-105"}`} />
        )}
        {soon && (
          <span className="absolute top-3 left-3 z-10 type-label bg-[#2c2620]/85 text-[#e9c98a] px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.14em" }}>COMING SOON</span>
        )}
      </div>
      <div className={big ? "md:w-1/2 pt-6 md:pt-0" : "pt-5"}>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} className="type-label text-[#b8934a] border border-[#b8934a]/30 rounded-full px-2.5 py-0.5" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>{t}</span>
          ))}
          <span className="type-label text-stone-400" style={{ fontSize: "10.5px" }}>{postDate(post)} · {readingMinutes(post)} min read</span>
        </div>
        <h2 className={`type-product text-stone-900 transition-colors mb-2 ${soon ? "" : "group-hover:text-[#b8934a]"}`} style={{ fontSize: big ? "clamp(26px, 3vw, 40px)" : "clamp(20px, 2vw, 26px)", lineHeight: 1.15 }}>{post.title}</h2>
        {(post.excerpt || post.subtitle) && (
          <p className="type-body text-stone-500" style={{ lineHeight: 1.8, fontSize: big ? "15px" : "13.5px" }}>{post.excerpt || post.subtitle}</p>
        )}
        {soon ? (
          <span className="type-button text-stone-400 inline-block mt-4" style={{ letterSpacing: "0.1em" }}>Coming soon</span>
        ) : (
          <span className="arrow-link type-button text-[#b8934a] inline-block mt-4" style={{ letterSpacing: "0.1em" }}>Read the article &nbsp;<span className="arrow">→</span></span>
        )}
      </div>
    </>
  );

  return soon
    ? <div className={shell} aria-disabled>{inner}</div>
    : <Link href={`/journal/${post.slug}`} className={shell}>{inner}</Link>;
}

export default function JournalList({ posts, tag }: { posts: JournalPost[]; tag?: string }) {
  const t = useT();
  const tags = useMemo(() => allTags(posts), [posts]);
  const [active, setActive] = useState(tag ?? "");
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;
  const [lead, ...rest] = shown;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Journal" />

      {/* Hero - same split layout as the About page */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[62vh]">
        <div className="flex flex-col justify-center px-10 md:px-16 py-20 md:py-28">
          <p className="type-label text-[#b8934a] mb-8" style={{ letterSpacing: "0.18em" }}>{t("journal.eyebrow")}</p>
          <h1 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(34px, 5vw, 68px)", lineHeight: 1.05 }}>
            {lines(t("journal.headline")).map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)}
          </h1>
          <div className="w-8 h-px bg-[#b8934a] mb-8" />
          {t("journal.intro") && <p className="type-body text-stone-600 max-w-sm" style={{ lineHeight: 1.9 }}>{t("journal.intro")}</p>}
        </div>
        <div className="relative min-h-[46vh] md:min-h-0">
          {t("journal.heroImg") && <Image src={t("journal.heroImg")} alt="Atelier journal" fill className="object-cover object-center" priority />}
        </div>
      </section>

      {/* Tag filters */}
      {tags.length > 0 && (
        <section className="px-6 md:px-8 pt-12">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
            <button onClick={() => setActive("")} className={`type-label px-3 py-1.5 rounded-full border transition-colors ${!active ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"}`} style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>ALL</button>
            {tags.map((tg) => (
              <button key={tg} onClick={() => setActive(tg === active ? "" : tg)} className={`type-label px-3 py-1.5 rounded-full border transition-colors ${active === tg ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"}`} style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>{tg.toUpperCase()}</button>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 md:px-8 pt-12 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
          {shown.length === 0 ? (
            <p className="type-body text-stone-400 py-16 text-center">{t("journal.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">
              {lead && <Card post={lead} big />}
              {rest.map((p) => <Card key={p.slug} post={p} />)}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
