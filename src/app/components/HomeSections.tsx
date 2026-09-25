"use client";
import Image from "next/image";
import { useT } from "./ContentProvider";
import { postDate, type JournalPost } from "@/lib/journal";

// Home page sections that read their wording from Pages (and from a block's own
// text when duplicated).
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const Lines = ({ text }: { text: string }) => <>{lines(text).map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)}</>;

export function OfferingStrip() {
  const t = useT();
  if (!t("home.offering")) return null;
  return (
    <div className="bg-[#2c2620] text-[#efe7d8] text-center px-6 py-2.5">
      <p className="type-label" style={{ letterSpacing: "0.12em", fontSize: "11px" }}>{t("home.offering")}</p>
    </div>
  );
}

export function HomeAbout() {
  const t = useT();
  return (
    <section className="bg-[#f5f0e8] py-16 md:py-24 px-6 md:px-8 text-center">
      <p className="type-label text-stone-500 mb-8">{t("home.about.eyebrow")}</p>
      <p className="type-large text-stone-900 max-w-3xl mx-auto" style={{ fontSize: "clamp(28px, 4vw, 54px)" }}>{t("home.about.headline")}</p>
      <p className="type-body text-stone-500 max-w-2xl mx-auto mt-8" style={{ lineHeight: 1.9 }}>{t("home.about.body")}</p>
    </section>
  );
}

export function HomeJournal({ posts = [] }: { posts?: JournalPost[] }) {
  const t = useT();
  // Real articles when there are any; the placeholders below until then.
  const items = posts.length
    ? posts.slice(0, 3).map((p) => [p.title, p.excerpt || p.subtitle || postDate(p), p.coverImage, `/journal/${p.slug}`])
    : lines(t("home.journal.items")).map((l) => {
        const [title, desc, img, href] = l.split("::").map((c) => c.trim());
        return [title, desc, img, href || "/journal"];
      }).filter((r) => r[0]);
  const viewAll = posts.length ? "/journal" : (t("home.journal.link") || "/journal").replace(/^#$/, "/journal");
  return (
    <section className="bg-[#f5f0e8] py-16 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <p className="type-label text-stone-500 mb-6">{t("home.journal.eyebrow")}</p>
            <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(32px, 4vw, 72px)" }}><Lines text={t("home.journal.headline")} /></h2>
            {t("home.journal.button") && (
              <a href={viewAll} className="arrow-link type-button text-stone-700 border-b border-stone-400 pb-px inline-flex items-center min-h-9">
                {t("home.journal.button")} &nbsp;<span className="arrow">→</span>
              </a>
            )}
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-4">
            {items.map(([title, desc, img, href], i) => {
              const card = (
                <>
                  <div className="relative h-36 mb-4 overflow-hidden bg-stone-300">
                    {img && <Image src={img} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <p className="type-product text-stone-900 mb-2 group-hover:text-[#b8934a] transition-colors" style={{ fontSize: "clamp(20px, 2.5vw, 36px)" }}>{title}</p>
                  {desc && <p className="type-body text-stone-500">{desc}</p>}
                </>
              );
              return href ? (
                <a key={i} href={href} className="group">{card}</a>
              ) : (
                <div key={i} className="group">{card}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeCta() {
  const t = useT();
  return (
    <section className="bg-[#e3d9c9] py-16 px-6 md:px-8 border-t border-stone-200">
      <div className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-8 md:items-center">
        <div>
          <h2 className="type-heading text-stone-900" style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}><Lines text={t("home.cta.headline")} /></h2>
        </div>
        <div className="flex items-start md:items-stretch">
          <div className="w-px bg-stone-400/60 mr-6 md:mr-8 shrink-0" />
          <p className="type-intro text-stone-600" style={{ fontSize: "clamp(16px, 1.5vw, 20px)" }}>{t("home.cta.body")}</p>
        </div>
        <div className="flex md:justify-end">
          {t("home.cta.button") && (
            <a href={t("home.cta.link") || "/quote"} className="arrow-link type-button border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors">
              {t("home.cta.button")} &nbsp;<span className="arrow">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
