"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useImage } from "./ImagesProvider";

// Shipped with the component so the animation can never be dropped by the
// global stylesheet build.
const GATE_CSS = `
@keyframes dlDrop {
  0%   { transform: translateY(-1px); opacity: 1; }
  35%  { transform: translateY(5px);  opacity: 0; }
  36%  { transform: translateY(-6px); opacity: 0; }
  60%, 100% { transform: translateY(-1px); opacity: 1; }
}
@keyframes dlTray {
  0%, 28%   { transform: translateY(0); }
  38%       { transform: translateY(1.5px); }
  55%, 100% { transform: translateY(0); }
}
@keyframes dlGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184,147,74,0.50), 0 10px 26px -14px rgba(184,147,74,0.45); }
  50%      { box-shadow: 0 0 0 12px rgba(184,147,74,0),  0 18px 42px -12px rgba(184,147,74,0.80); }
}
.dl-arrow { transform-box: fill-box; transform-origin: center; animation: dlDrop 1.9s ease-in-out infinite; }
.dl-tray  { transform-box: fill-box; transform-origin: center; animation: dlTray 1.9s ease-in-out infinite; }
.dl-glow  { animation: dlGlow 2.4s ease-in-out infinite; }
.dl-glow:hover .dl-arrow,
.dl-glow:hover .dl-tray { animation-duration: 1.05s; }
.dl-glow:hover { animation-duration: 1.4s; }
@media (prefers-reduced-motion: reduce) {
  .dl-arrow, .dl-tray, .dl-glow { animation: none; }
}
`;

type Props = {
  resource: string;        // key understood by /api/download-request
  eyebrow?: string;
  headline: string;
  body?: string;
  buttonLabel?: string;
  imageSlot?: string;      // CMS image slot for the background
  imageFallback?: string;  // stock image used until a real photo is uploaded
};

/**
 * A gated download CTA: name + email are captured before the file URL is
 * revealed. The link is never in the page source until the form succeeds.
 * Once unlocked, the browser remembers so returning visitors skip the form.
 */
export default function DownloadGate({
  resource, eyebrow = "Download", headline, body,
  buttonLabel = "Download the collection", imageSlot, imageFallback,
}: Props) {
  const slotImg = useImage(imageSlot ?? "");
  const bg = slotImg || imageFallback || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [shown, setShown] = useState(false);

  // The form is always required: the download link is issued per submission
  // and never remembered, so every visitor supplies a name and email.
  useEffect(() => { setShown(true); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/download-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, resource }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Something went wrong."); return; }
      setUrl(d.url);
    } catch {
      setError("Network error. Please try again.");
    } finally { setBusy(false); }
  }

  const INPUT =
    "w-full bg-white/10 border border-white/25 rounded-lg px-4 py-3.5 text-white placeholder-white/45 " +
    "outline-none transition-all duration-300 focus:border-[#c8a25c] focus:bg-white/15 focus:ring-2 focus:ring-[#c8a25c]/30";

  return (
    <section className="relative overflow-hidden border-t border-stone-200">
      <style dangerouslySetInnerHTML={{ __html: GATE_CSS }} />
      {bg && <Image src={bg} alt="" fill className="object-cover object-center scale-105" />}
      <div className="absolute inset-0" style={{ background: bg ? "linear-gradient(to right, rgba(28,24,20,0.92) 0%, rgba(28,24,20,0.78) 55%, rgba(28,24,20,0.6) 100%)" : "#2c2620" }} />

      <div
        className="relative z-10 px-6 md:px-8 py-20 md:py-28 transition-all duration-700"
        style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(16px)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="type-label text-[#c8a25c] mb-5" style={{ letterSpacing: "0.18em" }}>{eyebrow.toUpperCase()}</p>
          <h2 className="text-white mb-5" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 3.6vw, 46px)", fontWeight: 300, lineHeight: 1.12 }}>
            {headline}
          </h2>
          {body && <p className="type-body text-white/70 mb-10 mx-auto max-w-xl" style={{ lineHeight: 1.9 }}>{body}</p>}

          {url ? (
            <div className="transition-all duration-500" style={{ opacity: shown ? 1 : 0 }}>
              <a
                href={url}
                download
                className="group dl-glow type-button inline-flex items-center gap-3 bg-[#b8934a] text-white px-8 py-4 rounded-lg
                           transition-all duration-300 hover:bg-[#a07e3c] hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <g className="dl-arrow">
                    <path d="M12 3v11" />
                    <path d="M8 10l4 4 4-4" />
                  </g>
                  <path className="dl-tray" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                {buttonLabel}
              </a>
              <p className="type-body text-white/45 mt-5" style={{ fontSize: "12.5px" }}>
                Your download is ready. PDF, opens in a new tab.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mx-auto max-w-lg text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  aria-label="Your name" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" className={INPUT}
                />
                <input
                  aria-label="Email address" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" className={INPUT}
                />
              </div>

              <button
                type="submit" disabled={busy}
                className="group type-button w-full inline-flex items-center justify-center gap-3 bg-[#b8934a] text-white px-8 py-4 rounded-lg
                           transition-all duration-300 hover:bg-[#a07e3c] hover:-translate-y-0.5
                           hover:shadow-[0_16px_36px_-12px_rgba(184,147,74,0.65)]
                           disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Preparing your download…
                  </>
                ) : (
                  <>
                    {buttonLabel}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </>
                )}
              </button>

              {error && <p className="type-body text-red-300 mt-3 text-center" style={{ fontSize: "13px" }}>{error}</p>}

              <p className="type-body text-white/40 mt-4 text-center" style={{ fontSize: "12px", lineHeight: 1.7 }}>
                We&rsquo;ll email you the collection and occasional Atelier updates. No spam, unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>

    </section>
  );
}
