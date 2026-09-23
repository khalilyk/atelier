"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Drag-to-scroll for the horizontal strip; suppresses the click that opens the
// lightbox when the pointer actually dragged.
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const s = useRef({ down: false, moved: false, startX: 0, scroll: 0 });
  const onDown = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    s.current = { down: true, moved: false, startX: e.pageX, scroll: el.scrollLeft };
  };
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el || !s.current.down) return;
    const dx = e.pageX - s.current.startX;
    if (Math.abs(dx) > 4) s.current.moved = true;
    el.scrollLeft = s.current.scroll - dx;
  };
  const end = () => { s.current.down = false; };
  const draggedRef = () => s.current.moved;
  return { ref, handlers: { onMouseDown: onDown, onMouseMove: onMove, onMouseUp: end, onMouseLeave: end }, draggedRef };
}

export default function GalleryStrip({ images, alt = "" }: { images: string[]; alt?: string }) {
  const drag = useDragScroll();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  const scrollBy = (dir: number) => drag.ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <>
      <div className="relative group/strip">
      <div
        ref={drag.ref}
        {...drag.handlers}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-8 md:px-14 pb-2 cursor-grab active:cursor-grabbing select-none"
      >
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { if (!drag.draggedRef()) setOpen(i); }}
            className="group relative shrink-0 overflow-hidden rounded-lg"
            style={{ width: "clamp(260px, 40vw, 460px)", height: "300px" }}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill draggable={false} className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-white/90 text-stone-800 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </span>
            </div>
          </button>
        ))}
      </div>

        {images.length > 1 && (
          <>
            <button
              type="button" aria-label="Scroll left"
              onClick={() => scrollBy(-1)}
              className="hidden md:flex absolute left-5 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 text-stone-800 items-center justify-center shadow-lg opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:bg-white"
            >←</button>
            <button
              type="button" aria-label="Scroll right"
              onClick={() => scrollBy(1)}
              className="hidden md:flex absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 text-stone-800 items-center justify-center shadow-lg opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:bg-white"
            >→</button>
          </>
        )}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10" onClick={() => setOpen(null)}>
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-5 right-6 z-20 text-white/70 hover:text-white text-3xl leading-none transition-colors">✕</button>
          {images.length > 1 && (
            <>
              <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length)); }} className="absolute left-4 md:left-8 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors">←</button>
              <button aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + 1) % images.length)); }} className="absolute right-4 md:right-8 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors">→</button>
            </>
          )}
          <div className="relative z-10 w-full max-w-5xl pointer-events-none" style={{ height: "80vh" }}>
            <Image src={images[open]} alt={`${alt} ${open + 1}`} fill className="object-contain" priority />
          </div>
          {images.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 type-label text-white/60" style={{ letterSpacing: "0.12em", fontSize: "11px" }}>{open + 1} / {images.length}</span>
          )}
        </div>
      )}
    </>
  );
}
