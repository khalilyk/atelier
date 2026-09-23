"use client";
import { useRef } from "react";

// A horizontally scrollable row with drag-to-scroll and hover prev/next arrows,
// so it reads clearly as a carousel.
export default function CarouselRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
  const onClickCapture = (e: React.MouseEvent) => { if (s.current.moved) { e.preventDefault(); e.stopPropagation(); } };
  const scrollBy = (dir: number) => ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <div className="relative group/car">
      <div
        ref={ref}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={end}
        onMouseLeave={end}
        onClickCapture={onClickCapture}
        className={`flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none ${className}`}
      >
        {children}
      </div>
      <button
        type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)}
        className="hidden md:flex absolute left-5 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-stone-800 border border-stone-200 items-center justify-center shadow-lg opacity-0 group-hover/car:opacity-100 transition-opacity duration-300 hover:border-[#b8934a]"
      >←</button>
      <button
        type="button" aria-label="Scroll right" onClick={() => scrollBy(1)}
        className="hidden md:flex absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white text-stone-800 border border-stone-200 items-center justify-center shadow-lg opacity-0 group-hover/car:opacity-100 transition-opacity duration-300 hover:border-[#b8934a]"
      >→</button>
    </div>
  );
}
