"use client";
import { useEffect, useMemo, useState } from "react";

type Item = { name: string; description: string; qty: number; unitPrice: number };
type Quote = {
  id: string; number: string; status: "draft" | "sent" | "accepted" | "declined";
  clientName: string; clientEmail: string; clientPhone: string; clientCompany: string;
  projectAddress: string; items: Item[]; notes: string; taxRate: number; sourceSubmissionId?: string; createdAt: string;
};
type Submission = { id: string; name: string; email: string; phone: string; company: string; message: string; items: Array<Record<string, unknown>>; createdAt: string };
type CatProduct = { slug: string; data: Record<string, unknown> & { name?: string; tagline?: string; description?: string } };
type Catalog = { category: string; products: CatProduct[] }[];

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-stone-100 text-stone-500", sent: "bg-[#b8934a]/10 text-[#b8934a]",
  accepted: "bg-emerald-50 text-emerald-600", declined: "bg-red-50 text-red-500",
};
const money = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
const blankForm = (): Quote => ({ id: "", number: "", status: "draft", clientName: "", clientEmail: "", clientPhone: "", clientCompany: "", projectAddress: "", items: [], notes: "", taxRate: 0.1, createdAt: "" });

// ── Company details (edited in Admin → Company Details) ──────────────────────
type CompanyInfo = {
  name: string; abn: string; acn: string; email: string; phone: string;
  website: string; instagram: string; location: string;
  bankName: string; bankAccountName: string; bankBsb: string; bankAccount: string;
};
const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "Atelier Supply Group Pty Ltd", abn: "ABN 99 696 292 001", acn: "ACN 696 292 001",
  email: "info@ateliersupplygroup.com.au", phone: "+61 449 513 614", website: "ateliersupplygroup.com.au",
  instagram: "@ateliersupplygroup", location: "Sydney based · Delivering Australia Wide",
  bankName: "-", bankAccountName: "Atelier Supply Group Pty Ltd", bankBsb: "000-000", bankAccount: "0000 0000",
};
const TERMS = [
  "This quotation is valid for 30 days from the date of issue.",
  "All prices are in Australian Dollars (AUD). GST is shown separately.",
  "Products are supplied to project-specific specifications; final details, pricing and availability are confirmed in writing on order.",
  "Lead times are indicative and confirmed at order. Supply is subject to Atelier's Terms of Supply, which prevail over anything stated here.",
  "This quotation is an estimate and not an offer to supply; no order is binding until accepted by Atelier in writing.",
];

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [catalog, setCatalog] = useState<Catalog>([]);
  const [form, setForm] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickSub, setPickSub] = useState(false);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then((d) => setQuotes(Array.isArray(d) ? d : []));
    fetch("/api/admin/submissions").then((r) => r.json()).then((d) => setSubs(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/product-content").then((r) => r.json()).then((d) => setCatalog(d.catalog || [])).catch(() => {});
    fetch("/api/admin/company").then((r) => r.json()).then((d) => { if (d && d.name) setCompany(d); }).catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const sub = (form?.items ?? []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const gst = sub * (form?.taxRate ?? 0.1);
    return { sub, gst, total: sub + gst };
  }, [form]);

  function setField<K extends keyof Quote>(k: K, v: Quote[K]) { setForm((f) => (f ? { ...f, [k]: v } : f)); }
  function setItem(i: number, patch: Partial<Item>) { setForm((f) => (f ? { ...f, items: f.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) } : f)); }
  function addItem(it: Item) { setForm((f) => (f ? { ...f, items: [...f.items, it] } : f)); }
  function removeItem(i: number) { setForm((f) => (f ? { ...f, items: f.items.filter((_, j) => j !== i) } : f)); }

  function fromSubmission(s: Submission) {
    const items: Item[] = (s.items || []).map((it) => ({
      name: String(it.name ?? "Item"),
      description: [it.categoryLabel, it.size, it.tagline].filter(Boolean).join(" · "),
      qty: Number(it.qty) || 1,
      unitPrice: 0,
    }));
    setForm({ ...blankForm(), clientName: s.name, clientEmail: s.email, clientPhone: s.phone, clientCompany: s.company, projectAddress: "", notes: s.message || "", items, sourceSubmissionId: s.id });
    setPickSub(false);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    if (form.id) {
      await fetch("/api/admin/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setQuotes((qs) => qs.map((q) => (q.id === form.id ? { ...q, ...form } : q)));
    } else {
      const res = await fetch("/api/admin/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setQuotes((qs) => [created, ...qs]);
      setForm(created);
    }
    setSaving(false);
  }

  async function del() {
    if (!form?.id || !window.confirm("Delete this quote?")) return;
    await fetch("/api/admin/quotes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.id }) });
    setQuotes((qs) => qs.filter((q) => q.id !== form.id));
    setForm(null);
  }

  function printQuote() {
    if (!form) return;
    const html = buildQuoteHtml(form, totals, window.location.origin, true, company);
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  const exampleHtml = useMemo(() => buildQuoteHtml(SAMPLE_QUOTE, SAMPLE_TOTALS, typeof window !== "undefined" ? window.location.origin : "", false, company), [company]);

  const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Quotes</h1>
          <p className="text-stone-900 text-sm mt-1">Build project quotations from an enquiry or from scratch.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPickSub(true)} className="text-xs uppercase tracking-widest border border-stone-200 text-stone-600 px-5 py-2.5 rounded-xl hover:border-[#b8934a] hover:text-[#b8934a] transition-colors">From submission</button>
          <button onClick={() => setForm(blankForm())} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors">New quote</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Quote list */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden lg:sticky lg:top-4 self-start">
          {quotes.length === 0 ? (
            <p className="px-5 py-8 text-center text-stone-400 text-sm">No quotes yet.</p>
          ) : quotes.map((q) => (
            <button key={q.id} onClick={() => setForm(q)} className={`w-full text-left px-5 py-3.5 border-b border-stone-50 last:border-b-0 transition-colors ${form?.id === q.id ? "bg-[#b8934a]/10" : "hover:bg-stone-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-900">{q.number}</span>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[q.status]}`}>{q.status}</span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 truncate">{q.clientName || "No client"}</p>
              <p className="text-xs text-stone-400">{money((q.items || []).reduce((s, it) => s + it.qty * it.unitPrice, 0) * (1 + (q.taxRate ?? 0.1)))}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        {!form ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-medium text-stone-700">Example quotation</p>
                <p className="text-xs text-stone-400">This is how every quote prints and exports to PDF. Create a quote to make your own.</p>
              </div>
              <button onClick={() => setForm(blankForm())} className="shrink-0 bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors">New quote</button>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              <iframe title="Example quotation" srcDoc={exampleHtml} className="w-full border-0 bg-white" style={{ height: 920 }} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-semibold text-stone-900">{form.number || "New quote"}</h2>
              <div className="flex items-center gap-3">
                <select value={form.status} onChange={(e) => setField("status", e.target.value as Quote["status"])} className="text-xs border border-stone-200 rounded-lg px-3 py-2 outline-none">
                  {["draft", "sent", "accepted", "declined"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {form.id && <button onClick={printQuote} className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a]">Print / PDF</button>}
                {form.id && <button onClick={del} className="text-xs text-red-500 hover:underline">Delete</button>}
                <button onClick={save} disabled={saving} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
              </div>
            </div>

            {/* Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Client name</label><input className={FIELD} value={form.clientName} onChange={(e) => setField("clientName", e.target.value)} /></div>
              <div><label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Company</label><input className={FIELD} value={form.clientCompany} onChange={(e) => setField("clientCompany", e.target.value)} /></div>
              <div><label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Email</label><input className={FIELD} value={form.clientEmail} onChange={(e) => setField("clientEmail", e.target.value)} /></div>
              <div><label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Phone</label><input className={FIELD} value={form.clientPhone} onChange={(e) => setField("clientPhone", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Project address</label><input className={FIELD} value={form.projectAddress} onChange={(e) => setField("projectAddress", e.target.value)} /></div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-widest text-stone-400">Line items</label>
                <div className="flex items-center gap-2">
                  <select onChange={(e) => { const [ci, pi] = e.target.value.split(":").map(Number); const p = catalog[ci]?.products[pi]; if (p) addItem({ name: (p.data.name as string) || p.slug, description: (p.data.tagline as string) || "", qty: 1, unitPrice: 0 }); e.currentTarget.selectedIndex = 0; }} className="text-xs border border-stone-200 rounded-lg px-3 py-2 outline-none max-w-[220px]">
                    <option>+ Add product…</option>
                    {catalog.map((c, ci) => (
                      <optgroup key={c.category} label={c.category}>
                        {c.products.map((p, pi) => <option key={p.slug} value={`${ci}:${pi}`}>{(p.data.name as string) || p.slug}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <button onClick={() => addItem({ name: "", description: "", qty: 1, unitPrice: 0 })} className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:border-[#b8934a]">+ Blank line</button>
                </div>
              </div>
              <div className="border border-stone-100 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_70px_110px_110px_32px] gap-2 px-3 py-2 bg-stone-50 text-[10px] uppercase tracking-widest text-stone-400">
                  <span>Item</span><span className="text-right">Qty</span><span className="text-right">Unit ($)</span><span className="text-right">Amount</span><span />
                </div>
                {form.items.length === 0 ? (
                  <p className="px-3 py-5 text-center text-stone-400 text-sm">No line items yet - add a product or a blank line.</p>
                ) : form.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[1fr_70px_110px_110px_32px] gap-2 px-3 py-2 border-t border-stone-50 items-start">
                    <div className="space-y-1">
                      <input className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#b8934a]/60" value={it.name} placeholder="Item name" onChange={(e) => setItem(i, { name: e.target.value })} />
                      <input className="w-full border border-stone-100 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 outline-none" value={it.description} placeholder="Description" onChange={(e) => setItem(i, { description: e.target.value })} />
                    </div>
                    <input type="number" min={0} className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-right outline-none" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                    <input type="number" min={0} step="0.01" className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-right outline-none" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} />
                    <span className="text-sm text-stone-700 text-right pt-2">{money((it.qty || 0) * (it.unitPrice || 0))}</span>
                    <button onClick={() => removeItem(i)} className="text-stone-300 hover:text-red-500 pt-1.5">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals + notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Notes</label>
                <textarea className={`${FIELD} resize-y`} rows={5} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Terms, lead times, inclusions/exclusions…" />
              </div>
              <div className="bg-stone-50 rounded-xl p-5 self-start">
                <div className="flex items-center justify-between text-sm py-1"><span className="text-stone-500">Subtotal</span><span className="text-stone-800">{money(totals.sub)}</span></div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-stone-500">GST <input type="number" className="w-12 border border-stone-200 rounded px-1 py-0.5 text-xs text-right ml-1" value={Math.round(form.taxRate * 100)} onChange={(e) => setField("taxRate", (Number(e.target.value) || 0) / 100)} />%</span>
                  <span className="text-stone-800">{money(totals.gst)}</span>
                </div>
                <div className="flex items-center justify-between py-2 mt-1 border-t-2 border-stone-800"><span className="font-medium text-stone-900">Total</span><span className="text-lg font-medium text-stone-900">{money(totals.total)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* From-submission picker */}
      {pickSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setPickSub(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Create quote from submission</h3>
              <button onClick={() => setPickSub(false)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto divide-y divide-stone-50">
              {subs.length === 0 ? <p className="px-6 py-8 text-center text-stone-400 text-sm">No submissions yet.</p> : subs.map((s) => (
                <button key={s.id} onClick={() => fromSubmission(s)} className="w-full text-left px-6 py-4 hover:bg-stone-50">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-stone-900">{s.name || "Unnamed"}</span><span className="text-xs text-stone-400">{new Date(s.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span></div>
                  <p className="text-xs text-stone-500">{s.email} · {(s.items || []).length} item{(s.items || []).length !== 1 ? "s" : ""}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function esc(s: string) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// A worked sample used for the on-screen preview (not saved anywhere).
const SAMPLE_QUOTE: Quote = {
  id: "sample", number: "Q-1042", status: "sent",
  clientName: "Daniel & Sophie Advani", clientCompany: "Advani Developments Pty Ltd",
  clientEmail: "daniel@advanidev.com.au", clientPhone: "+61 402 118 664",
  projectAddress: "14 Marsden Crescent, Mosman NSW 2088",
  items: [
    { name: "ASG Series 102 - Sliding door", description: "Custom aluminium, double glazed · 2400 × 2100 · Matt Black", qty: 3, unitPrice: 2480 },
    { name: "ASG Series 86 - Awning window", description: "Custom aluminium, double glazed · 900 × 1200 · Matt Black", qty: 6, unitPrice: 690 },
    { name: "The Estate - Bathroom package", description: "Coordinated vanity, tapware, sanitaryware & finishes", qty: 2, unitPrice: 8450 },
    { name: "Custom joinery - Kitchen", description: "Cabinetry to plan, stone benchtops, soft-close hardware", qty: 1, unitPrice: 24800 },
  ],
  notes: "Lead time approx. 8–10 weeks from approved order and final measure. 50% deposit to commence; balance prior to dispatch. Installation quoted separately on request.",
  taxRate: 0.1, createdAt: "",
};
const SAMPLE_TOTALS = (() => {
  const sub = SAMPLE_QUOTE.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const gst = sub * SAMPLE_QUOTE.taxRate;
  return { sub, gst, total: sub + gst };
})();

function buildQuoteHtml(q: Quote, totals: { sub: number; gst: number; total: number }, origin: string, forPrint: boolean, c: CompanyInfo) {
  const today = new Date();
  const valid = new Date(today.getTime() + 30 * 864e5);
  const fmt = (d: Date) => d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const rows = q.items.map((it, i) => `<tr class="${i % 2 ? "alt" : ""}"><td><span class="in">${esc(it.name) || "&nbsp;"}</span>${it.description ? `<div class="d">${esc(it.description)}</div>` : ""}</td><td class="n">${it.qty}</td><td class="n">${money(it.unitPrice)}</td><td class="n">${money((it.qty || 0) * (it.unitPrice || 0))}</td></tr>`).join("");
  const terms = TERMS.map((t) => `<li>${esc(t)}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Quotation ${esc(q.number || "")}</title>
<style>
  @page{margin:0}
  *{box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;color:#1a1714;margin:0;font-size:13px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
  .sheet{max-width:820px;margin:0 auto}
  .lab{font-family:Arial,Helvetica,sans-serif;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#b8934a}
  .muted{color:#8a7d70}
  .head{background:#2c2620;color:#efe7d8;padding:30px 48px;display:flex;justify-content:space-between;align-items:center}
  .head .logo{height:54px;width:auto}
  .head h1{font-weight:300;font-size:30px;margin:0;color:#fff;letter-spacing:.02em}
  .head .num{color:#e9c98a;font-family:Arial,sans-serif;letter-spacing:.14em;font-size:12px;text-transform:uppercase;text-align:right}
  .head .dt{color:#b7ab97;font-size:12px;text-align:right;margin-top:4px}
  .strip{background:#ede8df;padding:12px 48px;display:flex;flex-wrap:wrap;gap:6px 26px;font-family:Arial,sans-serif;font-size:11px;color:#5a5048}
  .strip b{color:#1a1714;font-weight:600}
  .body{padding:36px 48px}
  .cols{display:flex;justify-content:space-between;gap:40px;margin-bottom:8px}
  .cols p{margin:2px 0}
  h2.sec{font-family:Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a7d70;margin:34px 0 12px;border-top:1px solid #e6e0d6;padding-top:16px}
  table{width:100%;border-collapse:collapse;margin-top:10px}
  th{text-align:left;font-family:Arial,sans-serif;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#8a7d70;border-bottom:2px solid #2c2620;padding:9px 8px}
  td{padding:11px 8px;border-bottom:1px solid #eee;vertical-align:top}
  tr.alt td{background:#faf7f2}
  .n{text-align:right;white-space:nowrap}
  .in{font-size:14px}
  .d{color:#8a7d70;font-size:11.5px;margin-top:3px}
  .tot{margin:16px 0 0 auto;width:290px}
  .tot div{display:flex;justify-content:space-between;padding:6px 8px}
  .tot .g{background:#2c2620;color:#fff;font-size:17px;border-radius:4px;margin-top:6px;padding:12px 8px}
  .split{display:flex;gap:32px}
  .split>div{flex:1}
  .card{background:#f7f3ec;border:1px solid #e6e0d6;border-radius:8px;padding:16px 18px}
  .card .kv{display:flex;justify-content:space-between;padding:3px 0;font-size:12.5px}
  .pay{display:flex;flex-wrap:wrap;gap:14px 40px;padding:14px 18px}
  .pay>div{display:flex;flex-direction:column;gap:2px}
  .pay .pl{font-family:Arial,sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#a2988a}
  .pay .pv{font-size:13px;color:#1a1714}
  .notes{white-space:pre-wrap;color:#4a4038;font-size:12.5px}
  ol.terms{margin:8px 0 0;padding-left:18px;color:#5a5048;font-size:11.5px;line-height:1.7}
  .foot{border-top:1px solid #e6e0d6;margin:0 48px;padding:18px 0 30px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;font-family:Arial,sans-serif;font-size:10.5px;color:#8a7d70}
  .foot b{color:#1a1714}
  .foot .nb{white-space:nowrap}
</style></head>
<body><div class="sheet">
  <div class="head">
    <img class="logo" src="${origin}/Atelier-logo.png" alt="Atelier Supply Group" />
    <div><div class="num">Quotation ${esc(q.number || "Draft")}</div><div class="dt">Issued ${fmt(today)}<br>Valid until ${fmt(valid)}</div></div>
  </div>
  <div class="body">
    <div class="cols">
      <div style="flex:1"><p class="lab">Prepared for</p><p style="font-size:15px">${esc(q.clientName) || "-"}</p>${q.clientCompany ? `<p>${esc(q.clientCompany)}</p>` : ""}${q.clientEmail ? `<p class="muted">${esc(q.clientEmail)}</p>` : ""}${q.clientPhone ? `<p class="muted">${esc(q.clientPhone)}</p>` : ""}</div>
      <div style="flex:1">${q.projectAddress ? `<p class="lab">Project</p><p style="font-size:15px">${esc(q.projectAddress)}</p>` : ""}</div>
    </div>

    <h2 class="sec">Quotation</h2>
    <table><thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Unit price</th><th class="n">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="muted">No line items.</td></tr>'}</tbody></table>
    <div class="tot">
      <div><span class="muted">Subtotal</span><span>${money(totals.sub)}</span></div>
      <div><span class="muted">GST (${Math.round(q.taxRate * 100)}%)</span><span>${money(totals.gst)}</span></div>
      <div class="g"><span>Total (incl. GST)</span><span>${money(totals.total)}</span></div>
    </div>

    ${q.notes ? `<h2 class="sec">Notes</h2><div class="notes">${esc(q.notes)}</div>` : ""}

    <h2 class="sec">Payment details</h2>
    <div class="card pay">
      <div><span class="pl">Account name</span><span class="pv">${esc(c.bankAccountName)}</span></div>
      ${c.bankName ? `<div><span class="pl">Bank</span><span class="pv">${esc(c.bankName)}</span></div>` : ""}
      <div><span class="pl">BSB</span><span class="pv">${esc(c.bankBsb) || "-"}</span></div>
      <div><span class="pl">Account</span><span class="pv">${esc(c.bankAccount) || "-"}</span></div>
      <div><span class="pl">Reference</span><span class="pv">${esc(q.number || "")}</span></div>
    </div>

    <h2 class="sec">Terms &amp; conditions</h2>
    <ol class="terms">${terms}</ol>
  </div>
  <div class="foot">
    <span><b>${esc(c.name)}</b>&nbsp;&nbsp;·&nbsp;&nbsp;${esc(c.abn)}</span>
    <span><span class="nb">${esc(c.email)}</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span class="nb">${esc(c.phone)}</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span class="nb">${esc(c.website)}</span></span>
  </div>
</div>
${forPrint ? '<script>window.onload=function(){setTimeout(function(){window.print()},350)}</script>' : ""}
</body></html>`;
}
