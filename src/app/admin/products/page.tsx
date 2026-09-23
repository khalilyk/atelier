"use client";
import { useEffect, useMemo, useState } from "react";
import ImagePicker from "../components/ImagePicker";
import HotspotEditor from "../components/HotspotEditor";
import SearchListing from "../components/SearchListing";
import { hasHotspots, type HotspotBlock } from "@/lib/hotspots";
import BlockList from "../components/BlockList";
import { PRODUCT_SECTION_FIELDS, isProductKey, productKind, productValue } from "@/lib/product-blocks";

type Pair = { label: string; value: string };
type Product = Record<string, unknown> & { name?: string };
type CatalogEntry = { category: string; label?: string; template?: "windows-doors" | "joinery"; products: { slug: string; data: Product }[] };
type Overrides = Record<string, Record<string, unknown>>;

const BUILTIN_LABEL: Record<string, string> = {
  "windows-doors": "Windows & Doors", joinery: "Custom Joinery", bathrooms: "Bathroom Packages",
};

const STR_FIELDS = ["name", "tagline", "description", "categoryLabel", "certification", "packageStyle"];
const IMG_FIELDS = ["heroImg", "storyImg"];
const ARR_FIELDS = ["story", "configurations", "performance", "glassOptions", "finishOptions", "sizes"];
const PAIR_FIELDS = ["profiles", "details", "fixedInclusions"];

const FIELD_LABEL: Record<string, string> = {
  name: "Name", tagline: "Tagline", description: "Description", categoryLabel: "Category label",
  certification: "Certification", packageStyle: "Package style", heroImg: "Hero image", storyImg: "Story image",
  story: "Story paragraphs", configurations: "Configurations", performance: "Performance features", glassOptions: "Glass options",
  finishOptions: "Finish options", sizes: "Sizes", gallery: "Gallery",
  profiles: "Frame profiles (Label | Value)", details: "Details (Label | Value)", fixedInclusions: "Fixed inclusions (Label | Value)",
};

const linesToArr = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const arrToLines = (a: unknown) => (Array.isArray(a) ? (a as string[]).join("\n") : "");
const pairsToLines = (a: unknown) => (Array.isArray(a) ? (a as Pair[]).map((p) => `${p.label} | ${p.value}`).join("\n") : "");
const linesToPairs = (s: string): Pair[] =>
  s.split("\n").map((l) => { const i = l.indexOf("|"); if (i < 0) return { label: l.trim(), value: "" }; return { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() }; }).filter((p) => p.label);
const stripMeta = (o: Record<string, unknown>) => { const out: Record<string, unknown> = {}; for (const [k, v] of Object.entries(o)) if (k !== "__custom" && k !== "__deleted") out[k] = v; return out; };

export default function ProductsAdmin() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [gallery, setGallery] = useState<string[]>([]);
  const [hotspots, setHotspots] = useState<HotspotBlock | null>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const [blocks, setBlocks] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [content, setContent] = useState<{ overrides: Record<string, string>; defaults: Record<string, string> }>({ overrides: {}, defaults: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Built-in categories plus any created in Admin > Categories.
  const CATEGORIES = catalog.map((c) => c.category);
  const CATEGORY_LABEL: Record<string, string> = { ...BUILTIN_LABEL, ...Object.fromEntries(catalog.filter((c) => c.label).map((c) => [c.category, c.label as string])) };

  useEffect(() => {
    fetch("/api/admin/product-content").then((r) => r.json()).then((d) => {
      setCatalog(d.catalog || []); setOverrides(d.overrides || {}); setLoading(false);
    }).catch(() => setLoading(false));
    // Shared page wording (e.g. bathroom package pages), shown until a block overrides it.
    fetch("/api/admin/content").then((r) => r.json()).then((d) => setContent({
      overrides: d.overrides || {},
      defaults: Object.fromEntries((d.registry || []).map((f: { key: string; default: string }) => [f.key, f.default])),
    })).catch(() => {});
  }, []);

  const codeProduct = (key: string): Product | null => {
    const [cat, slug] = [key.split("/")[0], key.split("/").slice(1).join("/")];
    return catalog.find((c) => c.category === cat)?.products.find((p) => p.slug === slug)?.data ?? null;
  };
  const isCustom = (key: string) => !!overrides[key]?.__custom && !codeProduct(key);

  const base = useMemo<Product | null>(() => {
    if (!selected) return null;
    const code = codeProduct(selected);
    if (code) return code;
    const ov = overrides[selected];
    return ov?.__custom ? (stripMeta(ov) as Product) : null;
  }, [selected, catalog, overrides]);

  // Combined list per category: code products (hidden marked) + custom products.
  const lists = useMemo(() => {
    return CATEGORIES.map((category) => {
      const code = (catalog.find((c) => c.category === category)?.products ?? []).map((p) => ({ key: `${category}/${p.slug}`, name: (p.data.name as string) || p.slug, custom: false }));
      const codeSlugs = new Set(code.map((c) => c.key));
      const custom = Object.entries(overrides)
        .filter(([k, o]) => o.__custom && k.startsWith(`${category}/`) && !codeSlugs.has(k))
        .map(([k, o]) => ({ key: k, name: (o.name as string) || k.split("/").slice(1).join("/"), custom: true }));
      return { category, items: [...code, ...custom] };
    });
  }, [catalog, overrides]);

  function seedForm(data: Product | null) {
    const merged: Product = { ...(data || {}) };
    const f: Record<string, string> = {};
    [...STR_FIELDS, ...IMG_FIELDS].forEach((k) => { f[k] = (merged[k] as string) ?? ""; });
    ARR_FIELDS.forEach((k) => { f[k] = arrToLines(merged[k]); });
    PAIR_FIELDS.forEach((k) => { f[k] = pairsToLines(merged[k]); });
    setForm(f);
    setGallery(Array.isArray(merged.gallery) ? (merged.gallery as string[]) : []);
    setHotspots((merged.hotspots as HotspotBlock) || null);
    setComingSoon(!!merged.comingSoon);
    setBlocks(typeof merged.blocks === "string" ? merged.blocks : "");
  }

  function openProduct(key: string) {
    setSelected(key);
    const code = codeProduct(key);
    const ov = overrides[key] ?? {};
    seedForm(code ? ({ ...code, ...stripMeta(ov) } as Product) : (stripMeta(ov) as Product));
  }

  function buildOverride(): Record<string, unknown> {
    if (!selected) return {};
    const custom = isCustom(selected);
    const codeBase = codeProduct(selected);
    const o: Record<string, unknown> = {};
    const putStr = (k: string) => {
      const cur = form[k] ?? "";
      if (custom) { if (cur) o[k] = cur; }
      else if (cur !== ((codeBase?.[k] as string) ?? "")) o[k] = cur;
    };
    [...STR_FIELDS, ...IMG_FIELDS].forEach(putStr);
    ARR_FIELDS.forEach((k) => {
      const cur = linesToArr(form[k] ?? "");
      if (custom) { if (cur.length) o[k] = cur; }
      else if (JSON.stringify(cur) !== JSON.stringify((codeBase?.[k] as string[]) ?? [])) o[k] = cur;
    });
    PAIR_FIELDS.forEach((k) => {
      const cur = linesToPairs(form[k] ?? "");
      if (custom) { if (cur.length) o[k] = cur; }
      else if (JSON.stringify(cur) !== JSON.stringify((codeBase?.[k] as Pair[]) ?? [])) o[k] = cur;
    });
    // gallery
    if (custom) { if (gallery.length) o.gallery = gallery; }
    else if (JSON.stringify(gallery) !== JSON.stringify((codeBase?.gallery as string[]) ?? [])) o.gallery = gallery;
    // hotspot image (only stored once it has an image and at least one hotspot)
    const hs = hasHotspots(hotspots) ? hotspots : null;
    const codeHs = (codeBase?.hotspots as HotspotBlock | undefined) ?? null;
    if (JSON.stringify(hs) !== JSON.stringify(codeHs)) o.hotspots = hs ?? { image: "", spots: [] };
    // page blocks
    if (blocks !== ((codeBase?.blocks as string) ?? "")) o.blocks = blocks;
    // "coming soon" shows the card without a link through to the page
    if (comingSoon !== !!codeBase?.comingSoon) o.comingSoon = comingSoon;
    if (custom) o.__custom = true;
    if (overrides[selected]?.__deleted) o.__deleted = true;
    return o;
  }

  async function saveAll(next: Overrides) {
    setSaving(true);
    await fetch("/api/admin/product-content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    setOverrides(next); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function saveProduct() {
    if (!selected) return;
    const o = buildOverride();
    const next = { ...overrides };
    if (Object.keys(o).length === 0) delete next[selected];
    else next[selected] = o;
    saveAll(next);
  }

  function newProduct(category: string) {
    const slug = window.prompt("New product slug (e.g. asg-new-system):")?.trim();
    if (!slug) return;
    const key = `${category}/${slug}`;
    if (overrides[key] || codeProduct(key)) { window.alert("A product with that slug already exists."); return; }
    const name = window.prompt("Product name:")?.trim() || slug;
    const next = { ...overrides, [key]: { __custom: true, name, categoryLabel: CATEGORY_LABEL[category], tagline: "", heroImg: "", storyImg: "" } };
    saveAll(next);
    setSelected(key);
    seedForm({ name, categoryLabel: CATEGORY_LABEL[category] } as Product);
  }

  function deleteProduct() {
    if (!selected) return;
    const next = { ...overrides };
    if (isCustom(selected)) {
      if (!window.confirm("Delete this custom product permanently?")) return;
      delete next[selected];
      setSelected(null);
    } else {
      if (!window.confirm("Remove this product from the website? You can restore it later.")) return;
      next[selected] = { ...(next[selected] ?? {}), __deleted: true };
    }
    saveAll(next);
  }

  function restoreProduct() {
    if (!selected) return;
    const next = { ...overrides };
    if (next[selected]) { const { __deleted, ...rest } = next[selected]; void __deleted; if (Object.keys(rest).length) next[selected] = rest; else delete next[selected]; }
    saveAll(next);
  }

  function resetProduct() {
    if (!selected) return;
    const next = { ...overrides };
    delete next[selected];
    saveAll(next);
    const code = codeProduct(selected);
    seedForm(code);
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading catalog…</div>;

  // Block editor: the product page's layout for this product.
  const selCategory = selected ? selected.split("/")[0] : "";
  const kind = selected && base ? productKind(selCategory, base as { packageStyle?: string }, catalog.find((c) => c.category === selCategory)?.template) : null;
  const pairToRows = (v: string) => v.split("\n").map((l) => l.replace(/\s*\|\s*/, " :: ")).join("\n");
  const rowsToPair = (v: string) => v.split("\n").map((l) => l.replace(/\s*::\s*/, " | ")).join("\n");
  const formKeys = new Set([...STR_FIELDS, ...IMG_FIELDS, ...ARR_FIELDS, ...PAIR_FIELDS, "gallery"]);
  const productText = (key: string) => {
    if (key === "gallery") return gallery.join("\n");
    if (PAIR_FIELDS.includes(key)) return pairToRows(form[key] ?? "");
    if (formKeys.has(key)) return form[key] ?? "";
    return productValue({ ...(base || {}), ...stripMeta(overrides[selected || ""] || {}) } as never, key);
  };
  const setProductText = (key: string, v: string) => {
    if (key === "gallery") setGallery(v.split("\n").map((l) => l.trim()).filter(Boolean));
    else if (PAIR_FIELDS.includes(key)) setForm((f) => ({ ...f, [key]: rowsToPair(v) }));
    else setForm((f) => ({ ...f, [key]: v }));
  };

  const hidden = selected ? !!overrides[selected]?.__deleted : false;
  const custom = selected ? isCustom(selected) : false;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-stone-900 font-semibold text-xl">Products</h1>
        <p className="text-stone-900 text-sm mt-1">Add, edit, remove and re-image Classic and Signature products. Code products fall back to their defaults; Reset clears an edit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Product list */}
        <div className="space-y-6 md:sticky md:top-4 self-start md:max-h-[calc(100vh-2rem)] md:overflow-y-auto scrollbar-hide">
          {lists.map((c) => (
            <div key={c.category}>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setCollapsed((s) => ({ ...s, [c.category]: !s[c.category] }))} className="flex items-center gap-1.5 text-stone-500 font-semibold text-xs uppercase tracking-widest hover:text-stone-800 transition-colors">
                  <span className={`inline-block transition-transform ${collapsed[c.category] ? "-rotate-90" : ""}`}>▾</span>
                  {CATEGORY_LABEL[c.category]}
                  <span className="text-stone-300 font-normal normal-case tracking-normal">({c.items.length})</span>
                </button>
                {!c.category.startsWith("signature-") && <button onClick={() => newProduct(c.category)} className="text-[11px] text-[#b8934a] hover:underline">+ New</button>}
              </div>
              {!collapsed[c.category] && (
              <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                {c.items.map((p) => {
                  const hid = !!overrides[p.key]?.__deleted;
                  const edited = !!overrides[p.key] && !p.custom && !hid;
                  return (
                    <button key={p.key} onClick={() => openProduct(p.key)}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-stone-50 last:border-b-0 flex items-center justify-between transition-colors ${selected === p.key ? "bg-[#b8934a]/10 text-stone-900" : "text-stone-600 hover:bg-stone-50"}`}>
                      <span className={`truncate ${hid ? "line-through text-stone-300" : ""}`}>{p.name}</span>
                      <span className="ml-2 shrink-0 flex items-center gap-1.5">
                        {p.custom && <span className="text-[9px] uppercase tracking-widest text-[#b8934a] border border-[#b8934a]/40 rounded px-1">New</span>}
                        {edited && <span className="w-1.5 h-1.5 rounded-full bg-[#b8934a]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              )}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div>
          {!base && !custom ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400 text-sm">Select a product to edit, or add a new one.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <h2 className="font-semibold text-stone-900 flex items-center gap-2">{(base?.name as string) || selected}{custom && <span className="text-[10px] uppercase tracking-widest text-[#b8934a] border border-[#b8934a]/40 rounded px-1.5 py-0.5">Custom</span>}</h2>
                <div className="flex items-center gap-3">
                  {hidden ? (
                    <button onClick={restoreProduct} className="text-xs text-emerald-600 hover:underline">Restore</button>
                  ) : (
                    <button onClick={deleteProduct} className="text-xs text-red-500 hover:underline">{custom ? "Delete product" : "Remove"}</button>
                  )}
                  {!custom && <button onClick={resetProduct} className="text-xs text-stone-400 hover:text-stone-700">Reset</button>}
                  <button onClick={saveProduct} disabled={saving} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50">
                    {saving ? "Saving…" : saved ? "Saved ✓" : "Save Product"}
                  </button>
                </div>
              </div>

              {hidden && <p className="text-xs text-amber-600 mb-4">This product is hidden from the website. Restore it to show again.</p>}

              {/* Coming soon: the card is shown, but it does not open a page. */}
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <button type="button" onClick={() => setComingSoon(!comingSoon)}
                  className={`mt-0.5 w-10 h-6 rounded-full relative transition-colors shrink-0 ${comingSoon ? "bg-[#b8934a]" : "bg-stone-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${comingSoon ? "left-[18px]" : "left-0.5"}`} />
                </button>
                <span>
                  <span className="text-sm text-stone-800">Coming soon</span>
                  <span className="block text-[11px] text-stone-400">Shows the product on the category page with a Coming soon badge, and no link through to its page.</span>
                </span>
              </label>

              {/* Hero image preview */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-6 flex items-center justify-center">
                {form.heroImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.heroImg} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-stone-300 text-3xl">◫</span>
                )}
              </div>

              <div className="space-y-5">
                {/* Page blocks */}
                {kind && (
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Page blocks</label>
                      <span className="text-[11px] text-stone-400">Saved with Save Product</span>
                    </div>
                    <BlockList
                      key={selected}
                      kind={kind}
                      value={blocks}
                      onChange={setBlocks}
                      fieldsFor={(type) => PRODUCT_SECTION_FIELDS[kind][type] ?? []}
                      resolve={(key) => (isProductKey(key) ? productText(key) : content.overrides[key] ?? content.defaults[key] ?? "")}
                      setBase={setProductText}
                      isBaseKey={(key) => formKeys.has(key)}
                      renderExtra={(type) => (type === "hotspots" ? <HotspotEditor value={hotspots} onChange={setHotspots} /> : null)}
                    />
                  </div>
                )}

                {/* How this product appears on Google */}
                <div className="rounded-2xl border border-stone-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">Search listing</p>
                  <SearchListing
                    path={`/classic/${selected ?? ""}`}
                    name={(form.name as string) || (selected ?? "")}
                    fallbackTitle={(form.name as string) || (selected ?? "")}
                    fallbackDescription={(form.description as string) || (form.tagline as string) || ""}
                  />
                </div>

                {/* Everything the blocks above already cover, as plain fields. */}
                <div className="rounded-2xl border border-stone-200 overflow-hidden">
                  <button type="button" onClick={() => setAdvanced((a) => !a)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50">
                    <span>
                      <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">All fields</span>
                      <span className="block text-[11px] text-stone-400">Every field for this product in one list - the same content as the blocks above.</span>
                    </span>
                    <span className={`text-stone-400 text-xs transition-transform ${advanced ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {advanced && (
                    <div className="px-4 pb-5 pt-2 border-t border-stone-100 space-y-4">
                      {STR_FIELDS.filter((k) => (base && base[k] !== undefined) || form[k] || custom).map((k) => (
                        <div key={k}>
                          <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{FIELD_LABEL[k]}</label>
                          {k === "description" || k === "tagline" ? (
                            <textarea value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={k === "description" ? 3 : 2}
                              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-y" />
                          ) : (
                            <input type="text" value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60" />
                          )}
                        </div>
                      ))}

                      {IMG_FIELDS.map((k) => (
                        <ImagePicker key={k} label={FIELD_LABEL[k]} value={form[k] ?? ""} onChange={(url) => setForm((f) => ({ ...f, [k]: url }))} />
                      ))}

                      {/* Gallery manager */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs uppercase tracking-widest text-stone-400">Gallery</label>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          {gallery.map((url, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => setGallery((g) => g.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                            </div>
                          ))}
                          <div className="w-64">
                            <ImagePicker value="" onChange={(url) => { if (url) setGallery((g) => [...g, url]); }} />
                          </div>
                        </div>
                      </div>

                                      {[...ARR_FIELDS, ...PAIR_FIELDS].filter((k) => (base && base[k] !== undefined) || form[k]).map((k) => (
                        <div key={k}>
                          <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{FIELD_LABEL[k]} <span className="text-stone-300 lowercase tracking-normal">- one per line</span></label>
                          <textarea value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                            rows={Math.min(12, Math.max(2, (form[k] ?? "").split("\n").length + 1))}
                            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-y font-mono" style={{ fontSize: "12px" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
