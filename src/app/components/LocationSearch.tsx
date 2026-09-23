"use client";
import { useEffect, useRef, useState } from "react";

// Australian localities are loaded once, lazily, and shared across instances.
let CACHE: string[] | null = null;
let LOADING: Promise<string[]> | null = null;
function loadLocalities(): Promise<string[]> {
  if (CACHE) return Promise.resolve(CACHE);
  if (!LOADING) {
    LOADING = fetch("/data/au-localities.json")
      .then((r) => r.json())
      .then((d: string[]) => { CACHE = d; return d; })
      .catch(() => { LOADING = null; return []; });
  }
  return LOADING;
}

export default function LocationSearch({
  value, onChange, placeholder, style, className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [list, setList] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function ensureLoaded() {
    if (list.length === 0) loadLocalities().then(setList);
  }

  function search(q: string) {
    const query = q.trim().toLowerCase();
    if (query.length < 2) { setResults([]); return; }
    const starts: string[] = [];
    const contains: string[] = [];
    for (const item of list) {
      const low = item.toLowerCase();
      if (low.startsWith(query)) { starts.push(item); if (starts.length >= 8) break; }
    }
    if (starts.length < 8) {
      for (const item of list) {
        const low = item.toLowerCase();
        if (!low.startsWith(query) && low.includes(query)) { contains.push(item); if (starts.length + contains.length >= 8) break; }
      }
    }
    setResults([...starts, ...contains].slice(0, 8));
  }

  function handleChange(v: string) {
    onChange(v);
    search(v);
    setOpen(true);
    setActive(-1);
  }

  function pick(v: string) {
    onChange(v);
    setResults([]);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        style={style}
        className={className}
        autoComplete="off"
        onFocus={() => { ensureLoaded(); if (results.length) setOpen(true); }}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onKey}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto shadow-lg" style={{ background: "#f5f0e8", border: "1px solid #d4ccc0" }}>
          {results.map((r, i) => (
            <li key={r}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pick(r); }}
                onMouseEnter={() => setActive(i)}
                className="w-full text-left px-4 py-2.5 type-body transition-colors"
                style={{ fontSize: "14px", color: "#1a1714", background: i === active ? "#ede8df" : "transparent" }}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
