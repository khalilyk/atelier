"use client";
import { use, useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { CATEGORY_META, listProducts, listPackages, WD_FAMILIES, type ProductData } from "../data";
import BathroomsPage from "./BathroomsPage";
import CustomCategoryPage from "./CustomCategoryPage";
import { useCustomCategories } from "../../components/CategoriesProvider";
import type { CustomCategory } from "@/lib/categories";
import DownloadGate from "../../components/DownloadGate";
import InlineDownloadGate from "../../components/InlineDownloadGate";
import { useT } from "../../components/ContentProvider";
import { useProductOverrides } from "../../components/ProductOverridesProvider";
import { mergeList } from "@/lib/product-content";
import { GENERIC_BY_TYPE, blockValue, parseBlocks } from "@/lib/page-blocks";
import GenericBlock from "../../components/GenericBlock";
import { layoutKey, splitLines, splitParas, splitRows } from "@/lib/category-copy";

type T = (key: string) => string;

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

type Step = { n: string; title: string; desc: string; note: string };

function PCard({ s, visible, delay }: { s: Step; visible: boolean; delay: number }) {
  return (
    <div className="group flex-1 min-w-0 bg-white border border-stone-200/80 rounded-2xl p-6 md:p-6 flex flex-col cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-16px_rgba(44,38,32,0.35)] hover:border-[#b8934a]/50"
      style={{ opacity: visible ? 1 : 0, transform: visible ? undefined : "translateY(14px)", transitionDelay: visible ? "0ms" : `${delay}ms` }}>
      <span className="w-9 h-9 rounded-full border border-[#b8934a]/50 bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center type-label mb-4 transition-colors duration-300 group-hover:bg-[#b8934a] group-hover:text-white group-hover:border-[#b8934a]" style={{ fontSize: "12px" }}>{s.n}</span>
      <h3 className="type-product text-stone-900 mb-2 transition-colors duration-300 group-hover:text-[#8a6d2f]" style={{ fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.2 }}>{s.title}</h3>
      <p className="type-body text-stone-600 mb-3" style={{ lineHeight: 1.7, fontSize: "13px" }}>{s.desc}</p>
      {s.note && <p className="type-label text-[#b8934a] mt-auto" style={{ fontSize: "10px", letterSpacing: "0.07em" }}>{s.note}</p>}
    </div>
  );
}

const Arrow = ({ dir, visible }: { dir: "right" | "left" | "down"; visible: boolean }) => (
  <div className={`shrink-0 flex items-center justify-center text-[#b8934a]/60 ${dir === "down" ? "" : "px-1"}`} style={{ fontSize: "22px", transition: "opacity 0.5s ease 0.4s", opacity: visible ? 1 : 0 }}>
    {dir === "right" ? "→" : dir === "left" ? "←" : "↓"}
  </div>
);

function JoineryProcess({ t }: { t: T }) {
  const { ref, visible } = useInView(0.1);
  const steps: Step[] = splitRows(t("jn.process.steps")).map(([title = "", desc = "", note = ""], i) => ({ n: String(i + 1).padStart(2, "0"), title, desc, note })).filter((s) => s.title);
  if (!steps.length) return null;
  // Desktop S-bend: first half left→right, then down, second half right→left.
  const half = Math.ceil(steps.length / 2);
  const rowA = steps.slice(0, half), rowB = steps.slice(half);
  const withArrows = (row: Step[], dir: "right" | "left", offset: number) => row.flatMap((s, i) => [
    ...(i > 0 ? [<Arrow key={`a${s.n}`} dir={dir} visible={visible} />] : []),
    <PCard key={s.n} s={s} visible={visible} delay={(offset + i) * 220} />,
  ]);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-px bg-stone-300 w-12" />
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("jn.process.eyebrow")}</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <h2 className="type-large text-stone-900 mb-3" style={{ fontSize: "clamp(26px, 3.5vw, 48px)", lineHeight: 1.05 }}>{t("jn.process.headline")}</h2>
        {t("jn.process.intro") && <p className="type-body text-stone-500 mb-12 max-w-xl" style={{ lineHeight: 1.9 }}>{t("jn.process.intro")}</p>}
      </div>

      <div ref={ref} className="hidden lg:block max-w-6xl mx-auto">
        <div className="flex items-stretch gap-3">{withArrows(rowA, "right", 0)}</div>
        {rowB.length > 0 && (
          <>
            <div className="flex justify-end pr-[15%] py-1"><Arrow dir="down" visible={visible} /></div>
            <div className="flex flex-row-reverse items-stretch gap-3">{withArrows(rowB, "left", half)}</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 max-w-3xl mx-auto">
        {steps.map((s, i) => <PCard key={s.n} s={s} visible={true} delay={i * 60} />)}
      </div>
    </section>
  );
}

function FaqItem({ q, a, dark }: { q: string; a: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b ${dark ? "border-white/12" : "border-stone-200"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left py-5">
        <span className={`type-product ${dark ? "text-[#efe7d8]" : "text-stone-900"}`} style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.3 }}>{q}</span>
        <span className={`text-[#c8a25c] text-xl transition-transform duration-300 flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "600px" : "0" }}>
        <p className={`type-body pb-6 ${dark ? "text-[#b7ab97]" : "text-stone-600"}`} style={{ lineHeight: 1.9, fontSize: "13.5px" }}>{a}</p>
      </div>
    </div>
  );
}

function JoineryFAQ({ t }: { t: T }) {
  const faqs = splitRows(t("category.joinery.faqs")).map(([q = "", ...a]) => ({ q, a: a.join(" :: ") })).filter((f) => f.q && f.a);
  if (!faqs.length) return null;
  const mid = Math.ceil(faqs.length / 2);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 bg-[#2c2620] text-[#efe7d8]">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-px bg-white/20 w-12" />
          <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>FAQS</span>
          <div className="h-px bg-white/20 w-12" />
        </div>
        <h2 className="type-large mb-3" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.05 }}>{t("jn.faq.headline")}</h2>
        {t("jn.faq.intro") && <p className="type-body text-[#b7ab97] mb-12 max-w-xl" style={{ lineHeight: 1.9 }}>{t("jn.faq.intro")}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14 max-w-5xl mx-auto">
        {[faqs.slice(0, mid), faqs.slice(mid)].map((col, c) => (
          <div key={c}>{col.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} dark />)}</div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ slug, data, category, cardCta }: { slug: string; data: ProductData; category: string; cardCta: string }) {
  const specs = [
    data.certification,
    data.profiles?.find((p) => /structure width/i.test(p.label)) && `${data.profiles.find((p) => /structure width/i.test(p.label))!.value} structure`,
    data.details?.[0] && `${data.details[0].label}: ${data.details[0].value}`,
    data.sizes?.[0],
  ].filter(Boolean) as string[];
  // A product marked "coming soon" is shown but does not open a page.
  const soon = !!data.comingSoon;
  const card = "group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-300";

  const inner = (
    <>
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
        <Image src={data.heroImg} alt={data.name} fill className={`object-cover transition-transform duration-500 ${soon ? "" : "group-hover:scale-105"}`} />
        {soon && (
          <span className="absolute top-3 left-3 z-10 type-label bg-[#2c2620]/85 text-[#e9c98a] px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.14em" }}>COMING SOON</span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h3 className={`type-product text-stone-900 transition-colors ${soon ? "" : "group-hover:text-[#b8934a]"}`} style={{ letterSpacing: "0.06em", fontSize: "20px", lineHeight: 1.2 }}>{data.name}</h3>
        <p className="type-body text-stone-500" style={{ lineHeight: 1.7, fontSize: "13px" }}>{data.tagline}</p>
        {data.features && (
          <p className="type-body text-stone-400" style={{ lineHeight: 1.6, fontSize: "12px" }}>{data.features}</p>
        )}
        {!data.features && specs.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 border-t border-stone-100 mt-1">
            {specs.slice(0, 2).map((s, i) => (
              <span key={i} className="type-label text-stone-400 inline-flex items-center gap-1.5" style={{ fontSize: "10.5px", letterSpacing: "0.08em" }}>
                <span className="w-1 h-1 rounded-full bg-[#b8934a]" />{s}
              </span>
            ))}
          </div>
        )}
        {soon ? (
          <span className="type-button text-stone-400 mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>Coming soon</span>
        ) : (
          <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>
            {cardCta} &nbsp;<span className="arrow">→</span>
          </span>
        )}
      </div>
    </>
  );

  return soon ? (
    <div className={card} aria-disabled>{inner}</div>
  ) : (
    <a href={`/classic/${category}/${slug}`} className={`${card} hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1`}>{inner}</a>
  );
}

function WindowsSupplier({ t }: { t: T }) {
  const { ref, visible } = useInView(0.12);
  const steps = splitRows(t("wd.supplier.steps")).map((r) => r[0]).filter(Boolean);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#ede8df]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("wd.supplier.eyebrow")}</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        <h2 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(24px, 3.2vw, 44px)", lineHeight: 1.05, maxWidth: "760px" }}>{t("wd.supplier.headline")}</h2>
        <p className="type-body text-stone-500 mb-12 max-w-2xl" style={{ lineHeight: 1.9 }}>{t("wd.supplier.body")}</p>
        {steps.length > 0 && (
          <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 mb-16">
            {steps.map((label, i) => (
              <div key={i} className="group relative rounded-2xl bg-white border border-stone-200 shadow-[0_10px_30px_-14px_rgba(44,38,32,0.4)] cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-18px_rgba(44,38,32,0.6)] hover:border-[#c8a25c]/50 p-5 flex flex-col items-start gap-4" style={{ opacity: visible ? 1 : 0, transform: visible ? undefined : "translateY(10px)", transitionDelay: visible ? "0ms" : `${i * 120}ms` }}>
                <span className="w-10 h-10 rounded-full bg-[#2c2620] text-[#e9c98a] flex items-center justify-center type-label transition-colors duration-300 group-hover:bg-[#c8a25c] group-hover:text-[#2c2620]" style={{ fontSize: "13px" }}>{String(i + 1).padStart(2, "0")}</span>
                <p className="type-body text-stone-700 group-hover:text-stone-900 transition-colors" style={{ fontSize: "13px", lineHeight: 1.45 }}>{label}</p>
                {i < steps.length - 1 && (
                  <span className="hidden lg:flex absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#2c2620] text-[#e9c98a] items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)]" style={{ fontSize: "15px" }}>→</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WindowsTailored({ t }: { t: T }) {
  const items = splitRows(t("wd.tailored.items")).filter((r) => r[0]);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 bg-[#2c2620] text-[#efe7d8]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>{t("wd.tailored.eyebrow")}</span>
          <div className="h-px bg-white/20 w-12" />
        </div>
        <h2 className="type-large mb-10 max-w-2xl" style={{ fontSize: "clamp(22px, 3vw, 38px)", lineHeight: 1.1 }}>{t("wd.tailored.headline")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {items.map(([label, img], i) => (
            <div key={i} className="group flex items-center gap-4 bg-white/[0.04] border border-white/12 rounded-xl p-3 cursor-default transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:border-[#c8a25c]/50 hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.7)]">
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black/20">
                {img && <Image src={img} alt={label} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />}
              </div>
              <span className="type-body text-[#efe7d8] group-hover:text-white transition-colors" style={{ fontSize: "13.5px", lineHeight: 1.5 }}>{label}</span>
            </div>
          ))}
        </div>
        {t("wd.tailored.closing") && <p className="type-body text-[#b7ab97] max-w-2xl" style={{ lineHeight: 1.9, fontStyle: "italic" }}>{t("wd.tailored.closing")}</p>}
      </div>
    </section>
  );
}

function OptionAccordion({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 text-left px-6 md:px-8 py-6">
        <div>
          <h3 className="type-product text-stone-900" style={{ fontSize: "clamp(17px, 1.8vw, 21px)", lineHeight: 1.2 }}>{title}</h3>
          {subtitle && <p className="type-body text-stone-500 mt-1" style={{ fontSize: "13px" }}>{subtitle}</p>}
        </div>
        <span className={`text-[#b8934a] text-2xl transition-transform duration-300 shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "600px" : "0" }}>
        <div className="px-6 md:px-8 pb-7 pt-1 type-body text-stone-600" style={{ lineHeight: 1.85, fontSize: "14px" }}>{children}</div>
      </div>
    </div>
  );
}

// Large image tiles: Title :: Description :: Link :: Button :: Image
function ImageTiles({ rows, rounded }: { rows: string[][]; rounded?: boolean }) {
  return (
    <>
      {rows.map(([title, desc, href, cta, img], i) => (
        <a key={i} href={href || "#"} className={`group relative flex flex-col justify-end overflow-hidden ${rounded ? "rounded-2xl min-h-[300px] md:min-h-[340px] px-8 py-10" : "px-8 md:px-14 py-12 md:py-16 min-h-[46vh] md:min-h-[480px]"}`}>
          {img && <Image src={img} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
          <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-500" />
          <div className={`relative z-10 ${rounded ? "max-w-sm" : "max-w-md"}`}>
            {!rounded && <p className="type-label text-[#d9b877] mb-4" style={{ letterSpacing: "0.16em" }}>EXPLORE</p>}
            <h3 className={`text-white ${rounded ? "mb-3" : "mb-4"}`} style={{ fontFamily: "var(--font-serif)", fontSize: rounded ? "clamp(24px, 3vw, 34px)" : "clamp(28px, 3.6vw, 48px)", fontWeight: 300, lineHeight: 1.08 }}>{title}</h3>
            {desc && <p className={`type-body text-white/80 ${rounded ? "mb-6" : "mb-8"}`} style={{ lineHeight: 1.75, fontSize: rounded ? "13.5px" : undefined }}>{desc}</p>}
            {cta && <span className="arrow-link type-button text-white border-b border-white/50 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>{cta} &nbsp;<span className="arrow">→</span></span>}
          </div>
        </a>
      ))}
    </>
  );
}

function WindowsOptions({ t }: { t: T }) {
  const tiles = splitRows(t("wd.options.tiles")).filter((r) => r[0]);
  const panels = splitRows(t("wd.options.accordions")).filter((r) => r[0]);
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("wd.options.eyebrow")}</span>
          <div className="h-px bg-stone-300 w-12" />
        </div>
        {tiles.length > 0 && (
          <div className={`grid grid-cols-1 ${tiles.length > 1 ? "md:grid-cols-2" : ""} gap-6 mb-6`}>
            <ImageTiles rows={tiles} rounded />
          </div>
        )}
        <div className="flex flex-col gap-4">
          {panels.map(([title, subtitle = "", body = ""], i) => (
            <OptionAccordion key={i} title={title} subtitle={subtitle}>
              {splitParas(body).map((p, j, all) => <p key={j} className={j < all.length - 1 ? "mb-3" : ""}>{p}</p>)}
            </OptionAccordion>
          ))}
        </div>
      </div>
    </section>
  );
}

function FamilyGroup({ fam, famProducts, category, index }: { fam: typeof WD_FAMILIES[0]; famProducts: { slug: string; data: ProductData }[]; category: string; index: number }) {
  const multiple = famProducts.length > 1;
  // The whole family is "coming soon" only when every system in it is.
  const soon = famProducts.every((p) => p.data.comingSoon);
  const href = multiple ? `/classic/${category}/series/${fam.slug}` : `/classic/${category}/${famProducts[0].slug}`;
  const ready = famProducts.filter((p) => !p.data.comingSoon).length;
  const cta = multiple ? `View all ${ready} system${ready === 1 ? "" : "s"}` : "View the system";
  const imageRight = index % 2 === 1;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border-b border-stone-200 last:border-b-0" style={{ minHeight: "500px" }}>
      <div className={`relative min-h-[300px] md:min-h-0 ${imageRight ? "md:order-2" : ""}`}>
        <Image src={famProducts[0].data.heroImg} alt={fam.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/8" />
        {soon && (
          <span className="absolute top-5 left-5 z-10 type-label bg-[#2c2620]/85 text-[#e9c98a] px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.14em" }}>COMING SOON</span>
        )}
      </div>
      <div className={`flex flex-col justify-center px-8 md:px-16 py-16 md:py-24 ${index % 2 ? "bg-[#ede8df]" : "bg-[#f5f0e8]"} ${imageRight ? "md:order-1" : ""}`}>
        <div className="flex items-center gap-4 mb-7">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{fam.tagline}</span>
          <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
        </div>
        <h3 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(30px, 3.5vw, 52px)", lineHeight: 1.03 }}>{fam.name}</h3>
        <p className="type-body text-stone-500 mb-9 max-w-md" style={{ lineHeight: 1.9 }}>{fam.desc}</p>
        {soon ? (
          <span className="type-button text-stone-400 border-b border-stone-300 pb-px w-fit" style={{ letterSpacing: "0.08em" }}>Coming soon</span>
        ) : (
          <a href={href} className="arrow-link type-button text-stone-500 border-b border-stone-300 pb-px w-fit hover:text-stone-900 transition-colors" style={{ letterSpacing: "0.08em" }}>{cta} &nbsp;<span className="arrow">→</span></a>
        )}
      </div>
    </div>
  );
}

export default function ClassicCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const t = useT();
  const productOverrides = useProductOverrides();
  const meta = CATEGORY_META[category];
  const customCats = useCustomCategories();
  const products = mergeList(category === "bathrooms" ? listPackages(category) : listProducts(category), category, productOverrides);

  if (!meta) return <CustomCategoryRoute slug={category} />;

  // Bathroom Packages has its own page.
  if (category === "bathrooms") return <BathroomsPage packages={products} />;

  const wd = category === "windows-doors";
  const p = wd ? "wd" : "jn";
  const build = (t: T): Record<string, () => React.ReactNode> => {
  const storyParas = splitLines(t(`category.${category}.story`));
  return {
    hero: () => (
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "70vh" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#ede8df]">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>Classic</p>
          <h1 className="type-hero text-stone-900 uppercase mb-5" style={{ fontSize: "clamp(36px, 6vw, 80px)", lineHeight: 1.0, letterSpacing: "0.06em" }}>{meta.label}</h1>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <p className="type-body text-stone-400 mb-8 max-w-sm" style={{ lineHeight: 1.9 }}>{t(`category.${category}.intro`) || meta.body[0]}</p>
          {t(`${p}.hero.cta`) && (
            <a href={wd ? "#range" : "/quote"} className="arrow-link type-button text-stone-500 border-b border-stone-300 pb-px hover:text-stone-900 transition-colors w-fit">
              {t(`${p}.hero.cta`)} &nbsp;<span className="arrow">{wd ? "↓" : "→"}</span>
            </a>
          )}
        </div>
        <div className="relative min-h-[400px] md:min-h-0">
          <Image src={t(`category.${category}.heroImg`) || meta.heroImg} alt={meta.label} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/8" />
        </div>
      </section>
    ),

    story: () => (
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200" style={{ minHeight: "520px" }}>
        <div className="relative min-h-[360px] md:min-h-0">
          <Image src={t(`category.${category}.storyImg`) || meta.storyImg} alt={`${meta.label} story`} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#f5f0e8]">
          <div className="flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t(`${p}.story.eyebrow`)}</span>
            <div className="flex-1 h-px bg-stone-300 max-w-[60px]" />
          </div>
          <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>{t(`category.${category}.headline`) || meta.headline}</h2>
          {(storyParas.length ? storyParas : meta.story ?? meta.body).map((para, i) => (
            <p key={i} className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.9 }}>{para}</p>
          ))}
        </div>
      </section>
    ),

    supplier: () => <WindowsSupplier t={t} />,
    tailored: () => <WindowsTailored t={t} />,

    range: () => products.length > 0 && (
      <section id="range" className="scroll-mt-24 py-20 md:py-28 px-6 md:px-8 border-t border-stone-200">
        <div className={wd ? "flex items-center gap-4 mb-14" : "mb-12"}>
          <div className="flex items-center gap-4">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t(`${p}.range.eyebrow`)}</span>
            <div className="h-px bg-stone-300 w-16" />
            {wd && <span className="type-label text-stone-400">{products.length} systems</span>}
          </div>
          {!wd && (t("jn.range.headline") || t("jn.range.intro")) && (
            <div className="mt-6">
              {t("jn.range.headline") && <h2 className="type-large text-stone-900 mb-2" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.1 }}>{t("jn.range.headline")}</h2>}
              {t("jn.range.intro") && <p className="type-body text-stone-500 max-w-xl" style={{ lineHeight: 1.8 }}>{t("jn.range.intro")}</p>}
            </div>
          )}
        </div>
        {wd ? (
          <div className="-mx-6 md:-mx-8 mt-6 border-t border-stone-200">
            {WD_FAMILIES.map((fam, fi) => {
              const famProducts = fam.slugs.map((s) => products.find((x) => x.slug === s)).filter(Boolean) as { slug: string; data: ProductData }[];
              if (famProducts.length === 0) return null;
              return <FamilyGroup key={fam.name} fam={fam} famProducts={famProducts} category={category} index={fi} />;
            })}
            {(() => {
              const inFamily = new Set(WD_FAMILIES.flatMap((f) => f.slugs));
              const extra = products.filter((x) => !inFamily.has(x.slug));
              if (extra.length === 0) return null;
              const fam = { slug: "additional", name: "Additional Systems", tagline: "More from the Classic collection.", desc: "Further window and door systems available across the Classic collection.", slugs: extra.map((e) => e.slug) };
              return <FamilyGroup key="additional" fam={fam} famProducts={extra} category={category} index={WD_FAMILIES.length} />;
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(({ slug, data }) => (
              <ProductCard key={slug} slug={slug} data={data} category={category} cardCta={t("jn.range.cta") || "EXPLORE"} />
            ))}
          </div>
        )}
      </section>
    ),

    options: () => <WindowsOptions t={t} />,

    process: () => <JoineryProcess t={t} />,

    materials: () => (() => {
      const tiles = splitRows(t("jn.mat.tiles")).filter((r) => r[0]);
      return (
        <section className="border-t border-stone-200">
          <div className="px-8 md:px-14 pt-16 md:pt-20 pb-2 max-w-3xl">
            <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.16em" }}>{t("jn.mat.eyebrow")}</p>
            <h2 className="type-large text-stone-900 mb-4" style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1.1 }}>{t("jn.mat.headline")}</h2>
            {t("jn.mat.intro") && <p className="type-body text-stone-500" style={{ lineHeight: 1.9 }}>{t("jn.mat.intro")}</p>}
          </div>
          {tiles.length > 0 && (
            <div className={`grid grid-cols-1 ${tiles.length > 1 ? "md:grid-cols-2" : ""} pt-8 md:pt-12`}>
              <ImageTiles rows={tiles} />
            </div>
          )}
        </section>
      );
    })(),

    download: () => (
      <DownloadGate
        resource="joinery-collection"
        eyebrow={t("jn.dl.eyebrow")}
        headline={t("jn.dl.headline")}
        body={t("jn.dl.body")}
        buttonLabel={t("jn.dl.button")}
        imageSlot="cta.joinery-collection.bg"
        imageFallback="/Atelier_Classic.png"
      />
    ),

    downloads: () => (
      <section className="px-6 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>{t("wd.dl.eyebrow")}</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          {t("wd.dl.headline") && (
            <h2 className="type-large text-stone-900 mb-4" style={{ fontSize: "clamp(28px, 3.6vw, 48px)", lineHeight: 1.05 }}>{t("wd.dl.headline")}</h2>
          )}
          {t("wd.dl.intro") && <p className="type-body text-stone-500 max-w-md mb-10" style={{ lineHeight: 1.8 }}>{t("wd.dl.intro")}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white rounded-3xl border border-stone-200/70 shadow-[0_24px_60px_-28px_rgba(44,38,32,0.45)] p-7 md:p-8 flex flex-col">
              {t("wd.dl.collection.img") && (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-stone-100 border border-stone-200/70">
                  <Image src={t("wd.dl.collection.img")} alt={t("wd.dl.collection.title")} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover object-top" />
                </div>
              )}
              <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.15 }}>{t("wd.dl.collection.title")}</h3>
              <p className="type-body text-stone-500 mb-5" style={{ lineHeight: 1.7, fontSize: "13.5px" }}>{t("wd.dl.collection.body")}</p>
              <div className="mt-auto pt-1">
                <InlineDownloadGate
                  resource="window-collection"
                  intro="Enter your name and email to download. We’ll email you a copy too."
                  itemName="The Window Collection"
                  submitLabel="GET THE COLLECTION"
                  downloadLabel="Download the collection"
                />
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200/70 shadow-[0_24px_60px_-28px_rgba(44,38,32,0.45)] p-7 md:p-8 flex flex-col">
              {t("wd.dl.care.img") && (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-stone-100 border border-stone-200/70">
                  <Image src={t("wd.dl.care.img")} alt={t("wd.dl.care.title")} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover object-top" />
                </div>
              )}
              <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.15 }}>{t("wd.dl.care.title")}</h3>
              <p className="type-body text-stone-500 mb-6" style={{ lineHeight: 1.7, fontSize: "13.5px" }}>{t("wd.dl.care.body")}</p>
              <div className="mt-auto pt-1">
                <InlineDownloadGate
                  resource="window-maintenance"
                  intro="Enter your name and email to download. We’ll email you a copy too."
                  itemName="The Care & Maintenance Guide"
                  submitLabel={t("wd.dl.care.button")}
                  downloadLabel="Download the guide"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    building: () => (
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">{t(`${p}.bwc.eyebrow`)}</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{t(`${p}.bwc.headline`)}</h2>
          {(() => {
            const paras = splitLines(t(`${p}.bwc.body`));
            return paras.map((para, i) => {
              const lead = wd && i === 0 && paras.length > 1;
              const last = i === paras.length - 1;
              return (
                <p key={i} className={`type-body mx-auto ${lead ? "text-stone-700 max-w-lg" : "text-stone-600 max-w-lg"} ${last ? "mb-10" : lead ? "mb-4" : "mb-3"}`} style={{ lineHeight: 1.9, fontSize: lead ? "17px" : undefined }}>{para}</p>
              );
            });
          })()}
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            {t(`${p}.bwc.cta`)} &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>
    ),

    faqs: () => <JoineryFAQ t={t} />,

    explore: () => (() => {
      const LABELS: Record<string, string> = { "windows-doors": "Windows & Doors", "joinery": "Custom Joinery", "bathrooms": "Bathroom Packages" };
      const HERO: Record<string, string> = { "windows-doors": "/Signature Luxe.png", "joinery": "/Atelier_Classic.png", "bathrooms": "/vanities/OJS265-1200.jpg" };
      const others = ["windows-doors", "joinery", "bathrooms"].filter((c) => c !== category);
      for (const c of customCats) { LABELS[c.slug] = c.label; HERO[c.slug] = c.heroImg || "/Atelier_Classic.png"; others.push(c.slug); }
      return (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
          {others.map((cat) => (
            <a key={cat} href={`/classic/${cat}`} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[42vh] md:min-h-[440px]">
              <Image src={HERO[cat]} alt={LABELS[cat]} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-500" />
              <div className="relative z-10 max-w-md">
                <p className="type-label text-[#b8934a] mb-3" style={{ letterSpacing: "0.16em" }}>EXPLORE THE COLLECTION</p>
                <h2 className="text-white mb-5" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 300, lineHeight: 1.05 }}>{LABELS[cat]}</h2>
                <span className="arrow-link type-button text-white border-b border-white/40 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>EXPLORE &nbsp;<span className="arrow">→</span></span>
              </div>
            </a>
          ))}
        </section>
      );
    })(),
  };
  };

  const blocks = parseBlocks(t(layoutKey(category)), wd ? "windows-doors" : "joinery");

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb={meta.label} />
      {blocks.filter((b) => !b.hidden).map((b) => (
        <Fragment key={b.uid}>{GENERIC_BY_TYPE[b.type] ? <GenericBlock block={b} /> : build(blockValue(b, t))[b.type]?.()}</Fragment>
      ))}
      <SiteFooter />
    </div>
  );
}

// Admin-created categories. Published ones come from the layout provider; an
// unpublished draft can be previewed by a signed-in admin with ?preview=1.
function CustomCategoryRoute({ slug }: { slug: string }) {
  const published = useCustomCategories().find((c) => c.slug === slug);
  const [draft, setDraft] = useState<CustomCategory | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (published) return;
    const preview = new URLSearchParams(window.location.search).get("preview");
    if (!preview) { setChecked(true); return; }
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((all: CustomCategory[]) => setDraft(Array.isArray(all) ? all.find((c) => c.slug === slug) ?? null : null))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [published, slug]);

  const cat = published ?? draft;
  if (cat) return <CustomCategoryPage cat={cat} />;
  if (!checked) return <div className="min-h-screen bg-[#f5f0e8]"><SiteHeader variant="solid" /></div>;
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Not found" />
      <p className="text-stone-400 text-center py-32">Category not found.</p>
    </div>
  );
}
