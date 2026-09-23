"use client";
import { useState } from "react";
import { useT } from "./ContentProvider";

export default function AtelierDifference() {
  const [open, setOpen] = useState<string | null>(null);
  const t = useT();
  const pillars = [
    { n: "01", title: t("difference.1.title"), desc: t("difference.1.desc") },
    { n: "02", title: t("difference.2.title"), desc: t("difference.2.desc") },
    { n: "03", title: t("difference.3.title"), desc: t("difference.3.desc") },
    { n: "04", title: t("difference.4.title"), desc: t("difference.4.desc") },
  ];

  return (
    <section className="bg-[#ede8df] py-16 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <p className="type-label text-[#b8934a] mb-10 md:hidden">{t("difference.eyebrow").replace("\n", " ")}</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-8">
          <div className="hidden md:flex col-span-1 items-start pt-1">
            <p className="type-label text-[#b8934a] leading-relaxed whitespace-pre-line">{t("difference.eyebrow")}</p>
          </div>

          {pillars.map(({ n, title, desc }) => {
            const isOpen = open === n;
            return (
              <div key={n} className="md:col-span-1">
                {/* Desktop: static layout */}
                <div className="hidden md:block md:p-6 md:-m-6 rounded transition-colors duration-300 hover:bg-black/[0.03]">
                  <p className="type-label text-stone-400 mb-4">{n}</p>
                  <h3 className="type-product text-stone-900 mb-4 whitespace-pre-line" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>{title}</h3>
                  <p className="type-body text-stone-500">{desc}</p>
                </div>

                {/* Mobile: accordion */}
                <div className="md:hidden border-b border-stone-300">
                  <button
                    className="w-full flex items-center justify-between py-5 text-left"
                    onClick={() => setOpen(isOpen ? null : n)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="type-label text-stone-400">{n}</span>
                      <h3 className="type-product text-stone-900 whitespace-pre-line leading-tight">{title.replace("\n", " ")}</h3>
                    </div>
                    <span className={`text-[#b8934a] text-xl transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}>
                    <p className="type-body text-stone-500">{desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
