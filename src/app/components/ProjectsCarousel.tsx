"use client";
import { useRef, useState } from "react";

const projects = [
  { name: "ETCETERA", type: "Hospitality", location: "Burwood, Sydney", img: "/project-etcetera.jpg" },
  { name: "Restaurant Project", type: "Hospitality", location: "Dubai", img: "/project-restaurant.jpg" },
  { name: "Residence Project", type: "Residential", location: "Vaucluse, Sydney", img: "/project-residence.jpg" },
  { name: "Hotel Project", type: "Hospitality", location: "Beirut", img: "/project-hotel.jpg" },
  { name: "Boutique Project", type: "Commercial", location: "Sydney CBD", img: "/project-boutique.jpg" },
];

export default function ProjectsCarousel() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const visible = 4;
  const max = projects.length - visible;

  const prev = () => setIndex(i => Math.max(i - 1, 0));
  const next = () => setIndex(i => Math.min(i + 1, max));

  return (
    <section className="bg-[#f5f0e8] pt-16 pb-0">
      {/* Header */}
      <div className="px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">Projects</p>
            <h2 className="text-5xl font-light leading-tight text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Spaces that<br />inspire.
            </h2>
          </div>
          <div className="flex flex-col justify-between">
            <p className="text-sm text-stone-600 leading-relaxed max-w-xs">
              We collaborate with leading architects, designers and developers to deliver timeless interiors across hospitality, commercial and residential spaces.
            </p>
            <div className="flex items-center justify-between mt-4">
              <a href="#" className="text-xs tracking-[0.2em] uppercase text-stone-700 border-b border-stone-400 pb-px">
                View All Projects &nbsp;→
              </a>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  disabled={index >= max}
                  className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards track */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${index} * 25%))` }}
        >
          {projects.map(({ name, type, location, img }) => (
            <div
              key={name}
              className="flex-none w-1/4"
            >
              <div className="relative h-[420px] flex flex-col justify-end p-6 overflow-hidden group cursor-pointer" style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="relative z-10">
                  <p className="text-white text-base font-light mb-1" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>{name}</p>
                  <p className="text-white/60 text-xs mb-[2px]">{type}</p>
                  <p className="text-white/45 text-xs mb-5">{location}</p>
                  <a href="#" className="flex items-center gap-2 text-white text-[10px] tracking-[0.18em] uppercase border-b border-white/25 pb-px w-fit">
                    View Project &nbsp;→
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
