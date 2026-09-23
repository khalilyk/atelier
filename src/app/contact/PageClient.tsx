"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import BlockPage from "../components/BlockPage";
import { pageLayoutKey } from "@/lib/page-copy";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "", company: "", email: "", phone: "", projectType: "", message: "", privacy: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const resultRef = useRef<HTMLDivElement>(null);

  // The long form collapses into a short message, so bring it into view -
  // otherwise mobile visitors are left looking at the footer.
  useEffect(() => {
    if (status === "sent" || status === "error") resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.privacy) return;
    setStatus("sending");
    const message = `Quote request via contact form.\nProject type: ${form.projectType || "-"}\n\n${form.message || "-"}`;
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [], name: form.fullName, email: form.email, phone: form.phone, company: form.company, message }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const sections: Record<string, React.ReactNode> = {
    hero: (
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden">
        <Image
          src="/Atelier_Classic.png"
          alt="Contact Atelier"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#f5f0e8]/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>
            Let&rsquo;s create<br />something exceptional.
          </h1>
          <div className="w-8 h-px bg-[#b8934a] mb-6" />
          <p className="type-body text-stone-600 max-w-xl" style={{ lineHeight: 1.9 }}>
            Whether you&rsquo;re planning a new home, renovation, townhouse development, apartment project or commercial fit-out, our team can help you understand the options and determine the next steps. You don&rsquo;t need every product or detail selected - send your plans, schedules, drawings or a preliminary brief and we&rsquo;ll review the available information.
          </p>
        </div>
      </section>
    ),

    info: (
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">

          {/* Visit */}
          <div className="flex flex-col items-center text-center px-10 py-10 gap-3">
            <svg className="w-5 h-5 text-[#b8934a] mb-1" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <p className="type-label text-stone-500 mb-1">Let&rsquo;s Meet</p>
            <p className="type-body text-stone-700 leading-relaxed">By appointment only</p>
            <p className="type-body text-stone-500">Monday - Friday<br />9:00am - 5:00pm AEST</p>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center text-center px-10 py-10 gap-3">
            <svg className="w-5 h-5 text-[#b8934a] mb-1" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            <p className="type-label text-stone-500 mb-1">Email Us</p>
            <a href="mailto:info@ateliersupplygroup.com.au" className="type-body text-stone-700 hover:text-[#b8934a] transition-colors">
              info@ateliersupplygroup.com.au
            </a>
            <p className="type-body text-stone-500 mt-1">We aim to respond to all<br />enquiries within 1 business day.</p>
          </div>

          {/* Call */}
          <div className="flex flex-col items-center text-center px-10 py-10 gap-3">
            <svg className="w-5 h-5 text-[#b8934a] mb-1" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <p className="type-label text-stone-500 mb-1">Call Us</p>
            <a href="tel:+61449513614" className="type-body text-stone-700 hover:text-[#b8934a] transition-colors">
              +61 449 513 614
            </a>
          </div>

        </div>
      </section>
    ),

    form: (
      <section className="bg-[#f5f0e8] py-16 md:py-20 px-6 md:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">

          {/* Left col */}
          <div className="md:col-span-2">
            <p className="type-label text-[#b8934a] mb-5">Send Us a Message</p>
            <h2 className="type-heading text-stone-900 mb-4" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>
              How can we<br />assist you?
            </h2>
            <div className="w-8 h-px bg-[#b8934a] mb-6" />
            <p className="type-body text-stone-500">
              Please provide as much detail<br />as possible about your project<br />and our team will be in touch.
            </p>

            {/* Image */}
            <div className="relative h-48 mt-10 overflow-hidden rounded-sm">
              <Image src="/Atelier_Classic.png" alt="Materials" fill className="object-cover" />
            </div>
          </div>

          {/* Form */}
          {status === "sent" ? (
          <div ref={resultRef} className="md:col-span-3 flex flex-col items-start justify-center scroll-mt-28">
            <div className="w-12 h-12 rounded-full border border-[#b8934a] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="type-heading text-stone-900 mb-3" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>Thank you, {form.fullName.split(" ")[0]}.</h3>
            <p className="type-body text-stone-600" style={{ lineHeight: 1.8, maxWidth: "26rem" }}>
              We&rsquo;ve received your enquiry and our team will be in touch shortly to discuss your project and prepare a quote.
            </p>
          </div>
          ) : (
          <form className="md:col-span-3 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text" placeholder="Full name*" required
                value={form.fullName} onChange={e => set("fullName", e.target.value)}
                className="border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
              />
              <input
                type="text" placeholder="Company name"
                value={form.company} onChange={e => set("company", e.target.value)}
                className="border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
              />
              <input
                type="email" placeholder="Email address*" required
                value={form.email} onChange={e => set("email", e.target.value)}
                className="border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
              />
              <input
                type="tel" placeholder="Phone number"
                value={form.phone} onChange={e => set("phone", e.target.value)}
                className="border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={form.projectType} onChange={e => set("projectType", e.target.value)}
                className="w-full appearance-none border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-400 outline-none focus:border-stone-400 transition-colors"
              >
                <option value="" disabled>Project type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 8 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l3 3 3-3" />
              </svg>
            </div>

            <textarea
              placeholder="Tell us about your project*" required rows={5}
              value={form.message} onChange={e => set("message", e.target.value)}
              className="border border-stone-200 bg-white px-4 py-3.5 type-body text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors resize-none"
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={form.privacy} onChange={e => set("privacy", e.target.checked)}
                className="mt-0.5 accent-[#b8934a]"
              />
              <span className="type-body text-stone-500">
                I agree to the <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-legal", { detail: "privacy" }))} className="underline hover:text-stone-800 transition-colors">privacy policy</button>*
              </span>
            </label>

            {status === "error" && (
              <p className="type-body text-red-700" style={{ fontSize: "13px" }}>Something went wrong. Please try again or email info@ateliersupplygroup.com.au.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="arrow-link type-button bg-stone-900 text-white px-8 py-4 flex items-center justify-center gap-3 hover:bg-[#b8934a] transition-colors duration-300 mt-2 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : <>Send Enquiry &nbsp;<span className="arrow">→</span></>}
            </button>
          </form>
          )}

        </div>
      </section>
    ),

  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" />
      <BlockPage kind="contact" layoutKey={pageLayoutKey("contact")} sections={sections} />
      <SiteFooter />
    </div>
  );
}
