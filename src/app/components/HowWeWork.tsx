"use client";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    n: "01", title: "Browse & Save",
    desc: "Explore Classic, Signature or Source Anything and build your Selections list.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="4" y="4" width="10" height="10" rx="1.5" /><rect x="18" y="4" width="10" height="10" rx="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="1.5" /><rect x="18" y="18" width="10" height="10" rx="1.5" />
      </svg>
    ),
  },
  {
    n: "02", title: "Share Your Project",
    desc: "Upload plans, inspiration and project details through a simple enquiry form.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 20V8M10 14l6-6 6 6" /><path d="M6 24h20" />
      </svg>
    ),
  },
  {
    n: "03", title: "Consultation",
    desc: "We review your project, discuss requirements and identify opportunities.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 8a2 2 0 012-2h20a2 2 0 012 2v12a2 2 0 01-2 2H10l-6 4V8z" />
        <path d="M10 13h12M10 18h7" />
      </svg>
    ),
  },
  {
    n: "04", title: "Supplier Sourcing",
    desc: "Our team sources products from our network of local and international suppliers.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="16" cy="16" r="12" />
        <path d="M4 16h24M16 4c-3 4-4.5 8-4.5 12s1.5 8 4.5 12M16 4c3 4 4.5 8 4.5 12s-1.5 8-4.5 12" />
      </svg>
    ),
  },
  {
    n: "05", title: "Specification & Pricing",
    desc: "Products are refined, specified and quoted based on your project requirements.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M8 4h16a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M11 11h10M11 16h10M11 21h6" />
      </svg>
    ),
  },
  {
    n: "06", title: "Quality Assurance",
    desc: "Every order is checked for accuracy, finishes, quantities and compliance before dispatch.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 4l10 4v8c0 6-5 10-10 12C11 26 6 22 6 16V8l10-4z" />
        <path d="M11 16l3.5 3.5L21 13" />
      </svg>
    ),
  },
  {
    n: "07", title: "Consolidation & Logistics",
    desc: "Products are consolidated where possible to streamline freight and delivery.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 10h16v14H4zM20 14h4l4 5v5h-8V14z" />
        <circle cx="9" cy="26" r="2" /><circle cx="23" cy="26" r="2" />
      </svg>
    ),
  },
  {
    n: "08", title: "Shipping & Delivery",
    desc: "Products are delivered directly to site or nominated locations.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 24h24M8 24V14l8-8 8 8v10" /><path d="M13 24v-7h6v7" />
      </svg>
    ),
  },
  {
    n: "09", title: "Project Support",
    desc: "We remain available throughout delivery and installation to assist where required.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="16" cy="16" r="12" />
        <path d="M12 12a4 4 0 018 1.5c0 2.5-4 4-4 7M16 24v1" />
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
    <section id="how-we-work" className="bg-[#0d0c0b] py-20 overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className="px-6 md:px-8 max-w-7xl mx-auto mb-16 transition-all duration-700"
        style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(24px)" }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="type-label text-[#b8934a] mb-4">Process</p>
            <h2 className="type-large text-white" style={{ fontSize: "clamp(32px, 4vw, 64px)" }}>From Selection to Site</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="type-body text-stone-500 max-w-xs hidden md:block">A considered process designed to deliver exceptional results, every time.</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white disabled:opacity-20 transition-all">‹</button>
              <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white disabled:opacity-20 transition-all">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="overflow-x-auto scrollbar-hide pl-6 md:pl-8"
        style={{ cursor: "grab" }}
      >
        <div className="flex items-start gap-0 w-max pr-8">
          {steps.map((step, i) => (
            <HStep key={step.n} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
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
      {/* Step card */}
      <div className="group/card w-[280px] flex flex-col cursor-default">
        {/* Number */}
        <p className="type-label text-[#b8934a] mb-4 transition-opacity duration-300 group-hover/card:opacity-100 opacity-60">{step.n}</p>

        {/* Node + line */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center shrink-0 transition-all duration-300 group-hover/card:bg-[#b8934a]/25 group-hover/card:border-[#b8934a] group-hover/card:scale-110 group-hover/card:shadow-[0_0_20px_rgba(184,147,74,0.2)]">
            {step.icon}
          </div>
          {!isLast && (
            <div className="flex-1 h-px bg-gradient-to-r from-[#b8934a]/40 to-white/10 mx-4 w-[188px]">
              <div className="h-full bg-gradient-to-r from-[#b8934a]/40 to-transparent" />
            </div>
          )}
        </div>

        {/* Text */}
        <h3 className="type-product text-white mb-2 pr-8 transition-colors duration-300 group-hover/card:text-[#b8934a]" style={{ fontSize: "clamp(16px, 1.5vw, 22px)" }}>{step.title}</h3>
        <p className="type-body text-stone-500 pr-8 transition-colors duration-300 group-hover/card:text-stone-300" style={{ fontSize: "14px", lineHeight: 1.7 }}>{step.desc}</p>
      </div>
    </div>
  );
}
