"use client";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useBasket } from "../context/BasketContext";
import { useCustomCategories } from "./CategoriesProvider";

const NAV_LINKS: Record<string, string> = {
  "Classic": "/classic",
  "Signature": "/signature",
  "How We Work": "/#how-we-work",
  "Request a Quote": "/quote",
  "Projects": "/projects",
  "Journal": "/journal",
  "About": "/about",
  "Contact": "/contact",
};

const SIGNATURE_CATEGORIES = [
  { label: "Windows & Doors", href: "/signature/windows-doors" },
];

const CLASSIC_CATEGORIES = [
  { label: "Windows & Doors", href: "/classic/windows-doors" },
  { label: "Custom Joinery", href: "/classic/joinery" },
  { label: "Bathroom Packages", href: "/classic/bathrooms" },
];

const ABOUT_LINKS = [
  { label: "Our Story", href: "/about#our-story" },
  { label: "Capability Statement", href: "/about#capability-statement" },
  { label: "Our Process", href: "/about#our-process" },
  { label: "Projects", href: "/projects" },
  { label: "Journal", href: "/journal" },
  { label: "Contact Us", href: "/contact" },
];

function NavDropdown({ label, align = "left", light = false }: { label: string; align?: "left" | "right"; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const page = NAV_LINKS[label] ?? "#";
  // Classic lists the built-in categories plus admin-created ones marked "show in navigation".
  // A category still being prepared stays out of the menu until it opens.
  const customNav = useCustomCategories().filter((c) => c.showInNav && !c.comingSoon).map((c) => ({ label: c.label, href: `/classic/${c.slug}` }));
  const cats = label === "Signature" ? SIGNATURE_CATEGORIES : label === "About" ? ABOUT_LINKS : [...CLASSIC_CATEGORIES, ...customNav];

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a href={page} className={`type-nav transition-colors duration-300 relative px-3 py-1.5 rounded-sm flex items-center gap-1.5 ${light ? "text-stone-600 hover:text-stone-900 hover:bg-stone-900/5" : "text-white/70 hover:text-white hover:bg-white/8 hover:[box-shadow:0_0_18px_6px_rgba(255,255,255,0.06)]"}`}>
        {label}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
      <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} pt-2 transition-all duration-200 ${open ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"}`}>
        <div className="bg-[#f5f0e8] border border-stone-200 rounded-xl py-2 min-w-[200px]">
          {cats.map(cat => (
            <a key={cat.label} href={cat.href} className="block px-5 py-2.5 type-nav text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors duration-150">{cat.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SiteHeaderProps {
  /** "overlay" = absolute, transparent, white text (hero usage)
   *  "solid"   = dark bg, white text, scrolls with the page (standalone pages) */
  variant?: "overlay" | "solid";
  menuOpenState?: [boolean, (v: boolean) => void];
  /** When set, replaces left nav with a breadcrumb: SIGNATURE → {breadcrumb} */
  breadcrumb?: string;
}

export default function SiteHeader({ variant = "solid", menuOpenState, breadcrumb }: SiteHeaderProps) {
  const [_menuOpen, _setMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = menuOpenState ?? [_menuOpen, _setMenuOpen];

  const isOverlay = variant === "overlay";
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { count } = useBasket();

  return (
    <>
      <header
        className={`${isOverlay ? "absolute" : "relative"} left-0 right-0 z-50 flex items-center px-6 md:px-8 py-6 ${!isOverlay ? "bg-[#2c2620]" : ""}`}
      >
        <nav className="hidden md:flex flex-1 items-center gap-8">
          <NavDropdown label="Classic" />
          <NavDropdown label="Signature" />
        </nav>
        <div className="flex md:hidden flex-1" />
        <div className="flex justify-center">
          <a href="/" className="group relative">
            <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
            {!isHome && (
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#f5f0e8] text-stone-700 type-label px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Go home
              </span>
            )}
          </a>
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-end gap-8">
          <NavDropdown label="About" align="right" />
          <a href="/quote" className="type-nav text-white border border-white/40 px-5 py-2 rounded-sm hover:bg-white hover:text-black transition-all duration-300 hover:[box-shadow:0_0_20px_6px_rgba(255,255,255,0.12)] whitespace-nowrap">Request a Quote</a>
          <a href="/quote" className="relative text-white/70 hover:text-white transition-colors duration-300 p-1" aria-label="Quote">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b8934a] text-white rounded-full flex items-center justify-center" style={{ width: "16px", height: "16px", fontFamily: "var(--font-sans)" }}>
                {count > 99 ? "99" : count}
              </span>
            )}
          </a>
        </nav>
        <div className="flex md:hidden flex-1 justify-end">
          <button className="relative z-50 flex flex-col items-center justify-center gap-[5px] w-11 h-11 -mr-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/90 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {Object.entries(NAV_LINKS).map(([label, href]) => (
          // The padding carries the gap, so each link is a full-height target
          // rather than a 22px line of text with space around it.
          <a key={label} href={href} className="type-nav text-white/70 hover:text-white transition-colors py-3 px-6 min-h-11 flex items-center" onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
      </div>
    </>
  );
}
