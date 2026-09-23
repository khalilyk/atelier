"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ImageLightbox from "../../components/ImageLightbox";

/**
 * The cover photo, with the rest of the project's photos as thumbnails under
 * it. Any of them opens the full-size lightbox, which then steps through all.
 */
export default function ProjectGallery({ cover, alt, rows, preview }: {
  cover: string;
  alt: string;
  rows: [string, string][];
  /** In the admin preview the photos are shown but not clickable. */
  preview?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const measure = () => {
    const el = strip.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  // The strip only needs arrows once it is wider than the space it has.
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [rows.length]);

  const scroll = (dir: -1 | 1) => strip.current?.scrollBy({ left: dir * 236, behavior: "smooth" });

  const images = [...(cover ? [cover] : []), ...rows.map(([src]) => src)];
  if (images.length === 0) return null;

  return (
    <>
      {cover && (
        <div className="px-6 md:px-8 mb-4">
          <button type="button" onClick={preview ? undefined : () => setIndex(0)} aria-label="Open the photo"
            className={`group block w-full max-w-5xl mx-auto relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-200 ${preview ? "" : "cursor-zoom-in"}`}>
            <Image src={cover} alt={alt} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" priority={!preview} />
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="px-6 md:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-4 px-1">
            {/* Dimmed when every photo already fits on screen. */}
            {rows.length > 1 && (
              <button type="button" onClick={() => scroll(-1)} disabled={!canLeft} aria-label="Previous photos"
                className="shrink-0 w-10 h-10 rounded-full bg-white border border-stone-300 shadow-sm flex items-center justify-center text-lg leading-none text-stone-700 hover:bg-stone-900 hover:border-stone-900 hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:hover:border-stone-300 transition-all">‹</button>
            )}

            <div ref={strip} onScroll={measure} className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 px-1" style={{ scrollBehavior: "smooth" }}>
              {rows.map(([src, caption], i) => (
                <button key={`${src}-${i}`} type="button" onClick={preview ? undefined : () => setIndex(cover ? i + 1 : i)}
                  aria-label={caption || `Photo ${i + 2}`}
                  className={`group shrink-0 relative w-[88px] h-[66px] md:w-[104px] md:h-[78px] rounded-lg overflow-hidden bg-stone-200 ${preview ? "" : "cursor-zoom-in"}`}>
                  <Image src={src} alt={caption || alt} fill sizes="104px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 ring-1 ring-inset ring-black/5 group-hover:ring-[#b8934a]/60 transition-colors" />
                </button>
              ))}
            </div>

            {rows.length > 1 && (
              <button type="button" onClick={() => scroll(1)} disabled={!canRight} aria-label="More photos"
                className="shrink-0 w-10 h-10 rounded-full bg-white border border-stone-300 shadow-sm flex items-center justify-center text-lg leading-none text-stone-700 hover:bg-stone-900 hover:border-stone-900 hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:hover:border-stone-300 transition-all">›</button>
            )}
          </div>
        </div>
      )}

      {!preview && <ImageLightbox images={images} index={index} setIndex={setIndex} alt={alt} />}
    </>
  );
}
