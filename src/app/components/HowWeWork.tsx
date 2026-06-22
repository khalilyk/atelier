"use client";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    n: "01", title: "Browse & Save",
    desc: "Explore Classic, Signature or Source Anything and build your Selections list.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="4" y="4" width="10" height="10" rx="1.5" /><rect x="18" y="4" width="10" height="10" rx="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="1.5" /><rect x="18" y="18" width="10" height="10" rx="1.5" />
        <path d="M21 21l5 5M26 21l-5 5" />
      </svg>
    ),
  },
  {
    n: "02", title: "Share Your Project",
    desc: "Upload plans, inspiration and project details through a simple enquiry form.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M16 20V8M10 14l6-6 6 6" /><path d="M6 24h20" />
      </svg>
    ),
  },
  {
    n: "03", title: "Consultation",
    desc: "We review your project, discuss requirements and identify opportunities.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 8a2 2 0 012-2h20a2 2 0 012 2v12a2 2 0 01-2 2H10l-6 4V8z" />
        <path d="M10 13h12M10 18h7" />
      </svg>
    ),
  },
  {
    n: "04", title: "Supplier Sourcing",
    desc: "Our team sources products from our network of local and international suppliers.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="16" cy="16" r="12" />
        <path d="M4 16h24M16 4c-3 4-4.5 8-4.5 12s1.5 8 4.5 12M16 4c3 4 4.5 8 4.5 12s-1.5 8-4.5 12" />
      </svg>
    ),
  },
  {
    n: "05", title: "Specification & Pricing",
    desc: "Products are refined, specified and quoted based on your project requirements.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M8 4h16a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path d="M11 11h10M11 16h10M11 21h6" />
      </svg>
    ),
  },
  {
    n: "06", title: "Quality Assurance",
    desc: "Every order is checked for accuracy, finishes, quantities and compliance before dispatch.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M16 4l10 4v8c0 6-5 10-10 12C11 26 6 22 6 16V8l10-4z" />
        <path d="M11 16l3.5 3.5L21 13" />
      </svg>
    ),
  },
  {
    n: "07", title: "Consolidation & Logistics",
    desc: "Products are consolidated where possible to streamline freight and delivery.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 10h16v14H4zM20 14h4l4 5v5h-8V14z" />
        <circle cx="9" cy="26" r="2" /><circle cx="23" cy="26" r="2" />
      </svg>
    ),
  },
  {
    n: "08", title: "Shipping & Delivery",
    desc: "Products are delivered directly to site or nominated locations.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 20h24M16 8l8 12H8L16 8z" /><path d="M16 8v12" />
      </svg>
    ),
  },
  {
    n: "09", title: "Project Support",
    desc: "We remain available throughout delivery and installation to assist where required.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="16" cy="16" r="12" />
        <path d="M12 12a4 4 0 018 1.5c0 2.5-4 4-4 7M16 24v1" />
      </svg>
    ),
  },
];

function Step({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isRight = index % 2 === 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-0 md:gap-8 transition-all duration-700`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transitionDelay: `${index * 60}ms` }}
    >
      {/* Left content (odd steps on desktop) */}
      <div className={`hidden md:flex flex-col ${isRight ? "items-end text-right" : "opacity-0 pointer-events-none"}`}>
        {isRight && <StepCard step={step} />}
      </div>

      {/* Centre node */}
      <div className="flex md:flex-col items-center gap-4 md:gap-0">
        <div className="flex items-center justify-center w-14 h-14 rounded-full border border-[#b8934a]/40 bg-[#b8934a]/10 text-[#b8934a] shrink-0 z-10">
          {step.icon}
        </div>
      </div>

      {/* Right content (even steps on desktop) */}
      <div className={`hidden md:flex flex-col ${!isRight ? "items-start" : "opacity-0 pointer-events-none"}`}>
        {!isRight && <StepCard step={step} />}
      </div>

      {/* Mobile: always show card below icon */}
      <div className="md:hidden pl-2">
        <StepCard step={step} mobile />
      </div>
    </div>
  );
}

function StepCard({ step, mobile }: { step: typeof steps[0]; mobile?: boolean }) {
  return (
    <div className={`max-w-xs ${mobile ? "" : ""}`}>
      <p className="type-label text-[#b8934a] mb-2">{step.n}</p>
      <h3 className="type-product text-white mb-2" style={{ fontSize: "clamp(18px, 2vw, 28px)" }}>{step.title}</h3>
      <p className="type-body text-stone-400 leading-relaxed">{step.desc}</p>
    </div>
  );
}

export default function HowWeWork() {
  return (
    <section id="how-we-work" className="bg-[#0d0c0b] py-20 px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="type-label text-[#b8934a] mb-5">Process</p>
          <h2 className="type-large text-white mb-4" style={{ fontSize: "clamp(32px, 4vw, 64px)" }}>From Selection to Site</h2>
          <p className="type-body text-stone-500 max-w-md mx-auto">A considered process designed to deliver exceptional results, every time.</p>
        </div>

        {/* Journey */}
        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:-translate-x-px" />

          <div className="flex flex-col gap-10 md:gap-12">
            {steps.map((step, i) => (
              <div key={step.n} className="flex md:block gap-4">
                {/* Mobile layout */}
                <div className="md:hidden flex flex-col items-center shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[#b8934a]/40 bg-[#b8934a]/10 text-[#b8934a] z-10">
                    {step.icon}
                  </div>
                </div>
                <div className="md:hidden flex-1 pb-2">
                  <MobileStepAnimated step={step} index={i} />
                </div>

                {/* Desktop layout */}
                <div className="hidden md:block">
                  <Step step={step} index={i} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileStepAnimated({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-16px)", transitionDelay: `${index * 40}ms` }}
    >
      <p className="type-label text-[#b8934a] mb-1">{step.n}</p>
      <h3 className="type-product text-white mb-1" style={{ fontSize: "20px" }}>{step.title}</h3>
      <p className="type-body text-stone-400">{step.desc}</p>
    </div>
  );
}
