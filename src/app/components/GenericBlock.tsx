"use client";
import Image from "next/image";
import { useState } from "react";
import type { Block } from "@/lib/page-blocks";
import ProductHotspots from "./ProductHotspots";
import { hasHotspots, type HotspotBlock } from "@/lib/hotspots";

// Renders the page-builder blocks that can be added to any category page.
const lines = (s?: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean);
const rows = (s?: string) => lines(s).map((l) => l.split("::").map((c) => c.trim()));

function Eyebrow({ text, dark, center }: { text?: string; dark?: boolean; center?: boolean }) {
  if (!text) return null;
  return (
    <div className={`flex items-center gap-4 mb-3 ${center ? "justify-center" : ""}`}>
      {center && <div className={`h-px w-12 ${dark ? "bg-white/20" : "bg-stone-300"}`} />}
      <span className={`type-label ${dark ? "text-[#c8a25c]" : "text-[#b8934a]"}`} style={{ letterSpacing: "0.14em" }}>{text}</span>
      <div className={`h-px w-12 ${dark ? "bg-white/20" : "bg-stone-300"}`} />
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/12">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left py-5">
        <span className="type-product text-[#efe7d8]" style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.3 }}>{q}</span>
        <span className={`text-[#c8a25c] text-xl transition-transform duration-300 flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "600px" : "0" }}>
        <p className="type-body pb-6 text-[#b7ab97]" style={{ lineHeight: 1.9, fontSize: "13.5px" }}>{a}</p>
      </div>
    </div>
  );
}

/** The hotspot block keeps its photo and points as JSON in one field. */
function readHotspots(raw?: string): HotspotBlock | null {
  try {
    const v = JSON.parse(raw || "null");
    return v && typeof v === "object" ? (v as HotspotBlock) : null;
  } catch {
    return null;
  }
}

export default function GenericBlock({ block, variant }: { block: Block; variant?: "page" | "article" }) {
  const d = block.data;
  // Inside a journal article everything sits in one readable column.
  if (variant === "article") return <ArticleBlock block={block} />;
  switch (block.type) {
    case "g-text": {
      const dark = d.tone === "dark";
      const center = d.align === "center";
      const bg = dark ? "bg-[#2c2620] text-[#efe7d8]" : d.tone === "sand" ? "bg-[#ede8df]" : "";
      return (
        <section className={`px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 ${bg}`}>
          <div className={`max-w-3xl ${center ? "mx-auto text-center" : "md:ml-6"}`}>
            <Eyebrow text={d.eyebrow} dark={dark} center={center} />
            {d.headline && <h2 className={`type-large mb-6 ${dark ? "" : "text-stone-900"}`} style={{ fontSize: "clamp(26px, 3.4vw, 46px)", lineHeight: 1.08 }}>{d.headline}</h2>}
            {lines(d.body).map((p, i) => (
              <p key={i} className={`type-body mb-4 ${dark ? "text-[#b7ab97]" : "text-stone-500"}`} style={{ lineHeight: 1.9 }}>{p}</p>
            ))}
          </div>
        </section>
      );
    }
    case "g-text-image": {
      const right = d.side === "right";
      return (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "520px" }}>
          <div className={`relative min-h-[360px] md:min-h-0 ${right ? "md:order-2" : ""}`}>
            {d.image && <Image src={d.image} alt={d.headline || ""} fill className="object-cover" />}
          </div>
          <div className={`flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#f5f0e8] ${right ? "md:order-1" : ""}`}>
            {d.eyebrow && (
              <div className="flex items-center gap-4 mb-8">
                <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{d.eyebrow}</span>
                <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
              </div>
            )}
            {d.headline && <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>{d.headline}</h2>}
            {lines(d.body).map((p, i) => <p key={i} className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.9 }}>{p}</p>)}
            {d.button && (
              <a href={d.link || "#"} className="arrow-link type-button text-stone-500 border-b border-stone-300 pb-px w-fit hover:text-stone-900 transition-colors mt-3">{d.button} &nbsp;<span className="arrow">→</span></a>
            )}
          </div>
        </section>
      );
    }
    case "g-image":
      if (!d.image) return null;
      return (
        <figure className="border-t border-stone-200">
          <Image src={d.image} alt={d.caption || ""} width={2400} height={1400} sizes="100vw" className="w-full h-auto block" />
          {d.caption && <figcaption className="type-body text-stone-500 text-center px-6 py-4" style={{ fontSize: "13px" }}>{d.caption}</figcaption>}
        </figure>
      );
    case "g-gallery": {
      const imgs = rows(d.images).filter((r) => r[0]);
      if (!imgs.length) return null;
      return (
        <section className="px-6 md:px-8 py-20 md:py-24 border-t border-stone-200">
          <div className="max-w-6xl mx-auto">
            <Eyebrow text={d.eyebrow} />
            {d.headline && <h2 className="type-large text-stone-900 mb-10" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.1 }}>{d.headline}</h2>}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${imgs.length >= 3 ? "lg:grid-cols-3" : ""} gap-5 ${d.eyebrow || d.headline ? "" : "mt-2"}`}>
              {imgs.map(([src, cap], i) => (
                <figure key={i}>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
                    <Image src={src} alt={cap || ""} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  </div>
                  {cap && <figcaption className="type-body text-stone-500 mt-2" style={{ fontSize: "13px" }}>{cap}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "g-tiles": {
      const tiles = rows(d.tiles).filter((r) => r[0]);
      if (!tiles.length) return null;
      return (
        <section className={`grid grid-cols-1 ${tiles.length > 1 ? "md:grid-cols-2" : ""} border-t border-stone-200`}>
          {tiles.map(([title, desc, href, cta, img], i) => (
            <a key={i} href={href || "#"} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[46vh] md:min-h-[440px]">
              {img && <Image src={img} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-500" />
              <div className="relative z-10 max-w-md">
                <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 300, lineHeight: 1.05 }}>{title}</h2>
                {desc && <p className="type-body text-white/80 mb-8" style={{ lineHeight: 1.8 }}>{desc}</p>}
                {cta && <span className="arrow-link type-button text-white border-b border-white/50 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>{cta} &nbsp;<span className="arrow">→</span></span>}
              </div>
            </a>
          ))}
        </section>
      );
    }
    case "g-steps": {
      const steps = rows(d.steps).filter((r) => r[0]);
      if (!steps.length) return null;
      return (
        <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <Eyebrow text={d.eyebrow} center />
              {d.headline && <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(26px, 3.5vw, 48px)", lineHeight: 1.05 }}>{d.headline}</h2>}
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
              {steps.map(([title, desc], i) => (
                <div key={i} className="bg-white border border-stone-200/80 rounded-2xl p-6">
                  <span className="w-9 h-9 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center type-label mb-4" style={{ fontSize: "12px" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.2 }}>{title}</h3>
                  {desc && <p className="type-body text-stone-600" style={{ lineHeight: 1.7, fontSize: "13px" }}>{desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "g-faq": {
      const faqs = rows(d.faqs).filter((r) => r[0] && r[1]);
      if (!faqs.length) return null;
      const mid = Math.ceil(faqs.length / 2);
      return (
        <section className="px-6 md:px-8 py-20 md:py-28 bg-[#2c2620] text-[#efe7d8]">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center mb-12">
            <Eyebrow text="FAQS" dark center />
            {d.headline && <h2 className="type-large" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.05 }}>{d.headline}</h2>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14 max-w-5xl mx-auto">
            {[faqs.slice(0, mid), faqs.slice(mid)].map((col, c) => (
              <div key={c}>{col.map(([q, a], i) => <Faq key={i} q={q} a={a} />)}</div>
            ))}
          </div>
        </section>
      );
    }
    case "g-hotspots": {
      const hs = readHotspots(d.hotspots);
      if (!hasHotspots(hs)) return null;
      // The block's own eyebrow and headline win over the ones saved with the photo.
      return <ProductHotspots block={{ ...hs, eyebrow: d.eyebrow || hs.eyebrow, heading: d.headline || hs.heading }} />;
    }
    case "g-cta":
      return (
        <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
          {d.image && <Image src={d.image} alt="" fill className="object-cover object-center" />}
          <div className="absolute inset-0 bg-[#f5f0e8]/85" />
          <div className="relative z-10">
            {d.eyebrow && <p className="type-label text-[#b8934a] mb-6">{d.eyebrow}</p>}
            {d.headline && <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{d.headline}</h2>}
            {lines(d.body).map((p, i, all) => (
              <p key={i} className={`type-body text-stone-600 mx-auto max-w-lg ${i === all.length - 1 ? "mb-10" : "mb-3"}`} style={{ lineHeight: 1.9 }}>{p}</p>
            ))}
            {d.button && (
              <a href={d.link || "/quote"} className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">{d.button} &nbsp;<span className="arrow">→</span></a>
            )}
          </div>
        </section>
      );
    default:
      return null;
  }
}

// ── Article rendering: plain prose in one column ────────────────────────────
const Para = ({ text }: { text?: string }) => (
  <>{lines(text).map((p, i) => <p key={i} className="type-body text-stone-600 mb-5" style={{ lineHeight: 1.95, fontSize: "16.5px" }}>{p}</p>)}</>
);
const Heading = ({ text }: { text?: string }) =>
  text ? <h2 className="type-product text-stone-900 mt-10 mb-4" style={{ fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.2 }}>{text}</h2> : null;
const ArticleEyebrow = ({ text }: { text?: string }) =>
  text ? <p className="type-label text-[#b8934a] mt-10 mb-2" style={{ letterSpacing: "0.14em", fontSize: "10.5px" }}>{text}</p> : null;

/** The same blocks, rendered as plain article content in a single column. */
function ArticleBlock({ block }: { block: Block }) {
  const d = block.data;
  switch (block.type) {
    case "g-text":
      return <><ArticleEyebrow text={d.eyebrow} /><Heading text={d.headline} /><Para text={d.body} /></>;
    case "g-text-image":
      return (
        <>
          <ArticleEyebrow text={d.eyebrow} />
          <Heading text={d.headline} />
          {d.image && (
            <figure className="my-6">
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-stone-200">
                <Image src={d.image} alt={d.headline || ""} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
              </div>
            </figure>
          )}
          <Para text={d.body} />
          {d.button && <a href={d.link || "#"} className="arrow-link type-button text-[#b8934a] inline-block mb-6">{d.button} &nbsp;<span className="arrow">→</span></a>}
        </>
      );
    case "g-image":
      if (!d.image) return null;
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-stone-200">
            <Image src={d.image} alt={d.caption || ""} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
          </div>
          {d.caption && <figcaption className="type-body text-stone-400 mt-2" style={{ fontSize: "13px" }}>{d.caption}</figcaption>}
        </figure>
      );
    case "g-gallery": {
      const imgs = rows(d.images).filter((r) => r[0]);
      if (!imgs.length) return null;
      return (
        <>
          <Heading text={d.headline} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {imgs.map(([src, cap], i) => (
              <figure key={i}>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
                  <Image src={src} alt={cap || ""} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
                </div>
                {cap && <figcaption className="type-body text-stone-400 mt-2" style={{ fontSize: "12.5px" }}>{cap}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      );
    }
    case "g-steps": {
      const steps = rows(d.steps).filter((r) => r[0]);
      if (!steps.length) return null;
      return (
        <>
          <Heading text={d.headline} />
          <ol className="my-6 space-y-4">
            {steps.map(([title, desc], i) => (
              <li key={i} className="flex gap-4">
                <span className="type-label text-[#b8934a] pt-1 shrink-0" style={{ fontSize: "11px" }}>{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="type-product text-stone-900 block mb-1" style={{ fontSize: "17px" }}>{title}</span>
                  {desc && <span className="type-body text-stone-600 block" style={{ lineHeight: 1.85, fontSize: "15.5px" }}>{desc}</span>}
                </span>
              </li>
            ))}
          </ol>
        </>
      );
    }
    case "g-faq": {
      const faqs = rows(d.faqs).filter((r) => r[0] && r[1]);
      if (!faqs.length) return null;
      return (
        <>
          <Heading text={d.headline} />
          <dl className="my-6 space-y-5">
            {faqs.map(([q, a], i) => (
              <div key={i}>
                <dt className="type-product text-stone-900 mb-1" style={{ fontSize: "17px" }}>{q}</dt>
                <dd className="type-body text-stone-600" style={{ lineHeight: 1.85, fontSize: "15.5px" }}>{a}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    }
    case "g-tiles": {
      const tiles = rows(d.tiles).filter((r) => r[0]);
      if (!tiles.length) return null;
      return (
        <ul className="my-6 space-y-3">
          {tiles.map(([title, desc, href, cta], i) => (
            <li key={i}>
              <a href={href || "#"} className="type-product text-stone-900 hover:text-[#b8934a] transition-colors" style={{ fontSize: "17px" }}>{title}</a>
              {desc && <span className="type-body text-stone-600 block" style={{ fontSize: "15px", lineHeight: 1.8 }}>{desc}</span>}
              {cta && href && <a href={href} className="arrow-link type-button text-[#b8934a] inline-block mt-1">{cta} &nbsp;<span className="arrow">→</span></a>}
            </li>
          ))}
        </ul>
      );
    }
    case "g-hotspots": {
      const hs = readHotspots(d.hotspots);
      if (!hasHotspots(hs)) return null;
      // The block's own eyebrow and headline win over the ones saved with the photo.
      return <ProductHotspots block={{ ...hs, eyebrow: d.eyebrow || hs.eyebrow, heading: d.headline || hs.heading }} />;
    }
    case "g-cta":
      return (
        <aside className="my-10 rounded-2xl border border-stone-200 bg-white px-6 py-7">
          {d.headline && <p className="type-product text-stone-900 mb-2" style={{ fontSize: "20px" }}>{d.headline}</p>}
          <Para text={d.body} />
          {d.button && <a href={d.link || "/quote"} className="arrow-link type-button text-[#b8934a]">{d.button} &nbsp;<span className="arrow">→</span></a>}
        </aside>
      );
    default:
      return null;
  }
}
