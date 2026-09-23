"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASICS, HELP, type Topic } from "./content";

const SUPPORT_EMAIL = "hello@bybric.com";


// Search suggestions that type themselves out, so it is obvious what the box
// is for. Stops as soon as someone types, and never runs for anyone who has
// asked for reduced motion.
const SUGGESTIONS = [
  "password",
  "add a blog post",
  "cover photo",
  "tags",
  "restore a backup",
  "hotspots",
  "quotes",
  "who can sign in",
];

function useTypedPlaceholder(paused: boolean) {
  const [text, setText] = useState("");
  // Read once, lazily: nothing to animate for anyone who asked for less motion.
  const [still] = useState(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  });

  useEffect(() => {
    if (paused || still) return;

    let word = 0, letters = 0, deleting = false, timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const target = SUGGESTIONS[word];
      letters += deleting ? -1 : 1;
      setText(target.slice(0, letters));

      let wait = deleting ? 35 : 70;
      if (!deleting && letters === target.length) { deleting = true; wait = 1600; }
      else if (deleting && letters === 0) { deleting = false; word = (word + 1) % SUGGESTIONS.length; wait = 350; }

      timer = setTimeout(tick, wait);
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [paused, still]);

  if (paused || still) return "Search help - try password, backup, photo, tags";
  return `Search help - try ${text}`;
}

function TopicCard({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-stone-50">
        <span className="min-w-0">
          <span className="block text-stone-900 font-semibold text-sm">{topic.title}</span>
          <span className="block text-xs text-stone-500 mt-1">{topic.what}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 mt-1 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="px-6 pb-6">
          <ol className="space-y-2.5">
            {topic.how.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#b8934a]/10 text-[#b8934a] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span className="text-sm text-stone-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          {topic.notes && topic.notes.length > 0 && (
            <div className="mt-5 rounded-xl bg-[#faf7f1] border border-[#b8934a]/20 px-4 py-3.5 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-[#b8934a] font-semibold">Worth knowing</p>
              {topic.notes.map((n, i) => <p key={i} className="text-xs text-stone-600 leading-relaxed">{n}</p>)}
            </div>
          )}

          {topic.href && (
            <Link href={topic.href} className="inline-flex items-center gap-1.5 mt-5 text-xs uppercase tracking-widest text-[#b8934a] hover:underline">
              Open {topic.title} <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export default function HelpPage() {
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  // The animation stands down once the box is in use.
  const placeholder = useTypedPlaceholder(typing || q.length > 0);
  const query = q.trim().toLowerCase();

  // Searches the titles, the summary and the steps, so "password" or "backup"
  // finds the right card even when it is not in the heading.
  const groups = useMemo(() => {
    if (!query) return HELP;
    const hit = (t: Topic) =>
      [t.title, t.what, ...t.how, ...(t.notes ?? [])].join(" ").toLowerCase().includes(query);
    return HELP.map((g) => ({ ...g, topics: g.topics.filter(hit) })).filter((g) => g.topics.length > 0);
  }, [query]);

  const basics = useMemo(() => {
    if (!query) return BASICS;
    return BASICS.filter((t) => [t.title, t.what, ...t.how].join(" ").toLowerCase().includes(query));
  }, [query]);

  const nothing = groups.length === 0 && basics.length === 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-7">
        <h1 className="text-stone-900 font-semibold text-xl">Help</h1>
        <p className="text-stone-700 text-sm mt-1 max-w-2xl">
          What every part of this portal does, and how to use it. Open a section to see the steps.
        </p>
      </div>

      {/* Bric, on one line, so help is one click away from the top. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-[#2c2620] text-[#efe7d8] px-5 py-3 mb-6">
        <span className="text-[10px] uppercase tracking-widest text-[#c8a25c] font-semibold shrink-0">Ask Bric</span>
        <span className="text-xs text-[#b7ab97] min-w-0">
          Bric built and looks after this website - tell us anything that is not working or that you would like changed.
        </span>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Atelier website - help")}&body=${encodeURIComponent("Hi Bric,\n\nWhat I was trying to do:\n\n\nWhat happened instead:\n\n\nThe page I was on:\n")}`}
          className="ml-auto shrink-0 inline-flex items-center gap-2 bg-[#b8934a] text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#a07e3c] transition-colors"
        >
          Email Bric <span aria-hidden>&rarr;</span>
        </a>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="shrink-0 text-[11px] text-[#b7ab97] hover:text-[#efe7d8] transition-colors">{SUPPORT_EMAIL}</a>
      </div>

      <div className="relative mb-8">
        <input
          ref={search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          placeholder={placeholder}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-10 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); search.current?.focus(); }} aria-label="Clear the search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 flex items-center justify-center text-sm">
            &times;
          </button>
        )}
      </div>

      {/* Each category gets its own band, two columns of cards inside it. */}
      {basics.length > 0 && (
        <section className="mb-9">
          <div className="border-t border-stone-200 pt-5 mb-5">
            <h2 className="text-[11px] uppercase tracking-widest text-stone-800 font-semibold">The basics</h2>
            <p className="text-xs text-stone-500 mt-1">Worth reading once, whoever you are.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {basics.map((t) => <TopicCard key={t.title} topic={t} />)}
          </div>
        </section>
      )}

      {groups.map((g) => (
        <section key={g.group} className="mb-9">
          <div className="border-t border-stone-200 pt-5 mb-5">
            <h2 className="text-[11px] uppercase tracking-widest text-stone-800 font-semibold">{g.group}</h2>
            <p className="text-xs text-stone-500 mt-1">{g.blurb}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {g.topics.map((t) => <TopicCard key={t.title} topic={t} />)}
          </div>
        </section>
      ))}

      {nothing && (
        <p className="text-sm text-stone-400 py-10 text-center">
          Nothing matches &ldquo;{q}&rdquo;. Try a different word, or ask Bric at the top.
        </p>
      )}

      <p className="text-[11px] text-stone-400 mt-6">
        Something out of date on this page? Tell us and we will fix it.
      </p>
    </div>
  );
}
