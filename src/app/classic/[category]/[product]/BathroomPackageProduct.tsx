"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { useBasket } from "../../../context/BasketContext";
import { flyToBasket } from "@/lib/flyToBasket";
import { useProductOverrides } from "../../../components/ProductOverridesProvider";
import { useT } from "../../../components/ContentProvider";
import { useImage } from "../../../components/ImagesProvider";
import { mergeList } from "@/lib/product-content";
import GalleryStrip from "../../../components/GalleryStrip";
import CarouselRow from "../../../components/CarouselRow";
import { listPackages, type ProductData } from "../../data";
import ProductHotspots from "../../../components/ProductHotspots";
import BlockPage from "../../../components/BlockPage";
import { applyProductText } from "@/lib/product-blocks";
import { blockValue } from "@/lib/page-blocks";

type Vanity = "single" | "double";
type Toilet = "back-to-wall" | "wall-hung" | "smart";
type Supply = "supply" | "install";

// Per-package colour palette (name + swatch). Editable here per slug.
const PALETTES: Record<string, { name: string; hex: string }[]> = {
  "the-mode": [
    { name: "Crisp White", hex: "#f4f2ee" }, { name: "Matte Black", hex: "#1c1b1a" },
    { name: "Charcoal", hex: "#3a3936" }, { name: "Ultra-White Stone", hex: "#eceae3" }, { name: "Black Grout", hex: "#2a2927" },
  ],
  "the-estate": [
    { name: "Calacatta", hex: "#ece9e1" }, { name: "Stone Grey", hex: "#b7b2a8" },
    { name: "Brushed Nickel", hex: "#b8b5ad" }, { name: "Gloss White", hex: "#f2f0ec" }, { name: "Marble Vein", hex: "#d8d2c6" },
  ],
  "the-coast": [
    { name: "Soft White", hex: "#efeae1" }, { name: "Pale Oak", hex: "#cbb391" },
    { name: "Warm White Stone", hex: "#e8e2d6" }, { name: "Brushed Nickel", hex: "#b8b5ad" }, { name: "Natural Texture", hex: "#d8cfc0" },
  ],
  "the-terra": [
    { name: "Travertine", hex: "#d8c7ab" }, { name: "Natural Timber", hex: "#b08a5e" },
    { name: "Brushed Brass", hex: "#b08d57" }, { name: "Terracotta", hex: "#b5714f" }, { name: "Warm Stone", hex: "#cdbfa8" },
  ],
  "the-regent": [
    { name: "Dark Timber", hex: "#4a3b2e" }, { name: "Smoky Stone", hex: "#6b6560" },
    { name: "Gunmetal", hex: "#4c4a47" }, { name: "Warm Light", hex: "#d9b877" }, { name: "Smoky Marble", hex: "#8a827a" },
  ],
};

// Placeholder hotspot positions for the interactive render (percentages).
const HOTSPOTS = [
  { top: "34%", left: "50%" }, { top: "58%", left: "30%" }, { top: "62%", left: "68%" }, { top: "24%", left: "78%" },
];

const lines = (s: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean);

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`type-button px-5 py-3 rounded-lg border text-left transition-all duration-200 ${active ? "border-[#b8934a] bg-[#b8934a] text-white" : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"}`}
      style={{ letterSpacing: "0.06em" }}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-stone-200 pt-6">
      <p className="type-label text-stone-500 mb-3" style={{ letterSpacing: "0.12em" }}>{label}</p>
      {children}
    </div>
  );
}

// Section 4 - The Room: interactive render with hotspots revealing key inclusions.
// The render is a CMS image slot; with no upload the whole section stays hidden.
function TheRoom({ slot, alt, inclusions, intro }: { slot: string; alt: string; inclusions: { label: string; value: string }[]; intro: string }) {
  const [active, setActive] = useState(0);
  const image = useImage(slot);
  const points = inclusions.slice(0, HOTSPOTS.length);
  if (points.length === 0 || !image) return null;
  return (
    <section className="border-t border-stone-200 py-16 md:py-20 bg-[#2c2620] text-[#efe7d8]">
      <div className="px-8 md:px-14 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>THE ROOM</span>
          <div className="h-px bg-white/20 w-12" />
        </div>
        <p className="type-body text-[#d8cfc0] mb-10 max-w-2xl" style={{ lineHeight: 1.8 }}>{intro}</p>
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-center">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/30">
            <Image src={image} alt={alt} fill className="object-cover" />
            {points.map((p, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={p.label}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${active === i ? "bg-[#c8a25c] border-[#c8a25c] scale-110" : "bg-black/40 border-white/70 hover:border-[#c8a25c]"}`}
                style={{ top: HOTSPOTS[i].top, left: HOTSPOTS[i].left }}>
                <span className={`w-2 h-2 rounded-full ${active === i ? "bg-[#2c2620]" : "bg-white"}`} />
              </button>
            ))}
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              {points.map((p, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`type-button px-3.5 py-2 rounded-full border transition-colors ${active === i ? "border-[#c8a25c] bg-[#c8a25c] text-[#2c2620]" : "border-white/25 text-[#d8cfc0] hover:border-white/50"}`}
                  style={{ fontSize: "11px", letterSpacing: "0.06em" }}>{p.label}</button>
              ))}
            </div>
            <p className="type-label text-[#c8a25c] mb-2" style={{ letterSpacing: "0.12em" }}>{points[active].label.toUpperCase()}</p>
            <p className="type-body text-white" style={{ fontSize: "20px", lineHeight: 1.4, fontFamily: "var(--font-serif)", fontWeight: 300 }}>{points[active].value}</p>
          </div>
        </div>
        <p className="type-body text-white/40 mt-6" style={{ fontSize: "12px" }}>Indicative render. Final photography and hotspot positions supplied as packages are documented.</p>
      </div>
    </section>
  );
}

// One inclusion = one section. The photo is a CMS slot; with no upload the row
// falls back to a clean full-width text row rather than showing a placeholder.
function InclusionRow({ index, label, value, slot }: { index: number; label: string; value: string; slot: string }) {
  const img = useImage(slot);
  const num = String(index + 1).padStart(2, "0");
  const Text = (
    <div className="flex flex-col justify-center px-8 md:px-14 py-10 md:py-14 [direction:ltr]">
      <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.14em" }}>{num} · {label.toUpperCase()}</p>
      <p className="type-large text-stone-900" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 2.4vw, 30px)", fontWeight: 300, lineHeight: 1.25 }}>{value}</p>
    </div>
  );
  if (!img) return <div className="border-t border-stone-100">{Text}</div>;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${index % 2 === 1 ? "md:[direction:rtl]" : ""} border-t border-stone-100`}>
      <div className="relative min-h-[220px] md:min-h-[300px] bg-stone-200 [direction:ltr]">
        <Image src={img} alt={label} fill className="object-cover" />
      </div>
      {Text}
    </div>
  );
}

export default function BathroomPackageProduct({ slug, data }: { slug: string; data: ProductData }) {
  const { add } = useBasket();
  const productOverrides = useProductOverrides();
  const page = useT();
  const [added, setAdded] = useState(false);

  const [vanity, setVanity] = useState<Vanity>("single");
  const [toilet, setToilet] = useState<Toilet>("back-to-wall");
  const [tileArea, setTileArea] = useState("");
  const [featureTiles, setFeatureTiles] = useState(false);
  const [supply, setSupply] = useState<Supply>("install");

  const packages = listPackages("bathrooms");
  const others = mergeList(packages.filter((p) => p.slug !== slug), "bathrooms", productOverrides);
  const palette = PALETTES[slug] ?? [];
  // Hero uses the uploaded project photo once available, else the current image.
  const slotHero = useImage(`bath.${slug}.hero`);
  const ledMirrors = vanity === "double" ? 2 : 1;
  const TOILET_LABEL: Record<Toilet, string> = { "back-to-wall": "Back-to-wall toilet", "wall-hung": "Wall-hung, concealed cistern", smart: "Fully featured smart toilet" };

  const summary = useMemo(() => [
    vanity === "double" ? "Double vanity (2 LED mirrors)" : "Single vanity (1 LED mirror)",
    TOILET_LABEL[toilet],
    tileArea ? `Tiles ${tileArea}m²` : "Tile area TBC",
    featureTiles ? "Feature tile wall included" : "Single tile across floor & walls",
    supply === "install" ? "Supply & install" : "Supply only",
  ].join(" · "), [vanity, toilet, tileArea, featureTiles, supply]); // eslint-disable-line react-hooks/exhaustive-deps

  function addPackage() {
    const configKey = [vanity, toilet, tileArea || "tbc", featureTiles ? "ft" : "nf", supply].join("-");
    add({
      id: `bathrooms/${slug}|${configKey}`,
      name: `${data.name} - ${data.packageStyle}`,
      category: "bathrooms", categoryLabel: "Bathroom Packages",
      tagline: summary, size: vanity === "double" ? "Double vanity" : "Single vanity",
      qty: 1, unit: "package", heroImg: data.heroImg, sku: data.packageStyle,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const build = (data: ProductData, own: Record<string, string>, t: (key: string) => string): Record<string, () => React.ReactNode> => {
    const gallery = data.gallery ?? [data.heroImg, data.storyImg];
    const inclusions = data.fixedInclusions ?? [];
    const heroImg = (own.heroImg ? data.heroImg : slotHero) || data.heroImg;
  return {
    hero: () => (
      <section className="relative overflow-hidden" style={{ height: "82vh", minHeight: "540px" }}>
        <Image src={heroImg} alt={data.name} fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-14 md:pb-20 max-w-2xl">
          <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.18em" }}>{data.packageStyle}</p>
          <h1 className="text-white uppercase mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(44px, 7vw, 100px)", lineHeight: 0.95, letterSpacing: "0.03em", fontWeight: 300 }}>{data.name}</h1>
          <p className="type-body text-white/75 mb-8" style={{ lineHeight: 1.6 }}>{data.tagline}</p>
          <a href="#configure" className="type-button px-7 py-3.5 inline-flex items-center gap-3 bg-[#b8934a] text-white hover:bg-[#a07e3c] transition-colors duration-300">Configure Package &nbsp;<span>→</span></a>
        </div>
      </section>
    ),

    story: () => (data.story ?? []).length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "520px" }}>
          <div className="relative min-h-[340px] md:min-h-0">
            <Image src={data.storyImg} alt={`${data.name} styling`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#f5f0e8]">
            <div className="flex items-center gap-4 mb-8">
              <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE STORY</span>
              <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
            </div>
            {(data.story ?? []).map((p, i) => (
              <p key={i} className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.9 }}>{p}</p>
            ))}
          </div>
        </section>
      ),

    hotspots: () => (
      <ProductHotspots block={data.hotspots} />
    ),

    palette: () => palette.length > 0 && (
        <section className="px-8 md:px-14 py-16 md:py-20 border-t border-stone-200 bg-[#ede8df]">
          <div className="flex items-center gap-4 mb-3">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE PALETTE</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <p className="type-body text-stone-500 mb-10 max-w-2xl" style={{ lineHeight: 1.8 }}>{t("bath.pkg.palette.body")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {palette.map((c) => (
              <div key={c.name} className="flex flex-col">
                <div className="w-full aspect-square rounded-2xl border border-stone-200 shadow-sm" style={{ background: c.hex }} />
                <p className="type-body text-stone-800 mt-3" style={{ fontSize: "13.5px" }}>{c.name}</p>
              </div>
            ))}
          </div>
        </section>
      ),

    room: () => (
      <TheRoom slot={`bath.${slug}.room`} alt={`${data.name} render`} inclusions={inclusions} intro={t("bath.pkg.room.body")} />
    ),

    included: () => inclusions.length > 0 && (
        <section className="border-t border-stone-200 py-16 md:py-20">
          <div className="px-8 md:px-14 flex items-center gap-4 mb-12">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>WHAT&rsquo;S IN {data.name.toUpperCase()}</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <div className="flex flex-col">
            {inclusions.map((f, i) => (
              <InclusionRow key={i} index={i} label={f.label} value={f.value} slot={`bath.${slug}.item.${i}`} />
            ))}
          </div>
        </section>
      ),

    tapware: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200 bg-[#2c2620] text-[#efe7d8]">
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-6">
            <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>TAPWARE</span>
            <div className="h-px bg-white/20 w-12" />
          </div>
          <h2 className="type-large mb-6" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.1 }}>{t("bath.pkg.tapware.headline")}</h2>
          {lines(t("bath.pkg.tapware.body")).map((p, i) => (
            <p key={i} className="type-body text-[#d8cfc0] mb-4" style={{ lineHeight: 1.9 }}>{p}</p>
          ))}
        </div>
        <div className="relative min-h-[300px] md:min-h-0">
          <Image src={gallery[Math.min(2, gallery.length - 1)]} alt="Tapware detail" fill className="object-cover" />
        </div>
      </section>
    ),

    certified: () => (
      <section className="px-8 md:px-14 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-5xl">
          <div className="flex items-center gap-4 mb-3">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>COMPLIANCE</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <h2 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.1 }}>{t("bath.pkg.certified.headline")}</h2>
          <p className="type-body text-stone-500 mb-10 max-w-2xl" style={{ lineHeight: 1.9 }}>{t("bath.pkg.certified.body")}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {lines(t("bath.pkg.certified.points")).map((p) => (
              <div key={p} className="flex items-start gap-2.5 bg-white border border-stone-200 rounded-xl p-4">
                <span className="mt-0.5 text-[#b8934a]">✓</span>
                <span className="type-body text-stone-700" style={{ fontSize: "13.5px", lineHeight: 1.4 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    inspiration: () => (
      <section className="border-t border-stone-200 py-14 bg-[#ede8df]">
        <div className="px-8 md:px-14 flex items-center gap-4 mb-8">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>INSPIRATION</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <GalleryStrip images={gallery} alt={`${data.name} inspiration`} />
      </section>
    ),

    configure: () => (
      <section id="configure" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-[1fr_1fr] border-t border-stone-200">
        <div className="relative min-h-[360px] lg:min-h-0">
          <Image src={data.storyImg} alt={`${data.name} package`} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="px-8 md:px-14 py-16 md:py-20 bg-[#f5f0e8]">
          <div className="flex items-center gap-4 mb-3">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>CONFIGURE YOUR PACKAGE</span>
          </div>
          <h2 className="text-stone-900 mb-8" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.1 }}>{data.name} - tailored to your bathroom.</h2>

          <div className="flex flex-col gap-6">
            <Field label="VANITY">
              <div className="grid grid-cols-2 gap-3">
                <OptionButton active={vanity === "single"} onClick={() => setVanity("single")}>Single vanity</OptionButton>
                <OptionButton active={vanity === "double"} onClick={() => setVanity("double")}>Double vanity</OptionButton>
              </div>
              <p className="type-body text-[#8a6d38] mt-2.5" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>Automatically includes {ledMirrors} LED mirror{ledMirrors > 1 ? "s" : ""}{vanity === "double" ? " (one per basin)." : "."}</p>
            </Field>

            <Field label="TOILET">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["back-to-wall", "wall-hung", "smart"] as Toilet[]).map((tv) => (
                  <OptionButton key={tv} active={toilet === tv} onClick={() => setToilet(tv)}>{TOILET_LABEL[tv]}</OptionButton>
                ))}
              </div>
            </Field>

            <Field label="BATHROOM TILE AREA">
              <div className="flex items-center gap-3">
                <input type="number" min="0" inputMode="decimal" value={tileArea} onChange={(e) => setTileArea(e.target.value)} placeholder="e.g. 18"
                  className="type-body w-40 px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-[#b8934a] focus:outline-none" />
                <span className="type-body text-stone-500">square metres (m²)</span>
              </div>
            </Field>

            <Field label="FEATURE TILE WALL">
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <OptionButton active={featureTiles} onClick={() => setFeatureTiles(true)}>Add feature wall</OptionButton>
                <OptionButton active={!featureTiles} onClick={() => setFeatureTiles(false)}>Keep it minimal</OptionButton>
              </div>
              {!featureTiles && (<p className="type-body text-[#8a6d38] mt-2.5" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>The same tile is used across the floor and walls.</p>)}
            </Field>

            <Field label="SUPPLY">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionButton active={supply === "supply"} onClick={() => setSupply("supply")}>Supply only</OptionButton>
                <OptionButton active={supply === "install"} onClick={() => setSupply("install")}>Supply &amp; install</OptionButton>
              </div>
            </Field>

            <div className="border-t border-stone-200 pt-6">
              <p className="type-label text-stone-400 mb-2" style={{ letterSpacing: "0.12em" }}>YOUR CONFIGURATION</p>
              <p className="type-body text-stone-700 mb-6" style={{ lineHeight: 1.7 }}>{summary}</p>
              <button onClick={(e) => { flyToBasket(e.currentTarget as HTMLElement, data.heroImg); addPackage(); }}
                className={`type-button w-full px-8 py-4 flex items-center justify-between transition-colors duration-300 rounded-lg ${added ? "bg-[#4a7c4a] text-white" : "bg-[#b8934a] text-white hover:bg-[#a07e3c]"}`}>
                <span>{added ? "ADDED TO ENQUIRY ✓" : "ADD PACKAGE TO ENQUIRY"}</span>
                <span>{added ? "✓" : "→"}</span>
              </button>
              <p className="type-body text-stone-500 mt-4" style={{ fontSize: "13px", lineHeight: 1.7 }}>Add your configured package and our team will confirm selections, quantities and pricing before preparing your proposal.</p>
            </div>
          </div>
        </div>
      </section>
    ),

    building: () => (
      <section className="relative py-24 md:py-28 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Atelier Classic</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(26px, 4vw, 54px)", maxWidth: "560px", lineHeight: 1.1 }}>{t("bath.bwc.headline")}</h2>
          {lines(t("bath.bwc.body")).map((p, i) => (
            <p key={i} className={`type-body mx-auto max-w-lg ${i === 0 ? "text-stone-700 mb-4" : "text-stone-600 mb-10"}`} style={{ lineHeight: 1.9, fontSize: i === 0 ? "17px" : undefined }}>{p}</p>
          ))}
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">{t("bath.bwc.cta")} &nbsp;<span className="arrow">→</span></a>
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
            {others.map(({ slug: s, data: d }) => (
              <a key={s} href={`/classic/bathrooms/${s}`} className="group shrink-0 w-[300px] bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image src={d.heroImg} alt={d.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 z-10 type-label text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.1em" }}>{d.packageStyle}</span>
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
      <SiteHeader variant="solid" breadcrumb="Bathroom Packages" />
      <BlockPage kind="p-bathroom" raw={data.blocks} render={(b) => build(applyProductText(data, b.data), b.data, blockValue(b, page))[b.type]?.()} />
      <SiteFooter />
    </div>
  );
}
