"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { projectMeta, type Project } from "@/lib/projects";
import { useT } from "./ContentProvider";

type Card = { name: string; location: string; img: string; href: string };

// Shown until real projects are published, so the homepage is never empty.
const PLACEHOLDERS: Card[] = [
  { name: "Building 1", location: "Burwood, Sydney", img: "/Atelier_First_Project_Card.jpg", href: "/projects" },
  { name: "Building 2", location: "Sydney CBD", img: "/Atelier_Second_Project_Card.jpg", href: "/projects" },
  { name: "Building 3", location: "Vaucluse, Sydney", img: "/Atelier_Third_Project_Card.jpg", href: "/projects" },
  { name: "Building 4", location: "Sydney NSW", img: "/Atelier_Fourth_Project_Card.jpg", href: "/projects" },
  { name: "Boutique Project", location: "Sydney CBD", img: "/project-boutique.jpg", href: "/projects" },
];

export default function ProjectsCarousel({ items = [] }: { items?: Project[] }) {
  const t = useT();
  const viewAll = t("home.projects.link") || "/projects";
  const projects: Card[] = items.length
    ? items.map((p) => ({ name: p.title, location: projectMeta(p), img: p.coverImage, href: `/projects/${p.slug}` }))
    : PLACEHOLDERS;
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visibleCount = isMobile ? 1 : 4;
  const max = projects.length - visibleCount;
  const cardPct = isMobile ? 100 : 25;

  const prev = () => setIndex(i => Math.max(i - 1, 0));
  const next = () => setIndex(i => Math.min(i + 1, max));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <section className="bg-[#ede8df] pt-16 pb-0">
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
              <Link href={viewAll} className="arrow-link type-button text-stone-700 border-b border-stone-400 pb-px">
                View All Projects &nbsp;<span className="arrow">→</span>
              </Link>
              <div className="flex gap-2">
                <button onClick={prev} disabled={index === 0} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all">‹</button>
                <button onClick={next} disabled={index >= max} className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-700 hover:text-stone-700 disabled:opacity-30 transition-all">›</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ touchAction: "pan-y" }}>
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${index} * ${cardPct}%))` }}
        >
          {projects.map(({ name, location, img, href }) => (
            <Link key={name} href={href} className="flex-none w-full md:w-1/4">
              <div className="relative h-[420px] overflow-hidden group cursor-pointer bg-stone-300">
                {img && <Image src={img} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover object-center" />}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="type-product text-white mb-1" style={{ fontSize: "clamp(20px, 2.5vw, 36px)" }}>{name}</p>
                  {location && <p className="type-body text-white/45">{location}</p>}
                  <span className="arrow-link type-button text-white border-b border-white/25 pb-px w-fit mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Project &nbsp;<span className="arrow">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile dot indicators */}
      {isMobile && (
        <div className="flex justify-center gap-2 py-4">
          {projects.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-stone-700" : "bg-stone-300"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
