"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import BlockList from "../components/BlockList";
import type { PageKind } from "@/lib/section-layout";
import { specFromRegistry } from "@/lib/page-blocks";
import { layoutKey, sectionFieldKeys } from "@/lib/category-copy";

type Field = { key: string; group: string; label: string; default: string; multiline?: boolean; image?: boolean; layout?: boolean };

export const BUILT_IN: { slug: string; label: string; groups: string[] }[] = [
  { slug: "windows-doors", label: "Windows & Doors", groups: ["Category - Windows & Doors"] },
  { slug: "joinery", label: "Custom Joinery", groups: ["Category - Custom Joinery"] },
  { slug: "bathrooms", label: "Bathroom Packages", groups: ["Category - Bathroom Packages", "Bathroom Package Page"] },
];

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400";

// Edits a built-in category's copy and images. Values live in Site Content, so
// changes here and on Pages stay in sync; a field equal to its default is cleared.
export default function BuiltInCategoryEditor({ slug, onDuplicate }: { slug: string; onDuplicate?: () => void }) {
  const cat = BUILT_IN.find((c) => c.slug === slug)!;
  const [registry, setRegistry] = useState<Field[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content").then((r) => r.json()).then((d) => {
      const reg: Field[] = d.registry || [];
      const ov: Record<string, string> = d.overrides || {};
      setRegistry(reg); setOverrides(ov);
      setValues(Object.fromEntries(reg.map((f) => [f.key, ov[f.key] ?? f.default])));
    }).catch(() => setError("Could not load content")).finally(() => setLoading(false));
  }, [slug]); // remounted per category via key

  const fields = registry.filter((f) => cat.groups.includes(f.group));
  const dirty = fields.some((f) => (values[f.key] ?? "") !== (overrides[f.key] ?? f.default));

  async function save() {
    setSaving(true); setError("");
    // Re-read so edits made elsewhere (Pages) in the meantime are kept.
    const latest: Record<string, string> = await fetch("/api/admin/content").then((r) => r.json()).then((d) => d.overrides || {}).catch(() => overrides);
    const next = { ...latest };
    for (const f of fields) {
      const v = values[f.key] ?? "";
      if (v === f.default || v === "") delete next[f.key];
      else next[f.key] = v;
    }
    const res = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    setSaving(false);
    if (!res.ok) { setError("Save failed"); return; }
    setOverrides(next);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const bySection = sectionFieldKeys(slug);
  const placed = new Set(Object.values(bySection).flat());
  const fieldByKey = Object.fromEntries(fields.map((f) => [f.key, f]));
  const extra = fields.filter((f) => !f.layout && !placed.has(f.key));

  const renderField = (f: Field) => {
    const v = values[f.key] ?? "";
    const changed = v !== f.default;
    return (
      <div key={f.key}>
        <div className="flex items-center justify-between mb-1.5 gap-3">
          <label className={LABEL}>{f.label}</label>
          {changed && (
            <button type="button" onClick={() => setValues((s) => ({ ...s, [f.key]: f.default }))} className="text-[11px] text-stone-400 hover:text-[#b8934a] shrink-0">Reset</button>
          )}
        </div>
        {f.image ? (
          <ImagePicker value={v} onChange={(url) => setValues((s) => ({ ...s, [f.key]: url }))} />
        ) : f.multiline ? (
          <textarea value={v} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
            rows={Math.min(14, Math.max(3, v.split("\n").length + 1))} className={`${FIELD} resize-y leading-relaxed`} />
        ) : (
          <input value={v} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} className={FIELD} />
        )}
      </div>
    );
  };

  if (loading) return <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between gap-3 flex-wrap lg:sticky lg:top-24 z-10">
        <div>
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            {cat.label}
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Live</span>
          </h2>
          <p className="text-xs text-stone-400">/classic/{cat.slug} · built-in</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <a href={`/classic/${cat.slug}`} target="_blank" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">View page</a>
          <Link href="/admin/products" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Manage products</Link>
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate as a new category"
              aria-label="Duplicate as a new category"
              className="w-9 h-9 rounded-lg border border-stone-200 text-stone-500 flex items-center justify-center hover:border-[#b8934a] hover:text-[#b8934a] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
              </svg>
            </button>
          )}
          {slug === "bathrooms" && <Link href="/admin/images" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Package photos</Link>}
          <button onClick={save} disabled={saving || !dirty} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <BlockList
        kind={slug as PageKind}
        value={values[layoutKey(slug)]}
        onChange={(raw) => setValues((v) => ({ ...v, [layoutKey(slug)]: raw }))}
        fieldsFor={(type) => (bySection[type] || []).map((k) => fieldByKey[k]).filter(Boolean).map(specFromRegistry)}
        resolve={(key) => values[key] ?? fieldByKey[key]?.default ?? ""}
        setBase={(key, v) => setValues((s) => ({ ...s, [key]: v }))}
        resetBase={(key) => { const f = fieldByKey[key]; if (f && values[key] !== f.default) setValues((s) => ({ ...s, [key]: f.default })); }}
      />

      {extra.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-100 p-6">
          <h3 className="text-stone-800 font-semibold text-sm uppercase tracking-widest mb-1">{slug === "bathrooms" ? "Individual package pages" : "Other"}</h3>
          <p className="text-xs text-stone-400 mb-5">{slug === "bathrooms" ? "Shared wording used on every bathroom package page." : "Fields not tied to a single section."}</p>
          <div className="space-y-4">{extra.map(renderField)}</div>
        </section>
      )}
    </div>
  );
}
