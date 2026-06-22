"use client";
import { useRef, useState } from "react";

const projects = [
  { name: "ETCETERA", type: "", location: "Burwood, Sydney", img: "/Atelier_First_Project_Card.jpg" },
  { name: "Restaurant Project", type: "", location: "Sydney CBD", img: "/Atelier_Second_Project_Card.jpg" },
  { name: "Residence Project", type: "Residential", location: "Vaucluse, Sydney", img: "/Atelier_Third_Project_Card.jpg" },
  { name: "Hotel Project", type: "", location: "Sydney NSW", img: "/Atelier_Fourth_Project_Card.jpg" },
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
      <div className="px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          <div>
            <p className="type-label text-stone-500 mb-5">Projects</p>
            <h2 className="type-large text-stone-900" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>Spaces that<br />inspire.</h2>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <p className="type-intro text-stone-600 max-w-xs" style={{ fontSize: "clamp(15px, 1.5vw, 20px)" }}>
              We collaborate with leading architects, designers and developers to deliver timeless interiors across commercial and residential spaces.
            </p>
            <div className="flex items-center justify-between">
              <a href="#" className="arrow-link type-button text-stone-700 border-b border-stone-400 pb-px">
                View All Projects &nbsp;<span className="arrow">→</span>
              </a>
              <div className="flex gap-2">
                <button onClick={prev} disabled={index === 0} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all">‹</button>
                <button onClick={next} disabled={index >= max} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all">›</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards — native scroll snap on mobile, JS-driven on desktop */}
      <div className="md:overflow-hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div
          ref={trackRef}
          className="flex md:transition-transform md:duration-500 md:ease-in-out"
          style={{ transform: `translateX(calc(-${index} * 25%))` }}
        >
          {projects.map(({ name, location, img }) => (
            <div key={name} className="flex-none w-[85vw] md:w-1/4 snap-start">
              <div className="relative h-[420px] overflow-hidden group cursor-pointer" style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="type-product text-white mb-1" style={{ fontSize: "clamp(20px, 2.5vw, 36px)" }}>{name}</p>
                  {location && <p className="type-body text-white/45">{location}</p>}
                  <a href="#" className="arrow-link type-button text-white border-b border-white/25 pb-px w-fit mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Project &nbsp;<span className="arrow">→</span>
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
