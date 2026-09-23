"use client";
import { useState } from "react";
import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { COLLECTION_INTRO, listProducts } from "../data";

const TECH = [
  { label: "Performance", desc: "Thermal efficiency, acoustic control and weather protection." },
  { label: "Materials & Finishes", desc: "Premium materials and finishes selected for longevity." },
  { label: "Installation", desc: "Guidance, details and best practice for installation." },
  { label: "Downloads", desc: "Technical documents, CAD files and care & maintenance." },
];

function TechItem({ label, desc }: { label: string; desc: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className=" pt-5 pb-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left">
        <span className="type-label text-white/60" style={{ letterSpacing: "0.1em" }}>{label.toUpperCase()}</span>
        <span className={`text-white/40 text-xl transition-transform duration-300 flex-shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="type-body text-stone-500 mt-3" style={{ lineHeight: 1.8 }}>{desc}</p>}
    </div>
  );
}

function OptionAccordion({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.03] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 text-left px-6 md:px-8 py-6">
        <div>
          <h3 className="type-product text-white" style={{ fontSize: "clamp(17px, 1.8vw, 21px)", lineHeight: 1.2 }}>{title}</h3>
          <p className="type-body text-white/50 mt-1" style={{ fontSize: "13px" }}>{subtitle}</p>
        </div>
        <span className={`text-[#b8934a] text-2xl transition-transform duration-300 shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "400px" : "0" }}>
        <div className="px-6 md:px-8 pb-7 pt-1 type-body text-white/65" style={{ lineHeight: 1.85, fontSize: "14px" }}>{children}</div>
      </div>
    </div>
  );
}

// Same structure as the Classic windows "Specification & Options" section, in the Signature palette.
function SpecsOptions() {
  const FEATURES = [
    { title: "Colours & Finishes", desc: "Architectural powdercoat and anodised finishes, specified to suit the architecture of each project.", href: "/classic/colour-card", cta: "View the Colour Card", img: "/Signature Luxe.png" },
    { title: "Door Hardware & Accessories", desc: "Handles, locks and operating hardware from leading architectural manufacturers, selected to suit your systems.", href: "/classic/door-hardware", cta: "View the Hardware Collection", img: "/Atelier_Signature.png" },
  ];
  return (
    <section className="px-6 md:px-8 py-20 md:py-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>SPECS &amp; OPTIONS</span>
          <div className="h-px bg-white/15 w-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {FEATURES.map((f) => (
            <a key={f.href} href={f.href} className="group relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-[300px] md:min-h-[340px] px-8 py-10">
              <Image src={f.img} alt={f.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors duration-500" />
              <div className="relative z-10 max-w-sm">
                <h3 className="text-white mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 300, lineHeight: 1.1 }}>{f.title}</h3>
                <p className="type-body text-white/80 mb-6" style={{ lineHeight: 1.7, fontSize: "13.5px" }}>{f.desc}</p>
                <span className="arrow-link type-button text-white border-b border-white/50 pb-px w-fit" style={{ letterSpacing: "0.1em" }}>{f.cta} &nbsp;<span className="arrow">→</span></span>
              </div>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <OptionAccordion title="Flyscreens" subtitle="Integrated protection without compromising the view">
            <p className="mb-3">Available configurations include fixed, sliding, rolling and retractable flyscreens, with mesh options including fibreglass, 304 stainless steel and aluminium.</p>
            <p>Flyscreens can be specified alongside your windows and doors to create a coordinated, complete package for your project.</p>
          </OptionAccordion>
          <OptionAccordion title="Glass Options" subtitle="Glazing specified for performance, comfort and compliance">
            <p className="mb-3">Available options include single glazing, double glazing, Low-E glass, laminated glass, acoustic glass and obscure glass, with combinations selected to suit the application.</p>
            <p>Glazing is specified to meet the project&rsquo;s BASIX/NatHERS requirements and applicable AS 1288 requirements, so the complete package is considered as part of the building&rsquo;s overall performance.</p>
          </OptionAccordion>
          <OptionAccordion title="Installation Materials" subtitle="Thought through beyond the window and door">
            <p className="mb-3">Options include subheads, subsills, flashings, angles, connection bars, fixing and packing components, seals, trims and timber reveals, selected to suit the system and project requirements.</p>
            <p>Considering these components at specification stage reduces last-minute sourcing, site improvisation and compatibility issues.</p>
          </OptionAccordion>
        </div>
      </div>
    </section>
  );
}

export default function SignatureWindowsDoorsPage() {
  const systems = listProducts("windows-doors");

  return (
    <div className="min-h-screen bg-[#0d0c0b]">
      <SiteHeader variant="solid" breadcrumb="Windows & Doors" />

      {/* ── HERO SPLIT ── */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "70vh" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#111110]">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>Signature Luxe</p>
          <h1 className="type-hero text-white uppercase mb-5" style={{ fontSize: "clamp(36px, 6vw, 80px)", lineHeight: 1.0, letterSpacing: "0.06em" }}>Windows &amp; Doors</h1>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <p className="type-body text-stone-400 mb-8 max-w-sm" style={{ lineHeight: 1.9 }}>
            {COLLECTION_INTRO[0]}
          </p>
          <a href="#systems" className="arrow-link type-button text-white/60 border-b border-white/25 pb-px w-fit hover:text-white transition-colors">
            View the Systems &nbsp;<span className="arrow">↓</span>
          </a>
        </div>
        <div className="relative min-h-[400px] md:min-h-0">
          <Image src="/products/Signature Luxe.png" alt="Windows & Doors" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </section>

      {/* ── COLLECTION DESCRIPTION ── */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "460px" }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24 bg-[#0d0c0b]">
          <div className="flex items-center gap-4 mb-10">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>THE COLLECTION</span>
            <div className="flex-1 h-px bg-white/10 max-w-[60px]" />
          </div>
          <h2 className="type-large text-white mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", lineHeight: 1.05 }}>Refined performance, uninterrupted views.</h2>
          {COLLECTION_INTRO.map((p, i) => (
            <p key={i} className="type-body text-stone-500 mb-5 last:mb-0" style={{ lineHeight: 1.9 }}>{p}</p>
          ))}
        </div>
        <div className="relative min-h-[360px] md:min-h-0">
          <Image src="/Classic.png" alt="Signature Luxe" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      </section>

      {/* ── OUR SYSTEMS ── */}
      <section id="systems" className="scroll-mt-24 py-20 md:py-28 px-6 md:px-8">
        <div className="flex items-center gap-4 mb-14">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>OUR SYSTEMS</span>
          <div className="h-px bg-white/10 w-16" />
          <span className="type-label text-white/30">{systems.length} systems</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {systems.map(({ slug, data }) => (
            <a key={slug} href={`/signature/windows-doors/${slug}`} className="group bg-[#111110] border border-white/8 rounded-2xl overflow-hidden flex flex-col hover:border-[#b8934a]/40 hover:-translate-y-1 transition-all duration-300">
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-stone-900">
                <Image src={data.heroImg} alt={data.name} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                {data.certification && (
                  <span className="absolute top-4 left-4 z-10 type-label text-white bg-black/45 backdrop-blur-sm px-3 py-1.5 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>{data.certification.toUpperCase()}</span>
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col gap-3 flex-1">
                <h3 className="type-product text-white group-hover:text-[#b8934a] transition-colors" style={{ letterSpacing: "0.06em", fontSize: "clamp(20px, 2vw, 28px)", lineHeight: 1.2 }}>{data.name}</h3>
                <p className="type-body text-stone-400" style={{ lineHeight: 1.7 }}>{data.tagline}</p>
                <span className="arrow-link type-button text-[#b8934a] transition-colors mt-auto pt-2" style={{ letterSpacing: "0.1em" }}>VIEW SYSTEM &nbsp;<span className="arrow">→</span></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── TECHNICAL INFORMATION ── */}
      <section className="px-6 md:px-8 py-14">
        <div className="flex items-center gap-4 mb-10">
          <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>TECHNICAL INFORMATION</span>
          <div className="h-px bg-white/10 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {TECH.map(t => (
            <div key={t.label} className="md:px-8 first:pl-0 last:pr-0">
              <TechItem label={t.label} desc={t.desc} />
            </div>
          ))}
        </div>
      </section>

      {/* ── BESPOKE SOURCING ── */}
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Custom Manufactured</p>
          <h2 className="type-large text-white mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>
            Tailored to your project.
          </h2>
          <p className="type-body text-white/75 mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>
            Every system is custom manufactured for the project and specified against the applicable BASIX, NatHERS and Australian Standards requirements. Send your plans and our team will prepare a tailored proposal.
          </p>
          <a href="/quote" className="arrow-link type-button inline-block border border-white/25 text-white px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300">
            Request a Quote &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      {/* ── SPECS & OPTIONS ── */}
      <SpecsOptions />

      <SiteFooter />
    </div>
  );
}
