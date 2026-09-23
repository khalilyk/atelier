"use client";
import { useEffect, useRef } from "react";

/**
 * A thin bar across the top that fills as you read the article and empties as
 * you scroll back up. Measured against the article itself, not the whole page,
 * so it reaches 100% at the end of the text rather than the end of the footer.
 */
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.style.transition = "none";

    let frame = 0;
    const update = () => {
      frame = 0;
      // Sit under the navigation bar, and pin to the top once it has scrolled away.
      const header = document.querySelector("header");
      if (header && track.current) {
        track.current.style.top = `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`;
      }
      const article = document.querySelector("article");
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const start = top + window.scrollY;
      const distance = Math.max(1, height - window.innerHeight * 0.4);
      const done = (window.scrollY - start) / distance;
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, done))})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={track} aria-hidden className="fixed left-0 right-0 z-[60] h-[5px] bg-black/5 pointer-events-none" style={{ top: 0 }}>
      <div
        ref={bar}
        className="h-full w-full origin-left bg-[#c8a25c]"
        style={{ transform: "scaleX(0)", transition: "transform 120ms linear", boxShadow: "0 0 10px rgba(200,162,92,0.9)" }}
      />
    </div>
  );
}
