"use client";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";

export default function HeroSplit() {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [nearDivider, setNearDivider] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center px-6 md:px-8 py-6">

        {/* Desktop: left nav */}
        <nav className="hidden md:flex flex-1 items-center gap-8">
          {["Classic", "Signature", "How We Work"].map(l => (
            <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors duration-300">{l}</a>
          ))}
        </nav>

        {/* Mobile: empty spacer to balance burger */}
        <div className="flex md:hidden flex-1" />

        {/* Logo — always centred */}
        <div className="flex justify-center">
          <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        </div>

        {/* Desktop: right nav */}
        <nav className="hidden md:flex flex-1 items-center justify-end gap-8">
          {["Products", "Source Anything", "About"].map(l => (
            <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors duration-300">{l}</a>
          ))}
        </nav>

        {/* Mobile: burger */}
        <div className="flex md:hidden flex-1 justify-end">
          <button
            className="flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/90 backdrop-blur-sm transition-opacity duration-400 md:hidden ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <button className="absolute top-6 right-6 type-nav text-white/50 hover:text-white" onClick={() => setMenuOpen(false)}>✕</button>
        {["Classic", "Signature", "How We Work", "Products", "Source Anything", "About", "Journal", "Contact"].map(l => (
          <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors text-base" onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
      </div>

      {/* CLASSIC image */}
      <div className="absolute inset-0" style={{ backgroundImage: "url('/Atelier_Classic.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* SIGNATURE image — clipped */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${split}%)`,
          backgroundImage: "url('/Atelier_Signature.png')", backgroundSize: "cover", backgroundPosition: "center",
          transition: dragging ? "none" : "clip-path 0.05s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* CLASSIC text */}
      <div
        className="absolute top-1/2 left-8 md:left-16 z-20 -translate-y-1/2 transition-opacity duration-300"
        style={{ opacity: classicVisible ? 1 : 0, pointerEvents: classicVisible ? "auto" : "none" }}
      >
        <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Classic</h1>
        <p className="type-body text-white/80 mb-7">Reserved for the exceptional.</p>
        <a href="#" className="arrow-link type-button flex items-center gap-3 text-white" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">←</span>
        </a>
      </div>

      {/* SIGNATURE text */}
      <div
        className="absolute z-20 transition-opacity duration-300"
        style={{
          left: `calc(${split}% + 2rem)`,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: signatureVisible ? 1 : 0,
          pointerEvents: signatureVisible ? "auto" : "none",
          transition: `opacity 0.3s, left ${dragging ? "0ms" : "50ms"} ease-out`,
        }}
      >
        <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Signature</h1>
        <p className="type-body text-white/80 mb-7">Selected for everyday luxury.</p>
        <a href="#" className="arrow-link type-button flex items-center gap-3 text-white" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">→</span>
        </a>
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
