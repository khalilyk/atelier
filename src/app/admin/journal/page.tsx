"use client";
import { useEffect, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import BlockList from "../components/BlockList";
import GenericBlock from "@/app/components/GenericBlock";
import ArticleView from "@/app/journal/ArticleView";
import PreviewFrame from "../components/PreviewFrame";
import { journalSlug, parseTags, readingMinutes, sortPosts, type JournalPost } from "@/lib/journal";

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

function Text({ label, value, onChange, rows, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string; placeholder?: string }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${FIELD} resize-y leading-relaxed`} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD} />
      )}
      {hint && <p className="text-[11px] text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button type="button" onClick={() => onChange(!checked)} className={`mt-0.5 w-10 h-6 rounded-full relative transition-colors shrink-0 ${checked ? "bg-[#b8934a]" : "bg-stone-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      <span>
        <span className="text-sm text-stone-800">{label}</span>
        {hint && <span className="block text-[11px] text-stone-400">{hint}</span>}
      </span>
    </label>
  );
}

/** A collapsible settings panel in the right-hand sidebar, like WordPress. */
function Panel({ title, open, onToggle, summary, children }: { title: string; open: boolean; onToggle: () => void; summary?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-stone-100 last:border-b-0">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-stone-50">
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-widest text-stone-800 font-semibold">{title}</span>
          {!open && summary && <span className="block text-[11px] text-stone-400 truncate mt-0.5">{summary}</span>}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </section>
  );
}


/** Plain text from the post's blocks, for the automatic listing. */
function bodyText(body: string): string {
  try {
    const blocks = JSON.parse(body || "[]") as { hidden?: boolean; data?: Record<string, string> }[];
    return blocks.filter((b) => !b.hidden)
      .flatMap((b) => Object.values(b.data ?? {}))
      .map((v) => String(v).replace(/\s+/g, " ").trim())
      .filter((v) => v.length > 40 && !v.startsWith("/") && !v.startsWith("http"))
      .join(" ");
  } catch { return ""; }
}

const clip = (s: string, n: number) => {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20)).trim()}…`;
};

/** What Google and the AI answer engines get if nothing is typed in. */
function autoSeo(form: JournalPost) {
  const source = [form.excerpt, form.subtitle, bodyText(form.body)].filter(Boolean).join(" ");
  const tag = form.tags[0] ? ` | ${form.tags[0]}` : "";
  return {
    metaTitle: clip(`${form.title}${tag}`, 58) || clip(form.title, 58),
    metaDescription: clip(source, 155),
    ogImage: form.coverImage,
  };
}


/** Recommended lengths. Google truncates the first two; the rest is what ranks. */
const SEO_LIMITS = {
  title: { min: 30, ideal: 50, max: 60, hard: 70 },
  description: { min: 70, ideal: 120, max: 160, hard: 180 },
  body: { min: 300, ideal: 800, max: 2000, hard: 3000 },
};

type Limit = { min: number; ideal: number; max: number; hard: number };

function verdict(n: number, l: Limit) {
  if (n === 0) return { tone: "empty", note: "nothing yet" } as const;
  if (n < l.min) return { tone: "warn", note: "too short" } as const;
  if (n > l.hard) return { tone: "bad", note: "well over — it will be cut off" } as const;
  if (n > l.max) return { tone: "warn", note: "a little long" } as const;
  return { tone: "good", note: "good length" } as const;
}

const TONE = {
  empty: "text-stone-400",
  warn: "text-amber-600",
  bad: "text-red-600",
  good: "text-emerald-600",
} as const;

const BAR = {
  empty: "bg-stone-200",
  warn: "bg-amber-400",
  bad: "bg-red-400",
  good: "bg-emerald-400",
} as const;

/** A length counter with the recommended range, under a field. */
function Gauge({ n, limit, unit, hint }: { n: number; limit: Limit; unit: string; hint?: string }) {
  const v = verdict(n, limit);
  const pct = Math.min(100, (n / limit.hard) * 100);
  const from = (limit.min / limit.hard) * 100;
  const to = (limit.max / limit.hard) * 100;
  return (
    <div className="mt-1.5">
      <div className="relative h-1 rounded-full bg-stone-100 overflow-hidden">
        {/* the recommended window */}
        <span className="absolute inset-y-0 bg-stone-200/80" style={{ left: `${from}%`, width: `${to - from}%` }} />
        <span className={`absolute inset-y-0 left-0 rounded-full ${BAR[v.tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] mt-1">
        <span className={TONE[v.tone]}>{n} {unit} — {v.note}.</span>
        <span className="text-stone-400"> Aim for {limit.min}–{limit.max}{hint ? `, ${hint}` : ""}.</span>
      </p>
    </div>
  );
}

/** Words in the article body, for the length guidance. */
function bodyWords(body: string) {
  const t = bodyText(body);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
}

function SeoSection({ form, set }: { form: JournalPost; set: <K extends keyof JournalPost>(k: K, v: JournalPost[K]) => void }) {
  const auto = autoSeo(form);
  const title = form.metaTitle || auto.metaTitle;
  const desc = form.metaDescription || auto.metaDescription;
  const share = form.ogImage || auto.ogImage;
  const custom = !!(form.metaTitle || form.metaDescription || form.ogImage);
  const words = bodyWords(form.body);

  return (
    <section className="mt-8 pt-6 border-t border-stone-100">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h2 className="text-[11px] uppercase tracking-widest text-stone-800 font-semibold">Search &amp; AI listing</h2>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { set("metaTitle", auto.metaTitle); set("metaDescription", auto.metaDescription); set("ogImage", auto.ogImage); }}
            className="text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Generate</button>
          {custom && (
            <button type="button" onClick={() => { set("metaTitle", ""); set("metaDescription", ""); set("ogImage", ""); }}
              className="text-xs text-stone-400 hover:text-stone-700">Reset to automatic</button>
          )}
        </div>
      </div>
      <p className="text-xs text-stone-400 mb-5">
        Written for you from the article. {custom ? "You have edited it — Reset goes back to automatic." : "Left as is, it updates itself as you write."} This is what Google, ChatGPT and the other answer engines read.
      </p>

      {/* Google-style preview */}
      <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-4 mb-5">
        <p className="text-[11px] text-stone-500">ateliersupplygroup.com.au › journal › {form.slug}</p>
        <p className="text-[#1a0dab] text-base leading-snug mt-0.5">{title}</p>
        <p className="text-[13px] text-stone-600 leading-snug mt-0.5">{desc || "Add a summary so Google has something to show."}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <Text label="Meta title" value={form.metaTitle} onChange={(v) => set("metaTitle", v)} placeholder={auto.metaTitle} />
            <Gauge n={title.length} limit={SEO_LIMITS.title} unit="characters" hint="Google cuts it around 60" />
          </div>
          <div>
            <Text label="Meta description" rows={3} value={form.metaDescription} onChange={(v) => set("metaDescription", v)} placeholder={auto.metaDescription} />
            <Gauge n={desc.length} limit={SEO_LIMITS.description} unit="characters" hint="Google cuts it around 160" />
          </div>
          <div>
            <label className={LABEL}>Article length</label>
            <Gauge n={words} limit={SEO_LIMITS.body} unit="words" hint="longer articles rank and get quoted more" />
          </div>
        </div>
        <div className="space-y-2">
          {/* Shows the cover photo until a different one is chosen, which is what actually gets shared. */}
          <ImagePicker label="Share image (Facebook, LinkedIn, X)" value={share} onChange={(v) => set("ogImage", v === auto.ogImage ? "" : v)} />
          <p className="text-[11px] text-stone-400">
            {form.ogImage ? "A picture chosen just for sharing." : share ? "Following the cover photo. Choose another to use a different picture when the link is shared." : "No image yet — add a cover photo and it will be used here too."}
          </p>
        </div>
      </div>
    </section>
  );
}

const PREVIEW_KEY = "atelier.journal.preview";

type PanelKey = "publishing" | "details" | "cover";

export default function JournalAdmin() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [form, setForm] = useState<JournalPost | null>(null);
  const [originalSlug, setOriginalSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [listOpen, setListOpen] = useState(false);
  // On by default; the choice is remembered per browser. Read once, lazily, so
  // the first paint already has the right layout.
  const [showPreview, setShowPreview] = useState(() => {
    try { return window.localStorage.getItem(PREVIEW_KEY) !== "off"; } catch { return true; }
  });

  const togglePreview = () => setShowPreview((v) => {
    try { window.localStorage.setItem(PREVIEW_KEY, v ? "off" : "on"); } catch { /* ignore */ }
    return !v;
  });
  const [open, setOpen] = useState<PanelKey | null>("publishing");
  const toggle = (k: PanelKey) => setOpen((c) => (c === k ? null : k));

  useEffect(() => {
    fetch("/api/admin/journal").then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof JournalPost>(k: K, v: JournalPost[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function create() {
    setError("");
    const res = await fetch("/api/admin/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle }) });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not create the post"); return; }
    setPosts((l) => sortPosts([...l, d]));
    setForm(d); setOriginalSlug(d.slug);
    setCreating(false); setNewTitle("");
  }

  async function save() {
    if (!form) return;
    setSaving(true); setError("");
    const res = await fetch("/api/admin/journal", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, previousSlug: originalSlug }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setError(d.error || "Save failed"); return; }
    setPosts((l) => sortPosts(l.filter((p) => p.slug !== originalSlug).concat(d)));
    setForm(d); setOriginalSlug(d.slug);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!form) return;
    if (!window.confirm(`Delete "${form.title}"? A backup is taken first, so it can be restored.`)) return;
    await fetch("/api/admin/journal", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: originalSlug }) });
    setPosts((l) => l.filter((p) => p.slug !== originalSlug));
    setForm(null);
  }

  async function duplicate() {
    if (!form) return;
    setError("");
    const res = await fetch("/api/admin/journal", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duplicateOf: originalSlug, title: `${form.title} (copy)` }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not copy the post"); return; }
    setPosts((l) => sortPosts([...l, d]));
    setForm(d); setOriginalSlug(d.slug);
  }

  function pick(p: JournalPost) {
    setForm(p); setOriginalSlug(p.slug); setError(""); setListOpen(false);
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading the journal…</div>;

  const live = posts.filter((p) => p.published).length;

  return (
    <div className="p-6 lg:p-8">
      {/* Top bar: post picker, title, actions — everything you need without scrolling. */}
      <div className="sticky top-0 z-30 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#faf9f7]/95 backdrop-blur border-b border-stone-200/70">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button onClick={() => setListOpen((v) => !v)} className="flex items-center gap-2 border border-stone-200 bg-white rounded-xl px-4 py-2.5 text-sm text-stone-800 hover:border-[#b8934a]">
              <span className="truncate max-w-[220px]">{form ? form.title : "All posts"}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{posts.length} · {live} live</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-stone-400 transition-transform ${listOpen ? "rotate-180" : ""}`} aria-hidden><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {listOpen && (
              <div className="absolute left-0 mt-2 w-[340px] max-h-[60vh] overflow-auto bg-white rounded-2xl border border-stone-200 shadow-xl z-40">
                {posts.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-stone-400">No posts yet. Use New post to write the first one.</p>
                ) : posts.map((p) => (
                  <button key={p.slug} onClick={() => pick(p)}
                    className={`w-full text-left px-5 py-3 border-b border-stone-50 last:border-b-0 transition-colors ${originalSlug === p.slug ? "bg-[#b8934a]/10" : "hover:bg-stone-50"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-stone-900 truncate">{p.title}</span>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${p.published ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>{p.published ? "Live" : "Draft"}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                      {p.publishedAt}{p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { setCreating(true); setError(""); }} className="text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">New post</button>

          {form && (
            <p className="text-xs text-stone-400 hidden xl:block">/journal/{form.slug} · {readingMinutes(form)} min read</p>
          )}

          <div className="ml-auto flex items-center gap-3">
            {form && (
              <>
                <button onClick={togglePreview}
                  className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg border transition-colors ${showPreview ? "border-[#b8934a] bg-[#b8934a]/10 text-[#b8934a]" : "border-stone-200 bg-white text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]"}`}>
                  Preview
                </button>
                <button onClick={duplicate} className="text-xs text-stone-500 hover:text-stone-900 hover:underline">Duplicate</button>
                <button onClick={remove} className="text-xs text-red-500 hover:underline">Delete</button>
                <a href={`/journal/${form.slug}`} target="_blank" className="text-xs border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">{form.published ? "View" : "Preview"}</a>
                <button onClick={save} disabled={saving} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save post"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mt-6 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {creating && (
        <div className="mt-6 bg-white rounded-2xl border border-[#b8934a]/40 p-6">
          <label className={LABEL}>Title</label>
          <input autoFocus value={newTitle} placeholder="e.g. Choosing the right glazing" onChange={(e) => setNewTitle(e.target.value)} className={FIELD} />
          <p className="text-[11px] text-stone-400 mt-2">Web address: /journal/{journalSlug(newTitle) || "…"}</p>
          <div className="flex gap-3 mt-5">
            <button onClick={create} disabled={newTitle.trim().length < 2} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-40">Create draft</button>
            <button onClick={() => setCreating(false)} className="text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800">Cancel</button>
          </div>
        </div>
      )}

      {!form ? (
        <div className="mt-6 bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">Choose a post from the menu above, or write a new one.</div>
      ) : (
        <div className={`mt-6 grid grid-cols-1 gap-6 items-start ${showPreview ? "lg:grid-cols-2" : "xl:grid-cols-[1fr_340px]"}`}>
          {/* Writing canvas */}
          <div className={`bg-white rounded-2xl border border-stone-100 p-6 min-w-0 ${showPreview ? "lg:col-start-1 lg:row-start-1" : ""}`}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Post title"
              className="w-full text-2xl font-semibold text-stone-900 outline-none placeholder:text-stone-300 mb-2"
            />
            <input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Subtitle (optional)"
              className="w-full text-sm text-stone-500 outline-none placeholder:text-stone-300 mb-6 pb-4 border-b border-stone-100"
            />
            <BlockList
              key={originalSlug}
              kind="journal-post"
              value={form.body}
              onChange={(raw) => set("body", raw)}
              fieldsFor={() => []}
              resolve={() => ""}
              setBase={() => {}}
              preview={(b) => <GenericBlock block={b} variant="article" />}
            />

            <SeoSection form={form} set={set} />
          </div>

          {/* Settings sidebar */}
          <aside className={`bg-white rounded-2xl border border-stone-100 overflow-hidden min-w-0 ${showPreview ? "lg:col-start-1 lg:row-start-2" : "xl:sticky xl:top-24"}`}>
            <Panel title="Publishing" open={open === "publishing"} onToggle={() => toggle("publishing")}
              summary={`${form.published ? "Live" : "Draft"}${form.comingSoon ? " · Coming soon" : ""} · ${form.publishedAt.slice(0, 10)}`}>
              <Toggle label="Published" checked={form.published} onChange={(v) => set("published", v)} hint="Drafts are hidden from the Journal and from Google." />
              <Toggle label="Coming soon" checked={!!form.comingSoon} onChange={(v) => set("comingSoon", v)} hint="Listed with a Coming soon badge and no link through, and kept out of Google." />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Date</label>
                  <input type="date" value={form.publishedAt.slice(0, 10)} onChange={(e) => set("publishedAt", e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Read time</label>
                  <input type="number" min={0} value={form.readMinutes} onChange={(e) => set("readMinutes", Number(e.target.value))} className={FIELD} />
                  <p className="text-[11px] text-stone-400 mt-1">0 works it out.</p>
                </div>
              </div>
            </Panel>

            <Panel title="Summary and tags" open={open === "details"} onToggle={() => toggle("details")}
              summary={form.tags.length ? form.tags.join(", ") : "No tags"}>
              <Text label="Web address" value={form.slug} onChange={(v) => set("slug", journalSlug(v))} hint={`/journal/${form.slug}`} />
              <Text label="Summary" rows={3} value={form.excerpt} onChange={(v) => set("excerpt", v)} hint="Shown on the Journal cards." />
              <Text label="Tags" value={form.tags.join(", ")} onChange={(v) => set("tags", parseTags(v))} hint="Comma separated. Visitors can filter by these." />
            </Panel>

            <Panel title="Cover photo" open={open === "cover"} onToggle={() => toggle("cover")}
              summary={form.coverImage ? "Set" : "None yet"}>
              <ImagePicker label="Cover image" value={form.coverImage} onChange={(v) => set("coverImage", v)} />
              <Text label="Photo description" value={form.coverAlt} onChange={(v) => set("coverAlt", v)} hint="For search engines and screen readers." />
            </Panel>

          </aside>

          {showPreview && (
            <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[11px] uppercase tracking-widest text-stone-400">Live preview</p>
                <p className="text-[11px] text-stone-400">/journal/{form.slug}</p>
              </div>
              {/* The real article component, fed the unsaved form - so this is what it will look like. */}
              <div className="rounded-2xl border border-stone-200 bg-[#f5f0e8] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 border-b border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                </div>
                <PreviewFrame maxHeight="calc(100vh - 220px)">
                  <ArticleView post={form} preview />
                </PreviewFrame>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
