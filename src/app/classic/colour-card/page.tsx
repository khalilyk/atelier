import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/classic/colour-card",
    title: "Window & Door Colours and Powdercoat Finishes",
    description: "A considered palette of architectural powdercoat finishes for aluminium windows and doors, curated for contemporary Australian architecture and finished for Australian conditions.",
  });
}


const GROUPS = [
  {
    name: "Whites & Light Neutrals",
    desc: "Clean, understated finishes designed for bright contemporary homes and softer architectural palettes.",
    swatches: [
      { name: "Pure White", hex: "#F1EFE9" },
      { name: "Surfmist", hex: "#E4E2D6" },
      { name: "Off White", hex: "#ECE8DC" },
      { name: "Dover White", hex: "#E0DBCC" },
    ],
  },
  {
    name: "Warm Neutrals & Earth Tones",
    desc: "Sophisticated natural shades that pair beautifully with stone, render, timber and warm exterior materials.",
    swatches: [
      { name: "Paperbark", hex: "#CEC6B4" },
      { name: "Dune", hex: "#A99C8B" },
      { name: "Riversand", hex: "#8C7C69" },
      { name: "Jasper", hex: "#6C5C4C" },
    ],
  },
  {
    name: "Greys & Charcoals",
    desc: "Versatile architectural colours suited to both modern and timeless residential design.",
    swatches: [
      { name: "Shale Grey", hex: "#BCBDB7" },
      { name: "Windspray", hex: "#8B8F8E" },
      { name: "Basalt", hex: "#585B58" },
      { name: "Monument", hex: "#333433" },
    ],
  },
  {
    name: "Black & Deep Tones",
    desc: "Strong, considered finishes that create definition and contrast while highlighting the geometry of the window and door system.",
    swatches: [
      { name: "Matt Black", hex: "#1A1A1A" },
      { name: "Night Sky", hex: "#1D1E20" },
      { name: "Ironstone", hex: "#3A3B3D" },
      { name: "Deep Ocean", hex: "#222E37" },
    ],
  },
];

export default function ColourCardPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Colours & Finishes" />

      {/* ── HERO ── */}
      <section className="px-6 md:px-8 pt-24 md:pt-32 pb-16 md:pb-20 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>ATELIER CLASSIC</p>
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(34px, 5vw, 68px)", lineHeight: 1.05 }}>Colours &amp; Finishes</h1>
          <p className="type-body text-[#b8934a] mb-8" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>A considered palette for architectural aluminium</p>
          <div className="w-8 h-px bg-[#b8934a] mx-auto mb-8" />
          <p className="type-body text-stone-600 max-w-2xl mx-auto mb-5" style={{ lineHeight: 1.9 }}>The Atelier Classic Colour Collection has been curated to complement contemporary Australian architecture, from warm coastal residences and refined neutral interiors to bold, modern fa&ccedil;ades.</p>
          <p className="type-body text-stone-500 max-w-2xl mx-auto" style={{ lineHeight: 1.9 }}>Each finish is selected to work seamlessly across our aluminium window and door systems, allowing frames, doors and architectural openings to form part of the overall design language of the home.</p>
        </div>
      </section>

      {/* ── OUR COLOUR COLLECTION ── */}
      <section className="px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>OUR COLOUR COLLECTION</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <p className="type-body text-stone-500 max-w-2xl mb-14" style={{ lineHeight: 1.85 }}>Choose from a refined selection of architectural powdercoat finishes across four coordinated families. Colours shown are indicative only - physical samples are confirmed at specification stage.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {GROUPS.map((g) => (
              <div key={g.name}>
                <h2 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(19px, 2.2vw, 26px)", lineHeight: 1.2 }}>{g.name}</h2>
                <p className="type-body text-stone-500 mb-6" style={{ lineHeight: 1.8, fontSize: "14px" }}>{g.desc}</p>
                <div className="grid grid-cols-4 gap-3">
                  {g.swatches.map((s) => (
                    <div key={s.name}>
                      <div className="aspect-square rounded-xl border border-stone-200/70 shadow-sm" style={{ backgroundColor: s.hex }} />
                      <p className="type-label text-stone-500 mt-2" style={{ fontSize: "10px", letterSpacing: "0.06em" }}>{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POWDERCOATED FOR AUSTRALIAN CONDITIONS ── */}
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>PERFORMANCE</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <h2 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(24px, 3.2vw, 42px)", lineHeight: 1.05 }}>Powdercoated for Australian conditions.</h2>
          <p className="type-body text-stone-600 mb-5" style={{ lineHeight: 1.9 }}>Australian sun, salt and coastal exposure are among the harshest environments in the world for architectural aluminium, and the coating system matters as much as the profile behind it.</p>
          <p className="type-body text-stone-600 mb-10" style={{ lineHeight: 1.9 }}>Atelier Classic frames are finished with architectural-grade powdercoat systems applied to AS 3715, with film thickness verified as part of our quality inspection before dispatch. The result is a durable, consistent finish that holds its colour and gloss while preserving the crisp profiles of the system.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-7">
              <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "18px" }}>Coastal &amp; exposed environments</h3>
              <p className="type-body text-stone-600" style={{ lineHeight: 1.85, fontSize: "14px" }}>For projects in marine or high-exposure locations, we specify marine-grade fluorocarbon coating systems or an anodised finish developed for severe environments. Tell us the site location at quotation stage - exposure classification is part of how we specify the system, not an afterthought.</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-7">
              <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "18px" }}>Caring for the finish</h3>
              <p className="type-body text-stone-600" style={{ lineHeight: 1.85, fontSize: "14px" }}>Like all architectural powdercoat, longevity depends on simple maintenance - periodic washing with fresh water, more frequently in coastal locations. Care guidance and any applicable finish warranty terms are supplied with your order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section className="px-6 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(18px, 2vw, 24px)" }}>Download the Colour Card</h3>
            <p className="type-body text-stone-500 max-w-md" style={{ lineHeight: 1.8 }}>Keep a copy of the full colour range for your project documentation and selections.</p>
          </div>
          <a href="/downloads/atelier-classic-colour-card.pdf" target="_blank" rel="noopener" className="arrow-link type-button inline-flex items-center gap-3 border border-stone-800 text-stone-900 px-7 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300 w-fit">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
            Download the Colour Card (PDF)
          </a>
        </div>
      </section>

      {/* ── BUILDING WITH CLASSIC ── */}
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Atelier Classic</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 56px)", maxWidth: "560px", lineHeight: 1.1 }}>Building with Atelier Classic?</h2>
          <p className="type-body text-stone-600 mb-10 mx-auto max-w-lg" style={{ lineHeight: 1.9 }}>Send us your plans and window schedule to receive an itemised quotation and begin your colour and specification selections.</p>
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            Start your project today &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
