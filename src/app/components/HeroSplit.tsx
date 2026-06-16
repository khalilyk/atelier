"use client";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";

export default function HeroSplit() {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [nearDivider, setNearDivider] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getSplit = useCallback((clientX: number) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    const pct = Math.min(Math.max(((clientX - left) / width) * 100, 10), 90);
    setSplit(pct);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    const mousePct = ((e.clientX - left) / width) * 100;
    setNearDivider(Math.abs(mousePct - split) < 2.5);
    if (dragging) getSplit(e.clientX);
  }, [dragging, getSplit, split]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    getSplit(e.touches[0].clientX);
  }, [getSplit]);

  // Hide Classic text when divider is in the Classic zone (dragged left)
  // Hide Signature text when divider is in the Signature zone (dragged right)
  const classicVisible = split >= 48;
  const signatureVisible = split <= 52;

  return (
    <section
      ref={ref}
      className="relative h-screen overflow-hidden select-none"
      style={{ cursor: dragging || nearDivider ? "col-resize" : "default" }}
      onMouseMove={onMouseMove}
      onMouseDown={(e) => {
        if (nearDivider) setDragging(true);
      }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => { setDragging(false); setNearDivider(false); }}
      onTouchMove={onTouchMove}
    >
      {/* NAV — absolute over hero */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-6">
        <div />
        <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        <button className="flex items-center gap-2 text-white/70 text-xs tracking-[0.2em] uppercase">
          Menu
          <span className="flex flex-col gap-[3px]">
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-3 h-px bg-white/70" />
          </span>
        </button>
      </header>

      {/* CLASSIC — full width base layer */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/Atelier_Classic.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute inset-0 flex items-center z-10 pl-16 transition-opacity duration-300"
          style={{ opacity: classicVisible ? 1 : 0, pointerEvents: classicVisible ? "auto" : "none" }}
        >
          <div>
            <h1 className="text-white text-6xl font-light tracking-[0.22em] uppercase mb-4" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Classic
            </h1>
            <p className="text-white/75 text-sm mb-6">Reserved for the exceptional.</p>
            <a href="#" className="arrow-link flex items-center gap-3 text-white text-xs tracking-[0.2em] uppercase" onClick={e => e.stopPropagation()}>
              <span className="border-b border-white/50 pb-px">Explore</span>
              <span className="arrow">←</span>
            </a>
          </div>
        </div>
      </div>

      {/* SIGNATURE — clipped to right of divider */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${split}%)`,
          backgroundImage: "url('/Atelier_Signature.png')", backgroundSize: "cover", backgroundPosition: "center",
          transition: dragging ? "none" : "clip-path 0.05s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute inset-0 flex items-center justify-end z-10 pr-16 text-right transition-opacity duration-300"
          style={{ opacity: signatureVisible ? 1 : 0, pointerEvents: signatureVisible ? "auto" : "none" }}
        >
          <div>
            <h1 className="text-white text-6xl font-light tracking-[0.22em] uppercase mb-4" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Signature
            </h1>
            <p className="text-white/75 text-sm mb-6">Selected for everyday luxury.</p>
            <a href="#" className="arrow-link flex items-center gap-3 justify-end text-white text-xs tracking-[0.2em] uppercase" onClick={e => e.stopPropagation()}>
              <span className="border-b border-white/50 pb-px">Explore</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* DIVIDER LINE */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
        style={{ left: `${split}%`, transform: "translateX(-50%)", transition: dragging ? "none" : "left 0.05s ease-out" }}
      >
        <div className="w-px h-full bg-white/30" />
        <div className="absolute w-8 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex items-center justify-center gap-1">
          <span className="text-white/70 text-[10px]">‹</span>
          <span className="text-white/70 text-[10px]">›</span>
        </div>
      </div>
    </section>
  );
}
