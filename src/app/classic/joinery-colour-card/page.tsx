import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import DownloadGate from "../../components/DownloadGate";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/classic/joinery-colour-card",
    title: "Joinery Colour Collection: Woodgrain & Solid Finishes",
    description: "Woodgrain, solid colour and specialty board finishes for Atelier custom joinery, from kitchens and wardrobes to vanities. Download the full Joinery Colour Collection.",
  });
}


type Swatch = { name: string; ref: string; hex: string; profile?: boolean };
type Group = { title: string; note: string; swatches: Swatch[] };

const GROUPS: Group[] = [
  {
    title: "Woodgrain Finishes",
    note: "Realistic timber-look laminates and veneers with directional grain.",
    swatches: [
      { name: "Natural Oak", ref: "WG-01", hex: "#c9a97e" },
      { name: "Limed Oak", ref: "WG-02", hex: "#d8c7a8" },
      { name: "American Walnut", ref: "WG-03", hex: "#6b4a33" },
      { name: "Smoked Walnut", ref: "WG-04", hex: "#4a3527" },
      { name: "Blackbutt", ref: "WG-05", hex: "#b08a5f" },
      { name: "Spotted Gum", ref: "WG-06", hex: "#9a6f4a" },
    ],
  },
  {
    title: "Natural Timber Tones",
    note: "Solid and veneered timbers in their natural, unpainted state.",
    swatches: [
      { name: "Raw Oak", ref: "NT-01", hex: "#d6c3a1" },
      { name: "Tasmanian Oak", ref: "NT-02", hex: "#e0cdae" },
      { name: "Victorian Ash", ref: "NT-03", hex: "#d3bfa0" },
      { name: "Messmate", ref: "NT-04", hex: "#b58e63" },
      { name: "Blackwood", ref: "NT-05", hex: "#6e4c39" },
      { name: "Marri", ref: "NT-06", hex: "#8a5a44" },
    ],
  },
  {
    title: "Painted Finishes",
    note: "Two-pack and polyurethane painted finishes in any specified colour.",
    swatches: [
      { name: "Snow White", ref: "P-01", hex: "#f4f3ef" },
      { name: "Natural White", ref: "P-02", hex: "#ece8de" },
      { name: "Lexicon Quarter", ref: "P-03", hex: "#eef0ef" },
      { name: "Whisper White", ref: "P-04", hex: "#e9e6db" },
      { name: "Domino", ref: "P-05", hex: "#3d3b3a" },
      { name: "Monument", ref: "P-06", hex: "#323233" },
    ],
  },
  {
    title: "Matte Finishes",
    note: "Low-sheen, fingerprint-resistant surfaces in soft, muted tones.",
    swatches: [
      { name: "Matte White", ref: "M-01", hex: "#eceae4" },
      { name: "Matte Stone", ref: "M-02", hex: "#cfc7ba" },
      { name: "Matte Clay", ref: "M-03", hex: "#b7a493" },
      { name: "Matte Sage", ref: "M-04", hex: "#9aa189" },
      { name: "Matte Navy", ref: "M-05", hex: "#2f3a4a" },
      { name: "Matte Charcoal", ref: "M-06", hex: "#3a3a3c" },
    ],
  },
  {
    title: "Textured Finishes",
    note: "Embossed and tactile surfaces that add depth and character.",
    swatches: [
      { name: "Fine Grain", ref: "TX-01", hex: "#c8b79a" },
      { name: "Linen Weave", ref: "TX-02", hex: "#d9d0bf" },
      { name: "Ribbed Oak", ref: "TX-03", hex: "#bfa079" },
      { name: "Fluted White", ref: "TX-04", hex: "#e6e2d6" },
      { name: "Sandstone", ref: "TX-05", hex: "#cbb896" },
      { name: "Concrete Look", ref: "TX-06", hex: "#b8b4ac" },
    ],
  },
  {
    title: "Door Profiles",
    note: "Cabinet door styles - shown as reference profiles until samples are supplied.",
    swatches: [
      { name: "Shaker", ref: "DP-01", hex: "#e6ddcf", profile: true },
      { name: "Flat Panel / Slab", ref: "DP-02", hex: "#e6ddcf", profile: true },
      { name: "Fluted / Reeded", ref: "DP-03", hex: "#e6ddcf", profile: true },
      { name: "V-Groove", ref: "DP-04", hex: "#e6ddcf", profile: true },
      { name: "Beaded / Hampton", ref: "DP-05", hex: "#e6ddcf", profile: true },
      { name: "Handleless J-Pull", ref: "DP-06", hex: "#e6ddcf", profile: true },
    ],
  },
];

const DISCLAIMER =
  "Selections made here are preliminary. Final finishes will be confirmed during the design process.";

function SwatchCard({ s }: { s: Swatch }) {
  return (
    <div className="group">
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden border border-stone-200/70 shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: s.hex }}
      >
        {s.profile && (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
            <span className="type-label text-stone-500" style={{ letterSpacing: "0.1em", fontSize: "11px" }}>{s.name.toUpperCase()}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 text-stone-500 backdrop-blur-sm">
          {s.ref}
        </span>
      </div>
      <p className="type-body text-stone-800 mt-3" style={{ fontSize: "14px" }}>{s.name}</p>
      <p className="text-stone-400 font-mono" style={{ fontSize: "11px", letterSpacing: "0.04em" }}>REF · {s.ref}</p>
    </div>
  );
}

export default function JoineryColourCard() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Joinery Colour Card" />

      {/* ── HERO ── */}
      <section className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b border-stone-200">
        <p className="type-label text-[#b8934a] mb-5" style={{ letterSpacing: "0.18em" }}>Custom Joinery - Inspiration</p>
        <h1 className="text-stone-900 mb-6" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(36px, 6vw, 84px)", fontWeight: 300, lineHeight: 1.0, letterSpacing: "0.02em" }}>
          Joinery Colour Card
        </h1>
        <p className="type-body text-stone-600 max-w-2xl" style={{ lineHeight: 1.9 }}>
          Browse woodgrains, natural timbers, painted, matte and textured finishes, and cabinet door profiles to start shaping the look of your joinery.
        </p>
        <p className="type-body text-stone-500 max-w-2xl mt-4 pl-4 border-l-2 border-[#b8934a]/50" style={{ lineHeight: 1.7, fontSize: "14px" }}>
          {DISCLAIMER}
        </p>
      </section>

      {/* ── FINISH GROUPS ── */}
      {GROUPS.map((g, gi) => (
        <section key={g.title} className={`px-8 md:px-16 py-14 md:py-16 ${gi % 2 === 1 ? "bg-[#ede8df]" : ""} ${gi > 0 ? "border-t border-stone-200" : ""}`}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-10">
            <div>
              <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.14em" }}>{String(gi + 1).padStart(2, "0")}</p>
              <h2 className="text-stone-900" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.1 }}>{g.title}</h2>
            </div>
            <p className="type-body text-stone-500 max-w-sm md:text-right" style={{ lineHeight: 1.7, fontSize: "14px" }}>{g.note}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {g.swatches.map((s) => <SwatchCard key={s.ref} s={s} />)}
          </div>
        </section>
      ))}

      {/* ── PRELIMINARY NOTE + CTA ── */}
      {/* ── GATED DOWNLOAD ── */}
      <DownloadGate
        resource="joinery-colour-collection"
        eyebrow="The full collection"
        headline="Take the Atelier Joinery Colour Collection with you."
        body="Every woodgrain, painted, matte and textured finish in one PDF, with door profiles and material notes. Tell us where to send it and it's yours."
        buttonLabel="Download the collection"
        imageSlot="cta.joinery-colour-collection.bg"
        imageFallback="/vanities/OJS261-900A.jpg"
      />

      <section className="px-6 md:px-8 py-20 md:py-24 border-t border-stone-200 bg-[#ede8df] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="type-label text-[#b8934a] mb-5" style={{ letterSpacing: "0.16em" }}>PRELIMINARY SELECTIONS</p>
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
