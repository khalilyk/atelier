"use client";
import Image from "next/image";
import BlockPage from "../components/BlockPage";
import type { CustomPage } from "@/lib/custom-pages";

/**
 * The visible part of a page you created yourself. Shared by the live route and
 * the admin's live preview, so the preview cannot drift from the real thing.
 */
export default function PageView({ page, preview }: { page: CustomPage; preview?: boolean }) {
  return (
    <article>
      <header className="px-6 md:px-8 pt-14 md:pt-20 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(32px, 4.6vw, 60px)", lineHeight: 1.06 }}>
            {page.title || "Untitled"}
          </h1>
          {page.subtitle && (
            <p className="type-intro text-stone-500" style={{ fontSize: "clamp(16px, 1.8vw, 21px)", lineHeight: 1.7 }}>{page.subtitle}</p>
          )}
        </div>
      </header>

      {page.heroImage && (
        <div className="px-6 md:px-8 mb-4">
          <div className="max-w-5xl mx-auto relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-200">
            <Image src={page.heroImage} alt={page.heroAlt || page.title} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" priority={!preview} />
          </div>
        </div>
      )}

      <div className="px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          <BlockPage kind="custom-page" raw={page.body} variant="article" />
        </div>
      </div>
    </article>
  );
}
