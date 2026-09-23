"use client";
import Link from "next/link";
import { useState } from "react";

// Tags and sharing, shown at the end of an article or a project.
const ICON = "w-[15px] h-[15px]";


/** A small dark label that appears above a button on hover or keyboard focus. */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex shrink-0 group">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-stone-900 text-white px-2.5 py-1.5 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
        style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}
      >
        {label}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900" />
      </span>
    </span>
  );
}

export default function ShareRow({ title, path, tags, tagBase = "/journal" }: { title: string; path: string; tags: string[]; /** Where a tag chip links, e.g. "/projects". */ tagBase?: string }) {
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;

  // The address is read when a button is pressed, so this works on any domain.
  const here = () => (typeof window === "undefined" ? path : window.location.href);

  function openShare(make: (link: string, title: string) => string) {
    const url = make(here(), title);
    if (url.startsWith("mailto:")) window.location.assign(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copy() {
    const link = here();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", link);
    }
  }

  const shares = [
    { label: "Share on LinkedIn", tip: "LinkedIn", make: (link: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(link)}`, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.4 2.5 4.4 5.8V21h-4v-5.6c0-1.35-.02-3.1-1.9-3.1s-2.2 1.48-2.2 3v5.7H9z" /></svg>
    ) },
    { label: "Share on Facebook", tip: "Facebook", make: (link: string) => `https://www.facebook.com/sharer/sharer.php?u=${e(link)}`, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.3-.13-2.45-.13-2.42 0-4.07 1.48-4.07 4.19v2.24H7.5V14h2.68v8z" /></svg>
    ) },
    { label: "Share on X", tip: "X", make: (link: string, t: string) => `https://twitter.com/intent/tweet?text=${e(t)}&url=${e(link)}`, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden><path d="M17.5 3h3l-6.6 7.5L21.8 21h-5.9l-4.6-6-5.3 6H3l7-8L2.6 3h6l4.2 5.5zm-1 16h1.6L8 4.7H6.3z" /></svg>
    ) },
    { label: "Share on WhatsApp", tip: "WhatsApp", make: (link: string, t: string) => `https://wa.me/?text=${e(`${t} ${link}`)}`, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.24-.12-1.42-.7-1.64-.78s-.38-.12-.54.12-.62.78-.76.94-.28.18-.52.06a6.5 6.5 0 01-1.92-1.18 7.2 7.2 0 01-1.33-1.65c-.14-.24 0-.37.1-.49s.24-.28.36-.42a1.6 1.6 0 00.24-.4.44.44 0 00-.02-.42c-.06-.12-.54-1.3-.74-1.78s-.4-.4-.54-.41h-.46a.89.89 0 00-.64.3 2.7 2.7 0 00-.84 2 4.68 4.68 0 001 2.48 10.7 10.7 0 004.1 3.6 13.6 13.6 0 001.37.5 3.3 3.3 0 001.51.1 2.47 2.47 0 001.62-1.15 2 2 0 00.14-1.14c-.06-.1-.22-.16-.46-.28z" /></svg>
    ) },
    { label: "Share by email", tip: "Email", make: (link: string, t: string) => `mailto:?subject=${e(t)}&body=${e(`${t}\n\n${link}`)}`, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ICON} aria-hidden><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
    ) },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-stone-200">
      {/* One line: the chips scroll sideways rather than wrapping. */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 mb-7 overflow-x-auto scrollbar-hide">
          <span className="type-label text-stone-400 shrink-0 mr-0.5 md:mr-1" style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>TAGS</span>
          {tags.map((tag) => (
            <Link key={tag} href={`${tagBase}?tag=${encodeURIComponent(tag)}`}
              className="type-label text-[#b8934a] shrink-0 whitespace-nowrap border border-[#b8934a]/30 rounded-full px-2.5 md:px-3 py-1 hover:bg-[#b8934a]/10 transition-colors"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-3">
        <span className="type-label text-stone-400 shrink-0 mr-0.5 md:mr-1" style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>SHARE</span>

        {shares.map((s) => (
          <Tip key={s.label} label={s.tip}>
            <button type="button" onClick={() => openShare(s.make)} aria-label={s.label}
              className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center hover:border-stone-900 hover:text-stone-900 transition-colors">
              {s.icon}
            </button>
          </Tip>
        ))}

        <Tip label={copied ? "Copied" : "Copy link"}>
          <button type="button" onClick={copy} aria-label="Copy link"
            className={`w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full border flex items-center justify-center transition-colors ${copied ? "border-[#b8934a] text-[#b8934a]" : "border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900"}`}>
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" /></svg>
            )}
          </button>
        </Tip>
      </div>
    </div>
  );
}
