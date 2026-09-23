"use client";
import { useState } from "react";
import Image from "next/image";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import GalleryStrip from "../../../components/GalleryStrip";
import CarouselRow from "../../../components/CarouselRow";
import { flyToBasket } from "@/lib/flyToBasket";
import { useProductOverrides } from "../../../components/ProductOverridesProvider";
import { mergeList, withImageFallbacks } from "@/lib/product-content";
import { useBasket } from "../../../context/BasketContext";
import { useImage, useImages } from "../../../components/ImagesProvider";
import { listProducts, type ProductData } from "../../data";
import ProductHotspots from "../../../components/ProductHotspots";
import BlockPage from "../../../components/BlockPage";
import { applyProductText } from "@/lib/product-blocks";

const JOINERY_MESSAGE =
  "Designed and manufactured to your plans, with standard construction tolerances built into the detailing.";

export type TemplateCategory = { slug: string; label: string };
const JOINERY: TemplateCategory = { slug: "joinery", label: "Custom Joinery" };

export default function JoineryProduct({ slug, data, cat = JOINERY }: { slug: string; data: ProductData; cat?: TemplateCategory }) {
  const { add } = useBasket();
  const productOverrides = useProductOverrides();
  const slotImages = useImages();
  const [added, setAdded] = useState(false);
  // CMS image slots: uploaded project photos take over from the stock imagery.
  // CMS slot photos win unless a block sets its own image.
  const slotHero = useImage(`${cat.slug}.${slug}.hero`);
  const slotSample = useImage(`${cat.slug}.${slug}.sample`);
  const uploadedRenders = [0, 1, 2].map((i) => slotImages[`${cat.slug}.${slug}.render.${i}`]).filter(Boolean) as string[];
  const others = mergeList(listProducts(cat.slug).filter((p) => p.data.name !== data.name), cat.slug, productOverrides).filter((p) => p.data.name !== data.name).map((p) => ({ ...p, data: withImageFallbacks(p.data) }));

  function addPackage() {
    add({
      id: `classic-${cat.slug}-package`,
      name: `${cat.label} Package`,
      category: cat.slug,
      categoryLabel: cat.label,
      tagline: `Includes: ${data.name}`,
      size: data.name,
      qty: 1,
      unit: "package",
      heroImg: data.heroImg,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const build = (data: ProductData, own: Record<string, string>): Record<string, () => React.ReactNode> => {
    const heroImg = (own.heroImg ? data.heroImg : slotHero) || data.heroImg;
    const sampleImg = (own.storyImg ? data.storyImg : slotSample) || data.storyImg;
    const gallery = own.gallery ? (data.gallery ?? []) : uploadedRenders.length > 0 ? uploadedRenders : (data.gallery ?? [data.heroImg, data.storyImg]);
  return {
    hero: () => (
      <section className="relative overflow-hidden" style={{ height: "82vh", minHeight: "540px" }}>
        <Image src={heroImg} alt={data.name} fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-14 md:pb-20">
          <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.18em" }}>{cat.label}</p>
          <h1 className="text-white uppercase mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "0.03em", fontWeight: 300 }}>
            {data.name}
          </h1>
          <p className="type-body text-white/70 mb-8 max-w-md" style={{ lineHeight: 1.6 }}>{data.tagline}</p>
          <a
            href="#explore"
            className="type-button px-7 py-3.5 inline-flex items-center gap-3 bg-[#b8934a] text-white hover:bg-[#a07e3c] transition-colors duration-300"
          >
            Explore &nbsp;<span>↓</span>
          </a>
        </div>
      </section>
    ),

    description: () => (
      <section id="explore" className="scroll-mt-24 px-8 md:px-14 py-16 md:py-20 border-t border-stone-200 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE PACKAGE</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <p className="text-stone-800" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2.4vw, 30px)", fontWeight: 300, lineHeight: 1.5 }}>
          {data.description ?? data.tagline}
        </p>
      </section>
    ),

    hotspots: () => (
      <ProductHotspots block={data.hotspots} />
    ),

    sample: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "440px" }}>
        <div className="relative min-h-[320px] md:min-h-0">
          <Image src={sampleImg} alt={`${data.name} sample project`} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 bg-[#ede8df]">
          <span className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.14em" }}>SAMPLE PROJECT</span>
          <h2 className="text-stone-900 mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.1 }}>Designed for the space it lives in.</h2>
          <p className="type-body text-stone-600" style={{ lineHeight: 1.9 }}>
            Every {data.name.toLowerCase()} package is developed around the room, the architecture and your selected finishes - then documented and reviewed before anything is manufactured.
          </p>
        </div>
      </section>
    ),

    renders: () => (
      <section className="border-t border-stone-200 py-14">
        <div className="px-8 md:px-14 flex items-center gap-4 mb-8">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>RENDERS &amp; DRAWINGS</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <GalleryStrip images={gallery} alt={`${data.name} render`} />
      </section>
    ),

    enquiry: () => (
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.16em" }}>ENQUIRE - {cat.label.toUpperCase()} PACKAGE</span>
          <h2 className="text-stone-900 mt-5 mb-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 300, lineHeight: 1.1 }}>
            A complete package, tailored to your project.
          </h2>
          <p className="type-body text-stone-600 mb-4" style={{ lineHeight: 1.9 }}>{JOINERY_MESSAGE}</p>
          <p className="type-body text-stone-500 mb-10" style={{ lineHeight: 1.8, fontSize: "14px" }}>
            You&rsquo;re enquiring about a complete {cat.label} package for your project. Add the package and share your plans, and our team will develop the design, drawings and finishes before preparing your proposal.
          </p>
          <button
            onClick={(e) => { flyToBasket(e.currentTarget as HTMLElement, data.heroImg); addPackage(); }}
            className={`type-button px-8 py-4 inline-flex items-center justify-center gap-3 transition-colors duration-300 ${added ? "bg-[#4a7c4a] text-white" : "bg-[#b8934a] text-white hover:bg-[#a07e3c]"}`}
          >
            {added ? "ADDED TO ENQUIRY ✓" : `ADD ${cat.label.toUpperCase()} PACKAGE`} <span>→</span>
          </button>
        </div>
      </section>
    ),

    others: () => others.length > 0 && (
        <section className="border-t border-stone-200 py-16 md:py-20">
          <div className="px-6 md:px-8 flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>OTHER PACKAGES</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <CarouselRow className="gap-6 px-6 md:px-8 pb-2">
            {others.map(({ slug, data: d }) => (
              <a key={slug} href={`/classic/${cat.slug}/${slug}`} className="group shrink-0 w-[300px] bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image src={d.heroImg} alt={d.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="type-product text-stone-900 group-hover:text-[#b8934a] transition-colors" style={{ fontSize: "18px", letterSpacing: "0.06em", lineHeight: 1.2 }}>{d.name}</h3>
                  <p className="type-body text-stone-500" style={{ fontSize: "13px", lineHeight: 1.6 }}>{d.tagline}</p>
                  <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>VIEW PACKAGE &nbsp;<span className="arrow">→</span></span>
                </div>
              </a>
            ))}
          </CarouselRow>
        </section>
      ),

  };
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb={cat.label} />
      <BlockPage kind="p-joinery" raw={data.blocks} render={(b) => build(applyProductText(data, b.data), b.data)[b.type]?.()} />
      <SiteFooter />
    </div>
  );
}
