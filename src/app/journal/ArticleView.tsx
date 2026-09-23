"use client";
import Image from "next/image";
import Link from "next/link";
import ArticleBody from "./[slug]/ArticleBody";
import ShareRow from "../components/ShareRow";
import { postDate, readingMinutes, type JournalPost } from "@/lib/journal";

/**
 * The visible part of a journal article. Shared by the live page and the
 * admin's live preview, so the preview cannot drift from the real thing.
 * In preview mode the links are inert and nothing is asked to preload.
 */
export default function ArticleView({ post, preview }: { post: JournalPost; preview?: boolean }) {
  const tags = post.tags ?? [];
  return (
    <article>
      <header className="px-6 md:px-8 pt-14 md:pt-20 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          {preview ? (
            <span className="type-label text-stone-400" style={{ letterSpacing: "0.14em" }}>← JOURNAL</span>
          ) : (
            <Link href="/journal" className="type-label text-stone-400 hover:text-stone-700 transition-colors" style={{ letterSpacing: "0.14em" }}>← JOURNAL</Link>
          )}
          <div className="flex items-center justify-center gap-3 flex-wrap mt-6 mb-5">
            {tags.map((tag) => (
              preview ? (
                <span key={tag} className="type-label text-[#b8934a] border border-[#b8934a]/30 rounded-full px-3 py-1" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>{tag}</span>
              ) : (
                <Link key={tag} href={`/journal?tag=${encodeURIComponent(tag)}`} className="type-label text-[#b8934a] border border-[#b8934a]/30 rounded-full px-3 py-1 hover:bg-[#b8934a]/10 transition-colors" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>{tag}</Link>
              )
            ))}
          </div>
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(32px, 4.6vw, 60px)", lineHeight: 1.06 }}>
            {post.title || "Untitled"}
          </h1>
          {post.subtitle && <p className="type-intro text-stone-500 mb-6" style={{ fontSize: "clamp(16px, 1.8vw, 21px)", lineHeight: 1.7 }}>{post.subtitle}</p>}
          <p className="type-label text-stone-400" style={{ fontSize: "11px" }}>
            {postDate(post)} · {readingMinutes(post)} min read
          </p>
        </div>
      </header>

      {post.coverImage && (
        <div className="px-6 md:px-8 mb-4">
          <div className="max-w-5xl mx-auto relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-200">
            <Image src={post.coverImage} alt={post.coverAlt || post.title} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" priority={!preview} />
          </div>
        </div>
      )}

      <ArticleBody body={post.body}>
        <ShareRow title={post.title} path={`/journal/${post.slug}`} tags={tags} />
      </ArticleBody>
    </article>
  );
}
