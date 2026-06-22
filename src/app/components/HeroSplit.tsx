"use client";
import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";

export default function HeroSplit() {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [nearDivider, setNearDivider] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getSplit = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (isMobile) {
      const pct = Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 10), 90);
      setSplit(pct);
    } else {
      const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 10), 90);
      setSplit(pct);
    }
  }, [isMobile]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = isMobile
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;
    setNearDivider(Math.abs(pct - split) < 2.5);
    if (dragging) getSplit(e.clientX, e.clientY);
  }, [dragging, getSplit, split, isMobile]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    getSplit(e.touches[0].clientX, e.touches[0].clientY);
  }, [getSplit]);

  const classicVisible = split >= 48;
  const signatureVisible = split <= 52;

  // Clip directions
  const signatureClip = isMobile
    ? `inset(${split}% 0 0 0)`
    : `inset(0 0 0 ${split}%)`;

  // Divider position
  const dividerStyle = isMobile
    ? { top: `${split}%`, left: 0, right: 0, transform: "translateY(-50%)", transition: dragging ? "none" : "top 0.05s ease-out" }
    : { left: `${split}%`, top: 0, bottom: 0, transform: "translateX(-50%)", transition: dragging ? "none" : "left 0.05s ease-out" };

  return (
    <section
      ref={ref}
      className="relative h-screen overflow-hidden select-none"
      style={{ cursor: isMobile ? (dragging || nearDivider ? "row-resize" : "default") : (dragging || nearDivider ? "col-resize" : "default") }}
      onMouseMove={onMouseMove}
      onMouseDown={() => { if (nearDivider) setDragging(true); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => { setDragging(false); setNearDivider(false); }}
      onTouchMove={onTouchMove}
    >
      {/* NAV */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center px-6 md:px-8 py-6">
        <nav className="hidden md:flex flex-1 items-center gap-8">
          {["Classic", "Signature", "How We Work"].map(l => (
            <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors duration-300">{l}</a>
          ))}
        </nav>
        <div className="flex md:hidden flex-1" />
        <div className="flex justify-center">
          <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-end gap-8">
          {["Products", "Source Anything", "About"].map(l => (
            <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors duration-300">{l}</a>
          ))}
        </nav>
        <div className="flex md:hidden flex-1 justify-end">
          <button className="flex flex-col gap-[5px] p-1" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/90 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button className="absolute top-6 right-6 type-nav text-white/50 hover:text-white" onClick={() => setMenuOpen(false)}>✕</button>
        {["Classic", "Signature", "How We Work", "Products", "Source Anything", "About", "Journal", "Contact"].map(l => (
          <a key={l} href="#" className="type-nav text-white/70 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{l}</a>
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
          clipPath: signatureClip,
          backgroundImage: "url('/Atelier_Signature.png')", backgroundSize: "cover", backgroundPosition: "center",
          transition: dragging ? "none" : "clip-path 0.05s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* CLASSIC text — top-left on mobile, left-centre on desktop */}
      <div
        className="absolute z-20 transition-opacity duration-300"
        style={{
          ...(isMobile
            ? { top: "28%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }
            : { top: "50%", left: "4rem", transform: "translateY(-50%)" }),
          opacity: classicVisible ? 1 : 0,
          pointerEvents: classicVisible ? "auto" : "none",
        }}
      >
        <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Classic</h1>
        <p className="type-body text-white/80 mb-7">Reserved for the exceptional.</p>
        <a href="#" className="arrow-link type-button flex items-center gap-3 text-white justify-center md:justify-start" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">←</span>
        </a>
      </div>

      {/* SIGNATURE text — bottom on mobile, right-centre on desktop */}
      <div
        className="absolute z-20 transition-opacity duration-300"
        style={{
          ...(isMobile
            ? { top: `calc(${split}% + 22%)`, left: "50%", transform: "translateX(-50%)", textAlign: "center", transition: `opacity 0.3s, top ${dragging ? "0ms" : "50ms"} ease-out` }
            : { left: `calc(${split}% + 2rem)`, top: "50%", transform: "translateY(-50%)", transition: `opacity 0.3s, left ${dragging ? "0ms" : "50ms"} ease-out` }),
          opacity: signatureVisible ? 1 : 0,
          pointerEvents: signatureVisible ? "auto" : "none",
        }}
      >
        <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Signature</h1>
        <p className="type-body text-white/80 mb-7">Selected for everyday luxury.</p>
        <a href="#" className="arrow-link type-button flex items-center gap-3 text-white justify-center md:justify-start" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">→</span>
        </a>
      </div>

      {/* DIVIDER */}
      <div className="absolute z-20 flex items-center justify-center" style={dividerStyle}>
        {isMobile ? (
          <>
            <div className="w-full h-px bg-white/30" />
            <div className="absolute w-8 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex items-center justify-center gap-1">
              <span className="text-white/70 text-[10px] rotate-90">‹</span>
              <span className="text-white/70 text-[10px] rotate-90">›</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-px h-full bg-white/30" />
            <div className="absolute w-8 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex items-center justify-center gap-1">
              <span className="text-white/70 text-[10px]">‹</span>
              <span className="text-white/70 text-[10px]">›</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
