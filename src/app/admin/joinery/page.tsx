"use client";
import { useEffect, useMemo, useState } from "react";

// Local mirrors of the server engine types (engine.ts is server-only).
type CabinetLine = { no: number; description: string; length?: string; width?: string; height?: string };
type Materials = { door?: string; body?: string; back?: string; hardware?: string };
type SupplierItem = { title: string; materials: Materials; lines: CabinetLine[]; cabinetUsd: number; accessories: string[]; accessoriesUsd: number };
type PricedItem = { title: string; materials: Materials; lines: CabinetLine[]; cabinetAud: number; accessories: string[]; accessoriesAud: number; hasAccessories: boolean };
type LogisticsComponent = { key: string; label: string; aud: number; benchmark: number };
type Assertion = { id: string; label: string; pass: boolean; detail: string };
type Flag = { level: "auto-removed" | "review" | "info"; item: string; message: string };
type Totals = { goods: number; logistics: number; exGst: number; gst: number; incGst: number; itemCount: number };
type Report = {
  fxRate: number; fxDate: string; marginFactor: number; goodsUsd: number; goodsCostAud: number; goodsSellAud: number;
  logistics: LogisticsComponent[]; logisticsTotal: number; revenueExGst: number; totalCost: number; profit: number; marginPctOfRevenue: number;
};
type PriceResult = { priced: PricedItem[]; logistics: { components: LogisticsComponent[]; totalAud: number }; totals: Totals; assertions: Assertion[]; report: Report; flags: Flag[]; incoterm: string };
type Settings = {
  marginFactor: number; fxSanityBandPct: number; lastRate: number; gstRate: number;
  logChinaLegFob: number; logChinaLegExw: number; logQaInspection: number; logOceanFreight: number; logAuPortTerminal: number; logCustomsStatutory: number; logBrokerageDelivery: number;
};

const money = (n: number) => (Number(n) || 0).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
const FIELD = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-[10px] uppercase tracking-widest text-stone-400 mb-1 block";

const emptyItem = (): SupplierItem => ({ title: "", materials: {}, lines: [{ no: 1, description: "" }], cabinetUsd: 0, accessories: [], accessoriesUsd: 0 });

export default function JoineryBot() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rate, setRate] = useState(0);
  const [rateDate, setRateDate] = useState("");
  const [fxMsg, setFxMsg] = useState("");
  const [fxHalt, setFxHalt] = useState("");
  const [fxLoading, setFxLoading] = useState(false);

  const [incoterm, setIncoterm] = useState<"FOB" | "EXW">("FOB");
  const [supplierSummary, setSupplierSummary] = useState("");
  const [extraBrands, setExtraBrands] = useState("");
  const [items, setItems] = useState<SupplierItem[]>([emptyItem()]);
  const [logOverride, setLogOverride] = useState<Record<string, number>>({});

  const [result, setResult] = useState<PriceResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetch("/api/admin/joinery/settings").then((r) => r.json()).then((s: Settings) => {
      setSettings(s); setRate(s.lastRate);
      setLogOverride({
        chinaLeg: s.logChinaLegFob, qaInspection: s.logQaInspection, oceanFreight: s.logOceanFreight,
        auPortTerminal: s.logAuPortTerminal, customsStatutory: s.logCustomsStatutory, brokerageDelivery: s.logBrokerageDelivery,
      });
    }).catch(() => {});
  }, []);

  // Reset the china-leg benchmark when incoterm flips.
  useEffect(() => {
    if (!settings) return;
    setLogOverride((o) => ({ ...o, chinaLeg: incoterm === "EXW" ? settings.logChinaLegExw : settings.logChinaLegFob }));
  }, [incoterm, settings]);

  async function fetchFx() {
    setFxLoading(true); setFxMsg(""); setFxHalt("");
    try {
      const r = await fetch("/api/admin/joinery/fx").then((x) => x.json());
      if (r.error) { setFxMsg(`Fetch failed: ${r.error}`); return; }
      setRate(r.rate); setRateDate(r.date);
      setFxMsg(`Live ${r.source}: 1 USD = ${r.rate} AUD (${r.date})`);
      if (r.halt) setFxHalt(r.halt);
    } finally { setFxLoading(false); }
  }

  // ── item editing helpers ──
  const setItem = (i: number, patch: Partial<SupplierItem>) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const setMat = (i: number, patch: Partial<Materials>) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, materials: { ...it.materials, ...patch } } : it)));
  const addItem = () => setItems((xs) => [...xs, emptyItem()]);
  const removeItem = (i: number) => setItems((xs) => xs.filter((_, j) => j !== i));
  const setLine = (i: number, li: number, patch: Partial<CabinetLine>) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, lines: it.lines.map((l, k) => (k === li ? { ...l, ...patch } : l)) } : it)));
  const addLine = (i: number) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, lines: [...it.lines, { no: it.lines.length + 1, description: "" }] } : it)));
  const removeLine = (i: number, li: number) => setItems((xs) => xs.map((it, j) => (j === i ? { ...it, lines: it.lines.filter((_, k) => k !== li).map((l, k) => ({ ...l, no: k + 1 })) } : it)));

  async function run() {
    setRunning(true); setError(""); setResult(null);
    try {
      const payload = {
        items, incoterm, rate, rateDate,
        supplierUsdSummary: supplierSummary ? Number(supplierSummary) : undefined,
        extraBrands: extraBrands.split(",").map((s) => s.trim()).filter(Boolean),
        logistics: logOverride,
      };
      const r = await fetch("/api/admin/joinery/price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Pricing failed"); return; }
      setResult(d);
    } finally { setRunning(false); }
  }

  async function saveSettings() {
    if (!settings) return;
    await fetch("/api/admin/joinery/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setShowSettings(false);
  }

  const allPass = result && result.assertions.every((a) => a.pass);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Joinery Bot</h1>
          <p className="text-stone-900 text-sm mt-1">Convert a supplier USD joinery quote into a priced, verified ASG schedule. Document export (Rev B .docx) is added once the template is provided.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSettings((v) => !v)} className="text-xs uppercase tracking-widest border border-stone-200 text-stone-600 px-4 py-2.5 rounded-xl hover:border-[#b8934a] hover:text-[#b8934a]">Engine settings</button>
          <button onClick={run} disabled={running} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">{running ? "Running…" : "Run pricing"}</button>
        </div>
      </div>

      {showSettings && settings && (
        <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">Engine settings <span className="text-stone-500 font-normal">· server-only</span></h2>
            <button onClick={saveSettings} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#a07e3c]">Save</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              ["marginFactor", "Margin factor"], ["fxSanityBandPct", "FX band %"], ["gstRate", "GST rate"],
              ["logChinaLegFob", "China leg FOB"], ["logChinaLegExw", "China leg EXW"], ["logQaInspection", "QA inspection"],
              ["logOceanFreight", "Ocean freight"], ["logAuPortTerminal", "AU port/terminal"], ["logCustomsStatutory", "Customs statutory"],
              ["logBrokerageDelivery", "Brokerage + delivery"],
            ] as [keyof Settings, string][]).map(([k, lbl]) => (
              <div key={k}>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">{lbl}</label>
                <input type="number" step="0.01" value={settings[k]} onChange={(e) => setSettings({ ...settings, [k]: Number(e.target.value) })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#b8934a]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run parameters */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>USD → AUD rate</label>
          <div className="flex gap-2">
            <input type="number" step="0.0001" value={rate} onChange={(e) => setRate(Number(e.target.value))} className={FIELD} />
            <button onClick={fetchFx} disabled={fxLoading} className="shrink-0 text-xs border border-stone-200 rounded-lg px-3 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">{fxLoading ? "…" : "Fetch live"}</button>
          </div>
          {fxMsg && <p className="text-[11px] text-stone-500 mt-1.5">{fxMsg}</p>}
          {fxHalt && <p className="text-[11px] text-red-600 mt-1.5">⚠ {fxHalt}</p>}
        </div>
        <div>
          <label className={LABEL}>Incoterm</label>
          <select value={incoterm} onChange={(e) => setIncoterm(e.target.value as "FOB" | "EXW")} className={FIELD}>
            <option value="FOB">FOB (port named) - origin charges in supplier price</option>
            <option value="EXW">EXW - full origin leg carried</option>
          </select>
          <p className="text-[11px] text-stone-400 mt-1.5">Ambiguous terms (bare FOB, CIF/DDP) should halt for a human - set explicitly here.</p>
        </div>
        <div>
          <label className={LABEL}>Supplier summary total (USD) - for reconciliation</label>
          <input type="number" step="0.01" value={supplierSummary} onChange={(e) => setSupplierSummary(e.target.value)} placeholder="optional" className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Extra brand words to strip (comma separated)</label>
          <input value={extraBrands} onChange={(e) => setExtraBrands(e.target.value)} placeholder="e.g. supplier name" className={FIELD} />
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest">Supplier items</h2>
        <button onClick={addItem} className="text-[11px] text-[#b8934a] hover:underline">+ Add item</button>
      </div>
      <div className="space-y-4 mb-6">
        {items.map((it, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-stone-400 w-6">{i + 1}</span>
              <input value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Item title (e.g. Kitchen Cabinet)" className={`${FIELD} font-medium`} />
              <button onClick={() => removeItem(i)} className="shrink-0 text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div><label className={LABEL}>Door material</label><input value={it.materials.door || ""} onChange={(e) => setMat(i, { door: e.target.value })} className={FIELD} /></div>
              <div><label className={LABEL}>Body material</label><input value={it.materials.body || ""} onChange={(e) => setMat(i, { body: e.target.value })} className={FIELD} /></div>
              <div><label className={LABEL}>Back panel</label><input value={it.materials.back || ""} onChange={(e) => setMat(i, { back: e.target.value })} className={FIELD} /></div>
              <div><label className={LABEL}>Hardware</label><input value={it.materials.hardware || ""} onChange={(e) => setMat(i, { hardware: e.target.value })} className={FIELD} /></div>
            </div>
            {/* cabinet lines */}
            <div className="space-y-2 mb-3">
              {it.lines.map((l, li) => (
                <div key={li} className="flex gap-2 items-center">
                  <span className="text-xs text-stone-300 w-4">{l.no}</span>
                  <input value={l.description} onChange={(e) => setLine(i, li, { description: e.target.value })} placeholder="Cabinet line description" className={`${FIELD} flex-1`} />
                  <input value={l.length || ""} onChange={(e) => setLine(i, li, { length: e.target.value })} placeholder="L" className={`${FIELD} w-16`} />
                  <input value={l.width || ""} onChange={(e) => setLine(i, li, { width: e.target.value })} placeholder="W" className={`${FIELD} w-16`} />
                  <input value={l.height || ""} onChange={(e) => setLine(i, li, { height: e.target.value })} placeholder="H" className={`${FIELD} w-16`} />
                  <button onClick={() => removeLine(i, li)} className="shrink-0 text-stone-300 hover:text-red-500 text-xs">✕</button>
                </div>
              ))}
              <button onClick={() => addLine(i)} className="text-[11px] text-stone-400 hover:text-[#b8934a]">+ line</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className={LABEL}>Cabinet price (USD)</label><input type="number" step="0.01" value={it.cabinetUsd} onChange={(e) => setItem(i, { cabinetUsd: Number(e.target.value) })} className={FIELD} /></div>
              <div className="md:col-span-2"><label className={LABEL}>Accessories (comma separated)</label><input value={it.accessories.join(", ")} onChange={(e) => setItem(i, { accessories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder='e.g. China Brand 105° Hinge, Soft-close Runner' className={FIELD} /></div>
              <div><label className={LABEL}>Accessories price (USD)</label><input type="number" step="0.01" value={it.accessoriesUsd} onChange={(e) => setItem(i, { accessoriesUsd: Number(e.target.value) })} className={FIELD} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Logistics benchmark */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
        <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-1">Landed logistics (AUD)</h2>
        <p className="text-stone-400 text-xs mb-4">Pre-filled from benchmarks. Adjust the freight leg from your live quote before running. China-side leg follows the incoterm.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            ["chinaLeg", incoterm === "EXW" ? "Origin leg (EXW)" : "Origin contingency (FOB)"],
            ["qaInspection", "QA/QC inspection"], ["oceanFreight", "Ocean freight (FCL)"],
            ["auPortTerminal", "AU port / terminal"], ["customsStatutory", "Customs statutory"], ["brokerageDelivery", "Brokerage + delivery"],
          ] as [string, string][]).map(([k, lbl]) => (
            <div key={k}>
              <label className={LABEL}>{lbl}</label>
              <input type="number" step="1" value={logOverride[k] ?? 0} onChange={(e) => setLogOverride((o) => ({ ...o, [k]: Number(e.target.value) }))} className={FIELD} />
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-600 mt-3">Logistics total: <b>{money(Object.values(logOverride).reduce((a, b) => a + (Number(b) || 0), 0))}</b></p>
      </div>

      {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>}

      {result && (
        <div className="space-y-6">
          {/* Verification */}
          <div className={`rounded-2xl border p-5 ${allPass ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
            <h2 className="font-semibold text-stone-900 text-sm mb-3">Verification {allPass ? "✓ all passed" : "✗ review required"}</h2>
            <div className="space-y-1.5">
              {result.assertions.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-sm">
                  <span className={a.pass ? "text-emerald-600" : "text-red-600"}>{a.pass ? "✓" : "✗"}</span>
                  <span className="text-stone-700"><b>({a.id})</b> {a.label}</span>
                  <span className="text-stone-400 text-xs ml-auto text-right">{a.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          {result.flags.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
              <h2 className="font-semibold text-stone-900 text-sm mb-3">Human flags</h2>
              <div className="space-y-1.5">
                {result.flags.map((f, k) => (
                  <div key={k} className="flex items-start gap-2 text-sm">
                    <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${f.level === "auto-removed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{f.level}</span>
                    <span className="text-stone-700"><b>{f.item}:</b> {f.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client schedule preview */}
          <div>
            <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-3">Client schedule preview (Section 2)</h2>
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[10px] uppercase tracking-widest text-stone-400">
                    <th className="text-left px-3 py-2 border-b border-stone-100">Material</th>
                    <th className="text-left px-3 py-2 border-b border-stone-100">Item</th>
                    <th className="text-left px-3 py-2 border-b border-stone-100">No.</th>
                    <th className="text-left px-3 py-2 border-b border-stone-100">Description</th>
                    <th className="text-right px-3 py-2 border-b border-stone-100">L</th>
                    <th className="text-right px-3 py-2 border-b border-stone-100">W</th>
                    <th className="text-right px-3 py-2 border-b border-stone-100">H</th>
                    <th className="text-right px-3 py-2 border-b border-stone-100">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.priced.map((it, idx) => {
                    const span = it.lines.length || 1;
                    const mat = [
                      it.materials.door && ["Door", it.materials.door],
                      it.materials.body && ["Body", it.materials.body],
                      it.materials.back && ["Back", it.materials.back],
                      it.materials.hardware && ["Hardware", it.materials.hardware],
                    ].filter(Boolean) as [string, string][];
                    return (
                      <tbody key={idx} className="align-top">
                        <tr className="bg-stone-100">
                          <td colSpan={8} className="px-3 py-2 font-semibold text-stone-800 text-center border-b border-stone-200">{it.title || "-"}</td>
                        </tr>
                        {(it.lines.length ? it.lines : [{ no: 1, description: "" }]).map((l, li) => (
                          <tr key={li} className="border-b border-stone-50">
                            {li === 0 && (
                              <td rowSpan={span} className="px-3 py-2 text-xs text-stone-600 border-r border-stone-50 min-w-[150px]">
                                {mat.map(([lbl, val], m) => (<div key={m} className="mb-1.5"><span className="underline">{lbl}:</span> {val}</div>))}
                              </td>
                            )}
                            {li === 0 && <td rowSpan={span} className="px-3 py-2 text-stone-700 border-r border-stone-50">Cabinet</td>}
                            <td className="px-3 py-2 text-stone-500">{l.no}</td>
                            <td className="px-3 py-2 text-stone-700">{l.description}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{l.length || ""}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{l.width || ""}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{l.height || ""}</td>
                            {li === 0 && <td rowSpan={span} className="px-3 py-2 text-right font-medium text-stone-800 border-l border-stone-50 whitespace-nowrap">{money(it.cabinetAud)}</td>}
                          </tr>
                        ))}
                        {it.hasAccessories && (
                          <tr className="border-b border-stone-50">
                            <td colSpan={6} className="px-3 py-2 text-xs text-stone-600"><span className="underline">Accessories:</span> {it.accessories.join(", ")}</td>
                            <td className="px-3 py-2 text-right font-medium text-stone-800 whitespace-nowrap" colSpan={2}>{money(it.accessoriesAud)}</td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
                  {/* logistics + totals */}
                  <tr className="border-t-2 border-stone-200">
                    <td colSpan={7} className="px-3 py-2 text-stone-700">Logistics, Freight &amp; Delivery</td>
                    <td className="px-3 py-2 text-right font-medium text-stone-800 whitespace-nowrap">{money(result.totals.logistics)}</td>
                  </tr>
                  <tr><td colSpan={7} className="px-3 py-2 text-right text-stone-500">TOTAL (excl. GST)</td><td className="px-3 py-2 text-right font-medium whitespace-nowrap">{money(result.totals.exGst)}</td></tr>
                  <tr><td colSpan={7} className="px-3 py-2 text-right text-stone-500">GST (10%)</td><td className="px-3 py-2 text-right whitespace-nowrap">{money(result.totals.gst)}</td></tr>
                  <tr className="bg-stone-900 text-white"><td colSpan={7} className="px-3 py-2.5 text-right font-semibold">TOTAL (incl. GST)</td><td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{money(result.totals.incGst)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-stone-400 mt-2">{result.totals.itemCount} joinery item{result.totals.itemCount === 1 ? "" : "s"} / package{result.totals.itemCount === 1 ? "" : "s"}.</p>
          </div>

          {/* Internal report */}
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-6">
            <h2 className="font-semibold text-white text-sm mb-4">Internal profit &amp; cost report <span className="text-stone-500 font-normal">· never in the client document</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-sm">
              <div><p className="text-stone-500 text-xs">FX rate</p><p className="text-white">{result.report.fxRate} <span className="text-stone-500">({result.report.fxDate || "-"})</span></p></div>
              <div><p className="text-stone-500 text-xs">Margin factor</p><p className="text-white">×{result.report.marginFactor}</p></div>
              <div><p className="text-stone-500 text-xs">Goods (USD)</p><p className="text-white">${result.report.goodsUsd.toLocaleString()}</p></div>
              <div><p className="text-stone-500 text-xs">Incoterm</p><p className="text-white">{result.incoterm}</p></div>
            </div>
            <div className="border-t border-stone-700 pt-4 mb-4">
              <p className="text-stone-500 text-xs mb-2">Logistics components vs benchmark</p>
              {result.report.logistics.map((c) => (
                <div key={c.key} className="flex justify-between text-sm py-0.5">
                  <span className="text-stone-300">{c.label}</span>
                  <span className="text-white">{money(c.aud)} <span className={c.aud === c.benchmark ? "text-stone-500" : c.aud > c.benchmark ? "text-red-400" : "text-emerald-400"}>({c.aud === c.benchmark ? "at benchmark" : `bmk ${money(c.benchmark)}`})</span></span>
                </div>
              ))}
              <div className="flex justify-between text-sm py-0.5 mt-1 border-t border-stone-800 pt-2"><span className="text-stone-400">Logistics total</span><span className="text-white">{money(result.report.logisticsTotal)}</span></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-stone-500 text-xs">Revenue (ex-GST)</p><p className="text-white">{money(result.report.revenueExGst)}</p></div>
              <div><p className="text-stone-500 text-xs">Total cost</p><p className="text-white">{money(result.report.totalCost)}</p></div>
              <div><p className="text-stone-500 text-xs">Projected profit</p><p className="text-[#e9c98a] font-semibold">{money(result.report.profit)}</p></div>
              <div><p className="text-stone-500 text-xs">Margin % of revenue</p><p className="text-[#e9c98a] font-semibold">{result.report.marginPctOfRevenue}%</p></div>
            </div>
            <p className="text-stone-500 text-xs mt-4">Erosion risks: FX movement before order, freight re-quote on the volatile China–AU lane, marine insurance if taken. Goods costed at rate ×1 (no margin); logistics at cost - profit rides on goods margin only.</p>
          </div>

          <p className="text-xs text-stone-400">Document export: the branded Rev B .docx generation (surgical XML clone of the schedule table) is wired in once the template file is provided. Until then this preview + internal report is the working output.</p>
        </div>
      )}
    </div>
  );
}
