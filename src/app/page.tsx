import Image from "next/image";
import HeroSplit from "./components/HeroSplit";
import ProjectsCarousel from "./components/ProjectsCarousel";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans), Arial, sans-serif" }}>

      {/* ── HERO (interactive reveal) ── */}
      <HeroSplit />

      {/* ── ABOUT ── */}
      <section className="bg-[#f5f0e8] py-20 px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-6">Atelier</p>
        <p className="text-3xl md:text-4xl font-light leading-snug max-w-2xl mx-auto text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          We source, procure and deliver exceptional furniture, lighting and objects for hospitality, commercial and residential spaces.
        </p>
      </section>

      {/* ── THE ATELIER DIFFERENCE ── */}
      <section className="bg-[#111110] py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-8">
          <div className="col-span-1 flex items-start pt-1">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 leading-relaxed">
              The Atelier<br />Difference
            </p>
          </div>
          {[
            { n: "01", title: "Curated\nGlobally", desc: "Access to leading manufacturers and emerging makers worldwide." },
            { n: "02", title: "Delivered\nEnd-to-End", desc: "From quotation through to delivery, we manage every detail." },
            { n: "03", title: "Hospitality\nFocused", desc: "Built around operational realities and the demands of hospitality." },
            { n: "04", title: "Bespoke\nSolutions", desc: "Tailored pieces and bespoke production to bring your vision to life." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="col-span-1">
              <p className="text-stone-500 text-xs mb-3">{n}</p>
              <h3 className="text-white text-xl font-light leading-snug mb-3 whitespace-pre-line" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                {title}
              </h3>
              <p className="text-stone-400 text-xs leading-relaxed mb-4">{desc}</p>
              <span className="text-stone-500 text-lg leading-none">+</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS CAROUSEL ── */}
      <ProjectsCarousel />

      {/* ── MATERIALS BANNER ── */}
      <section className="relative h-48 grid grid-cols-3 overflow-hidden">
        <div className="bg-gradient-to-r from-stone-200 to-stone-300" />
        <div className="bg-stone-800 flex flex-col items-center justify-center z-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-2">Materials</p>
          <p className="text-white text-xs tracking-[0.2em] uppercase">The foundation of every exceptional space.</p>
          <a href="#" className="arrow-link mt-3 text-[10px] tracking-[0.2em] uppercase text-white/50 border-b border-white/20 pb-px">
            Explore Materials &nbsp;<span className="arrow">→</span>
          </a>
        </div>
        <div className="bg-gradient-to-l from-stone-700 to-stone-800" />
      </section>

      {/* ── JOURNAL ── */}
      <section className="bg-[#f5f0e8] py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-2">
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">Journal</p>
              <h2 className="text-4xl font-light leading-tight text-stone-900 mb-6" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                Insights. Inspiration.<br />Ideas that shape spaces.
              </h2>
              <a href="#" className="arrow-link text-xs tracking-[0.2em] uppercase text-stone-700 border-b border-stone-400 pb-px">
                View All Articles &nbsp;<span className="arrow">→</span>
              </a>
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-4">
              {[
                { title: "Design Notes", desc: "Timeless materials and considered details." },
                { title: "Project Spotlight", desc: "An inside look at our latest hospitality projects." },
                { title: "Material Stories", desc: "Exploring the craft and process behind the pieces." },
              ].map(({ title, desc }) => (
                <div key={title}>
                  <div className="h-36 bg-gradient-to-b from-stone-400 to-stone-600 mb-3" />
                  <p className="text-stone-900 text-sm font-medium mb-1">{title}</p>
                  <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0d0c0b] py-14 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-light text-white leading-snug" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Creating something<br />extraordinary?
            </h2>
          </div>
          <div className="flex items-stretch">
            <div className="w-px bg-white/15 mr-8" />
            <p className="text-stone-400 text-sm leading-relaxed">
              Whether it's a single room or an entire building, we help bring your vision to life with precision and care.
            </p>
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              className="arrow-link border border-white/30 text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Start Your Project &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0908] px-8 pt-20 pb-0">
        <div className="max-w-6xl mx-auto">
          {/* Main footer grid: logo | nav | contact */}
          <div className="grid grid-cols-3 gap-0">

            {/* Left: Logo + tagline */}
            <div className="flex flex-col items-center justify-center text-center pr-12 border-r border-white/10">
              <Image src="/Atelier-logo.png" alt="Atelier" width={160} height={64} className="object-contain mb-5" />
              <p className="text-stone-400 text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                Furniture, lighting and objects<br />for exceptional spaces.
              </p>
            </div>

            {/* Center: Nav links */}
            <div className="flex flex-col items-center justify-center gap-5 px-12 border-r border-white/10">
              {["Collections", "Classic", "Signature", "Projects", "Brands", "Journal", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-stone-300 text-xs tracking-[0.25em] uppercase hover:text-[#b8934a] transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>

            {/* Right: Contact */}
            <div className="flex flex-col justify-center pl-12 gap-0">
              <p className="text-[#b8934a] text-[10px] tracking-[0.3em] uppercase mb-4">Contact</p>

              <p className="text-white text-sm leading-relaxed mb-4">
                Level 1, Suite X<br />Revesby NSW 2212
              </p>
              <div className="w-8 h-px bg-white/20 mb-4" />

              <p className="text-white text-sm mb-4">+61 2 8123 4567</p>
              <div className="w-8 h-px bg-white/20 mb-4" />

              <p className="text-white text-sm mb-6">hello@ateliersupplygroup.com.au</p>
              <div className="w-8 h-px bg-white/20 mb-5" />

              {/* Socials */}
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors group">
                  <svg className="w-5 h-5 text-[#b8934a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                  </svg>
                  <span className="text-xs tracking-[0.2em] uppercase">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors group">
                  <svg className="w-5 h-5 text-[#b8934a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="1.5" />
                    <path d="M7 10v7M7 7v.5M12 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M17 10v7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs tracking-[0.2em] uppercase">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-between items-center border-t border-white/10 mt-16 py-6">
            <p className="text-stone-600 text-[10px] tracking-[0.1em]">© 2026 Atelier Supply Group Pty Ltd</p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-stone-600 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-stone-700">|</span>
              <a href="#" className="text-stone-600 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
