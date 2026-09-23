"use client";
import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CapabilityRequest from "../components/CapabilityRequest";
import { useT } from "../components/ContentProvider";
import { useEffect, useRef, useState } from "react";
import BlockPage from "../components/BlockPage";
import { pageLayoutKey } from "@/lib/page-copy";
import { blockValue } from "@/lib/page-blocks";

// Reveals once when scrolled into view, so the process cards can float in.
function useInView(threshold = 0.2) {
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

// Float-in + a dark glow bloom, both sequenced by card number.
const PROCESS_CSS = `
@keyframes procGlow {
  0%   { box-shadow: 0 0 0 0 rgba(44,31,20,0); }
  45%  { box-shadow: 0 22px 55px -12px rgba(44,31,20,0.45); }
  100% { box-shadow: 0 0 0 0 rgba(44,31,20,0); }
}
.proc-card { opacity: 0; transform: translateY(28px); }
.proc-in .proc-card {
  animation: procFloat 0.7s cubic-bezier(0.22,1,0.36,1) forwards, procGlow 1.1s ease-out both;
}
@keyframes procFloat {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .proc-card { opacity: 1; transform: none; }
  .proc-in .proc-card { animation: none; }
}
`;

export default function AboutPage() {
  const t = useT();
  const { ref: procRef, visible: procVisible } = useInView(0.15);
  const build = (t: (key: string) => string): Record<string, () => React.ReactNode> => {
  const STORY = t("about.story.body").split("\n\n");
  const CAPABILITY = t("about.capability.body").split("\n\n");
  const PROCESS = [1, 2, 3, 4].map((n) => ({ n: `0${n}`, title: t(`about.process.${n}.title`), body: t(`about.process.${n}.body`) }));
  return {
    hero: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[62vh]">
        <div className="flex flex-col justify-center px-10 md:px-16 py-20 md:py-28">
          <p className="type-label text-[#b8934a] mb-8" style={{ letterSpacing: "0.18em" }}>About Atelier</p>
          <h1 className="type-large text-stone-900 mb-6 whitespace-pre-line" style={{ fontSize: "clamp(34px, 5vw, 68px)", lineHeight: 1.05 }}>
            {t("about.hero.headline")}
          </h1>
          <div className="w-8 h-px bg-[#b8934a] mb-8" />
          <p className="type-body text-stone-600 max-w-sm" style={{ lineHeight: 1.9 }}>
            {t("about.hero.body")}
          </p>
        </div>
        <div className="relative min-h-[46vh] md:min-h-0">
          <Image src="/Atelier_Classic.png" alt="Atelier interior" fill className="object-cover object-center" priority />
        </div>
      </section>
    ),

    story: () => (
      <section id="our-story" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 border-t border-stone-200 bg-[#ede8df]">
        <div className="relative min-h-[46vh] md:min-h-0 order-1 md:order-none">
          <Image src="/Atelier_Signature.png" alt="Atelier projects" fill className="object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-20 md:py-28">
          <p className="type-label text-[#b8934a] mb-7" style={{ letterSpacing: "0.16em" }}>Our Story</p>
          <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(26px, 3.6vw, 46px)", lineHeight: 1.1 }}>
            {t("about.story.headline")}
          </h2>
          {STORY.map((p, i) => (
            <p key={i} className="type-body text-stone-600 mb-5 last:mb-0" style={{ lineHeight: 1.9 }}>{p}</p>
          ))}
        </div>
      </section>
    ),

    capability: () => (
      <section id="capability-statement" className="scroll-mt-24 px-10 md:px-16 py-20 md:py-28 border-t border-stone-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-14 md:gap-20 items-start">
          <div className="md:sticky md:top-24 border border-stone-300/80 rounded-2xl p-7 bg-white/45 backdrop-blur-[2px]">
            <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.16em" }}>Capability Statement</p>
            <h2 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(22px, 2.4vw, 32px)", lineHeight: 1.12 }}>
              {t("about.capability.headline")}
            </h2>
            <CapabilityRequest />
          </div>
          <div>
            {CAPABILITY.map((p, i) => (
              <p key={i} className="type-body text-stone-600 mb-5 last:mb-0" style={{ lineHeight: 1.9 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    ),

    process: () => (
      <section id="our-process" className="scroll-mt-24 px-10 md:px-16 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-6xl mx-auto">
          <p className="type-label text-[#b8934a] mb-7" style={{ letterSpacing: "0.16em" }}>Our Process</p>
          <h2 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(26px, 3.6vw, 48px)", lineHeight: 1.05, maxWidth: "620px" }}>
            {t("about.process.headline")}
          </h2>
          <p className="type-body text-stone-600 mb-16 max-w-2xl" style={{ lineHeight: 1.9 }}>
            {t("about.process.intro")}
          </p>
          <style>{PROCESS_CSS}</style>
          <div
            ref={procRef}
            className={`grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch ${procVisible ? "proc-in" : ""}`}
          >
            {PROCESS.map((s, i) => (
              <div
                key={s.n}
                className="proc-card group h-full bg-white border border-stone-200 rounded-2xl p-8 md:p-10 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(44,31,20,0.12)] hover:border-[#b8934a]/50"
                style={{ animationDelay: `${i * 220}ms, ${i * 220}ms`, transition: "box-shadow 0.3s, border-color 0.3s, transform 0.3s" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{s.n}</span>
                  <span className="h-px flex-1 bg-stone-200 group-hover:bg-[#b8934a]/40 transition-colors duration-300" />
                </div>
                <h3 className="type-product text-stone-900 mb-4 group-hover:text-[#b8934a] transition-colors duration-300" style={{ fontSize: "clamp(18px, 2vw, 26px)", lineHeight: 1.2 }}>{s.title}</h3>
                <p className="type-body text-stone-600" style={{ lineHeight: 1.9 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    contact: () => (
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center overflow-hidden border-t border-stone-200 bg-[#2c1f14]">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center opacity-25" />
        <div className="absolute inset-0 bg-[#2c1f14]/55" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.16em" }}>Contact Us</p>
          <h2 className="type-large text-white mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "620px", lineHeight: 1.1 }}>
            Every successful project starts with a conversation.
          </h2>
          <p className="type-body text-stone-300 mb-10 mx-auto max-w-lg" style={{ lineHeight: 1.9 }}>
            Send through your plans, schedules, drawings or a preliminary brief - you don&rsquo;t need every detail selected. Our team will review the information and help you determine the next steps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
            <a href="mailto:info@ateliersupplygroup.com.au" className="type-body text-white/80 hover:text-white transition-colors">info@ateliersupplygroup.com.au</a>
            <span className="hidden sm:block text-white/30">·</span>
            <a href="tel:+61449513614" className="type-body text-white/80 hover:text-white transition-colors">+61 449 513 614</a>
          </div>
          <a href="/contact" className="arrow-link type-button inline-block border border-white/30 text-white px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300">
            Speak With Our Team &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>
    ),

  };
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" />
      <BlockPage kind="about" layoutKey={pageLayoutKey("about")} render={(b) => build(blockValue(b, t))[b.type]?.()} />
      <SiteFooter />
    </div>
  );
}
