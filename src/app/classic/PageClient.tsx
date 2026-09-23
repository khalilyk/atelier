"use client";
import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useT } from "../components/ContentProvider";
import { useCustomCategories } from "../components/CategoriesProvider";
import BlockPage from "../components/BlockPage";
import { pageLayoutKey } from "@/lib/page-copy";
import { blockValue } from "@/lib/page-blocks";

type ClassicCategory = { n: string; id: string; name: string; quote: string; body: string; img: string; img2?: string; imgAlt: string; flip: boolean; doubleImg: boolean; comingSoon?: boolean };

const CATEGORIES: ClassicCategory[] = [
  {
    n: "01",
    id: "windows-doors",
    name: "Windows & Doors",
    quote: "Architectural glazing has the power to define how a home feels, performs and connects with its surroundings.",
    body: "From expansive sliding and stacking systems to refined fixed glazing, awning windows and statement entry doors, our aluminium window and door systems are tailored to the architecture, scale and performance requirements of each project. Designed for Australian conditions and specified to meet applicable Australian Standards, including AS 2047 and AS 1288, every system is considered for performance, detailing and integration with the architecture.",
    img: "/Atelier_Classic.png",
    imgAlt: "Windows & Doors",
    flip: false,
    doubleImg: false,
  },
  {
    n: "02",
    id: "joinery",
    name: "Custom Joinery",
    quote: "Joinery should feel integrated into the architecture, not added after it.",
    body: "From kitchens and wardrobes to vanities, laundries and built-in cabinetry, our joinery is developed around your plans, material palette and functional requirements to create spaces that feel cohesive, refined and considered. Atelier brings your vision into reality.",
    img: "/Atelier_Signature.png",
    imgAlt: "Custom Joinery",
    flip: true,
    doubleImg: false,
  },
  {
    n: "03",
    id: "bathrooms",
    name: "Bathroom Packages",
    quote: "A beautifully resolved bathroom shouldn't require endless decisions.",
    body: "We've simplified the process by curating every element into five complete bathroom collections. Vanities, basins, mirrors, tapware, sanitaryware and complementary finishes are selected to work together - creating a cohesive, considered space without months of sourcing from multiple suppliers. Choose the collection that speaks to your project. We've already considered the details.",
    img: "/Atelier_Signature.png",
    img2: "/vanities/OJS265-1200.jpg",
    imgAlt: "Bathroom Packages",
    flip: false,
    doubleImg: true,
  },
];

export default function ClassicPage() {
  const t = useT();
  const custom = useCustomCategories().filter((c) => c.showOnLanding);
  const build = (t: (key: string) => string): Record<string, () => React.ReactNode> => {
  const all: ClassicCategory[] = [
    ...CATEGORIES.map((c) => ({ ...c, quote: t(`classic.${c.id}.quote`), body: t(`classic.${c.id}.body`) })),
    ...custom.map((c, i) => ({
      n: String(CATEGORIES.length + i + 1).padStart(2, "0"),
      id: c.slug, name: c.label, quote: c.landingQuote, body: c.landingBody,
      img: c.landingImg || c.heroImg || "/Atelier_Classic.png", imgAlt: c.label,
      flip: (CATEGORIES.length + i) % 2 === 1, doubleImg: false, comingSoon: c.comingSoon,
    })),
  ];
  return {
    hero: () => (
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <Image src="/products/Main Classic.png" alt="Classic" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col justify-end px-8 md:px-16 pb-16 md:pb-24">
          <h1 className="type-hero text-white tracking-[0.18em] uppercase mb-4" style={{ fontSize: "clamp(40px, 8vw, 96px)" }}>Classic</h1>
          <p className="type-body text-white/70 mb-8 max-w-xl" style={{ lineHeight: 1.9 }}>
            {t("classic.hero.body")}
          </p>
          <a href="#collection" className="arrow-link type-button text-white/70 border-b border-white/25 pb-px w-fit hover:text-white transition-colors">
            Explore the Collection &nbsp;<span className="arrow">↓</span>
          </a>
        </div>
      </section>
    ),

    categories: () => (
      <div id="collection">
        {all.map((cat) => {
          const textBlock = (
            <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#ede8df]">
              <div className="flex items-center gap-4 mb-8">
                <span className="type-label text-[#b8934a]">{cat.n}</span>
                <div className="flex-1 h-px bg-stone-300" />
              </div>
              <h2 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>{cat.name}</h2>
              <p className="type-body text-stone-400 mb-5" style={{ lineHeight: 1.9 }}>{cat.quote}</p>
              <p className="type-body text-stone-500 mb-10" style={{ lineHeight: 1.9 }}>{cat.body}</p>
              {cat.comingSoon ? (
                <span className="type-button text-stone-400 border-b border-stone-300 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>Coming soon</span>
              ) : (
              <a href={`/classic/${cat.id}`} className="arrow-link type-button text-[#b8934a] border-b border-[#b8934a]/40 pb-px w-fit hover:text-stone-900 hover:border-stone-400 transition-colors">
                Explore {cat.name} &nbsp;<span className="arrow">→</span>
              </a>
              )}
            </div>
          );

          const imgBlock = cat.doubleImg ? (
            <div className="flex flex-col h-full min-h-[480px] md:min-h-0">
              <div className="relative flex-1">
                <Image src={cat.img} alt={cat.imgAlt} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/8" />
              </div>
              <div className="relative flex-1">
                <Image src={cat.img2!} alt={cat.imgAlt} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/12" />
              </div>
            </div>
          ) : (
            <div className="relative min-h-[360px] md:min-h-0">
              <Image src={cat.img} alt={cat.imgAlt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          );

          return (
            <section key={cat.id} id={cat.id} className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200 first:border-t-0" style={{ minHeight: "480px" }}>
              {cat.flip ? <>{imgBlock}{textBlock}</> : <>{textBlock}{imgBlock}</>}
            </section>
          );
        })}
      </div>
    ),

    why: () => (
      <section className="px-6 md:px-14 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
        <div className="max-w-6xl mx-auto">
          <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.16em" }}>Why Classic?</p>
          <h2 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(28px, 3.6vw, 52px)", lineHeight: 1.05, maxWidth: "720px" }}>
            {t("classic.why.headline")}
          </h2>
          <p className="type-body text-stone-600 mb-14 max-w-3xl" style={{ lineHeight: 1.9 }}>
            {t("classic.why.body")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {[
              { n: "01", title: "One Cohesive Collection", desc: "Every product, material and finish is deliberately selected to work together so windows, doors, joinery and bathrooms carry a consistent architectural character throughout the home." },
              { n: "02", title: "Designed for Real Projects", desc: "Practicality sits alongside aesthetics. Classic is built around the realities of residential design, construction and everyday living." },
              { n: "03", title: "Simplified Specification", desc: "A focused collection means fewer unnecessary decisions. We guide you through the details and produce a clear, coordinated specification for your project." },
              { n: "04", title: "Tailored Where It Matters", desc: "Within the range, key elements - sizes, configurations, finishes and hardware - are configured around your architecture and design intent." },
              { n: "05", title: "Inspected & Documented", desc: "Windows and doors compliant with AS 2047 and AS 1288, WaterMark and WELS certified fittings and factory quality inspection before dispatch - with compliance documentation supplied with every order." },
            ].map((f) => (
              <div key={f.n} className="border-t border-stone-300 pt-5">
                <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.14em" }}>{f.n}</p>
                <h3 className="type-product text-stone-900 mb-3" style={{ fontSize: "clamp(17px, 1.6vw, 22px)", lineHeight: 1.2 }}>{f.title}</h3>
                <p className="type-body text-stone-600" style={{ lineHeight: 1.8, fontSize: "14px" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    closing: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
        {/* Building with Atelier Classic */}
        <div className="group relative overflow-hidden text-center px-6 md:px-10 py-24 md:py-32 flex flex-col items-center justify-center min-h-[440px]">
          <Image src="/products/Main Classic.png" alt="Atelier Classic Collection interior" fill className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors duration-500" />
          <div className="relative z-10 max-w-md">
            <p className="type-label text-[#d9b877] mb-5" style={{ letterSpacing: "0.16em" }}>Atelier Classic</p>
            <h2 className="text-white mb-5" style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(26px, 3vw, 44px)", lineHeight: 1.1 }}>
              {t("classic.cta.headline")}
            </h2>
            <p className="type-body text-white/75 mb-9 mx-auto" style={{ lineHeight: 1.85, fontSize: "14px", maxWidth: "26rem" }}>
              {t("classic.cta.body")}
            </p>
            <a href="/quote" className="arrow-link type-button inline-block bg-[#b8934a] text-white px-8 py-4 hover:bg-[#a07e3c] transition-colors duration-300">
              Start Your Project &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>

        {/* Beyond the Range - Signature upsell */}
        <div className="group relative overflow-hidden text-center px-6 md:px-10 py-24 md:py-32 flex flex-col items-center justify-center min-h-[440px]">
          <Image src="/products/Signature Luxe.png" alt="Atelier Signature Luxe Collection interior" fill className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500" />
          <div className="relative z-10 max-w-md">
            <p className="type-label text-[#d9b877] mb-5" style={{ letterSpacing: "0.18em" }}>Beyond the Range?</p>
            <h2 className="text-white mb-5" style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(26px, 3vw, 44px)", lineHeight: 1.12 }}>
              {t("classic.signature.headline")}
            </h2>
            <p className="type-body text-white/70 mb-9 mx-auto" style={{ lineHeight: 1.85, fontSize: "14px", maxWidth: "26rem" }}>
              {t("classic.signature.body")}
            </p>
            <a href="/signature" className="arrow-link type-button inline-block border border-[#d9b877]/70 text-[#d9b877] px-8 py-4 hover:bg-[#d9b877] hover:text-black transition-colors duration-300">
              Begin a Consultation &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    ),

  };
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" />
      <BlockPage kind="classic" layoutKey={pageLayoutKey("classic")} render={(b) => build(blockValue(b, t))[b.type]?.()} />
      <SiteFooter />
    </div>
  );
}
