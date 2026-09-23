"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import SiteHeader from "./SiteHeader";
import { useT } from "./ContentProvider";

export default function HeroSplit() {
  const t = useT();
  const classicImg = t("home.hero.classic.image");
  const signatureImg = t("home.hero.signature.image");
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
    if (!dragging) return;
    const t = e.touches[0];
    if (t) getSplit(t.clientX, t.clientY);
  }, [dragging, getSplit]);

  const classicVisible = split >= 48;
  const signatureVisible = split <= 52;

  const signatureClip = isMobile
    ? `inset(${split}% 0 0 0)`
    : `inset(0 0 0 ${split}%)`;

  const dividerStyle = isMobile
    ? { top: `${split}%`, left: 0, right: 0, transform: "translateY(-50%)", transition: dragging ? "none" : "top 0.05s ease-out" }
    : { left: `${split}%`, top: 0, bottom: 0, transform: "translateX(-50%)", transition: dragging ? "none" : "left 0.05s ease-out" };

  return (
    <section
      ref={ref}
      className="relative h-screen overflow-hidden select-none"
      style={{
        cursor: !isMobile && (dragging || nearDivider) ? "col-resize" : "default",
        touchAction: isMobile && dragging ? "none" : undefined,
      }}
      onMouseMove={!isMobile ? onMouseMove : undefined}
      onMouseDown={!isMobile ? () => { if (nearDivider) setDragging(true); } : undefined}
      onMouseUp={!isMobile ? () => setDragging(false) : undefined}
      onMouseLeave={!isMobile ? () => { setDragging(false); setNearDivider(false); } : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? () => setDragging(false) : undefined}
      onTouchCancel={isMobile ? () => setDragging(false) : undefined}
    >
      <SiteHeader variant="overlay" menuOpenState={[menuOpen, setMenuOpen]} />

      {/* CLASSIC image */}
      <div className="absolute inset-0" style={{ backgroundImage: `url("${classicImg}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* SIGNATURE image - clipped */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: signatureClip,
          transition: dragging ? "none" : "clip-path 0.05s ease-out"}}
      >
        <div className="absolute inset-0" style={{ backgroundImage: `url("${signatureImg}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* CLASSIC text */}
      <div
        className="absolute z-20 transition-opacity duration-300"
        style={{
          ...(isMobile
            ? { top: "28%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }
            : { top: "50%", left: "4rem", transform: "translateY(-50%)" }),
          opacity: classicVisible ? 1 : 0,
          pointerEvents: classicVisible ? "auto" : "none"}}
      >
        <h2 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Classic</h2>
        <p className="type-body text-white/80 mb-7">Everyday luxury.</p>
        <a href="/classic" className="arrow-link type-button flex items-center gap-3 text-white justify-center md:justify-start" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">←</span>
        </a>
      </div>

      {/* SIGNATURE text */}
      <div
        className="absolute z-20 transition-opacity duration-300"
        style={{
          ...(isMobile
            ? { top: `calc(${split}% + 22%)`, left: "50%", transform: "translateX(-50%)", textAlign: "center", transition: `opacity 0.3s, top ${dragging ? "0ms" : "50ms"} ease-out` }
            : { left: `calc(${split}% + 2rem)`, top: "50%", transform: "translateY(-50%)", transition: `opacity 0.3s, left ${dragging ? "0ms" : "50ms"} ease-out` }),
          opacity: signatureVisible ? 1 : 0,
          pointerEvents: signatureVisible ? "auto" : "none"}}
      >
        <h2 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(22px, 5vw, 67px)" }}>Signature</h2>
        <p className="type-body text-white/80 mb-7">Reserved for the exceptional.</p>
        <a href="/signature" className="arrow-link type-button flex items-center gap-3 text-white justify-center md:justify-start" onClick={e => e.stopPropagation()}>
          <span className="border-b border-white/50 pb-px">Explore</span>
          <span className="arrow">→</span>
        </a>
      </div>

      {/* DIVIDER */}
      <div className="absolute z-20 flex items-center justify-center" style={dividerStyle}>
        {isMobile ? (
          <>
            <div className="w-full h-px bg-white/30" />
            <div
              onTouchStart={() => setDragging(true)}
              className="absolute w-12 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex flex-col items-center justify-center leading-none"
              style={{ touchAction: "none" }}
            >
              <span className="text-white/70 text-[9px] -mb-0.5">⌃</span>
              <span className="text-white/70 text-[9px]">⌄</span>
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
