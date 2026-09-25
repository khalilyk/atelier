"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
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

  // The divider is draggable by mouse and touch; arrow keys give the same
  // control to anyone not using a pointer.
  const onDividerKey = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4;
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
    if (!back && !fwd && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    setSplit((p) => {
      if (e.key === "Home") return 10;
      if (e.key === "End") return 90;
      return Math.min(Math.max(p + (fwd ? step : -step), 10), 90);
    });
  }, []);

  const classicVisible = split >= 48;
  const signatureVisible = split <= 52;



  return (
    <section
      ref={ref}
      className="hero-split relative h-screen overflow-hidden select-none"
      style={{
        ["--split" as string]: `${split}%`,
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

      {/* CLASSIC image. This is the page's largest paint, so it goes through
          next/image - a CSS background is fetched raw, at full size, and
          cannot be preloaded. */}
      <div className="absolute inset-0">
        <Image src={classicImg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* SIGNATURE image - clipped */}
      <div
        className="hero-sig-clip absolute inset-0"
        style={{ transition: dragging ? "none" : "clip-path 0.05s ease-out" }}
      >
        <Image src={signatureImg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* CLASSIC text */}
      <div
        className="hero-classic-text absolute z-20 transition-opacity duration-300"
        style={{
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
        className="hero-sig-text absolute z-20 transition-opacity duration-300"
        style={{
          transition: `opacity 0.3s, top ${dragging ? "0ms" : "50ms"} ease-out, left ${dragging ? "0ms" : "50ms"} ease-out`,
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
      <div className="hero-divider absolute z-20 flex items-center justify-center" style={{ transition: dragging ? "none" : "top 0.05s ease-out, left 0.05s ease-out" }}>
        <div className="contents md:hidden">
          <>
            <div className="w-full h-px bg-white/30" />
            <div
              onTouchStart={() => setDragging(true)}
              onKeyDown={onDividerKey}
              role="slider"
              tabIndex={0}
              aria-label="Show more of Classic or Signature"
              aria-orientation="vertical"
              aria-valuemin={10}
              aria-valuemax={90}
              aria-valuenow={Math.round(split)}
              aria-valuetext={`${Math.round(split)}% Classic, ${100 - Math.round(split)}% Signature`}
              className="absolute w-12 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex flex-col items-center justify-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              style={{ touchAction: "none" }}
            >
              <span className="text-white/70 text-[9px] -mb-0.5">⌃</span>
              <span className="text-white/70 text-[9px]">⌄</span>
            </div>
          </>
        </div>
        <div className="hidden md:contents">
          <>
            <div className="w-px h-full bg-white/30" />
            <div className="absolute w-8 h-8 rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex items-center justify-center gap-1">
              <span className="text-white/70 text-[10px]">‹</span>
              <span className="text-white/70 text-[10px]">›</span>
            </div>
          </>
        </div>
      </div>
    </section>
  );
}
