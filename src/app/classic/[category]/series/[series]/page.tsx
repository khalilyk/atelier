import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import { CATEGORY_META, getFamily, getProduct } from "../../../data";
import { getProductOverrides } from "@/lib/get-content";
import { resolveProduct } from "@/lib/product-content";
import { pageMetadata } from "@/lib/seo";

type SeriesProps = { params: Promise<{ category: string; series: string }> };

export async function generateMetadata({ params }: SeriesProps) {
  const { category, series } = await params;
  const fam = getFamily(series);
  if (!CATEGORY_META[category] || !fam) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    path: `/classic/${category}/series/${series}`,
    title: `${fam.name} Aluminium Windows & Doors`,
    description: `${fam.tagline} ${fam.desc}`,
  });
}


export default async function SeriesPage({ params }: { params: Promise<{ category: string; series: string }> }) {
  const { category, series } = await params;
  const meta = CATEGORY_META[category];
  const fam = getFamily(series);
  if (!meta || !fam) notFound();

  const overrides = await getProductOverrides();
  const products = fam.slugs
    .map((slug) => ({ slug, data: resolveProduct(getProduct(category, slug), category, slug, overrides) }))
    .filter((p): p is { slug: string; data: NonNullable<typeof p.data> } => Boolean(p.data));

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb={fam.name} />

      {/* ── HERO ── */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "56vh" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#ede8df]">
          <a href={`/classic/${category}`} className="type-label text-stone-400 hover:text-stone-700 transition-colors mb-6" style={{ letterSpacing: "0.14em" }}>← {meta.label}</a>
          <p className="type-label text-[#b8934a] mb-4" style={{ letterSpacing: "0.16em" }}>Classic Collection</p>
          <h1 className="type-large text-stone-900 mb-4" style={{ fontSize: "clamp(34px, 5vw, 66px)", lineHeight: 1.02 }}>{fam.name}</h1>
          <p className="type-body text-[#b8934a] mb-6" style={{ fontSize: "clamp(15px, 1.8vw, 19px)" }}>{fam.tagline}</p>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <p className="type-body text-stone-500 max-w-md" style={{ lineHeight: 1.9 }}>{fam.desc}</p>
        </div>
        <div className="relative min-h-[320px] md:min-h-0">
          <Image src={products[0].data.heroImg} alt={fam.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/8" />
        </div>
      </section>

      {/* ── CONFIGURATIONS ── */}
      <section className="py-20 md:py-28 px-6 md:px-8 border-t border-stone-200">
        <div className="flex items-center gap-4 mb-12">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>CONFIGURATIONS</span>
          <div className="h-px bg-stone-300 w-16" />
          <span className="type-label text-stone-400">{products.length} systems</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map(({ slug, data }) => {
            // A system still being prepared is shown, but does not open a page.
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
                  {data.certification && (
                    <span className="type-label text-stone-400 inline-flex items-center gap-1.5 mt-1" style={{ fontSize: "10.5px", letterSpacing: "0.08em" }}>
                      <span className="w-1 h-1 rounded-full bg-[#b8934a]" />{data.certification}
                    </span>
                  )}
                  {soon ? (
                    <span className="type-button text-stone-400 mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>Coming soon</span>
                  ) : (
                    <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-1" style={{ letterSpacing: "0.1em" }}>VIEW SYSTEM &nbsp;<span className="arrow">→</span></span>
                  )}
                </div>
              </>
            );
            return soon ? (
              <div key={slug} className={card} aria-disabled>{inner}</div>
            ) : (
              <a key={slug} href={`/classic/${category}/${slug}`} className={`${card} hover:shadow-[0_16px_40px_rgba(44,31,20,0.10)] hover:-translate-y-1`}>{inner}</a>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Selection Support</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 56px)", maxWidth: "560px", lineHeight: 1.1 }}>Building with Classic?</h2>
          <p className="type-body text-stone-600 mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>Send us your plans and window schedule and we&rsquo;ll help specify the right {fam.name} configuration for your project.</p>
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            Start your project today &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
