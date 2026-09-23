"use client";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    n: "01", title: "Share Your Project",
    desc: "Send us your plans, selections and project brief. We review the detail, understand the design intent and identify what the project requires before anything is specified.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 20V8M10 14l6-6 6 6" /><path d="M6 24h20" />
      </svg>
    ),
  },
  {
    n: "02", title: "Design & Technical Consultation",
    desc: "We work with you through the key decisions - materials, finishes, configurations, performance requirements and practical site considerations - helping shape a solution that is both refined and buildable.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 8a2 2 0 012-2h20a2 2 0 012 2v12a2 2 0 01-2 2H10l-6 4V8z" />
        <path d="M10 13h12M10 18h7" />
      </svg>
    ),
  },
  {
    n: "03", title: "Specification & Approval",
    desc: "Your project is translated into a clear, coordinated specification with drawings, selections and pricing documented for review. Nothing moves into production until the details are resolved and approved.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M8 4h16a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M11 11h10M11 16h10M11 21h6" />
      </svg>
    ),
  },
  {
    n: "04", title: "Crafted for Your Project",
    desc: "Each element is produced specifically for your project with the approved design, detailing, finishes and specifications carried through into production.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 4l10 4v8c0 6-5 10-10 12C11 26 6 22 6 16V8l10-4z" />
        <path d="M11 16l3.5 3.5L21 13" />
      </svg>
    ),
  },
  {
    n: "05", title: "Delivered with Confidence",
    desc: "From coordinated delivery through to installation, we manage the final stage with the same attention to detail applied throughout the project - helping ensure each element arrives, is installed and comes together as intended.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 24h24M8 24V14l8-8 8 8v10" /><path d="M13 24v-7h6v7" />
      </svg>
    ),
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function HowWeWork() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef, visible: headerVisible } = useInView(0.3);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    trackRef.current?.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
  };

  return (
    <section id="how-we-work" className="bg-[#e3d9c9] py-20 overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className="px-6 md:px-8 max-w-7xl mx-auto mb-16 transition-all duration-700"
        style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(24px)" }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="type-label text-[#b8934a] mb-4">How We Work</p>
            <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(32px, 4vw, 64px)" }}>A considered path from concept to completion.</h2>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <p className="type-body text-stone-500 max-w-xs">From first brief to final installation, one coordinated team and one clear process.</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-500 hover:text-stone-900 disabled:opacity-20 transition-all">‹</button>
              <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-500 hover:text-stone-900 disabled:opacity-20 transition-all">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide py-4"
        style={{ cursor: "grab", touchAction: "pan-x", overscrollBehaviorX: "contain", paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))" }}
      >
        <div className="group/track flex items-start gap-8 w-max pr-8">
          {steps.map((step, i) => (
            <HStep key={step.n} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>

      {/* Mobile arrows - below track, centred */}
      <div className="flex md:hidden justify-center gap-2 mt-8">
        <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-500 hover:text-stone-900 disabled:opacity-20 transition-all">‹</button>
        <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-500 hover:text-stone-900 disabled:opacity-20 transition-all">›</button>
      </div>
    </section>
  );
}

function HStep({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) {
  const { ref, visible } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="flex items-start"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(24px)", transition: `opacity 0.6s ease, transform 0.6s ease`, transitionDelay: `${index * 80}ms` }}
    >
      {/* Step card - pops into a rounded box on hover while siblings blur/dim */}
      <div className="group/card relative w-[280px] flex flex-col cursor-default rounded-2xl transition duration-300 group-hover/track:opacity-40 hover:!opacity-100">
        {/* Hover box */}
        <div className="pointer-events-none absolute -inset-y-4 -inset-x-3 z-0 rounded-2xl bg-white/70 ring-1 ring-[#b8934a]/30 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

        <div className="relative z-10">
          {/* Number */}
          <p className="type-label text-[#b8934a] mb-4 transition-opacity duration-300 group-hover/card:opacity-100 opacity-60">{step.n}</p>

          {/* Node + line */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center shrink-0 transition-all duration-300 group-hover/card:bg-[#b8934a]/25 group-hover/card:border-[#b8934a] group-hover/card:scale-110 group-hover/card:shadow-[0_0_20px_rgba(184,147,74,0.2)]">
              {step.icon}
            </div>
            {!isLast && (
              <div className="flex-1 h-px bg-gradient-to-r from-[#b8934a]/40 to-stone-300 mx-4 w-[188px]">
                <div className="h-full bg-gradient-to-r from-[#b8934a]/40 to-transparent" />
              </div>
            )}
          </div>

          {/* Text */}
          <h3 className="type-product text-stone-900 mb-2 pr-8 transition-colors duration-300 group-hover/card:text-[#b8934a]" style={{ fontSize: "clamp(16px, 1.5vw, 22px)" }}>{step.title}</h3>
          <p className="type-body text-stone-500 pr-8 transition-colors duration-300 group-hover/card:text-stone-700" style={{ lineHeight: 1.7 }}>{step.desc}</p>
        </div>
      </div>
    </div>
  );
}
