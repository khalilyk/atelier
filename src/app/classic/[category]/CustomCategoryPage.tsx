"use client";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { useProductOverrides } from "../../components/ProductOverridesProvider";
import { useCustomCategories } from "../../components/CategoriesProvider";
import { mergeList, withImageFallbacks } from "@/lib/product-content";
import { lines, rows, type CustomCategory } from "@/lib/categories";
import { GENERIC_BY_TYPE, parseBlocks } from "@/lib/page-blocks";
import GenericBlock from "../../components/GenericBlock";

// Built-in collections always offered in "Explore other collections".
const BUILTIN = [
  { slug: "windows-doors", label: "Windows & Doors", img: "/Signature Luxe.png" },
  { slug: "joinery", label: "Custom Joinery", img: "/Atelier_Classic.png" },
  { slug: "bathrooms", label: "Bathroom Packages", img: "/vanities/OJS265-1200.jpg" },
];

function useInView(threshold = 0.12) {
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/12">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left py-5">
        <span className="type-product text-[#efe7d8]" style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.3 }}>{q}</span>
        <span className={`text-[#c8a25c] text-xl transition-transform duration-300 flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "600px" : "0" }}>
        <p className="type-body text-[#b7ab97] pb-6" style={{ lineHeight: 1.9, fontSize: "13.5px" }}>{a}</p>
      </div>
    </div>
  );
}

function Process({ headline, steps }: { headline: string; steps: string[][] }) {
  const { ref, visible } = useInView();
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-px bg-stone-300 w-12" />
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE PROCESS</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(26px, 3.5vw, 48px)", lineHeight: 1.05 }}>{headline}</h2>
      </div>
      <div ref={ref} className={`max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 ${steps.length === 1 ? "lg:grid-cols-1" : steps.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-4`}>
        {steps.map(([title, desc], i) => (
          <div key={i} className="group bg-white border border-stone-200/80 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-16px_rgba(44,38,32,0.35)] hover:border-[#b8934a]/50"
            style={{ opacity: visible ? 1 : 0, transform: visible ? undefined : "translateY(14px)", transition: "opacity 0.6s ease, transform 0.6s ease", transitionDelay: `${i * 180}ms` }}>
            <span className="w-9 h-9 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center type-label mb-4 transition-colors duration-300 group-hover:bg-[#b8934a] group-hover:text-white" style={{ fontSize: "12px" }}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.2 }}>{title}</h3>
            {desc && <p className="type-body text-stone-600" style={{ lineHeight: 1.7, fontSize: "13px" }}>{desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CustomCategoryPage({ cat }: { cat: CustomCategory }) {
  const productOverrides = useProductOverrides();
  const customs = useCustomCategories();
  const products = mergeList([], cat.slug, productOverrides).map((p) => ({ ...p, data: withImageFallbacks(p.data, cat.heroImg || undefined) }));

  const others = [
    ...BUILTIN,
    ...customs.map((c) => ({ slug: c.slug, label: c.label, img: c.heroImg || "/Atelier_Classic.png" })),
  ].filter((o) => o.slug !== cat.slug);

  const build = (cat: CustomCategory): Record<string, () => React.ReactNode> => {
  const steps = rows(cat.processSteps);
  const tiles = rows(cat.featureTiles).filter((r) => r[0]);
  const faqs = rows(cat.faqs).filter((r) => r[0] && r[1]);
  const faqMid = Math.ceil(faqs.length / 2);
  return {
    hero: () => (
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "70vh" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#ede8df]">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>{cat.heroEyebrow}</p>
          <h1 className="type-hero text-stone-900 uppercase mb-5" style={{ fontSize: "clamp(36px, 6vw, 80px)", lineHeight: 1.0, letterSpacing: "0.06em" }}>{cat.label}</h1>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <p className="type-body text-stone-500 mb-8 max-w-sm" style={{ lineHeight: 1.9 }}>{cat.heroIntro}</p>
          {cat.heroCta && (
            <a href="#range" className="arrow-link type-button text-stone-500 border-b border-stone-300 pb-px hover:text-stone-900 transition-colors w-fit">
              {cat.heroCta} &nbsp;<span className="arrow">↓</span>
            </a>
          )}
        </div>
        <div className="relative min-h-[400px] md:min-h-0">
          {cat.heroImg && <Image src={cat.heroImg} alt={cat.label} fill className="object-cover" priority />}
          <div className="absolute inset-0 bg-black/8" />
        </div>
      </section>
    ),

    story: () => (cat.storyHeadline || cat.storyBody) && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "520px" }}>
          <div className="relative min-h-[360px] md:min-h-0">
            {cat.storyImg && <Image src={cat.storyImg} alt={`${cat.label} story`} fill className="object-cover" />}
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#f5f0e8]">
            <div className="flex items-center gap-4 mb-10">
              <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{cat.storyEyebrow}</span>
              <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
            </div>
            {cat.storyHeadline && <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>{cat.storyHeadline}</h2>}
            {lines(cat.storyBody).map((p, i) => (
              <p key={i} className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.9 }}>{p}</p>
            ))}
          </div>
        </section>
      ),

    process: () => steps.length > 0 && <Process headline={cat.processHeadline} steps={steps} />,

    range: () => (
      <section id="range" className="scroll-mt-24 py-20 md:py-28 px-6 md:px-8 border-t border-stone-200">
        <div className="mb-12">
          <div className="flex items-center gap-4">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE RANGE</span>
            <div className="h-px bg-stone-300 w-16" />
            <span className="type-label text-stone-400">{products.length} {cat.template === "windows-doors" ? "systems" : "packages"}</span>
          </div>
          {(cat.rangeHeadline || cat.rangeIntro) && (
            <div className="mt-6">
              {cat.rangeHeadline && <h2 className="type-large text-stone-900 mb-2" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.1 }}>{cat.rangeHeadline}</h2>}
              {cat.rangeIntro && <p className="type-body text-stone-500 max-w-xl" style={{ lineHeight: 1.8 }}>{cat.rangeIntro}</p>}
            </div>
          )}
        </div>
        {products.length === 0 ? (
          <p className="type-body text-stone-400">The range is being prepared. Please check back soon, or request a quote below.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(({ slug, data }) => (
              <a key={slug} href={`/classic/${cat.slug}/${slug}`} className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                  {data.heroImg && <Image src={data.heroImg} alt={data.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="type-product text-stone-900 group-hover:text-[#b8934a] transition-colors" style={{ letterSpacing: "0.06em", fontSize: "20px", lineHeight: 1.2 }}>{data.name}</h3>
                  {data.tagline && <p className="type-body text-stone-500" style={{ lineHeight: 1.7, fontSize: "13px" }}>{data.tagline}</p>}
                  <span className="arrow-link type-button text-[#b8934a] mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>{cat.cardCta || "Explore"} &nbsp;<span className="arrow">→</span></span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    ),

    tiles: () => tiles.length > 0 && (
        <section className={`grid grid-cols-1 ${tiles.length > 1 ? "md:grid-cols-2" : ""} border-t border-stone-200`}>
          {tiles.map(([title, desc, href, img], i) => (
            <a key={i} href={href || "#"} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[46vh] md:min-h-[440px]">
              {img && <Image src={img} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-500" />
              <div className="relative z-10 max-w-md">
                <p className="type-label text-[#d9b877] mb-4" style={{ letterSpacing: "0.16em" }}>EXPLORE</p>
                <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 300, lineHeight: 1.05 }}>{title}</h2>
                {desc && <p className="type-body text-white/80 mb-8" style={{ lineHeight: 1.8 }}>{desc}</p>}
                {href && <span className="arrow-link type-button text-white border-b border-white/50 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>View &nbsp;<span className="arrow">→</span></span>}
              </div>
            </a>
          ))}
        </section>
      ),

    building: () => (
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Atelier Classic</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{cat.ctaHeadline}</h2>
          {cat.ctaBody && <p className="type-body text-stone-600 mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>{cat.ctaBody}</p>}
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            Start Your Project Today &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>
    ),

    faqs: () => faqs.length > 0 && (
        <section className="px-6 md:px-8 py-20 md:py-28 bg-[#2c2620] text-[#efe7d8]">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px bg-white/20 w-12" />
              <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>FAQS</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            <h2 className="type-large" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.05 }}>Questions, answered.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14 max-w-5xl mx-auto">
            {[faqs.slice(0, faqMid), faqs.slice(faqMid)].map((col, c) => (
              <div key={c}>{col.map(([q, a], i) => <FaqItem key={i} q={q} a={a} />)}</div>
            ))}
          </div>
        </section>
      ),

    explore: () => (
      <section className="grid grid-cols-1 md:grid-cols-2">
        {others.slice(0, 2).map((o) => (
          <a key={o.slug} href={`/classic/${o.slug}`} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[42vh] md:min-h-[440px]">
            <Image src={o.img} alt={o.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-500" />
            <div className="relative z-10 max-w-md">
              <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.16em" }}>EXPLORE THE COLLECTION</p>
              <h2 className="text-white mb-5" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 300, lineHeight: 1.05 }}>{o.label}</h2>
              <span className="arrow-link type-button text-white border-b border-white/40 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>EXPLORE &nbsp;<span className="arrow">→</span></span>
            </div>
          </a>
        ))}
      </section>
    ),

  };
  };

  const blocks = parseBlocks(cat.layout, "custom");

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb={cat.label} />
      {blocks.filter((b) => !b.hidden).map((b) => (
        <Fragment key={b.uid}>{GENERIC_BY_TYPE[b.type] ? <GenericBlock block={b} /> : build({ ...cat, ...b.data } as CustomCategory)[b.type]?.()}</Fragment>
      ))}
      <SiteFooter />
    </div>
  );
}
