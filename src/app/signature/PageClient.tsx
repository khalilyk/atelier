"use client";
import { useState } from "react";
import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { COLLECTION_INTRO } from "./data";
import BlockPage from "../components/BlockPage";
import { pageLayoutKey } from "@/lib/page-copy";

type SignatureCategory = { id: string; n: string; name: string; quote: string; body: string; img: string; img2?: string; imgAlt: string; flip: boolean; doubleImg: boolean };

const CATEGORIES_FALLBACK: SignatureCategory[] = [
  {
    n: "01",
    id: "windows-doors",
    name: "Windows & Doors",
    quote: "Architectural refinement with improved technical performance.",
    body: "Thermally broken aluminium systems for improved energy efficiency, and ultra-slim panoramic systems for larger openings, minimal sightlines and uninterrupted views.",
    img: "/Signature Luxe.png",
    imgAlt: "Windows & Doors",
    flip: false,
    doubleImg: false,
  },
];

function AccordionItem({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="type-body text-stone-400 group-hover:text-white transition-colors">{label}</span>
        <span className={`text-white/30 text-xl transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="pb-5 type-body text-stone-500">
          Contact us to request {label.toLowerCase()} documentation for this collection.
        </div>
      )}
    </div>
  );
}

export default function SignaturePage() {
  // Content is driven from code (data.ts) so the site stays consistent with the catalog.
  const CATEGORIES = CATEGORIES_FALLBACK;

  const sections: Record<string, React.ReactNode> = {
    hero: (
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <Image src="/products/Signature Luxe.png" alt="Signature" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col justify-end px-8 md:px-16 pb-16 md:pb-24">
          <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(40px, 8vw, 96px)" }}>Signature</h1>
          <p className="type-body text-white/60 mb-8" style={{ lineHeight: 1.9 }}>
            Reserved for the exceptional.
          </p>
          <a href="#collection" className="arrow-link type-button text-white/70 border-b border-white/25 pb-px w-fit hover:text-white transition-colors">
            Explore the Collection &nbsp;<span className="arrow">↓</span>
          </a>
        </div>
      </section>
    ),

    intro: (
      <section className="px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-4xl">
          <p className="type-label text-[#b8934a] mb-7" style={{ letterSpacing: "0.16em" }}>The Signature Luxe Collection</p>
          {COLLECTION_INTRO.map((p, i) => (
            <p key={i} className="type-body text-stone-400 mb-5 last:mb-0" style={{ lineHeight: 1.9, fontSize: "clamp(15px, 1.6vw, 19px)" }}>{p}</p>
          ))}
        </div>
      </section>
    ),

    categories: (
      <div id="collection">
        {CATEGORIES.map((cat) => {
          const textBlock = (
            <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#111110]">
              <div className="flex items-center gap-4 mb-8">
                <span className="type-label text-[#b8934a]">{cat.n}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <h2 className="type-large text-white mb-6" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>{cat.name}</h2>
              <p className="type-body text-stone-400 mb-5" style={{ lineHeight: 1.9 }}>{cat.quote}</p>
              <p className="type-body text-stone-500 mb-10" style={{ lineHeight: 1.9 }}>{cat.body}</p>
              <a href={`/signature/${cat.id}`} className="arrow-link type-button text-[#b8934a] border-b border-[#b8934a]/40 pb-px w-fit hover:text-white hover:border-white/30 transition-colors">
                Explore {cat.name} &nbsp;<span className="arrow">→</span>
              </a>
            </div>
          );

          const imgBlock = cat.doubleImg ? (
            <div className="flex flex-col h-full min-h-[480px] md:min-h-0">
              <div className="relative flex-1">
                <Image src={cat.img} alt={cat.imgAlt} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative flex-1">
                <Image src={cat.img2!} alt={cat.imgAlt} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </div>
          ) : (
            <div className="relative min-h-[360px] md:min-h-0">
              <Image src={cat.img} alt={cat.imgAlt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/25" />
            </div>
          );

          return (
            <section key={cat.id} id={cat.id} className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "480px" }}>
              {cat.flip ? <>{imgBlock}{textBlock}</> : <>{textBlock}{imgBlock}</>}
            </section>
          );
        })}
      </div>
    ),

    sourcing: (
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center opacity-40" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Bespoke Sourcing</p>
          <h2 className="type-large text-white mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>
            Looking for something rare?
          </h2>
          <p className="type-body text-white mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>
            Our sourcing team works directly with manufacturers and artisans worldwide to source custom materials, finishes and objects for your project.
          </p>
          <a href="/contact" className="arrow-link type-button inline-block border border-white/25 text-white px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300">
            Let's Source It For You &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>
    ),

  };

  return (
    <div className="min-h-screen bg-[#0d0c0b]">
      <SiteHeader variant="solid" />
      <BlockPage kind="signature" layoutKey={pageLayoutKey("signature")} sections={sections} />
      <SiteFooter />
    </div>
  );
}
