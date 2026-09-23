import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/classic/stone-collection",
    title: "Stone Collection: Benchtops & Vanity Tops",
    description: "Natural and engineered stone for kitchen benchtops, vanity tops and joinery, with thickness and finish options coordinated with Atelier custom joinery and bathroom packages.",
  });
}


type Stone = {
  name: string;
  type: "Natural" | "Engineered";
  hex: string;
  thicknesses: string[];
  finishes: string[];
  img?: string; // full-slab image where available; placeholder swatch until supplied
};

const STONES: Stone[] = [
  // ── Natural ──
  { name: "Calacatta Gold", type: "Natural", hex: "#eae6de", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Polished", "Leathered"] },
  { name: "Carrara", type: "Natural", hex: "#e4e2dc", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Polished"] },
  { name: "Statuario", type: "Natural", hex: "#eceae4", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Polished"] },
  { name: "Nero Marquina", type: "Natural", hex: "#2b2b2c", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Polished", "Leathered"] },
  { name: "Taj Mahal Quartzite", type: "Natural", hex: "#d8cdb6", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Leathered", "Polished"] },
  { name: "Silver Travertine", type: "Natural", hex: "#cdbfa6", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Filled"] },
  { name: "Pietra Grey", type: "Natural", hex: "#48484b", thicknesses: ["20mm", "40mm"], finishes: ["Honed", "Polished"] },
  { name: "Verde Alpi", type: "Natural", hex: "#3b4a3f", thicknesses: ["20mm"], finishes: ["Polished", "Honed"] },
  // ── Engineered / Artificial ──
  { name: "Pure Snow", type: "Engineered", hex: "#f2f1ec", thicknesses: ["20mm"], finishes: ["Polished", "Matte"] },
  { name: "Alpine Mist", type: "Engineered", hex: "#e8e5dc", thicknesses: ["20mm", "40mm"], finishes: ["Polished", "Honed"] },
  { name: "Cloudburst", type: "Engineered", hex: "#d9d4c8", thicknesses: ["20mm"], finishes: ["Matte", "Polished"] },
  { name: "Frozen Terra", type: "Engineered", hex: "#cbb99b", thicknesses: ["20mm"], finishes: ["Honed", "Polished"] },
  { name: "Pepper Grey", type: "Engineered", hex: "#8f8c86", thicknesses: ["20mm"], finishes: ["Matte"] },
  { name: "Raw Concrete", type: "Engineered", hex: "#b4b0a8", thicknesses: ["20mm", "40mm"], finishes: ["Matte"] },
];

const DISCLAIMER =
  "Stone is supplied as part of your complete Atelier Custom Joinery package rather than as an individual slab. Your selected surface is coordinated with the cabinetry, finishes and overall project specification to ensure everything works together.";

function StoneCard({ s }: { s: Stone }) {
  const light = parseInt(s.hex.slice(1, 3), 16) > 120;
  return (
    <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] transition-all duration-300">
      {/* Full-slab image where available, placeholder swatch otherwise */}
      <div className="relative w-full aspect-[3/2] overflow-hidden" style={{ background: s.hex }}>
        <span className={`absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${light ? "bg-black/10 text-stone-700" : "bg-white/20 text-white"}`}>
          {s.type}
        </span>
        {!s.img && (
          <span className={`absolute bottom-3 right-3 text-[10px] tracking-wide ${light ? "text-stone-500" : "text-white/60"}`}>
            swatch - full slab to follow
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="type-product text-stone-900" style={{ fontSize: "19px", letterSpacing: "0.04em", lineHeight: 1.2 }}>{s.name}</h3>
        <div>
          <p className="type-label text-stone-400 mb-1.5" style={{ letterSpacing: "0.1em", fontSize: "10px" }}>THICKNESS</p>
          <div className="flex flex-wrap gap-1.5">
            {s.thicknesses.map(t => (
              <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded border border-stone-200 text-stone-600">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="type-label text-stone-400 mb-1.5" style={{ letterSpacing: "0.1em", fontSize: "10px" }}>FINISHES</p>
          <div className="flex flex-wrap gap-1.5">
            {s.finishes.map(f => (
              <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-[#b8934a]/10 text-[#a07e3c]">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoneCollection() {
  const natural = STONES.filter(s => s.type === "Natural");
  const engineered = STONES.filter(s => s.type === "Engineered");

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Stone Collection" />

      {/* ── HERO ── */}
      <section className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b border-stone-200">
        <p className="type-label text-[#b8934a] mb-5" style={{ letterSpacing: "0.18em" }}>Custom Joinery - Surfaces</p>
        <h1 className="text-stone-900 mb-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(36px, 6vw, 84px)", fontWeight: 300, lineHeight: 1.0, letterSpacing: "0.02em" }}>
          Stone Collection
        </h1>
        <p className="type-body text-stone-600 max-w-2xl" style={{ lineHeight: 1.9 }}>
          A curated selection of natural and quartz stone for benchtops, splashbacks and feature surfaces.
        </p>
        <p className="type-body text-stone-600 max-w-2xl mt-4" style={{ lineHeight: 1.9 }}>
          Explore available colours, thicknesses and finishes including honed, leathered and polished options.
        </p>
        <p className="type-body text-stone-500 max-w-2xl mt-4 pl-4 border-l-2 border-[#b8934a]/50" style={{ lineHeight: 1.7, fontSize: "14px" }}>
          {DISCLAIMER}
        </p>
      </section>

      {/* ── NATURAL ── */}
      <section className="px-8 md:px-16 py-14 md:py-16">
        <div className="flex items-center gap-4 mb-10">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>NATURAL STONE</span>
          <div className="h-px bg-stone-300 w-12" />
          <span className="type-label text-stone-400">{natural.length} stones</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {natural.map(s => <StoneCard key={s.name} s={s} />)}
        </div>
      </section>

      {/* ── ENGINEERED ── */}
      <section className="px-8 md:px-16 py-14 md:py-16 border-t border-stone-200 bg-[#ede8df]">
        <div className="flex items-center gap-4 mb-10">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>ENGINEERED / ARTIFICIAL STONE</span>
          <div className="h-px bg-stone-300 w-12" />
          <span className="type-label text-stone-400">{engineered.length} stones</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {engineered.map(s => <StoneCard key={s.name} s={s} />)}
        </div>
      </section>

      {/* ── PART OF THE PACKAGE ── */}
      <section className="px-6 md:px-8 py-20 md:py-24 border-t border-stone-200 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="type-label text-[#b8934a] mb-5" style={{ letterSpacing: "0.16em" }}>PART OF YOUR PACKAGE</p>
          <p className="text-stone-800 mb-8" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(19px, 2.2vw, 28px)", fontWeight: 300, lineHeight: 1.5 }}>
            {DISCLAIMER}
          </p>
          <a href="/classic/joinery" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            Explore Custom Joinery &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
