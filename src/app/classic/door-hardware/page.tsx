import Image from "next/image";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/classic/door-hardware",
    title: "Door Hardware & Accessories",
    description: "Handles, locks and operating hardware from leading architectural manufacturers, selected to suit the Atelier Classic aluminium window and door systems.",
  });
}


const BRANDS = [
  {
    name: "Kin Long",
    lead: "A comprehensive range of architectural window and door hardware designed to combine refined styling with reliable everyday performance.",
    body: "Available across a variety of window and door configurations, Kin Long provides a coordinated approach to handles, locks and operating hardware throughout the home.",
  },
  {
    name: "Doric",
    lead: "Established Australian architectural hardware for sliding doors, windows and residential applications.",
    body: "Doric hardware provides practical, proven solutions with a clean architectural appearance suited to the Atelier Classic Collection.",
  },
  {
    name: "Siegenia",
    lead: "Precision-engineered window and door hardware designed for smooth operation, secure locking and long-term functionality.",
    body: "Siegenia hardware can be incorporated into selected Atelier systems where enhanced operating performance and sophisticated hardware integration are required.",
  },
  {
    name: "LSMA",
    lead: "Minimalist handle designs created to complement contemporary door systems.",
    body: "With clean proportions and restrained detailing, LSMA hardware provides a refined finishing option for modern architectural interiors and openings.",
  },
  {
    name: "HOPPE",
    lead: "European-designed handles with refined finishes and a strong emphasis on architectural detail.",
    body: "HOPPE offers a sophisticated selection of handle styles and finishes, allowing door hardware to become a considered part of the wider interior palette.",
  },
];

export default function DoorHardwarePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Door Hardware" />

      {/* ── HERO ── */}
      <section className="px-6 md:px-8 pt-24 md:pt-32 pb-16 md:pb-20 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="type-label text-[#b8934a] mb-6" style={{ letterSpacing: "0.18em" }}>ATELIER CLASSIC</p>
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(34px, 5vw, 68px)", lineHeight: 1.05 }}>Door Hardware &amp; Accessories</h1>
          <p className="type-body text-[#b8934a] mb-8" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>Considered hardware for every opening</p>
          <div className="w-8 h-px bg-[#b8934a] mx-auto mb-8" />
          <p className="type-body text-stone-600 max-w-2xl mx-auto mb-5" style={{ lineHeight: 1.9 }}>The right hardware is an integral part of how a window or door looks, feels and performs. The Atelier Classic Hardware Collection brings together a considered range of handles, locks and operating hardware selected to complement our aluminium window and door systems.</p>
          <p className="type-body text-stone-500 max-w-2xl mx-auto" style={{ lineHeight: 1.9 }}>From understated architectural handles to precision-engineered locking and operating components, each selection is considered as part of the complete window and door package - balancing appearance, functionality and everyday usability.</p>
        </div>
      </section>

      {/* ── OUR HARDWARE COLLECTION ── */}
      <section className="px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="type-label text-[#b8934a]" style={{ letterSpacing: "0.14em" }}>OUR HARDWARE COLLECTION</span>
            <div className="h-px bg-stone-300 w-12" />
          </div>
          <p className="type-body text-stone-500 max-w-2xl mb-16" style={{ lineHeight: 1.85 }}>Explore hardware options from established architectural hardware manufacturers, with selections tailored to the requirements of your window and door systems.</p>

          <div className="flex flex-col gap-16 md:gap-20">
            {BRANDS.map((b, i) => (
              <div key={b.name} className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
                <div className="md:col-span-2">
                  <h2 className="type-large text-stone-900 mb-4" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.05 }}>{b.name}</h2>
                  <p className="type-body text-stone-700 mb-4" style={{ lineHeight: 1.85, fontSize: "15px" }}>{b.lead}</p>
                  <p className="type-body text-stone-500" style={{ lineHeight: 1.85 }}>{b.body}</p>
                </div>
                <div className="md:col-span-3 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((n) => (
                    <div key={n} className="relative aspect-square rounded-xl overflow-hidden bg-[#ede8df] border border-stone-200 flex items-center justify-center">
                      {i === 0 && n === 0 ? (
                        <Image src="/products/classic/windows/asg102/ASG102-Hardware.png" alt={`${b.name} hardware`} fill className="object-cover" />
                      ) : (
                        <span className="type-label text-stone-300" style={{ fontSize: "10px" }}>{b.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HARDWARE THAT COMPLETES THE SYSTEM ── */}
      <section className="px-6 md:px-8 py-20 md:py-28 border-t border-stone-200 bg-[#2c2620] text-[#efe7d8]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px bg-white/20 w-12" />
            <span className="type-label text-[#c8a25c]" style={{ letterSpacing: "0.14em" }}>COMPLETE SYSTEMS</span>
            <div className="h-px bg-white/20 w-12" />
          </div>
          <h2 className="type-large mb-6" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.05 }}>Hardware that completes the system.</h2>
          <p className="type-body text-[#b7ab97] mb-5" style={{ lineHeight: 1.9 }}>Hardware should never feel like an afterthought. Our window and door packages are specified as complete systems, allowing the frame, glazing, locking hardware, handles and accessories to be considered together from the beginning of the project.</p>
          <p className="type-body text-[#b7ab97]" style={{ lineHeight: 1.9 }}>Available hardware will vary depending on the selected window or door system, opening configuration and project requirements.</p>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section className="px-6 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="type-product text-stone-900 mb-2" style={{ fontSize: "clamp(18px, 2vw, 24px)" }}>View the complete hardware collection</h3>
            <p className="type-body text-stone-500 max-w-md" style={{ lineHeight: 1.8 }}>Browse the hardware and accessory options shown above, or download our reference sheet for your project documentation.</p>
          </div>
          <a href="/downloads/atelier-classic-door-hardware.pdf" target="_blank" rel="noopener" className="arrow-link type-button inline-flex items-center gap-3 border border-stone-800 text-stone-900 px-7 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300 w-fit">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
            Download the Door Hardware &amp; Accessories Card (PDF)
          </a>
        </div>
      </section>

      {/* ── BUILDING WITH CLASSIC ── */}
      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        <Image src="/Atelier_Classic.png" alt="" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">Atelier Classic</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 56px)", maxWidth: "560px", lineHeight: 1.1 }}>Building with Atelier Classic?</h2>
          <p className="type-body text-stone-600 mb-10 mx-auto max-w-lg" style={{ lineHeight: 1.9 }}>Send us your architectural plans and window and door schedule to receive an itemised quotation. We&rsquo;ll help you select the appropriate systems, glazing, colours and hardware to create a coordinated window and door package for your project.</p>
          <a href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            Start your project today &nbsp;<span className="arrow">→</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
