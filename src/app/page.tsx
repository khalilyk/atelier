import Image from "next/image";
import HeroSplit from "./components/HeroSplit";
import ProjectsCarousel from "./components/ProjectsCarousel";
import FooterModals from "./components/FooterModals";
import AtelierDifference from "./components/AtelierDifference";
import HowWeWork from "./components/HowWeWork";

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <HeroSplit />

      {/* ── ABOUT ── */}
      <section className="bg-[#f5f0e8] py-16 md:py-24 px-6 md:px-8 text-center">
        <p className="type-label text-stone-500 mb-8">Atelier</p>
        <p className="type-large text-stone-900 max-w-3xl mx-auto" style={{ fontSize: "clamp(28px, 4vw, 54px)" }}>
          We source, procure and deliver exceptional furniture, lighting and objects for commercial and residential spaces.
        </p>
      </section>

      {/* ── THE ATELIER DIFFERENCE ── */}
      <AtelierDifference />

      {/* ── PROJECTS CAROUSEL ── */}
      <ProjectsCarousel />

      {/* ── HOW WE WORK ── */}
      <HowWeWork />

      {/* ── BEIGE BREAK ── */}
      <div className="h-16 bg-[#f5f0e8]" />

      {/* ── MATERIALS BANNER ── */}
      <section className="relative h-48 overflow-hidden" style={{ backgroundImage: "url('/Atelier_Materials.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3" style={{ paddingTop: "20px" }}>
          <p className="type-label text-white/50">Materials</p>
          <p className="type-body text-white text-center">The foundation of every exceptional space.</p>
          <a href="#" className="arrow-link type-button text-white/50 border-b border-white/20 pb-px">
            Explore Materials &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      {/* ── JOURNAL ── */}
      <section className="bg-[#f5f0e8] py-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
            <div className="md:col-span-2">
              <p className="type-label text-stone-500 mb-6">Journal</p>
              <h2 className="type-large text-stone-900 mb-8" style={{ fontSize: "clamp(32px, 4vw, 72px)" }}>
                Insights. Inspiration.<br />Ideas that shape spaces.
              </h2>
              <a href="#" className="arrow-link type-button text-stone-700 border-b border-stone-400 pb-px">
                View All Articles &nbsp;<span className="arrow">→</span>
              </a>
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-4">
              {[
                { title: "Design Notes", desc: "Timeless materials and considered details." },
                { title: "Project Spotlight", desc: "An inside look at our latest projects." },
                { title: "Material Stories", desc: "Exploring the craft and process behind the pieces." },
              ].map(({ title, desc }) => (
                <div key={title}>
                  <div className="h-36 bg-gradient-to-b from-stone-400 to-stone-600 mb-4" />
                  <p className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(20px, 2.5vw, 36px)" }}>{title}</p>
                  <p className="type-body text-stone-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#2c1f14] py-14 px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-8 md:items-center">
          <div>
            <h2 className="type-heading text-white" style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}>
              Creating something<br />extraordinary?
            </h2>
          </div>
          <div className="flex items-start md:items-stretch">
            <div className="w-px bg-white/15 mr-6 md:mr-8 shrink-0" />
            <p className="type-intro text-stone-400" style={{ fontSize: "clamp(16px, 1.5vw, 20px)" }}>
              Whether it's a single room or an entire building, we help bring your vision to life with precision and care.
            </p>
          </div>
          <div className="flex md:justify-end">
            <a href="#" className="arrow-link type-button border border-white/30 text-white px-8 py-4 hover:bg-white hover:text-black transition-colors">
              Start Your Project &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0908] px-6 md:px-8 pt-16 md:pt-20 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-12 md:gap-0">

            {/* Logo + tagline */}
            <div className="flex flex-col items-center text-center md:pr-12 md:border-r md:border-white/10">
              <Image src="/Atelier-logo.png" alt="Atelier" width={160} height={64} className="object-contain mb-5" />
              <p className="type-intro text-stone-400" style={{ fontSize: "clamp(14px, 1.5vw, 20px)" }}>
                Furniture, lighting and objects<br />for exceptional spaces.
              </p>
            </div>

            {/* Nav links */}
            <div className="flex flex-col items-center md:items-start gap-4 md:gap-5 md:px-12 md:border-r md:border-white/10 md:justify-center">
              {["Classic", "Signature", "How We Work", "Products", "Source Anything", "About", "Journal", "Contact"].map((l) => (
                <a key={l} href="#" className="type-nav text-stone-300 hover:text-[#b8934a] transition-colors">{l}</a>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center md:pl-12">
              <p className="type-label text-[#b8934a] mb-5">Contact</p>
              <p className="type-body text-white mb-4">Level 1, Suite X<br />Revesby NSW 2212</p>
              <div className="w-8 h-px bg-white/20 mb-4" />
              <p className="type-body text-white mb-4">+61 2 8123 4567</p>
              <div className="w-8 h-px bg-white/20 mb-4" />
              <p className="type-body text-white mb-6">hello@ateliersupplygroup.com.au</p>
              <div className="w-8 h-px bg-white/20 mb-5" />
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-[#b8934a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                  </svg>
                  <span className="type-nav">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-[#b8934a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="1.5" />
                    <path d="M7 10v7M7 7v.5M12 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M17 10v7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="type-nav">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center items-center text-center md:text-left border-t border-white/10 mt-12 md:mt-16 py-6 gap-4">
            <div>
              <p className="type-body text-stone-600">© 2026 Atelier Supply Group Pty Ltd</p>
              <a href="https://thisisnn.com" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-white transition-colors" style={{ fontFamily: "var(--font-neue)", fontSize: "16px", fontWeight: 400, lineHeight: 1.8 }}>made by nn</a>
            </div>
            <FooterModals />
          </div>
        </div>
      </footer>

    </div>
  );
}
