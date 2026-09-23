"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { hasHotspots, hotspotHeightVh, type HotspotBlock } from "@/lib/hotspots";

// Full-width product image with tappable hotspots. Selecting one opens a card
// (right-hand panel on desktop, bottom sheet on mobile) that steps through every
// hotspot in order.
const CSS = `
@keyframes hsPulse { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(2.1); opacity: 0 } }
@keyframes hsIn { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes hsUp { from { opacity: 0; transform: translateY(32px) } to { opacity: 1; transform: none } }
@keyframes hsFade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
.hs-pulse::before { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: rgba(255,255,255,.7); animation: hsPulse 2.2s ease-out infinite; }
.hs-panel { animation: hsIn .45s cubic-bezier(.2,.7,.2,1) both; }
@media (max-width: 767px) { .hs-panel { animation-name: hsUp; } }
.hs-fade { animation: hsFade .4s ease both; }
@media (prefers-reduced-motion: reduce) { .hs-pulse::before, .hs-panel, .hs-fade { animation: none; } }
`;

export default function ProductHotspots({ block }: { block?: HotspotBlock | null }) {
  const [active, setActive] = useState<number | null>(null);
  const spots = block?.spots ?? [];
  const count = spots.length;

  const go = useCallback((dir: 1 | -1) => {
    setActive((i) => (i === null ? 0 : (i + dir + count) % count));
  }, [count]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  if (!hasHotspots(block)) return null;
  const vh = hotspotHeightVh(block);
  const spot = active !== null ? spots[active] : null;
  const paragraphs = spot ? spot.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [];

  return (
    <section className="relative w-full bg-[#ede8df] border-t border-stone-200 overflow-hidden">
      <style>{CSS}</style>

      {(block.eyebrow || block.heading) && (
        <div className="px-6 md:px-14 pt-14 md:pt-20 pb-8 md:pb-10 text-center">
          {block.eyebrow && <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.16em" }}>{block.eyebrow}</p>}
          {block.heading && <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(28px, 3.6vw, 48px)", lineHeight: 1.08 }}>{block.heading}</h2>}
        </div>
      )}

      <div
        className="relative w-full"
        style={vh ? { height: `${vh}svh`, minHeight: vh >= 50 ? "320px" : "220px" } : undefined}
        onClick={() => setActive(null)}
      >
        {vh ? (
          <Image src={block.image} alt={block.alt || block.heading || "Product detail"} fill sizes="100vw" className="object-cover select-none" draggable={false} />
        ) : (
          <Image src={block.image} alt={block.alt || block.heading || "Product detail"} width={2400} height={1400} sizes="100vw" className="w-full h-auto block select-none" draggable={false} />
        )}

        {spots.map((s, i) => {
          const on = active === i;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`${on ? "Close" : "Show"}: ${s.title}`}
              aria-expanded={on}
              onClick={(e) => { e.stopPropagation(); setActive(on ? null : i); }}
              className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.25)] transition-all duration-300 ${on ? "bg-[#b8934a] text-white scale-110" : "hs-pulse bg-white/95 text-stone-900 hover:scale-110"}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" className={`relative transition-transform duration-300 ${on ? "rotate-45" : "group-hover:rotate-90"}`} aria-hidden>
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          );
        })}

        {/* Card */}
        {spot && (
          <>
            <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setActive(null)} />
            {/* Desktop: a rail down the right of the image keeps the card in view while scrolling */}
            <div className="fixed md:absolute z-50 md:z-20 inset-x-3 bottom-3 md:inset-x-auto md:inset-y-5 md:right-5 md:w-[min(360px,34vw)] pointer-events-none">
            <div
              role="dialog"
              aria-label={spot.title}
              onClick={(e) => e.stopPropagation()}
              className="hs-panel pointer-events-auto md:sticky md:top-24 max-h-[82svh] md:max-h-[min(calc(100svh-7rem),100%)] flex flex-col bg-[#f5f0e8] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-stone-900 flex items-center justify-center hover:bg-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>

              <div key={spot.id} className="hs-fade flex-1 min-h-0 overflow-y-auto">
                {spot.image && (
                  <div className="relative w-full aspect-[4/3] bg-stone-200">
                    <Image src={spot.image} alt={spot.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
                  </div>
                )}
                <div className={`px-6 pb-6 ${spot.image ? "pt-6" : "pt-14"}`}>
                  <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "clamp(20px, 1.8vw, 24px)", lineHeight: 1.2 }}>{spot.title}</h3>
                  {paragraphs.map((p, i) => (
                    <p key={i} className="type-body text-stone-600 mb-3" style={{ fontSize: "14px", lineHeight: 1.75 }}>{p}</p>
                  ))}
                  {spot.linkUrl && (
                    <a href={spot.linkUrl} className="arrow-link type-button inline-flex items-center gap-2 mt-2 text-stone-900 border-b border-stone-900/40 pb-0.5 hover:text-[#b8934a] hover:border-[#b8934a] transition-colors">
                      {spot.linkLabel || "Learn more"} <span className="arrow">→</span>
                    </a>
                  )}
                </div>
              </div>

              {count > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-stone-200/70">
                  <button type="button" onClick={() => go(-1)} aria-label="Previous" className="w-9 h-9 rounded-full border border-stone-300 text-stone-800 flex items-center justify-center hover:border-stone-900 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <div className="flex items-center gap-1.5" aria-hidden>
                    {spots.map((s, i) => (
                      <span key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-stone-900" : "w-1.5 bg-stone-300"}`} />
                    ))}
                  </div>
                  <button type="button" onClick={() => go(1)} aria-label="Next" className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-[#b8934a] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
