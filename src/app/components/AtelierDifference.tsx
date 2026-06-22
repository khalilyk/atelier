"use client";
import { useState } from "react";

const pillars = [
  { n: "01", title: "Curated\nGlobally", desc: "Access to leading manufacturers and emerging makers worldwide." },
  { n: "02", title: "Delivered\nEnd-to-End", desc: "From quotation through to delivery, we manage every detail." },
  { n: "03", title: "Focused on\nQuality", desc: "Built around operational realities and the demands of exceptional spaces." },
  { n: "04", title: "Bespoke\nSolutions", desc: "Tailored pieces and bespoke production to bring your vision to life." },
];

export default function AtelierDifference() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-[#111110] py-16 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <p className="type-label text-stone-500 mb-10 md:hidden">The Atelier Difference</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-8">
          <div className="hidden md:flex col-span-1 items-start pt-1">
            <p className="type-label text-stone-500 leading-relaxed">The Atelier<br />Difference</p>
          </div>

          {pillars.map(({ n, title, desc }) => {
            const isOpen = open === n;
            return (
              <div key={n} className="md:col-span-1">
                {/* Desktop: static layout */}
                <div className="hidden md:block md:p-6 md:-m-6 rounded transition-colors duration-300 hover:bg-white/5">
                  <p className="type-label text-stone-500 mb-4">{n}</p>
                  <h3 className="type-product text-white mb-4 whitespace-pre-line" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>{title}</h3>
                  <p className="type-body text-stone-400 mb-5">{desc}</p>
                  <span className="text-stone-500 text-lg">+</span>
                </div>

                {/* Mobile: accordion */}
                <div className="md:hidden border-b border-white/10">
                  <button
                    className="w-full flex items-center justify-between py-5 text-left"
                    onClick={() => setOpen(isOpen ? null : n)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="type-label text-stone-500">{n}</span>
                      <h3 className="type-product text-white whitespace-pre-line leading-tight" style={{ fontSize: "22px" }}>{title.replace("\n", " ")}</h3>
                    </div>
                    <span className={`text-stone-400 text-xl transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}>
                    <p className="type-body text-stone-400">{desc}</p>
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
