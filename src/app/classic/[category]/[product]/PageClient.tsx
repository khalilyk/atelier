"use client";
import { useState, use } from "react";
import Image from "next/image";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { getProduct } from "../../data";
import { useBasket } from "../../../context/BasketContext";
import { useProductOverrides } from "../../../components/ProductOverridesProvider";
import { resolveProduct, withImageFallbacks } from "@/lib/product-content";
import WindowsDoorsProduct from "./WindowsDoorsProduct";
import JoineryProduct from "./JoineryProduct";
import BathroomPackageProduct from "./BathroomPackageProduct";
import { useCustomCategories } from "../../../components/CategoriesProvider";
import ProductHotspots from "../../../components/ProductHotspots";

const IMGS = [
  "/Atelier_Signature.png",
  "/Atelier_Classic.png",
  "/Atelier_Classic.png",
  "/Atelier_Classic.png",
];

function AccordionItem({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="type-body text-stone-600">
          {label}
        </span>
        <span
          className={`text-stone-400 text-xl transition-transform duration-300 flex-shrink-0 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 type-body text-stone-500" style={{ lineHeight: 1.8 }}>
          Contact us to request {label.toLowerCase()} documentation for this product.
        </p>
      )}
    </div>
  );
}

function DetailIcon({ index }: { index: number }) {
  if (index === 0) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b8934a]">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
  if (index === 1) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b8934a]">
      <polygon points="12 2 22 8.5 12 15 2 8.5"/><polyline points="2 14.5 12 21 22 14.5"/><polyline points="2 11.5 12 18 22 11.5"/>
    </svg>
  );
  if (index === 2) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b8934a]">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b8934a]">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  );
}

export default function ProductPage({ params }: { params: Promise<{ category: string; product: string }> }) {
  const { category, product } = use(params);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(0);
  const [added, setAdded] = useState(false);
  const { add } = useBasket();
  const productOverrides = useProductOverrides();
  const customCat = useCustomCategories().find((c) => c.slug === category);

  const base = getProduct(category, product);
  const data = resolveProduct(base, category, product, productOverrides);

  // Admin-created categories reuse the page template they were created from.
  if (customCat && data) {
    const cat = { slug: customCat.slug, label: customCat.label };
    const safe = withImageFallbacks(data, customCat.heroImg || undefined);
    return customCat.template === "windows-doors"
      ? <WindowsDoorsProduct data={safe} cat={cat} />
      : <JoineryProduct slug={product} data={safe} cat={cat} />;
  }

  // Windows & Doors and Custom Joinery use dedicated package product pages (no per-item cart)
  if (category === "windows-doors" && data) {
    return <WindowsDoorsProduct data={data} />;
  }
  if (category === "joinery" && data) {
    return <JoineryProduct slug={product} data={data} />;
  }
  if (category === "bathrooms" && data?.packageStyle) {
    return <BathroomPackageProduct slug={product} data={data} />;
  }

  function handleAdd() {
    if (!data) return;
    add({
      id: `${category}/${product}`,
      name: data.name,
      category,
      categoryLabel: data.categoryLabel,
      tagline: data.tagline,
      size: data.sizes[size] ?? data.sizes[0],
      qty,
      unit: data.unit,
      heroImg: data.heroImg,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <SiteHeader variant="solid" />
        <p className="text-stone-400">Product not found.</p>
      </div>
    );
  }

  const [img1, img2, img3, img4] = IMGS;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ height: "90vh", minHeight: "580px" }}>
        <Image src={data.heroImg} alt={data.name} fill className="object-cover object-center" priority />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.15) 100%)" }}
        />
        <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-14 md:pb-20">
          <h1
            className="text-white uppercase mb-3"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(48px, 8vw, 110px)",
              lineHeight: 0.92,
              letterSpacing: "0.03em",
              fontWeight: 300}}
          >
            {data.name}
          </h1>
          <p className="type-body text-white/70 mb-8" style={{ lineHeight: 1.6 }}>
            {data.tagline}
          </p>
          <div className="flex items-center gap-8 flex-wrap">
            <button
              onClick={handleAdd}
              className={`type-button border px-7 py-3 flex items-center gap-3 transition-all duration-300 ${added ? "border-[#4a7c4a] text-[#4a7c4a]" : "border-white/40 text-white hover:bg-white hover:text-black"}`}
            >
              {added ? "Added ✓" : "Add to Basket"} &nbsp;<span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── THE STORY ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "440px" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-20 bg-[#ede8df]">
          <h2
            className="mb-4"
            style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3vw, 42px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.1 }}
          >
            The Story
          </h2>
          <div className="w-8 h-px bg-[#b8934a] mb-8" />
          {data.story.map((p, i) => (
            <p key={i} className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.9 }}>
              {p}
            </p>
          ))}
        </div>
        <div className="relative min-h-[320px] md:min-h-0">
          <Image src={data.storyImg} alt="Story" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      {/* ── HOTSPOTS (Admin > Products) ── */}
      <ProductHotspots block={data.hotspots} />

      {/* ── MATERIAL DETAILS ── */}
      <section className="px-8 md:px-14 py-14 bg-[#f5f0e8] border-t border-stone-200">
        <h2
          className="mb-4"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 2.5vw, 38px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.1 }}
        >
          Material Details
        </h2>
        <div className="w-8 h-px bg-[#b8934a] mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          {data.details.map((d, i) => (
            <div key={i} className="px-0 md:px-8 first:pl-0 py-6 md:py-4">
              <DetailIcon index={i} />
              <p
                className="type-label text-stone-400 mb-2 mt-3"
                style={{ letterSpacing: "0.14em" }}
              >
                {d.label.toUpperCase()}
              </p>
              <p className="type-body text-stone-900" style={{ lineHeight: 1.6 }}>
                {d.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WIDE PANORAMIC IMAGE ── */}
      <section className="relative border-t border-stone-200" style={{ height: "40vh", minHeight: "260px" }}>
        <Image src={img3} alt={`${data.name} project detail`} fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* ── GALLERY + ORDER ── */}
      <section className="grid grid-cols-1 md:grid-cols-[55fr_45fr] border-t border-stone-200" style={{ minHeight: "560px" }}>
        {/* Gallery */}
        <div className="grid grid-rows-2 gap-px bg-stone-300">
          <div className="relative min-h-[220px]">
            <Image src={img1} alt="Gallery 1" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/5" />
          </div>
          <div className="grid grid-cols-2 gap-px bg-stone-300">
            <div className="relative min-h-[180px]">
              <Image src={img2} alt="Gallery 2" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/5" />
            </div>
            <div className="relative min-h-[180px]">
              <Image src={img4} alt="Gallery 3" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </div>
        </div>

        {/* Order sidebar */}
        <div className="bg-[#ede8df] px-10 md:px-12 py-14 flex flex-col">
          <h2
            className="mb-8"
            style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2.2vw, 34px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.15 }}
          >
            {data.name}
          </h2>

          {/* Size options */}
          <div className="mb-8">
            {data.sizes.map((s, i) => (
              <label
                key={i}
                onClick={() => setSize(i)}
                className="flex items-center gap-3 py-3.5 border-b border-stone-200 cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all duration-200 ${
                    size === i ? "border-[#b8934a] bg-[#b8934a]" : "border-stone-300 bg-transparent"
                  }`}
                />
                <span className="type-body text-stone-600">
                  {s}
                </span>
              </label>
            ))}
          </div>

          {/* Quantity */}
          <div className="mb-10">
            <p className="type-label text-stone-400 mb-4" style={{ letterSpacing: "0.14em" }}>
              QUANTITY
            </p>
            <div className="flex items-center border border-stone-300 w-fit">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors border-r border-stone-300"
              >
                −
              </button>
              <span className="px-6 type-body text-stone-900" style={{ minWidth: "80px", textAlign: "center" }}>
                {qty} {qty === 1 ? data.unit : data.unit + "s"}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors border-l border-stone-300"
              >
                +
              </button>
            </div>
          </div>

          {/* CTAs */}
          <p className="type-body text-stone-400 mb-5" style={{ lineHeight: 1.8 }}>
            Want more information about {data.name}? Add it to your enquiry basket and our team will be in touch.
          </p>
          <button
            onClick={handleAdd}
            className={`type-button px-8 py-4 flex items-center justify-between transition-colors duration-300 ${added ? "bg-[#4a7c4a] text-white" : "bg-[#b8934a] text-white hover:bg-[#a07d3c]"}`}
          >
            <span>{added ? "ADDED TO BASKET" : "ADD TO BASKET"}</span>
            <span>{added ? "✓" : "→"}</span>
          </button>
        </div>
      </section>

      {/* ── PROJECTS USING THIS MATERIAL ── */}
      <section className="px-8 md:px-14 py-16 border-t border-stone-200 bg-[#f5f0e8]">
        <h2
          className="mb-4"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 2.5vw, 38px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.1 }}
        >
          Projects Using This Material
        </h2>
        <div className="w-8 h-px bg-[#b8934a] mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([["Etcetera", img1], ["Maison Project", img3], ["Private Residence", img2]] as [string, string][]).map(([label, src]) => (
            <div key={label} className="group cursor-pointer">
              <div className="relative overflow-hidden mb-4" style={{ paddingBottom: "66%" }}>
                <Image
                  src={src}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/8 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <p className="type-label text-stone-900/35" style={{ letterSpacing: "0.14em" }}>
                {label.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM: ENQUIRY + ACCORDION ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
        {/* Left: image + enquiry text */}
        <div className="relative min-h-[420px]">
          <Image src={img1} alt={`${data.name} project detail`} fill className="object-cover object-center" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(245,240,232,0.94) 0%, rgba(245,240,232,0.5) 55%, rgba(245,240,232,0.1) 100%)" }}
          />
          <div className="relative z-10 flex flex-col justify-end h-full px-10 md:px-14 py-14">
            <h3
              className="mb-3"
              style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 2.5vw, 38px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.2 }}
            >
              Need something<br />more unique?
            </h3>
            <p className="type-body text-stone-500 mb-8 max-w-xs" style={{ lineHeight: 1.8 }}>
              Our sourcing team works directly with manufacturers and artisans worldwide.
            </p>
            <a
              href="/contact"
              className="arrow-link type-button text-stone-900 border border-stone-400 px-6 py-3 inline-flex items-center gap-3 hover:bg-stone-900 hover:text-white transition-all duration-300 w-fit"
            >
              Let's Source It For You &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>

        {/* Right: accordion */}
        <div className="bg-[#ede8df] px-10 md:px-14 py-14 flex flex-col justify-center">
          {["Specifications", "Installation", "Downloads", "Samples"].map((label) => (
            <AccordionItem key={label} label={label} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
