"use client";
import { useState } from "react";

// Compact inline name + email gate for any gated PDF. Captures the lead,
// triggers the thank-you email, then reveals a signed download link.
export default function InlineDownloadGate({
  resource,
  intro = "Leave your name and email to download it. We’ll email you a copy too.",
  submitLabel = "GET THE PDF",
  downloadLabel = "Download the PDF",
  readyText = "is ready",
  itemName = "Your download",
}: {
  resource: string;
  intro?: string;
  submitLabel?: string;
  downloadLabel?: string;
  readyText?: string;
  itemName?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState("sending"); setError("");
    try {
      const res = await fetch("/api/download-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, resource }),
      });
      const d = await res.json();
      if (!res.ok || !d.url) { setError(d.error || "Something went wrong."); setState("error"); return; }
      setUrl(d.url);
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  const INPUT =
    "w-full border border-stone-300 bg-white px-4 py-3 type-body text-stone-800 placeholder:text-stone-400 " +
    "outline-none focus:border-[#b8934a] focus:ring-2 focus:ring-[#b8934a]/20 transition-all rounded-lg";

  if (state === "done") {
    return (
      <div>
        <p className="type-body text-stone-600 mb-6" style={{ lineHeight: 1.8 }}>
          Thank you, {name.split(" ")[0] || name}. {itemName} {readyText}, and a copy is on its way to{" "}
          <span className="text-stone-900">{email}</span>.
        </p>
        <a
          href={url}
          download
          className="group dl-glow type-button inline-flex items-center gap-3 bg-[#b8934a] text-white px-8 py-4 rounded-lg transition-all duration-300 hover:bg-[#a07e3c] hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <g className="dl-arrow">
              <path d="M12 3v11" />
              <path d="M8 10l4 4 4-4" />
            </g>
            <path className="dl-tray" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          {downloadLabel}
        </a>
        <style>{CAP_CSS}</style>
      </div>
    );
  }

  return (
    <div>
      <p className="type-body text-stone-500 mb-4" style={{ lineHeight: 1.7, fontSize: "13.5px" }}>
        {intro}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="text" placeholder="Full name*" required aria-label="Full name"
          value={name} onChange={(e) => setName(e.target.value)} className={INPUT}
        />
        <input
          type="email" placeholder="Email address*" required aria-label="Email address"
          value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT}
        />
        {state === "error" && (
          <p className="type-body text-red-700" style={{ fontSize: "13px" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={state === "sending"}
          className="group type-button bg-[#b8934a] text-white px-8 py-3.5 inline-flex items-center justify-between gap-3 rounded-lg mt-1
                     transition-all duration-300 hover:bg-[#a07e3c] hover:-translate-y-0.5
                     hover:shadow-[0_16px_36px_-12px_rgba(184,147,74,0.6)]
                     disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          <span>{state === "sending" ? "PREPARING…" : submitLabel}</span>
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </button>
      </form>
    </div>
  );
}

const CAP_CSS = `
@keyframes dlDrop { 0% { transform: translateY(-1px); opacity: 1 } 35% { transform: translateY(5px); opacity: 0 } 36% { transform: translateY(-6px); opacity: 0 } 60%, 100% { transform: translateY(-1px); opacity: 1 } }
@keyframes dlTray { 0%, 28% { transform: translateY(0) } 38% { transform: translateY(1.5px) } 55%, 100% { transform: translateY(0) } }
@keyframes dlGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(184,147,74,0.50), 0 10px 26px -14px rgba(184,147,74,0.45) } 50% { box-shadow: 0 0 0 12px rgba(184,147,74,0), 0 18px 42px -12px rgba(184,147,74,0.80) } }
.dl-arrow { transform-box: fill-box; transform-origin: center; animation: dlDrop 1.9s ease-in-out infinite }
.dl-tray { transform-box: fill-box; transform-origin: center; animation: dlTray 1.9s ease-in-out infinite }
.dl-glow { animation: dlGlow 2.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .dl-arrow, .dl-tray, .dl-glow { animation: none } }
`;
