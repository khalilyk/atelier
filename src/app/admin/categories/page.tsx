"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import BuiltInCategoryEditor, { BUILT_IN } from "./BuiltInCategoryEditor";
import SearchListing from "../components/SearchListing";
import BlockList from "../components/BlockList";
import { CUSTOM_FIELDS } from "@/lib/page-blocks";
import { slugify, TEMPLATE_LABEL, type CategoryTemplate, type CustomCategory } from "@/lib/categories";

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

function Text({ label, value, onChange, hint, rows }: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD} resize-y leading-relaxed`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={FIELD} />
      )}
      {hint && <p className="text-[11px] text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button type="button" onClick={() => onChange(!checked)}
        className={`mt-0.5 w-10 h-6 rounded-full relative transition-colors shrink-0 ${checked ? "bg-[#b8934a]" : "bg-stone-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      <span>
        <span className="text-sm text-stone-800">{label}</span>
        {hint && <span className="block text-[11px] text-stone-400">{hint}</span>}
      </span>
    </label>
  );
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-stone-100 p-6">
      <h2 className="text-stone-800 font-semibold text-sm uppercase tracking-widest mb-1">{title}</h2>
      {note && <p className="text-xs text-stone-400 mb-4">{note}</p>}
      {!note && <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function CategoriesAdmin() {
  const [list, setList] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomCategory | null>(null);
  const [builtIn, setBuiltIn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [newTemplate, setNewTemplate] = useState<CategoryTemplate>("joinery");

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof CustomCategory>(k: K, v: CustomCategory[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function create() {
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, slug: newSlug || slugify(newLabel), template: newTemplate }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not create category"); return; }
    setList((l) => [...l, d]);
    setForm(d);
    setBuiltIn(null);
    setCreating(false); setNewLabel(""); setNewSlug(""); setSlugTouched(false);
  }

  async function duplicate(source?: { builtIn: string; label: string }) {
    if (!source && !form) return;
    setError("");
    const payload = source
      ? { duplicateBuiltIn: source.builtIn, label: `${source.label} (copy)` }
      : { duplicateOf: form!.slug, label: `${form!.label} (copy)` };
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Could not copy the category"); return; }
    setList((l) => [...l, d]);
    setForm(d);
    setBuiltIn(null);
  }

  async function save() {
    if (!form) return;
    setSaving(true); setError("");
    const res = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setError(d.error || "Save failed"); return; }
    setList((l) => l.map((c) => (c.slug === d.slug ? d : c)));
    setForm(d);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!form) return;
    if (!window.confirm(`Delete "${form.label}"? The page will be removed from the site. Its products will no longer be shown.`)) return;
    await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: form.slug }) });
    setList((l) => l.filter((c) => c.slug !== form.slug));
    setForm(null);
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading categories…</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Categories</h1>
          <p className="text-stone-900 text-sm mt-1 max-w-2xl">
            Edit the built-in categories, or create a new Classic category from an existing page layout. Edit content and images here, add its products in Products, then publish and add it to the navigation.
          </p>
        </div>
        <button onClick={() => { setCreating(true); setError(""); }} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c]">New category</button>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {creating && (
        <div className="mb-8 bg-white rounded-2xl border border-[#b8934a]/40 p-6">
          <h2 className="text-stone-800 font-semibold text-sm uppercase tracking-widest mb-4">New category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Name</label>
              <input autoFocus value={newLabel} placeholder="e.g. Flooring"
                onChange={(e) => { setNewLabel(e.target.value); if (!slugTouched) setNewSlug(slugify(e.target.value)); }} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>URL</label>
              <div className="flex items-center gap-1 text-sm text-stone-400">
                <span className="shrink-0">/classic/</span>
                <input value={newSlug} onChange={(e) => { setSlugTouched(true); setNewSlug(slugify(e.target.value)); }} className={FIELD} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Copy the layout of</label>
              <select value={newTemplate} onChange={(e) => setNewTemplate(e.target.value as CategoryTemplate)} className={FIELD}>
                {(Object.keys(TEMPLATE_LABEL) as CategoryTemplate[]).map((t) => <option key={t} value={t}>{TEMPLATE_LABEL[t]}</option>)}
              </select>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-3">The new page starts as a draft pre-filled with placeholder copy from the chosen layout, so nothing goes live until you publish it.</p>
          <div className="flex gap-3 mt-5">
            <button onClick={create} disabled={newLabel.trim().length < 2} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-40">Create draft</button>
            <button onClick={() => setCreating(false)} className="text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* List */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden lg:sticky lg:top-24">
          <div className="px-5 py-3 border-b border-stone-50 text-[10px] uppercase tracking-widest text-stone-400">Built-in</div>
          {BUILT_IN.map((c) => (
            <button key={c.slug} onClick={() => { setBuiltIn(c.slug); setForm(null); setError(""); }}
              className={`w-full text-left px-5 py-3.5 border-b border-stone-50 transition-colors ${builtIn === c.slug ? "bg-[#b8934a]/10" : "hover:bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-900 truncate">{c.label}</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 bg-emerald-50 text-emerald-600">Live</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">/classic/{c.slug}</p>
            </button>
          ))}
          <div className="px-5 py-3 border-b border-stone-50 text-[10px] uppercase tracking-widest text-stone-400">Your categories</div>
          {list.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-400">None yet. Use New category to add one.</p>
          ) : list.map((c) => (
            <button key={c.slug} onClick={() => { setForm(c); setBuiltIn(null); setError(""); }}
              className={`w-full text-left px-5 py-3.5 border-b border-stone-50 last:border-b-0 transition-colors ${form?.slug === c.slug ? "bg-[#b8934a]/10" : "hover:bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-900 truncate">{c.label}</span>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${c.published ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>{c.published ? "Live" : "Draft"}</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">/classic/{c.slug} · {c.template === "joinery" ? "Joinery layout" : "Windows layout"}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        {builtIn ? (
          <BuiltInCategoryEditor
            key={builtIn}
            slug={builtIn}
            onDuplicate={() => duplicate({ builtIn, label: BUILT_IN.find((c) => c.slug === builtIn)?.label ?? builtIn })}
          />
        ) : !form ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">Select a category to edit, or create a new one.</div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between gap-3 flex-wrap lg:sticky lg:top-24 z-10">
              <div>
                <h2 className="font-semibold text-stone-900">{form.label}</h2>
                <p className="text-xs text-stone-400">/classic/{form.slug}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a href={`/classic/${form.slug}?preview=1`} target="_blank" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Preview</a>
                <Link href="/admin/products" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Manage products</Link>
                <button onClick={() => duplicate()} className="text-xs text-stone-500 hover:text-stone-900 hover:underline">Duplicate</button>
                <button onClick={remove} className="text-xs text-red-500 hover:underline">Delete</button>
                <button onClick={save} disabled={saving} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
                </button>
              </div>
            </div>

            <Card title="Search listing" note="How this category appears on Google.">
              <SearchListing path={`/classic/${form.slug}`} name={form.label} fallbackDescription={form.heroIntro} />
            </Card>

            <Card title="Visibility" note="Drafts are hidden from visitors. Use Preview to check a draft while signed in.">
              <Toggle label="Published" checked={form.published} onChange={(v) => set("published", v)} hint="Make the page live at its URL." />
              <Toggle label="Show in navigation" checked={form.showInNav} onChange={(v) => set("showInNav", v)} hint="Adds it to the Classic dropdown in the header (only once published)." />
              <Toggle label="Show on the Classic page" checked={form.showOnLanding} onChange={(v) => set("showOnLanding", v)} hint="Adds a section to /classic (only once published)." />
              <Toggle label="Coming soon" checked={!!form.comingSoon} onChange={(v) => set("comingSoon", v)} hint="Listed with a Coming soon badge instead of a link, and kept out of the menu and out of Google." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Text label="Name" value={form.label} onChange={(v) => set("label", v)} />
                <div>
                  <label className={LABEL}>Layout</label>
                  <select value={form.template} onChange={(e) => set("template", e.target.value as CategoryTemplate)} className={FIELD}>
                    {(Object.keys(TEMPLATE_LABEL) as CategoryTemplate[]).map((t) => <option key={t} value={t}>{TEMPLATE_LABEL[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Order</label>
                  <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={FIELD} />
                </div>
              </div>
            </Card>

            <Card title="Page blocks" note="Blocks you haven't edited use this category's standard wording.">
              <BlockList
                kind="custom"
                value={form.layout}
                onChange={(raw) => set("layout", raw)}
                fieldsFor={(type) => CUSTOM_FIELDS[type] ?? []}
                resolve={(key) => String((form as unknown as Record<string, unknown>)[key] ?? "")}
                setBase={(key, v) => setForm((f) => (f ? ({ ...f, [key]: v } as CustomCategory) : f))}
              />
            </Card>

            <Card title="Classic page section" note="Shown on /classic when 'Show on the Classic page' is on.">
              <Text label="Quote" rows={2} value={form.landingQuote} onChange={(v) => set("landingQuote", v)} />
              <Text label="Body" rows={3} value={form.landingBody} onChange={(v) => set("landingBody", v)} />
              <ImagePicker label="Image" value={form.landingImg} onChange={(v) => set("landingImg", v)} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
