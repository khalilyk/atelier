"use client";
import Image from "next/image";
import FooterModals from "./FooterModals";
import { useCompany } from "./CompanyProvider";
import { useFooterPages } from "./CustomPagesProvider";

export default function SiteFooter() {
  const c = useCompany();
  const extraPages = useFooterPages();
  const igHandle = (c.instagram || "").replace(/^@/, "");
  const igUrl = igHandle ? `https://www.instagram.com/${igHandle}` : "";
  const year = 2026;
  return (
    <footer className="bg-[#2c2620] px-6 md:px-8 pt-16 md:pt-20 pb-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-12 md:gap-0">

          <div className="flex flex-col items-center text-center md:pr-12">
            <Image src="/Atelier-logo.png" alt="Atelier" width={160} height={64} className="object-contain mb-5" />
            <p className="type-intro text-stone-400 text-balance" style={{ fontSize: "clamp(12px, 1.3vw, 14px)", lineHeight: 1.6, maxWidth: "22rem" }}>
              Windows, doors, custom joinery and coordinated bathroom packages for Australian projects.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4 md:gap-5 md:px-12 md:justify-center">
            {([
              ["Classic", "/classic"], ["Signature", "/signature"], ["How We Work", "/#how-we-work"],
              ["Projects", "/projects"], ["Journal", "/journal"], ["About", "/about"], ["Contact", "/contact"],
              // Pages you created and marked to show in the footer.
              ...extraPages.map((p) => [p.title, `/${p.slug}`] as [string, string]),
            ] as [string, string][]).map(([label, href]) => (
              <a key={href} href={href} className="type-nav text-stone-300 hover:text-[#b8934a] transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center md:pl-12">
            <p className="type-label text-[#b8934a] mb-5">Contact</p>
            <p className="type-body text-white mb-4">{c.location}</p>
            <div className="w-8 h-px bg-white/20 mb-4" />
            <p className="type-body text-white mb-4">{c.phone}</p>
            <div className="w-8 h-px bg-white/20 mb-4" />
            <p className="type-body text-white mb-6">{c.email}</p>
            <div className="w-8 h-px bg-white/20 mb-5" />
            <div className="flex flex-col gap-3">
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors">
                <svg className="w-5 h-5 text-[#b8934a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
                <span className="type-nav">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start items-center text-center md:text-left mt-12 md:mt-16 pt-6 gap-4">
          <p className="type-body text-stone-500" style={{ fontSize: "13px" }}>© {year} {c.name} · <span className="whitespace-nowrap">{c.abn}</span></p>
          <FooterModals />
        </div>

        {/* Its own line, centred across the page. */}
        <div className="text-center pt-4 pb-6">
          <a href="https://bybric.com" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors" style={{ fontFamily: "var(--font-neue)", fontWeight: 400, lineHeight: 1.8, fontSize: "14px" }}>made by bric</a>
        </div>
      </div>
    </footer>
  );
}
