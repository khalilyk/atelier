"use client";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { useT } from "../../components/ContentProvider";
import type { ProductData } from "../data";
import { GENERIC_BY_TYPE, blockValue, parseBlocks } from "@/lib/page-blocks";
import GenericBlock from "../../components/GenericBlock";
import { layoutKey } from "@/lib/category-copy";
import InlineDownloadGate from "../../components/InlineDownloadGate";

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

// Split a multiline CMS field into trimmed non-empty lines.
const lines = (s: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean);
// Split each line on "::" into columns.
const rows = (s: string) => lines(s).map((l) => l.split("::").map((c) => c.trim()));

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

function HowItWorks({ headline, steps }: { headline: string; steps: string[][] }) {
  const { ref, visible } = useInView(0.12);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center mb-14">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-px bg-stone-300 w-12" />
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>HOW IT WORKS</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(26px, 3.5vw, 48px)", lineHeight: 1.05 }}>{headline}</h2>
      </div>
      <div ref={ref} className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 items-stretch">
        {steps.map(([title, desc], i) => (
          <div key={i} className="relative flex">
            <div className="group flex-1 bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-16px_rgba(44,38,32,0.35)] hover:border-[#b8934a]/50"
              style={{ opacity: visible ? 1 : 0, transform: visible ? undefined : "translateY(14px)", transition: "opacity 0.6s ease, transform 0.6s ease", transitionDelay: `${i * 220}ms` }}>
              <span className="w-9 h-9 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center type-label mb-4 transition-colors duration-300 group-hover:bg-[#b8934a] group-hover:text-white" style={{ fontSize: "12px" }}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className="type-product text-stone-900 mb-2 transition-colors duration-300 group-hover:text-[#8a6d2f]" style={{ fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.2 }}>{title}</h3>
              <p className="type-body text-stone-600" style={{ lineHeight: 1.7, fontSize: "13px" }}>{desc}</p>
            </div>
            {i < steps.length - 1 && (
              <span className="hidden lg:flex absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#2c2620] text-[#e9c98a] items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)]" style={{ fontSize: "15px", opacity: visible ? 1 : 0, transition: "opacity 0.5s ease", transitionDelay: `${i * 220 + 110}ms` }}>→</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Renders paragraphs from a multiline field; optionally italicises the last one.
function Paras({ text, className, italicLast, style }: { text: string; className?: string; italicLast?: boolean; style?: React.CSSProperties }) {
  const ps = lines(text);
  return (
    <>
      {ps.map((p, i) => (
        <p key={i} className={className} style={{ ...style, ...(italicLast && i === ps.length - 1 ? { fontStyle: "italic", color: "#57534e" } : {}) }}>{p}</p>
      ))}
    </>
  );
}

export default function BathroomsPage({ packages }: { packages: { slug: string; data: ProductData }[] }) {
  const page = useT();
  const build = (t: (key: string) => string): Record<string, () => React.ReactNode> => {
  const cardMap: Record<string, { desc: string; style: string }> = {};
  for (const [slug, desc, style] of rows(t("bath.cards"))) cardMap[slug] = { desc, style };
  const includes = lines(t("bath.si.includes"));
  const chooseRows = rows(t("bath.inc.choose"));
  const whyTiles = rows(t("bath.why.tiles"));
  const faqRows = rows(t("bath.faqs"));
  const faqMid = Math.ceil(faqRows.length / 2);
  const availableSet = new Set(lines(t("bath.available")));

  return {
    hero: () => (
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "72vh" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#ede8df]">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>{t("bath.hero.eyebrow")}</p>
          <h1 className="type-hero text-stone-900 mb-6" style={{ fontSize: "clamp(30px, 4.6vw, 60px)", lineHeight: 1.05, letterSpacing: "0.01em" }}>{t("bath.hero.headline")}</h1>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <Paras text={t("bath.hero.body")} className="type-body text-stone-500 mb-4 max-w-md" style={{ lineHeight: 1.9 }} />
          <a href="#range" className="arrow-link type-button text-stone-500 border-b border-stone-300 pb-px hover:text-stone-900 transition-colors w-fit mt-4">{t("bath.hero.cta")} &nbsp;<span className="arrow">↓</span></a>
        </div>
        <div className="relative min-h-[400px] md:min-h-0">
          <Image src={t("bath.hero.img")} alt="Atelier bathroom package" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/8" />
        </div>
      </section>
    ),

    story: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "560px" }}>
        <div className="relative min-h-[360px] md:min-h-0">
          <Image src={t("bath.story.img")} alt="Bathroom detail" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#f5f0e8]">
          <div className="flex items-center gap-4 mb-8">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("bath.story.eyebrow")}</span>
            <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
          </div>
          <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(26px, 3.4vw, 46px)", lineHeight: 1.08 }}>{t("bath.story.headline")}</h2>
          <Paras text={t("bath.story.body")} className="type-body text-stone-500 mb-5" italicLast style={{ lineHeight: 1.9 }} />
        </div>
      </section>
    ),

    how: () => (
      <HowItWorks headline={t("bath.how.headline")} steps={rows(t("bath.how.steps"))} />
    ),

    range: () => packages.length > 0 && (
      <section id="range" className="scroll-mt-24 py-20 md:py-28 px-6 md:px-8 border-t border-stone-200">
        <div className="flex items-center gap-4 mb-12">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("bath.range.eyebrow")}</span>
          <div className="h-px bg-stone-300 w-16" />
          <span className="type-label text-stone-400">{packages.length} packages</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map(({ slug, data }) => {
            const copy = cardMap[slug];
            const available = availableSet.has(slug);
            const inner = (
              <>
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image src={data.heroImg} alt={data.name} fill className={`object-cover transition-transform duration-500 ${available ? "group-hover:scale-105" : ""}`} />
                  {!available && (
                    <span className="absolute top-3 left-3 z-10 type-label bg-[#2c2620]/85 text-[#e9c98a] px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.14em" }}>COMING SOON</span>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h3 className={`type-product text-stone-900 transition-colors ${available ? "group-hover:text-[#b8934a]" : ""}`} style={{ letterSpacing: "0.05em", fontSize: "19px", lineHeight: 1.2 }}>{data.name}</h3>
                  <p className="type-body text-stone-500" style={{ lineHeight: 1.7, fontSize: "13px" }}>{copy?.desc || data.tagline}</p>
                  <p className="type-label text-stone-400 pt-1 border-t border-stone-100 mt-1" style={{ fontSize: "10.5px", letterSpacing: "0.08em" }}>STYLE: {(copy?.style || data.packageStyle || "").toUpperCase()}</p>
                  {available ? (
                    <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>Explore Package &nbsp;<span className="arrow">→</span></span>
                  ) : (
                    <span className="type-button text-stone-400 mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>Coming Soon</span>
                  )}
                </div>
              </>
            );
            const cls = "group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-300";
            return available ? (
              <a key={slug} href={`/classic/bathrooms/${slug}`} className={`${cls} hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1`}>{inner}</a>
            ) : (
              <div key={slug} className={cls} aria-disabled>{inner}</div>
            );
          })}
        </div>
      </section>
      ),

    supply: () => (
      <section className="border-t border-stone-200">
        <div className="relative px-6 md:px-8 py-24 md:py-32 overflow-hidden">
          <Image src={t("bath.si.img")} alt="Coordinated bathroom vanity" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-[#2c2620]/80" />
          <div className="relative z-10 max-w-4xl mx-auto text-center text-[#efe7d8]">
            <p className="type-label text-[#c8a25c] mb-5" style={{ letterSpacing: "0.16em" }}>{t("bath.si.eyebrow")}</p>
            <h2 className="type-large mb-6" style={{ fontSize: "clamp(26px, 4vw, 52px)", lineHeight: 1.05 }}>{t("bath.si.headline")}</h2>
            <Paras text={t("bath.si.lead")} className="type-body text-[#d8cfc0] mb-4 max-w-2xl mx-auto" style={{ lineHeight: 1.9 }} />
          </div>
        </div>

        <div className="px-6 md:px-8 py-16 md:py-20 bg-[#f5f0e8]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <Paras text={t("bath.si.body")} className="type-body text-stone-600 mb-4" style={{ lineHeight: 1.9 }} />
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-12">
              <p className="type-label text-[#b8934a] mb-2" style={{ letterSpacing: "0.14em" }}>WHAT INSTALLATION CAN INCLUDE</p>
              <p className="type-body text-stone-400 mb-6" style={{ fontSize: "13px" }}>Depending on your project scope:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">
                {includes.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 type-body text-stone-600" style={{ fontSize: "13.5px", lineHeight: 1.5 }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b8934a] shrink-0" />{item}
                  </div>
                ))}
              </div>
              <p className="type-body text-stone-500 mt-6" style={{ lineHeight: 1.8, fontSize: "13px" }}>{t("bath.si.includesNote")}</p>
            </div>

            <div className="mb-12 max-w-3xl">
              <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "clamp(18px, 2vw, 24px)" }}>{t("bath.si.pricing.headline")}</h3>
              <Paras text={t("bath.si.pricing.body")} className="type-body text-stone-600 mb-4" style={{ lineHeight: 1.9 }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border border-stone-200 rounded-2xl p-8">
                <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.14em" }}>NEW BUILDS</p>
                <Paras text={t("bath.si.newbuilds")} className="type-body text-stone-500 mb-4" italicLast style={{ lineHeight: 1.8, fontSize: "13.5px" }} />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-8">
                <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.14em" }}>FULL RENOVATIONS</p>
                <Paras text={t("bath.si.fullreno")} className="type-body text-stone-500 mb-4" italicLast style={{ lineHeight: 1.8, fontSize: "13.5px" }} />
              </div>
            </div>

            <div className="text-center">
              <p className="type-body text-stone-600 mb-6" style={{ lineHeight: 1.9, fontSize: "17px" }}>{t("bath.si.ctaLine")}</p>
              <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">{t("bath.si.ctaButton")} &nbsp;<span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </section>
    ),

    included: () => (
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("bath.inc.eyebrow")}</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <h2 className="type-large text-stone-900 mb-12" style={{ fontSize: "clamp(26px, 3.4vw, 46px)", lineHeight: 1.05 }}>{t("bath.inc.headline")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-8">
              <h3 className="type-product text-stone-900 mb-4" style={{ fontSize: "clamp(18px, 2vw, 24px)" }}>Fixed in every package</h3>
              <Paras text={t("bath.inc.fixed")} className="type-body text-stone-500 mb-4" style={{ lineHeight: 1.9 }} />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-8">
              <h3 className="type-product text-stone-900 mb-4" style={{ fontSize: "clamp(18px, 2vw, 24px)" }}>Yours to choose</h3>
              <div className="space-y-5">
                {chooseRows.map(([label, desc], i) => (
                  <div key={i}>
                    <p className="type-body text-stone-800" style={{ lineHeight: 1.6 }}><b>{label}</b></p>
                    <p className="type-body text-stone-500" style={{ lineHeight: 1.8, fontSize: "13.5px" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    why: () => (
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("bath.why.eyebrow")}</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyTiles.map(([title, desc], i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6">
                <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "17px", lineHeight: 1.25 }}>{title}</h3>
                <p className="type-body text-stone-500" style={{ lineHeight: 1.75, fontSize: "13px" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    downloads: () => (
      <section className="px-6 md:px-8 py-16 border-t border-stone-200 bg-[#faf8f4]">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-stone-200/70 shadow-[0_24px_60px_-28px_rgba(44,38,32,0.45)] px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
          {t("bath.dl.img") && (
            <div className="relative w-40 sm:w-48 shrink-0 aspect-[707/1000] rounded-xl overflow-hidden bg-stone-100 border border-stone-200/70 shadow-[0_14px_36px_-18px_rgba(44,38,32,0.5)]">
              <Image src={t("bath.dl.img")} alt={t("bath.dl.headline") || "Care guide"} fill sizes="200px" className="object-cover object-top" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-3">
              <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("bath.dl.eyebrow")}</span>
              <div className="h-px bg-stone-300 w-12" />
            </div>
            {t("bath.dl.headline") && (
              <h2 className="type-large text-stone-900 mb-4" style={{ fontSize: "clamp(28px, 3.6vw, 48px)", lineHeight: 1.05 }}>{t("bath.dl.headline")}</h2>
            )}
            <p className="type-body text-stone-500 max-w-md" style={{ lineHeight: 1.8 }}>{t("bath.dl.note")}</p>
          </div>
          <div className="w-full md:max-w-sm">
            <InlineDownloadGate
              resource="bathroom-maintenance"
              intro="Enter your name and email to download. We’ll email you a copy too."
              itemName="The Bathroom Care & Maintenance Guide"
              submitLabel={t("bath.dl.button")}
              downloadLabel="Download the guide"
            />
          </div>
        </div>
      </section>
    ),

    building: () => (
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">{t("bath.bwc.eyebrow")}</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{t("bath.bwc.headline")}</h2>
          {lines(t("bath.bwc.body")).map((p, i) => (
            <p key={i} className={`type-body mx-auto ${i === 0 ? "text-stone-700 mb-4 max-w-lg" : "text-stone-600 mb-10 max-w-lg"}`} style={{ lineHeight: 1.9, fontSize: i === 0 ? "17px" : undefined }}>{p}</p>
          ))}
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">{t("bath.bwc.cta")} &nbsp;<span className="arrow">→</span></a>
        </div>
      </section>
    ),

    faqs: () => (
      <section className="px-6 md:px-8 py-20 md:py-28 bg-[#2c2620] text-[#efe7d8]">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px bg-white/20 w-12" />
            <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>FAQS</span>
            <div className="h-px bg-white/20 w-12" />
          </div>
          <h2 className="type-large mb-3" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.05 }}>{t("bath.faq.headline")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14 max-w-5xl mx-auto">
          {[faqRows.slice(0, faqMid), faqRows.slice(faqMid)].map((col, c) => (
            <div key={c}>{col.map(([q, a], i) => <FaqItem key={i} q={q} a={a} />)}</div>
          ))}
        </div>
      </section>
    ),

    explore: () => (
      <section className="grid grid-cols-1 md:grid-cols-2">
        {([
          { cat: "windows-doors", label: "Aluminium Windows & Doors", img: "/Signature Luxe.png" },
          { cat: "joinery", label: "Custom Joinery", img: "/Atelier_Classic.png" },
        ]).map((o) => (
          <a key={o.cat} href={`/classic/${o.cat}`} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[42vh] md:min-h-[440px]">
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

  const blocks = parseBlocks(page(layoutKey("bathrooms")), "bathrooms");

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Bathroom Packages" />
      {blocks.filter((b) => !b.hidden).map((b) => (
        <Fragment key={b.uid}>{GENERIC_BY_TYPE[b.type] ? <GenericBlock block={b} /> : build(blockValue(b, page))[b.type]?.()}</Fragment>
      ))}
      <SiteFooter />
    </div>
  );
}
