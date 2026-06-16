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

  const classicVisible = split >= 48;
  const signatureVisible = split <= 52;

  return (
    <section
      ref={ref}
      className="relative h-screen overflow-hidden select-none"
      style={{ cursor: dragging || nearDivider ? "col-resize" : "default" }}
      onMouseMove={onMouseMove}
      onMouseDown={() => { if (nearDivider) setDragging(true); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => { setDragging(false); setNearDivider(false); }}
      onTouchMove={onTouchMove}
    >
      {/* NAV */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-6">
        <div />
        <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        <button className="type-nav flex items-center gap-2 text-white/70">
          Menu
          <span className="flex flex-col gap-[3px]">
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-3 h-px bg-white/70" />
          </span>
        </button>
      </header>

      {/* CLASSIC */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/Atelier_Classic.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute bottom-20 left-16 z-10 transition-opacity duration-300"
          style={{ opacity: classicVisible ? 1 : 0, pointerEvents: classicVisible ? "auto" : "none" }}
        >
          <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4">Classic</h1>
          <p className="type-body text-white/80 mb-7">Reserved for the exceptional.</p>
          <a href="#" className="arrow-link type-button flex items-center gap-3 text-white" onClick={e => e.stopPropagation()}>
            <span className="border-b border-white/50 pb-px">Explore</span>
            <span className="arrow">←</span>
          </a>
        </div>
      </div>

      {/* SIGNATURE */}
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
          className="absolute bottom-20 left-16 z-10 transition-opacity duration-300"
          style={{ opacity: signatureVisible ? 1 : 0, pointerEvents: signatureVisible ? "auto" : "none" }}
        >
          <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4">Signature</h1>
          <p className="type-body text-white/80 mb-7">Selected for everyday luxury.</p>
          <a href="#" className="arrow-link type-button flex items-center gap-3 text-white" onClick={e => e.stopPropagation()}>
            <span className="border-b border-white/50 pb-px">Explore</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </div>

      {/* DIVIDER */}
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
