"use client";
import { useState, useRef, useEffect } from "react";
import MediaPicker from "../../components/MediaPicker";

type ParsedProduct = { name: string; desc: string; tag: string; image: string };
type Category = { id: string; name: string };

const NEW_CAT_VALUE = "__new__";

export default function ImportPage() {
  const [collection, setCollection] = useState<"classic" | "signature" | "">("");
  const [classicCats, setClassicCats] = useState<Category[]>([]);
  const [signatureCats, setSignatureCats] = useState<Category[]>([]);
  const [catId, setCatId] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedProduct[] | null>(null);
  const [editItems, setEditItems] = useState<ParsedProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [parseStage, setParseStage] = useState(0);
  const [rawSample, setRawSample] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const STAGES = [
    { label: "Reading PDF structure", pct: 12 },
    { label: "Analysing page layout", pct: 28 },
    { label: "Extracting raw text", pct: 45 },
    { label: "Translating content", pct: 62 },
    { label: "Identifying products", pct: 78 },
    { label: "Capturing dimensions", pct: 90 },
    { label: "Finalising data", pct: 97 },
  ];

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(d => {
      setClassicCats((d.classic || []).map((c: Category) => ({ id: c.id, name: c.name })));
      setSignatureCats((d.signature || []).map((c: Category) => ({ id: c.id, name: c.name })));
    });
  }, []);

  // Reset category when collection changes
  function handleCollectionChange(col: "classic" | "signature") {
    setCollection(col);
    setCatId("");
    setNewCatId("");
    setNewCatName("");
    setParsed(null);
    setEditItems([]);
    setError("");
  }

  const activeCats = collection === "classic" ? classicCats : collection === "signature" ? signatureCats : [];

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  }

  async function handleParse() {
    if (!file) return;
    const targetCat = catId === NEW_CAT_VALUE ? newCatId : catId;
    if (!targetCat) { setError("Please select or create a category."); return; }
    setError("");
    setParsing(true);
    setParseStage(0);

    // Animate through stages while the real fetch runs
    let stageIdx = 0;
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES.length - 1);
      setParseStage(stageIdx);
    }, 600);

    const fd = new FormData();
    fd.append("pdf", file);
    fd.append("catId", targetCat);
    const res = await fetch("/api/admin/import-pdf", { method: "POST", body: fd });
    const data = await res.json();

    clearInterval(stageTimer);
    setParseStage(STAGES.length - 1);
    await new Promise(r => setTimeout(r, 400)); // hold final stage briefly
    setParsing(false);
    if (data.error) { setError(data.error); return; }
    setParsed(data.products);
    setEditItems(data.products);
    setRawSample(data.rawSample || "");
  }

  async function handleSave() {
    const targetCat = catId === NEW_CAT_VALUE ? newCatId : catId;
    if (!targetCat || editItems.length === 0 || !collection) return;
    setSaving(true);
    await fetch("/api/admin/import-pdf", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, catId: targetCat, catName: newCatName || targetCat, items: editItems }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateItem(i: number, patch: Partial<ParsedProduct>) {
    setEditItems(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  function removeItem(i: number) {
    setEditItems(prev => prev.filter((_, idx) => idx !== i));
  }

  const targetCat = catId === NEW_CAT_VALUE ? newCatId : catId;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-stone-900 font-semibold text-lg">Import from PDF</h2>
          <p className="text-stone-400 text-sm mt-0.5">Upload a supplier PDF to extract and add products to a category</p>
        </div>
        <a href="/admin/products" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">← Back to Products</a>
      </div>

      {/* Step 1: Collection */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
        <h3 className="text-stone-700 font-semibold text-sm">1. Select Collection</h3>
        <div className="grid grid-cols-2 gap-3">
          {(["classic", "signature"] as const).map(col => (
            <button
              key={col}
              onClick={() => handleCollectionChange(col)}
              className={`py-4 rounded-xl border-2 text-sm font-medium uppercase tracking-widest transition-all duration-200 ${
                collection === col
                  ? col === "classic"
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-[#b8934a] bg-[#b8934a] text-white"
                  : "border-stone-200 text-stone-500 hover:border-stone-400"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Category */}
      {collection && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
          <h3 className="text-stone-700 font-semibold text-sm">2. Select Category</h3>
          <select
            value={catId}
            onChange={e => setCatId(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
          >
            <option value="">- Choose a {collection} category -</option>
            {activeCats.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value={NEW_CAT_VALUE}>+ Create new category</option>
          </select>

          {catId === NEW_CAT_VALUE && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Category ID (slug)</label>
                <input
                  value={newCatId}
                  onChange={e => setNewCatId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="e.g. vanities"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Display Name</label>
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Vanities"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Upload PDF */}
      {collection && catId && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
          <h3 className="text-stone-700 font-semibold text-sm">3. Upload PDF</h3>
          <div
            ref={dropRef}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center hover:border-[#b8934a]/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("pdf-input")?.click()}
          >
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div>
                <p className="text-sm font-medium text-stone-800">📄 {file.name}</p>
                <p className="text-xs text-stone-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-stone-400 text-sm">Drag & drop a PDF here, or click to browse</p>
                <p className="text-stone-300 text-xs mt-1">Supplier catalogues, product lists, spec sheets</p>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {parsing ? (
            <div className="bg-[#0a0908] rounded-xl p-6 space-y-4">
              {/* Stage label */}
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium tracking-wide">{STAGES[parseStage].label}</p>
                <p className="text-[#b8934a] text-sm font-mono tabular-nums">{STAGES[parseStage].pct}%</p>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b8934a] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${STAGES[parseStage].pct}%` }}
                />
              </div>

              {/* Stage dots */}
              <div className="flex items-center gap-2 pt-1">
                {STAGES.map((s, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= parseStage ? "bg-[#b8934a]" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Animated dots */}
              <p className="text-white/30 text-xs tracking-widest">
                {["●", "●", "●"].map((dot, i) => (
                  <span
                    key={i}
                    style={{ opacity: ((parseStage + i) % 3 === 0) ? 1 : 0.2, transition: "opacity 0.3s", marginRight: 4 }}
                  >
                    {dot}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <button
              onClick={handleParse}
              disabled={!file || !targetCat}
              className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-40"
            >
              Extract Products from PDF
            </button>
          )}
        </div>
      )}

      {/* Step 4: Review & edit */}
      {parsed !== null && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-stone-700 font-semibold text-sm">
              4. Review Products <span className="text-stone-400 font-normal">({editItems.length} found)</span>
            </h3>
            <button
              onClick={() => setEditItems(prev => [...prev, { name: "", desc: "", tag: "", image: "" }])}
              className="text-xs text-[#b8934a] hover:text-stone-800 transition-colors"
            >
              + Add manually
            </button>
          </div>

          {editItems.length === 0 && (
            <div className="space-y-3">
              <p className="text-stone-400 text-sm">
                No products auto-detected in this PDF&apos;s layout. Add them manually below, or review the extracted text to see what was read.
              </p>
              {rawSample && (
                <details className="bg-stone-50 rounded-xl border border-stone-100 p-4">
                  <summary className="text-xs uppercase tracking-widest text-stone-400 cursor-pointer select-none">
                    Extracted text (first 4000 chars)
                  </summary>
                  <pre className="mt-3 text-xs text-stone-600 whitespace-pre-wrap max-h-72 overflow-y-auto font-mono">{rawSample}</pre>
                </details>
              )}
            </div>
          )}

          <div className="space-y-3">
            {editItems.map((item, i) => (
              <div key={i} className="border border-stone-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors relative group"
                    onClick={() => setPickerIndex(i)}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-stone-300 text-xl">◫</span>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs">Edit</span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      value={item.name}
                      onChange={e => updateItem(i, { name: e.target.value })}
                      placeholder="Product name / code"
                      className="col-span-2 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                    />
                    <input
                      value={item.tag}
                      onChange={e => updateItem(i, { tag: e.target.value })}
                      placeholder="Tag (e.g. 900mm)"
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                    />
                    <input
                      value={item.desc}
                      onChange={e => updateItem(i, { desc: e.target.value })}
                      placeholder="Description / dimensions"
                      className="col-span-3 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                    />
                  </div>

                  <button onClick={() => removeItem(i)} className="text-stone-300 hover:text-red-400 transition-colors text-lg shrink-0 mt-0.5">✕</button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || editItems.length === 0}
            className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-40 w-full"
          >
            {saving ? "Saving…" : saved ? `✓ Saved to ${collection} / ${targetCat}` : `Save ${editItems.length} Products → ${collection} / ${targetCat}`}
          </button>
        </div>
      )}

      {pickerIndex !== null && (
        <MediaPicker
          title="Select Product Image"
          onSelect={url => { updateItem(pickerIndex, { image: url }); setPickerIndex(null); }}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </div>
  );
}
