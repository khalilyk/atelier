"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import BlockList from "../components/BlockList";
import PreviewFrame from "../components/PreviewFrame";
import GenericBlock from "@/app/components/GenericBlock";
import PageView from "@/app/[slug]/PageView";
import { SITE_PAGES } from "@/lib/page-copy";
import { pageSlug, sortCustomPages, type CustomPage } from "@/lib/custom-pages";

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";
const PREVIEW_KEY = "atelier.custompages.preview";

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

type PanelKey = "publishing" | "details" | "hero" | "seo";

export default function CustomPagesAdmin() {
  const [list, setList] = useState<CustomPage[]>([]);
  const [form, setForm] = useState<CustomPage | null>(null);
  const [originalSlug, setOriginalSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [open, setOpen] = useState<PanelKey | null>("publishing");
  const toggle = (k: PanelKey) => setOpen((c) => (c === k ? null : k));
  const [showPreview, setShowPreview] = useState(() => {
    try { return window.localStorage.getItem(PREVIEW_KEY) !== "off"; } catch { return true; }
  });
  const togglePreview = () => setShowPreview((v) => {
    try { window.localStorage.setItem(PREVIEW_KEY, v ? "off" : "on"); } catch { /* ignore */ }
    return !v;
  });
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/custom-pages").then((r) => r.json())
      .then((d) => {
        const items: CustomPage[] = Array.isArray(d) ? d : [];
        setList(items);
        // Opened from the Pages list: show that page straight away.
        const wanted = new URLSearchParams(window.location.search).get("page");
        const match = wanted ? items.find((p) => p.slug === wanted) : null;
        if (match) { setForm(match); setOriginalSlug(match.slug); }
      })
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof CustomPage>(k: K, v: CustomPage[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function create() {
    setError("");
    const res = await fetch("/api/admin/custom-pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle }) });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not create the page"); return; }
    setList((l) => sortCustomPages([...l, d]));
    setForm(d); setOriginalSlug(d.slug);
    setCreating(false); setNewTitle("");
  }

  async function duplicate() {
    if (!form) return;
    setError("");
    const res = await fetch("/api/admin/custom-pages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duplicateOf: originalSlug, title: `${form.title} (copy)` }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not copy the page"); return; }
    setList((l) => sortCustomPages([...l, d]));
    setForm(d); setOriginalSlug(d.slug);
  }

  async function save() {
    if (!form) return;
    setSaving(true); setError("");
    const res = await fetch("/api/admin/custom-pages", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, previousSlug: originalSlug }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setError(d.error || "Save failed"); return; }
    setList((l) => sortCustomPages(l.filter((p) => p.slug !== originalSlug).concat(d)));
    setForm(d); setOriginalSlug(d.slug);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!form) return;
    if (!window.confirm(`Delete "${form.title}"? A backup is taken first, so it can be restored.`)) return;
    await fetch("/api/admin/custom-pages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: originalSlug }) });
    setList((l) => l.filter((p) => p.slug !== originalSlug));
    setForm(null);
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading pages…</div>;

  const live = list.filter((p) => p.published).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="sticky top-0 z-30 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#faf9f7]/95 backdrop-blur border-b border-stone-200/70">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative" ref={menu}>
            <button onClick={() => setListOpen((v) => !v)} className="flex items-center gap-2 border border-stone-200 bg-white rounded-xl px-4 py-2.5 text-sm text-stone-800 hover:border-[#b8934a]">
              <span className="truncate max-w-[220px]">{form ? form.title : "All pages"}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{list.length} · {live} live</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-stone-400 transition-transform ${listOpen ? "rotate-180" : ""}`} aria-hidden><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {listOpen && (
              <div className="absolute left-0 mt-2 w-[360px] max-h-[65vh] overflow-auto bg-white rounded-2xl border border-stone-200 shadow-xl z-40">
                {/* The site's own pages, for reference - their wording is edited under Pages. */}
                <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Site pages</p>
                {SITE_PAGES.map((p) => (
                  <Link key={p.kind} href={`/admin/content`} className="block px-5 py-2.5 hover:bg-stone-50">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm text-stone-700">{p.label}</span>
                      <span className="text-[11px] text-stone-400">{p.path}</span>
                    </span>
                  </Link>
                ))}

                <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-widest text-stone-400 font-semibold border-t border-stone-100 mt-2">Your pages</p>
                {list.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-stone-400">None yet. Use New page to add one.</p>
                ) : list.map((p) => (
                  <button key={p.slug} onClick={() => { setForm(p); setOriginalSlug(p.slug); setError(""); setListOpen(false); }}
                    className={`w-full text-left px-5 py-3 border-b border-stone-50 last:border-b-0 transition-colors ${originalSlug === p.slug ? "bg-[#b8934a]/10" : "hover:bg-stone-50"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-stone-900 truncate">{p.title}</span>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${p.published ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>{p.published ? "Live" : "Draft"}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5 truncate">/{p.slug}{p.showInNav ? " · in the footer" : ""}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { setCreating(true); setError(""); }} className="text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">New page</button>

          {form && <p className="text-xs text-stone-400 hidden xl:block">/{form.slug}</p>}

          <div className="ml-auto flex items-center gap-3">
            {form && (
              <>
                <button onClick={togglePreview}
                  className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg border transition-colors ${showPreview ? "border-[#b8934a] bg-[#b8934a]/10 text-[#b8934a]" : "border-stone-200 bg-white text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]"}`}>
                  Preview
                </button>
                <button onClick={duplicate} className="text-xs text-stone-500 hover:text-stone-900 hover:underline">Duplicate</button>
                <button onClick={remove} className="text-xs text-red-500 hover:underline">Delete</button>
                <a href={`/${form.slug}`} target="_blank" className="text-xs border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">{form.published ? "View" : "Preview"}</a>
                <button onClick={save} disabled={saving} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save page"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mt-6 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {creating && (
        <div className="mt-6 bg-white rounded-2xl border border-[#b8934a]/40 p-6">
          <label className={LABEL}>Page name</label>
          <input autoFocus value={newTitle} placeholder="e.g. Warranty" onChange={(e) => setNewTitle(e.target.value)} className={FIELD} />
          <p className="text-[11px] text-stone-400 mt-2">Web address: /{pageSlug(newTitle) || "…"}</p>
          <div className="flex gap-3 mt-5">
            <button onClick={create} disabled={newTitle.trim().length < 2} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-40">Create draft</button>
            <button onClick={() => setCreating(false)} className="text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800">Cancel</button>
          </div>
        </div>
      )}

      {!form ? (
        <div className="mt-6 bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">
          Choose a page from the menu above, or add a new one. The website&rsquo;s own pages are edited under Pages.
        </div>
      ) : (
        <div className={`mt-6 grid grid-cols-1 gap-6 items-start ${showPreview ? "lg:grid-cols-2" : "xl:grid-cols-[1fr_340px]"}`}>
          <div className={`bg-white rounded-2xl border border-stone-100 p-6 min-w-0 ${showPreview ? "lg:col-start-1 lg:row-start-1" : ""}`}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Page name"
              className="w-full text-2xl font-semibold text-stone-900 outline-none placeholder:text-stone-300 mb-2"
            />
            <input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="One line under the title (optional)"
              className="w-full text-sm text-stone-500 outline-none placeholder:text-stone-300 mb-6 pb-4 border-b border-stone-100"
            />
            <BlockList
              key={originalSlug}
              kind="custom-page"
              value={form.body}
              onChange={(raw) => set("body", raw)}
              fieldsFor={() => []}
              resolve={() => ""}
              setBase={() => {}}
              preview={(b) => <GenericBlock block={b} variant="article" />}
            />
          </div>

          <aside className={`bg-white rounded-2xl border border-stone-100 overflow-hidden min-w-0 ${showPreview ? "lg:col-start-1 lg:row-start-2" : "xl:sticky xl:top-24"}`}>
            <Panel title="Publishing" open={open === "publishing"} onToggle={() => toggle("publishing")}
              summary={`${form.published ? "Live" : "Draft"}${form.showInNav ? " · in the footer" : ""}`}>
              <Toggle label="Published" checked={form.published} onChange={(v) => set("published", v)} hint="A draft is invisible to visitors and to Google." />
              <Toggle label="Show in the footer" checked={form.showInNav} onChange={(v) => set("showInNav", v)} hint="Adds a link in the website footer." />
              <div>
                <label className={LABEL}>Position in the footer</label>
                <input type="number" min={0} value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={FIELD} />
                <p className="text-[11px] text-stone-400 mt-1">1 shows first. 0 sorts by name.</p>
              </div>
            </Panel>

            <Panel title="Web address" open={open === "details"} onToggle={() => toggle("details")} summary={`/${form.slug}`}>
              <Text label="Web address" value={form.slug} onChange={(v) => set("slug", pageSlug(v))} hint={`This page will live at /${form.slug}`} />
            </Panel>

            <Panel title="Banner photo" open={open === "hero"} onToggle={() => toggle("hero")} summary={form.heroImage ? "Set" : "None"}>
              <ImagePicker label="Banner image (optional)" value={form.heroImage} onChange={(v) => set("heroImage", v)} />
              <Text label="Photo description" value={form.heroAlt} onChange={(v) => set("heroAlt", v)} hint="For search engines and screen readers." />
            </Panel>

            <Panel title="Search listing" open={open === "seo"} onToggle={() => toggle("seo")}
              summary={form.metaTitle || form.metaDescription ? "Customised" : "Using the title and subtitle"}>
              <p className="text-xs text-stone-400">How this page appears on Google. Leave blank to use the title and subtitle.</p>
              <Text label="Meta title" value={form.metaTitle} onChange={(v) => set("metaTitle", v)} placeholder={form.title}
                hint={`${(form.metaTitle || form.title).length} characters - aim for under 60.`} />
              <Text label="Meta description" rows={3} value={form.metaDescription} onChange={(v) => set("metaDescription", v)} placeholder={form.subtitle}
                hint={`${(form.metaDescription || form.subtitle || "").length} characters - aim for 70 to 160.`} />
              <ImagePicker label="Share image (optional)" value={form.ogImage} onChange={(v) => set("ogImage", v)} />
            </Panel>
          </aside>

          {showPreview && (
            <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[11px] uppercase tracking-widest text-stone-400">Live preview</p>
                <p className="text-[11px] text-stone-400">/{form.slug}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-[#f5f0e8] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 border-b border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                </div>
                <PreviewFrame maxHeight="calc(100vh - 220px)">
                  <PageView page={form} preview />
                </PreviewFrame>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
