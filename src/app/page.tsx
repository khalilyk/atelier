import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans), Arial, sans-serif" }}>

      {/* ── NAV ── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <div />
        <Image src="/Atelier-logo.png" alt="Atelier" width={120} height={48} className="object-contain" priority />
        <button className="flex items-center gap-2 text-white/70 text-xs tracking-[0.2em] uppercase">
          Menu
          <span className="flex flex-col gap-[3px]">
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-4 h-px bg-white/70" />
            <span className="block w-3 h-px bg-white/70" />
          </span>
        </button>
      </header>

      {/* ── HERO SPLIT ── */}
      <section className="grid grid-cols-2 h-screen">
        {/* Classic — warm left */}
        <div
          className="relative flex flex-col justify-end p-12 pb-16 overflow-hidden"
          style={{ background: "linear-gradient(160deg,#c8b89a 0%,#8a7560 100%)" }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h1 className="text-white text-6xl font-light tracking-[0.18em] uppercase mb-3" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Classic
            </h1>
            <div className="w-8 h-px bg-white/60 mb-4" />
            <p className="text-white/80 text-sm leading-relaxed max-w-xs mb-6">
              Reserved for the exceptional.<br />
              Furniture, lighting and objects<br />
              curated for everyday excellence.
            </p>
            <a href="#" className="flex items-center gap-2 text-white text-xs tracking-[0.2em] uppercase border-b border-white/40 pb-px w-fit">
              Explore Classic &nbsp;→
            </a>
          </div>
        </div>

        {/* Signature — dark right */}
        <div
          className="relative flex flex-col justify-end p-12 pb-16 overflow-hidden"
          style={{ background: "linear-gradient(160deg,#2a2520 0%,#0d0c0b 100%)" }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10">
            <h1 className="text-white text-6xl font-light tracking-[0.18em] uppercase mb-3" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Signature
            </h1>
            <div className="w-8 h-px bg-white/40 mb-4" />
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-6">
              A collection of exceptional pieces,<br />
              bespoke sourcing and elevated<br />
              design solutions for<br />
              landmark spaces.
            </p>
            <a href="#" className="flex items-center gap-2 text-white text-xs tracking-[0.2em] uppercase border-b border-white/30 pb-px w-fit">
              Explore Signature &nbsp;→
            </a>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="bg-[#f5f0e8] py-20 px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-6">Atelier</p>
        <p className="text-3xl md:text-4xl font-light leading-snug max-w-2xl mx-auto text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          We source, procure and deliver exceptional furniture, lighting and objects for hospitality, commercial and residential spaces.
        </p>
        <div className="w-px h-12 bg-stone-300 mx-auto mt-10" />
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

      {/* ── PROJECTS ── */}
      <section className="bg-[#f5f0e8] pt-16 pb-0">
        <div className="px-8 max-w-6xl mx-auto">
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
                  <button className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-600 transition-colors">‹</button>
                  <button className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-600 transition-colors">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-4">
          {[
            { name: "ETCETFRA", type: "Hospitality", location: "Burwood, Sydney", bg: "from-stone-800 to-stone-900" },
            { name: "Restaurant Project", type: "Hospitality", location: "Dubai", bg: "from-stone-700 to-stone-900" },
            { name: "Residence Project", type: "Residential", location: "Vaucluse, Sydney", bg: "from-zinc-700 to-zinc-900" },
            { name: "Hotel Project", type: "Hospitality", location: "Beirut", bg: "from-neutral-700 to-neutral-900" },
          ].map(({ name, type, location, bg }) => (
            <div key={name} className={`relative h-80 bg-gradient-to-b ${bg} flex flex-col justify-end p-6 overflow-hidden group`}>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10">
                <p className="text-white text-sm font-medium mb-1">{name}</p>
                <p className="text-white/60 text-xs mb-1">{type}</p>
                <p className="text-white/50 text-xs mb-4">{location}</p>
                <a href="#" className="text-white text-xs tracking-[0.15em] uppercase border-b border-white/30 pb-px">
                  View Project &nbsp;→
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MATERIALS BANNER ── */}
      <section className="relative h-48 grid grid-cols-3 overflow-hidden">
        <div className="bg-gradient-to-r from-stone-200 to-stone-300" />
        <div className="bg-stone-800 flex flex-col items-center justify-center z-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-2">Materials</p>
          <p className="text-white text-xs tracking-[0.2em] uppercase">The foundation of every exceptional space.</p>
          <a href="#" className="mt-3 text-[10px] tracking-[0.2em] uppercase text-white/50 border-b border-white/20 pb-px">
            Explore Materials &nbsp;→
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
              <a href="#" className="text-xs tracking-[0.2em] uppercase text-stone-700 border-b border-stone-400 pb-px">
                View All Articles &nbsp;→
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
      <section className="bg-[#111110] py-14 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-light text-white leading-snug" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
              Creating something<br />extraordinary?
            </h2>
          </div>
          <div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Whether you're opening a restaurant, building a home or shaping a hospitality destination, Atelier helps bring the vision together.
            </p>
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              className="border border-white/30 text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Start Your Project &nbsp;→
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0d0c0b] pt-14 pb-8 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Top footer grid */}
          <div className="grid grid-cols-4 gap-8 mb-12">
            {/* Logo + tagline */}
            <div>
              <div className="mb-3">
                <Image src="/Atelier-logo.png" alt="Atelier" width={100} height={40} className="object-contain" />
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                Furniture, lighting and objects<br />for exceptional spaces.
              </p>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-2 col-span-2 gap-4 pt-1">
              <div className="flex flex-col gap-3">
                {["Classic", "Signature", "Brands"].map((l) => (
                  <a key={l} href="#" className="text-stone-400 text-xs tracking-[0.15em] uppercase hover:text-white transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {["Projects", "Journal", "Contact"].map((l) => (
                  <a key={l} href="#" className="text-stone-400 text-xs tracking-[0.15em] uppercase hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-stone-500 text-xs leading-relaxed mb-4">
                Level 1, Suite X<br />
                Revesby NSW 2212
              </p>
              <p className="text-stone-500 text-xs mb-1">+61 2 8123 4567</p>
              <p className="text-stone-500 text-xs mb-4">hello@ateliersupplygroup.com.au</p>
              <div className="flex gap-4">
                <a href="#" className="text-stone-500 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-stone-500 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-between items-center border-t border-stone-800 pt-6">
            <p className="text-stone-600 text-[10px]">© 2026 Atelier Supply Group Pty Ltd</p>
            <div className="flex gap-6">
              <a href="#" className="text-stone-600 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-stone-600 text-[10px] tracking-[0.15em] uppercase hover:text-white transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
