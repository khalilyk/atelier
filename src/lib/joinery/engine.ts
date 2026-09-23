// Joinery Bot - core engine (pure functions, SERVER-SIDE).
// Stages 2 (sanitise), 3 (pricing), 4 (logistics), 6 (verification).
// Margin/benchmarks arrive from joinerySettings and must not be exposed to the
// public site; this module runs behind the authenticated admin API only.

import type { JoinerySettings } from "@/lib/admin-store";

// ── Data model ───────────────────────────────────────────────────────────────
export type CabinetLine = {
  no: number;
  description: string;
  length?: string; // mm, blank when none stated
  width?: string;
  height?: string;
};

export type Materials = {
  door?: string;
  body?: string;
  back?: string;
  hardware?: string;
};

export type SupplierItem = {
  title: string;
  materials: Materials;
  lines: CabinetLine[];
  cabinetUsd: number;
  accessories: string[];
  accessoriesUsd: number;
};

export type PricedItem = {
  title: string;
  materials: Materials;         // sanitised
  lines: CabinetLine[];
  cabinetAud: number;
  accessories: string[];        // sanitised, title-cased
  accessoriesAud: number;
  hasAccessories: boolean;
};

export type LogisticsComponent = { key: string; label: string; aud: number; benchmark: number };

export type Incoterm = "FOB" | "EXW";

// ── Stage 2 - Sanitisation ───────────────────────────────────────────────────
// Remove origin-label / brand wording; keep technical substance verbatim.
const ORIGIN_PATTERNS: RegExp[] = [
  /\bchina\s*brand\b/gi,
  /\bchinese\s*brand\b/gi,
  /\bbrand\s*:\s*china\b/gi,
  /\bmade\s*in\s*china\b/gi,
  /\bchina\b/gi,
  /\bp\.?r\.?c\.?\b/gi,
];

export function stripBrands(input: string, extraBrands: string[] = []): string {
  let s = input || "";
  for (const re of ORIGIN_PATTERNS) s = s.replace(re, " ");
  for (const b of extraBrands) {
    if (!b.trim()) continue;
    const esc = b.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(`\\b${esc}\\b`, "gi"), " ");
  }
  // collapse whitespace and tidy stray leading punctuation
  return s.replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function sanitiseAccessories(names: string[], extraBrands: string[] = []): string[] {
  return names
    .map((n) => titleCase(stripBrands(n, extraBrands)))
    .map((n) => n.trim())
    .filter(Boolean);
}

function sanitiseMaterials(m: Materials, extraBrands: string[] = []): Materials {
  const clean = (v?: string) => (v && v.trim() && v.trim() !== "/" ? stripBrands(v, extraBrands) : undefined);
  return { door: clean(m.door), body: clean(m.body), back: clean(m.back), hardware: clean(m.hardware) };
}

// ── Stage 7 (pre-pricing) - engineered-stone removal + exclusion flags ───────
export type Flag = { level: "auto-removed" | "review" | "info"; item: string; message: string };

const ENGINEERED_STONE = /\b(engineered|reconstituted|quartz|composite)\s*stone\b/i;
const EXCLUSION_WORDS = /\b(sink|tap|tapware|mixer|natural\s*stone|stone\s*bench|benchtop|appliance|oven|cooktop|rangehood|range\s*hood|dishwasher|microwave|basin|toilet|wc)\b/i;

// Engineered stone is prohibited in Australia - auto-remove and flag. Other
// exclusion-list collisions are kept but flagged for human review before issue.
export function applyExclusions(items: SupplierItem[]): { items: SupplierItem[]; flags: Flag[] } {
  const flags: Flag[] = [];
  const out = items.map((it) => {
    const keptAccessories: string[] = [];
    for (const acc of it.accessories || []) {
      if (ENGINEERED_STONE.test(acc)) {
        flags.push({ level: "auto-removed", item: it.title, message: `Engineered stone removed (prohibited in Australia): "${acc}"` });
        continue;
      }
      if (EXCLUSION_WORDS.test(acc)) {
        flags.push({ level: "review", item: it.title, message: `Possible exclusion-list item kept as priced: "${acc}" - review before issue.` });
      }
      keptAccessories.push(acc);
    }
    // Scan cabinet lines + materials for engineered stone (flag; can't auto-price-remove a merged line safely, so flag for review).
    const scan = [it.materials?.door, it.materials?.body, it.materials?.back, it.materials?.hardware, ...(it.lines || []).map((l) => l.description)].filter(Boolean).join(" ");
    if (ENGINEERED_STONE.test(scan)) {
      flags.push({ level: "review", item: it.title, message: "Engineered stone referenced in a cabinet line/material - prohibited; remove or requote before issue." });
    }
    return { ...it, accessories: keptAccessories };
  });
  return { items: out, flags };
}

// ── Stage 3 - Per-cell pricing ───────────────────────────────────────────────
export function priceUsd(usd: number, rate: number, margin: number): number {
  return Math.round((Number(usd) || 0) * rate * margin);
}

export function priceItems(items: SupplierItem[], rate: number, margin: number, extraBrands: string[] = []): PricedItem[] {
  return items.map((it) => {
    const accessories = sanitiseAccessories(it.accessories || [], extraBrands);
    return {
      title: it.title,
      materials: sanitiseMaterials(it.materials || {}, extraBrands),
      lines: it.lines || [],
      cabinetAud: priceUsd(it.cabinetUsd, rate, margin),
      accessories,
      accessoriesAud: priceUsd(it.accessoriesUsd, rate, margin),
      hasAccessories: accessories.length > 0 && (Number(it.accessoriesUsd) || 0) > 0,
    };
  });
}

// ── Stage 4 - Landed-logistics model ─────────────────────────────────────────
export function buildLogistics(s: JoinerySettings, incoterm: Incoterm): { components: LogisticsComponent[]; totalAud: number } {
  const chinaLeg = incoterm === "EXW" ? s.logChinaLegExw : s.logChinaLegFob;
  const chinaLabel = incoterm === "EXW"
    ? "Origin leg (EXW: trucking, export docs, terminal)"
    : "Origin contingency (FOB: consolidation)";
  const components: LogisticsComponent[] = [
    { key: "chinaLeg", label: chinaLabel, aud: chinaLeg, benchmark: chinaLeg },
    { key: "qaInspection", label: "China QA/QC inspection & photo report", aud: s.logQaInspection, benchmark: s.logQaInspection },
    { key: "oceanFreight", label: "Ocean freight (FCL S.China → Sydney)", aud: s.logOceanFreight, benchmark: s.logOceanFreight },
    { key: "auPortTerminal", label: "Australian port / terminal (Port Botany)", aud: s.logAuPortTerminal, benchmark: s.logAuPortTerminal },
    { key: "customsStatutory", label: "Customs statutory charges (ChAFTA duty 0% w/ DOO)", aud: s.logCustomsStatutory, benchmark: s.logCustomsStatutory },
    { key: "brokerageDelivery", label: "Brokerage + wharf cartage + delivery", aud: s.logBrokerageDelivery, benchmark: s.logBrokerageDelivery },
  ];
  const totalAud = components.reduce((sum, c) => sum + (Number(c.aud) || 0), 0);
  return { components, totalAud };
}

// ── Totals ───────────────────────────────────────────────────────────────────
export function computeTotals(items: PricedItem[], logisticsAud: number, gstRate: number) {
  const goods = items.reduce((sum, it) => sum + it.cabinetAud + (it.hasAccessories ? it.accessoriesAud : 0), 0);
  const exGst = goods + Math.round(logisticsAud);
  const gst = Math.round(exGst * gstRate);
  const incGst = exGst + gst;
  return { goods, logistics: Math.round(logisticsAud), exGst, gst, incGst, itemCount: items.length };
}

// ── Stage 6 - Verification ───────────────────────────────────────────────────
export type Assertion = { id: string; label: string; pass: boolean; detail: string };

export function verify(opts: {
  supplierUsdSummary?: number;              // supplier's own summary total (Stage 6a)
  items: SupplierItem[];
  priced: PricedItem[];
  rate: number;
  margin: number;
  logisticsAud: number;
  gstRate: number;
  totals: { goods: number; logistics: number; exGst: number; gst: number; incGst: number; itemCount: number };
}): Assertion[] {
  const a: Assertion[] = [];

  // (a) Re-add supplier USD independently and reconcile to their summary.
  const usdSum = opts.items.reduce((s, it) => s + (Number(it.cabinetUsd) || 0) + (Number(it.accessoriesUsd) || 0), 0);
  if (typeof opts.supplierUsdSummary === "number" && opts.supplierUsdSummary > 0) {
    const diff = Math.abs(usdSum - opts.supplierUsdSummary);
    a.push({ id: "a", label: "Supplier USD reconciles to summary", pass: diff <= 2,
      detail: `Re-added USD ${usdSum.toFixed(2)} vs summary ${opts.supplierUsdSummary.toFixed(2)} (Δ ${diff.toFixed(2)})` });
  } else {
    a.push({ id: "a", label: "Supplier USD reconciles to summary", pass: true, detail: `No summary supplied; re-added USD ${usdSum.toFixed(2)}` });
  }

  // (b) Recompute every AUD cell from scratch and diff.
  let bPass = true;
  for (const it of opts.items) {
    const recCab = priceUsd(it.cabinetUsd, opts.rate, opts.margin);
    const recAcc = priceUsd(it.accessoriesUsd, opts.rate, opts.margin);
    const match = opts.priced.find((p) => p.title === it.title);
    if (!match || match.cabinetAud !== recCab || match.accessoriesAud !== recAcc) bPass = false;
  }
  a.push({ id: "b", label: "Every AUD cell recomputes identically", pass: bPass, detail: bPass ? "Second pass matches" : "Mismatch in a recomputed cell" });

  // (c) TOTAL (excl GST) equals sum of printed cells + logistics.
  const cellSum = opts.priced.reduce((s, it) => s + it.cabinetAud + (it.hasAccessories ? it.accessoriesAud : 0), 0) + opts.totals.logistics;
  a.push({ id: "c", label: "TOTAL (excl GST) = Σ cells + logistics", pass: cellSum === opts.totals.exGst,
    detail: `Σ ${cellSum} vs printed ${opts.totals.exGst}` });

  // (d) GST = 10% of ex-GST; incl = ex + GST.
  const gstOk = opts.totals.gst === Math.round(opts.totals.exGst * opts.gstRate) && opts.totals.incGst === opts.totals.exGst + opts.totals.gst;
  a.push({ id: "d", label: "GST and incl-GST arithmetic", pass: gstOk, detail: `GST ${opts.totals.gst}, incl ${opts.totals.incGst}` });

  // (e) Item count equals number of section headers (items).
  a.push({ id: "e", label: "Caption count = section headers", pass: opts.totals.itemCount === opts.priced.length,
    detail: `${opts.totals.itemCount} = ${opts.priced.length}` });

  return a;
}

// ── Stage 7 - Internal profit report ─────────────────────────────────────────
export function profitReport(opts: {
  items: SupplierItem[];
  rate: number; rateDate: string; margin: number;
  logistics: { components: LogisticsComponent[]; totalAud: number };
  totals: { goods: number; logistics: number; exGst: number; gst: number; incGst: number; itemCount: number };
}) {
  const goodsUsd = opts.items.reduce((s, it) => s + (Number(it.cabinetUsd) || 0) + (Number(it.accessoriesUsd) || 0), 0);
  const goodsCostAud = Math.round(goodsUsd * opts.rate);      // at-cost goods (no margin)
  const revenue = opts.totals.exGst;                          // sell ex-GST (goods sold + logistics at cost)
  const totalCost = goodsCostAud + opts.totals.logistics;     // goods at cost + logistics at cost
  const profit = revenue - totalCost;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
  return {
    fxRate: opts.rate, fxDate: opts.rateDate, marginFactor: opts.margin,
    goodsUsd: Math.round(goodsUsd * 100) / 100,
    goodsCostAud, goodsSellAud: opts.totals.goods,
    logistics: opts.logistics.components,
    logisticsTotal: opts.totals.logistics,
    revenueExGst: revenue, totalCost, profit,
    marginPctOfRevenue: Math.round(marginPct * 10) / 10,
  };
}
