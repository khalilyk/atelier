import Image from "next/image";
import HeroSplit from "./components/HeroSplit";
import ProjectsCarousel from "./components/ProjectsCarousel";

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <HeroSplit />

      {/* ── ABOUT ── */}
      <section className="bg-[#f5f0e8] py-24 px-8 text-center">
        <p className="type-label text-stone-500 mb-8">Atelier</p>
        <p className="type-large text-stone-900 max-w-3xl mx-auto">
          We source, procure and deliver exceptional furniture, lighting and objects for hospitality, commercial and residential spaces.
        </p>
      </section>

      {/* ── THE ATELIER DIFFERENCE ── */}
      <section className="bg-[#111110] py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-8">
          <div className="col-span-1 flex items-start pt-1">
            <p className="type-label text-stone-500 leading-relaxed">The Atelier<br />Difference</p>
          </div>
          {[
            { n: "01", title: "Curated\nGlobally", desc: "Access to leading manufacturers and emerging makers worldwide." },
            { n: "02", title: "Delivered\nEnd-to-End", desc: "From quotation through to delivery, we manage every detail." },
            { n: "03", title: "Hospitality\nFocused", desc: "Built around operational realities and the demands of hospitality." },
            { n: "04", title: "Bespoke\nSolutions", desc: "Tailored pieces and bespoke production to bring your vision to life." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="col-span-1">
              <p className="type-label text-stone-500 mb-4">{n}</p>
              <h3 className="type-product text-white mb-4 whitespace-pre-line">{title}</h3>
              <p className="type-body text-stone-400 mb-5">{desc}</p>
              <span className="text-stone-500 text-lg">+</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS CAROUSEL ── */}
      <ProjectsCarousel />

      {/* ── MATERIALS BANNER ── */}
      <section className="relative h-48 grid grid-cols-3 overflow-hidden">
        <div className="bg-gradient-to-r from-stone-200 to-stone-300" />
        <div className="bg-stone-800 flex flex-col items-center justify-center z-10 gap-3">
          <p className="type-label text-white/50">Materials</p>
          <p className="type-body text-white text-center">The foundation of every exceptional space.</p>
          <a href="#" className="arrow-link type-button text-white/50 border-b border-white/20 pb-px">
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
              <p className="type-label text-stone-500 mb-6">Journal</p>
              <h2 className="type-large text-stone-900 mb-8">
                Insights. Inspiration.<br />Ideas that shape spaces.
              </h2>
              <a href="#" className="arrow-link type-button text-stone-700 border-b border-stone-400 pb-px">
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
                  <div className="h-36 bg-gradient-to-b from-stone-400 to-stone-600 mb-4" />
                  <p className="type-product text-stone-900 mb-2">{title}</p>
                  <p className="type-body text-stone-500">{desc}</p>
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
            <h2 className="type-heading text-white">
              Creating something<br />extraordinary?
            </h2>
          </div>
          <div className="flex items-stretch">
            <div className="w-px bg-white/15 mr-8" />
            <p className="type-intro text-stone-400">
              Whether it's a single room or an entire building, we help bring your vision to life with precision and care.
            </p>
          </div>
          <div className="flex justify-end">
            <a href="#" className="arrow-link type-button border border-white/30 text-white px-8 py-4 hover:bg-white hover:text-black transition-colors">
              Start Your Project &nbsp;<span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0908] px-8 pt-20 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-0">

            {/* Logo + tagline */}
            <div className="flex flex-col items-center justify-center text-center pr-12 border-r border-white/10">
              <Image src="/Atelier-logo.png" alt="Atelier" width={160} height={64} className="object-contain mb-5" />
              <p className="type-intro text-stone-400">
                Furniture, lighting and objects<br />for exceptional spaces.
              </p>
            </div>

            {/* Nav links */}
            <div className="flex flex-col items-start justify-center gap-5 px-12 border-r border-white/10">
              {["Collections", "Classic", "Signature", "Projects", "Brands", "Journal", "Contact"].map((l) => (
                <a key={l} href="#" className="type-nav text-stone-300 hover:text-[#b8934a] transition-colors">{l}</a>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col justify-center pl-12">
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
          <div className="flex justify-between items-center border-t border-white/10 mt-16 py-6">
            <p className="type-body text-stone-600">© 2026 Atelier Supply Group Pty Ltd</p>
            <div className="flex items-center gap-3">
              <a href="#" className="type-nav text-stone-600 hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-stone-700">|</span>
              <a href="#" className="type-nav text-stone-600 hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
