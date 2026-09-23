"use client";
import { useState, useRef, useEffect } from "react";

const ALL_ITEMS = [
  { label: "Classic - Windows & Doors", category: "Classic", href: "#" },
  { label: "Classic - Joinery", category: "Classic", href: "#" },
  { label: "Classic - Bathrooms", category: "Classic", href: "#" },
  { label: "Classic - Finishes", category: "Classic", href: "#" },
  { label: "Classic - Stairs & Balustrades", category: "Classic", href: "#" },
  { label: "Signature - Windows & Doors", category: "Signature", href: "#" },
  { label: "Signature - Joinery", category: "Signature", href: "#" },
  { label: "Signature - Bathrooms", category: "Signature", href: "#" },
  { label: "Signature - Finishes", category: "Signature", href: "#" },
  { label: "Signature - Stairs & Balustrades", category: "Signature", href: "#" },
];

const PLACEHOLDERS = [
  "Search for joinery…",
  "Search for bathrooms…",
  "Search for windows & doors…",
  "Search for finishes…",
  "Search for stairs & balustrades…",
];

function AnimatedPlaceholder() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = PLACEHOLDERS[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (typing) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 30);
      } else {
        setPhraseIndex(i => (i + 1) % PLACEHOLDERS.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, typing, phraseIndex]);

  return (
    <span className="type-body text-stone-400 pointer-events-none select-none">
      {displayed}<span className="animate-pulse">|</span>
    </span>
  );
}

export default function SearchBar({ collection }: { collection?: "Classic" | "Signature" }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = collection ? ALL_ITEMS.filter(i => i.category === collection) : ALL_ITEMS;
  const results = query.trim().length > 0
    ? pool.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const showDropdown = focused && query.trim().length > 0;

  return (
    <section className="relative bg-[#2c1f14] px-6 md:px-8 py-12 md:py-16 flex justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Search box */}
        <div
          className="flex items-center gap-4 bg-[#f5f0e8] rounded-2xl px-6 py-4 transition-all duration-300"
          style={{ boxShadow: focused ? "0 0 40px 8px rgba(245,240,232,0.18), 0 8px 32px rgba(0,0,0,0.3)" : "0 0 20px 4px rgba(245,240,232,0.08), 0 4px 16px rgba(0,0,0,0.25)" }}
        >
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>

          <div className="relative flex-1">
            {!query && !focused && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <AnimatedPlaceholder />
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={focused ? "Search products, categories, collections…" : ""}
              className="w-full bg-transparent outline-none type-body text-stone-800 placeholder:text-stone-400 caret-[#b8934a]"
            />
          </div>

          {query && (
            <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#f5f0e8] rounded-2xl overflow-hidden shadow-2xl">
            <div className="py-2">
              {results.length > 0 ? (
                results.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200/60 last:border-0 group hover:bg-stone-200/40 transition-colors"
                  >
                    <span className="type-body text-stone-700 group-hover:text-stone-900 transition-colors">{item.label}</span>
                    <span className="type-label text-stone-400 group-hover:text-[#b8934a] transition-colors">{item.category}</span>
                  </a>
                ))
              ) : (
                <p className="px-6 py-4 type-body text-stone-400">No results for &ldquo;{query}&rdquo;</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
