"use client";
import { useState } from "react";
import Image from "next/image";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { useBasket } from "../../../context/BasketContext";
import { flyToBasket } from "@/lib/flyToBasket";
import GalleryStrip from "../../../components/GalleryStrip";
import CarouselRow from "../../../components/CarouselRow";
import { useProductOverrides } from "../../../components/ProductOverridesProvider";
import { mergeList, withImageFallbacks } from "@/lib/product-content";
import { listProducts, type ProductData } from "../../data";
import ProductHotspots from "../../../components/ProductHotspots";
import BlockPage from "../../../components/BlockPage";
import { applyProductText } from "@/lib/product-blocks";

const TAILORED_MESSAGE =
  "Our windows and doors are custom tailored to each project. Upload your plans and project information and our team will review the window schedule, applicable BASIX and NatHERS requirements, glazing, frame systems and project specifications before preparing your tailored proposal.";

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const PACKAGE_SIZE = "Complete project package";

type Sibling = { slug: string; data: ProductData };

export default function WindowsDoorsProduct({
  data,
  collection = "classic",
  siblings,
  cat,
}: {
  data: ProductData;
  collection?: "classic" | "signature";
  siblings?: Sibling[];
  /** Admin-created category using this template (defaults to Windows & Doors). */
  cat?: { slug: string; label: string };
}) {
  const { add, items, remove } = useBasket();
  const productOverrides = useProductOverrides();
  const [added, setAdded] = useState(false);

  const isSignature = collection === "signature";
  const eyebrow = isSignature ? "Signature Luxe" : "Classic Collection";
  const catSlug = cat?.slug ?? "windows-doors";
  const catLabel = cat?.label ?? "Windows & Doors";
  const basePath = isSignature ? "/signature/windows-doors" : `/classic/${catSlug}`;
  const packageId = isSignature ? "signature-windows-doors-package" : `classic-${catSlug}-package`;
  const packageCategoryLabel = isSignature ? "Windows & Doors (Signature Luxe)" : catLabel;

  // Customers never add individual windows or doors. This adds ONE complete
  // Window & Door Package for the project; re-adding updates the preferred
  // system rather than stacking a second package.
  function addPackage() {
    items.filter((i) => i.id === packageId).forEach((i) => remove(i.id, i.size));
    add({
      id: packageId,
      name: cat ? `${catLabel} Package` : "Window & Door Package",
      category: catSlug,
      categoryLabel: packageCategoryLabel,
      tagline: `Preferred system: ${data.name}`,
      size: PACKAGE_SIZE,
      qty: 1,
      unit: "package",
      heroImg: data.heroImg,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const others = mergeList((siblings ?? listProducts(catSlug)).filter((p) => p.data.name !== data.name), catSlug, productOverrides).filter((p) => p.data.name !== data.name).map((p) => ({ ...p, data: withImageFallbacks(p.data) }));

  const build = (data: ProductData): Record<string, () => React.ReactNode> => {
    const gallery = data.gallery ?? [data.heroImg, data.storyImg];
  return {
    hero: () => (
      <section className="relative overflow-hidden" style={{ height: "82vh", minHeight: "540px" }}>
        <Image src={data.heroImg} alt={data.name} fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-14 md:pb-20">
          <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.18em" }}>{eyebrow}</p>
          <h1 className="text-white uppercase mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "0.03em", fontWeight: 300 }}>
            {data.name}
          </h1>
          {data.certification && (
            <span className="inline-block type-label text-white border border-white/40 px-4 py-2 mb-6" style={{ letterSpacing: "0.12em" }}>
              {data.certification.toUpperCase()}
            </span>
          )}
          <p className="type-body text-white/70 mb-8 max-w-md" style={{ lineHeight: 1.6 }}>{data.tagline}</p>
          <button
            onClick={(e) => { flyToBasket(e.currentTarget as HTMLElement, data.heroImg); addPackage(); }}
            className={`type-button px-7 py-3.5 inline-flex items-center gap-3 transition-all duration-300 ${added ? "bg-[#4a7c4a] text-white" : "bg-[#b8934a] text-white hover:bg-[#a07e3c]"}`}
          >
            {added ? "Added to Enquiry ✓" : `Add ${catLabel} Package`} &nbsp;<span>→</span>
          </button>
        </div>
      </section>
    ),

    description: () => (
      <section className="px-8 md:px-14 py-16 md:py-20 border-t border-stone-200 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE SYSTEM</span>
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

    configurations: () => data.configurations && (
        <section className="px-8 md:px-14 py-14 border-t border-stone-200">
          <div className="flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>AVAILABLE CONFIGURATIONS</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4 max-w-4xl">
            {data.configurations.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-stone-200">
                <Check /><span className="type-body text-stone-700">{c}</span>
              </div>
            ))}
          </div>
        </section>
      ),

    profiles: () => data.profiles && (
        <section className="px-8 md:px-14 py-14 border-t border-stone-200 bg-[#ede8df]">
          <div className="flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>FRAME PROFILES & SECTION DETAILS</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 w-full items-start">
            {data.profiles.map((p, i) => (
              <div key={i} className="md:border-l md:border-stone-300 md:pl-8 md:[&:nth-child(4n+1)]:border-l-0 md:[&:nth-child(4n+1)]:pl-0">
                <p className="type-label text-stone-400 mb-2" style={{ letterSpacing: "0.12em" }}>{p.label.toUpperCase()}</p>
                <p className="type-body text-stone-900">{p.value}</p>
              </div>
            ))}
          </div>
        </section>
      ),

    performance: () => data.performance && (
        <section className="px-8 md:px-14 py-14 border-t border-stone-200">
          <div className="flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>KEY PERFORMANCE FEATURES</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-4 w-full">
            {data.performance.map((f, i) => (
              <div key={i} className="flex items-start gap-3"><Check /><span className="type-body text-stone-700" style={{ lineHeight: 1.6 }}>{f}</span></div>
            ))}
          </div>
        </section>
      ),

    options: () => (data.glassOptions || data.finishOptions) && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
          {data.glassOptions && (
            <div className="px-8 md:px-14 py-14 md:border-r border-stone-200">
              <div className="flex items-center gap-4 mb-8">
                <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>GLASS OPTIONS</span>
                <div className="h-px bg-stone-300 w-10" />
              </div>
              <ul className="space-y-3">
                {data.glassOptions.map((g, i) => <li key={i} className="flex items-start gap-3"><Check /><span className="type-body text-stone-700">{g}</span></li>)}
              </ul>
            </div>
          )}
          {data.finishOptions && (
            <div className="px-8 md:px-14 py-14 border-t md:border-t-0 border-stone-200 bg-[#ede8df]">
              <div className="flex items-center gap-4 mb-8">
                <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>FINISH OPTIONS</span>
                <div className="h-px bg-stone-300 w-10" />
              </div>
              <ul className="space-y-3">
                {data.finishOptions.map((f, i) => <li key={i} className="flex items-start gap-3"><Check /><span className="type-body text-stone-700">{f}</span></li>)}
              </ul>
            </div>
          )}
        </section>
      ),

    project: () => data.projectExample && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "440px" }}>
          <div className="relative min-h-[320px] md:min-h-0">
            <Image src={data.projectExample.img} alt={data.projectExample.title} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 bg-[#ede8df]">
            <span className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.14em" }}>IN A PROJECT</span>
            <h2 className="text-stone-900 mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.1 }}>{data.projectExample.title}</h2>
            <p className="type-label text-stone-400 mb-6" style={{ letterSpacing: "0.12em" }}>{data.projectExample.location.toUpperCase()}</p>
            <p className="type-body text-stone-600" style={{ lineHeight: 1.9 }}>{data.projectExample.desc}</p>
          </div>
        </section>
      ),

    gallery: () => (
      <section className="border-t border-stone-200 py-14">
        <div className="px-8 md:px-14 flex items-center gap-4 mb-8">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>GALLERY</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <GalleryStrip images={gallery} alt={data.name} />
      </section>
    ),

    enquiry: () => (
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.16em" }}>ENQUIRE - WINDOW & DOOR PACKAGE</span>
          <h2 className="text-stone-900 mt-5 mb-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 300, lineHeight: 1.1 }}>
            A complete package, tailored to your project.
          </h2>
          <p className="type-body text-stone-600 mb-4" style={{ lineHeight: 1.9 }}>{TAILORED_MESSAGE}</p>
          <p className="type-body text-stone-500 mb-10" style={{ lineHeight: 1.8, fontSize: "14px" }}>
            You&rsquo;re enquiring about a complete window &amp; door package for your project - not purchasing individual windows or doors. Add the package and upload your plans, and our team will prepare a tailored proposal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={(e) => { flyToBasket(e.currentTarget as HTMLElement, data.heroImg); addPackage(); }}
              className={`w-full sm:w-auto type-button px-8 py-4 inline-flex items-center justify-center gap-3 transition-colors duration-300 ${added ? "bg-[#4a7c4a] text-white" : "bg-[#b8934a] text-white hover:bg-[#a07e3c]"}`}
            >
              {added ? "ADDED TO ENQUIRY ✓" : "ADD WINDOWS & DOORS PACKAGE"} <span>→</span>
            </button>
          </div>
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
              <a
                key={slug}
                href={`${basePath}/${slug}`}
                className="group shrink-0 w-[300px] bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image src={d.heroImg} alt={d.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="type-product text-stone-900 group-hover:text-[#b8934a] transition-colors" style={{ fontSize: "18px", letterSpacing: "0.06em", lineHeight: 1.2 }}>{d.name}</h3>
                  <p className="type-body text-stone-500" style={{ fontSize: "13px", lineHeight: 1.6 }}>{d.tagline}</p>
                  <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>
                    VIEW SYSTEM &nbsp;<span className="arrow">→</span>
                  </span>
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
      <SiteHeader variant="solid" breadcrumb={catLabel} />
      <BlockPage kind="p-windows" raw={data.blocks} render={(b) => build(applyProductText(data, b.data))[b.type]?.()} />
      <SiteFooter />
    </div>
  );
}
