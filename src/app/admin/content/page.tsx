"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import BlockList from "../components/BlockList";
import PreviewFrame from "../components/PreviewFrame";
import SitePreview from "./SitePreview";
import SearchListing from "../components/SearchListing";
import SiteDefaults from "./SiteDefaults";

const SITE_DEFAULTS = "Site defaults";
import { specFromRegistry } from "@/lib/page-blocks";
import { PAGE_SECTION_KEYS, SITE_PAGE_BY_GROUP, SITE_PAGES, pageLayoutKey } from "@/lib/page-copy";
import { sortCustomPages, type CustomPage } from "@/lib/custom-pages";

const PREVIEW_KEY = "atelier.pages.preview";

type Field = { key: string; group: string; label: string; default: string; multiline?: boolean; image?: boolean; layout?: boolean };

export default function ContentAdmin() {
  const [registry, setRegistry] = useState<Field[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chosen, setChosen] = useState<string>("");
  const [ownPages, setOwnPages] = useState<CustomPage[]>([]);
  // On by default; the choice is remembered per browser.
  const [showPreview, setShowPreview] = useState(() => {
    try { return window.localStorage.getItem(PREVIEW_KEY) !== "off"; } catch { return true; }
  });
  const togglePreview = () => setShowPreview((v) => {
    try { window.localStorage.setItem(PREVIEW_KEY, v ? "off" : "on"); } catch { /* ignore */ }
    return !v;
  });

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d: { registry: Field[]; overrides: Record<string, string> }) => {
        setRegistry(d.registry);
        setOverrides(d.overrides || {});
        // seed the form with override-or-default for each key
        const seed: Record<string, string> = {};
        d.registry.forEach((f) => { seed[f.key] = d.overrides?.[f.key] ?? f.default; });
        setValues(seed);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Pages you created yourself are listed here too, and edited on their own screen.
    fetch("/api/admin/custom-pages").then((r) => r.json())
      .then((d) => setOwnPages(Array.isArray(d) ? sortCustomPages(d) : []))
      .catch(() => {});
  }, []);

  // Site pages first (they have block layouts), then the remaining groups.
  // Fields placed in a site page's blocks are edited there, so a group whose
  // fields all belong to another page (e.g. Atelier Difference) is not listed.
  const groups = useMemo(() => {
    const g: Record<string, Field[]> = {};
    for (const p of SITE_PAGES) g[p.group] = [];
    const placedElsewhere = new Map<string, string>();
    for (const p of SITE_PAGES) for (const k of Object.values(PAGE_SECTION_KEYS[p.kind] ?? {}).flat()) placedElsewhere.set(k, p.group);
    registry.forEach((f) => {
      if (f.layout) return;
      const home = placedElsewhere.get(f.key);
      if (home && home !== f.group) return;
      (g[f.group] ??= []).push(f);
    });
    return Object.fromEntries(Object.entries(g).filter(([name, list]) => list.length || SITE_PAGE_BY_GROUP[name]));
  }, [registry]);
  const groupNames = useMemo(() => Object.keys(groups), [groups]);
  const fieldByKey = useMemo(() => Object.fromEntries(registry.map((f) => [f.key, f])), [registry]);
  // The first group is open until one is picked - derived, so no extra render.
  const active = chosen || groupNames[0] || "";

  const isOverridden = (f: Field) => overrides[f.key] !== undefined && overrides[f.key] !== "";
  const changed = (f: Field) => (values[f.key] ?? f.default) !== (overrides[f.key] ?? f.default);
  const isDirty = registry.some(changed);

  async function save() {
    setSaving(true);
    // Start from the latest saved values so edits made elsewhere (Categories,
    // section order) are kept, then apply this page's fields. Only values that
    // differ from the default are stored, so blanks/resets fall back to code.
    const latest: Record<string, string> = await fetch("/api/admin/content").then((r) => r.json()).then((d) => d.overrides || {}).catch(() => overrides);
    const payload: Record<string, string> = { ...latest };
    // Only fields changed here are written; everything else keeps its latest saved value.
    registry.filter(changed).forEach((f) => {
      const v = values[f.key] ?? "";
      if (v !== f.default && v !== "") payload[f.key] = v;
      else delete payload[f.key];
    });
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setOverrides(payload);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetField(f: Field) {
    setValues((v) => ({ ...v, [f.key]: f.default }));
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading content…</div>;

  const editedCount = (group: string) => (groups[group] ?? []).filter(isOverridden).length;
  const sitePage = SITE_PAGE_BY_GROUP[active];
  // Only the site's own pages can be previewed; category wording is edited elsewhere.
  const preview = showPreview && !!sitePage && active !== SITE_DEFAULTS;
  const sectionKeys = sitePage ? PAGE_SECTION_KEYS[sitePage.kind] ?? {} : {};
  const placed = new Set(Object.values(sectionKeys).flat());
  const activeFields = (groups[active] ?? []).filter((f) => !placed.has(f.key));
  const categoryGroup = active.startsWith("Category - ");

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Pages</h1>
          <p className="text-stone-900 text-sm mt-1">Edit the copy shown across the website. Blank a field or press Reset to fall back to the default.</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
        {sitePage && (
          <button
            onClick={togglePreview}
            className={`text-xs uppercase tracking-widest px-3 py-3 rounded-xl border transition-colors ${showPreview ? "border-[#b8934a] bg-[#b8934a]/10 text-[#b8934a]" : "border-stone-200 bg-white text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]"}`}
          >
            Preview
          </button>
        )}
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className="shrink-0 bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left anchor nav - sticky */}
        <nav className={`md:w-56 shrink-0 md:sticky md:top-24 md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full ${preview ? "hidden" : "flex"}`}>
          {groupNames.map((group) => {
            const n = editedCount(group);
            const on = active === group;
            return (
              <button
                key={group}
                onClick={() => setChosen(group)}
                className={`shrink-0 md:w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${on ? "bg-[#b8934a] text-white" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <span className="truncate">{group}</span>
                {n > 0 && (
                  <span className={`shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${on ? "bg-white/25 text-white" : "bg-[#b8934a]/10 text-[#b8934a]"}`}>{n}</span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setChosen(SITE_DEFAULTS)}
            className={`shrink-0 md:w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${active === SITE_DEFAULTS ? "bg-[#b8934a] text-white" : "text-stone-600 hover:bg-stone-100"}`}
          >
            {SITE_DEFAULTS}
          </button>

          {/* Pages you created yourself */}
          <div className="md:mt-6 md:pt-4 md:border-t border-stone-200 flex md:flex-col gap-1 shrink-0">
            <p className="hidden md:block text-[10px] uppercase tracking-widest text-stone-400 font-semibold px-4 mb-2">Your pages</p>
            {ownPages.map((p) => (
              <Link key={p.slug} href={`/admin/pages?page=${p.slug}`}
                className="shrink-0 md:w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-100 transition-colors">
                <span className="truncate">{p.title}</span>
                {!p.published && <span className="shrink-0 text-[9px] uppercase tracking-widest text-stone-400">Draft</span>}
              </Link>
            ))}
            <Link href="/admin/pages"
              className="shrink-0 md:w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#b8934a] hover:bg-[#b8934a]/10 transition-colors">
              + New page
            </Link>
          </div>
        </nav>

        {/* Active page */}
        <div className={`flex-1 min-w-0 space-y-5 ${preview ? "" : "max-w-3xl"}`}>
          {active === SITE_DEFAULTS && <SiteDefaults />}
          {preview && (
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={active}
                onChange={(e) => setChosen(e.target.value)}
                className="border border-stone-200 bg-white rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
              >
                {[...groupNames, SITE_DEFAULTS].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {ownPages.length > 0 && (
                <span className="text-[11px] text-stone-400">Your pages are in the list on the left when the preview is off.</span>
              )}
            </div>
          )}
          {sitePage && (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-stone-900 font-semibold">{sitePage.label} page</h2>
                <a href={sitePage.path} target="_blank" className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">View page</a>
              </div>
              <BlockList
                kind={sitePage.kind}
                value={values[pageLayoutKey(sitePage.kind)]}
                onChange={(raw) => setValues((v) => ({ ...v, [pageLayoutKey(sitePage.kind)]: raw }))}
                fieldsFor={(type) => (sectionKeys[type] || []).map((k) => fieldByKey[k]).filter(Boolean).map(specFromRegistry)}
                resolve={(key) => values[key] ?? fieldByKey[key]?.default ?? ""}
                setBase={(key, v) => setValues((s) => ({ ...s, [key]: v }))}
                resetBase={(key) => { const f = fieldByKey[key]; if (f) setValues((s) => ({ ...s, [key]: f.default })); }}
              />
            </>
          )}
          {categoryGroup && (
            <div className="bg-[#b8934a]/5 border border-[#b8934a]/20 rounded-2xl px-5 py-4 text-sm text-stone-700">
              This category page is arranged as blocks in <Link href="/admin/categories" className="text-[#b8934a] underline">Categories</Link>. The fields below are its standard wording.
            </div>
          )}
          {sitePage && (
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="text-stone-800 font-semibold text-sm uppercase tracking-widest mb-4">Search listing</h3>
              <SearchListing path={sitePage.path} name={`${sitePage.label} page`} />
            </div>
          )}
          {activeFields.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
            {sitePage && <h3 className="text-stone-800 font-semibold text-sm uppercase tracking-widest">Other wording on this page</h3>}
            {activeFields.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-widest text-stone-400">{f.label}</label>
                  <div className="flex items-center gap-3">
                    {isOverridden(f) && <span className="text-[10px] uppercase tracking-widest text-[#b8934a]">Edited</span>}
                    {f.image && (values[f.key] ?? "") !== "" && (
                      <button type="button" onClick={() => setValues((v) => ({ ...v, [f.key]: "" }))} className="text-[11px] text-red-400 hover:text-red-600">Remove</button>
                    )}
                    <button type="button" onClick={() => resetField(f)} className="text-[11px] text-stone-400 hover:text-stone-700">Reset</button>
                  </div>
                </div>
                {f.image ? (
                  <ImagePicker value={values[f.key] ?? ""} onChange={(url) => setValues((v) => ({ ...v, [f.key]: url }))} />
                ) : f.multiline ? (
                  <textarea
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    rows={Math.min(14, Math.max(3, (values[f.key] ?? "").split("\n").length + 1))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-y leading-relaxed"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
                  />
                )}
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Live preview: the real page, drawn from what is in the editor now. */}
        {preview && sitePage && (
          <div className="hidden lg:block flex-1 min-w-[380px] max-w-[720px] lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] uppercase tracking-widest text-stone-400">Live preview</p>
              <p className="text-[11px] text-stone-400">{sitePage.path}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 border-b border-stone-200">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              </div>
              <PreviewFrame width={1440} maxHeight="calc(100vh - 220px)">
                <SitePreview kind={sitePage.kind} values={values} />
              </PreviewFrame>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
