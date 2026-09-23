import { NextRequest, NextResponse } from "next/server";
import { joinerySettings } from "@/lib/admin-store";
import { applyExclusions, priceItems, buildLogistics, computeTotals, verify, profitReport, type SupplierItem, type Incoterm } from "@/lib/joinery/engine";

export const dynamic = "force-dynamic";

// Runs the full pricing pass server-side. Margin + benchmarks never leave here
// except inside the internal report returned to the authenticated admin.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const items: SupplierItem[] = Array.isArray(body.items) ? body.items : [];
  const incoterm: Incoterm = body.incoterm === "EXW" ? "EXW" : "FOB";
  const rate = Number(body.rate);
  const rateDate: string = body.rateDate || new Date().toISOString().slice(0, 10);
  const supplierUsdSummary = typeof body.supplierUsdSummary === "number" ? body.supplierUsdSummary : undefined;
  const extraBrands: string[] = Array.isArray(body.extraBrands) ? body.extraBrands : [];
  // Optional per-run logistics overrides (from the editable benchmark panel).
  const logisticsOverride = body.logistics && typeof body.logistics === "object" ? body.logistics : null;

  if (!rate || rate <= 0) return NextResponse.json({ error: "A valid FX rate is required" }, { status: 400 });
  if (items.length === 0) return NextResponse.json({ error: "No items to price" }, { status: 400 });

  const s = await joinerySettings.get();
  const margin = typeof body.marginFactor === "number" && body.marginFactor > 0 ? body.marginFactor : s.marginFactor;

  // Stage 7 (pre-pricing): auto-remove engineered stone, flag exclusion collisions.
  const { items: cleanItems, flags } = applyExclusions(items);
  const priced = priceItems(cleanItems, rate, margin, extraBrands);
  const logistics = buildLogistics(s, incoterm);
  // Apply per-run overrides on top of benchmarks (benchmark retained for comparison).
  if (logisticsOverride) {
    for (const c of logistics.components) {
      if (typeof logisticsOverride[c.key] === "number") c.aud = logisticsOverride[c.key];
    }
    logistics.totalAud = logistics.components.reduce((sum, c) => sum + (Number(c.aud) || 0), 0);
  }

  const totals = computeTotals(priced, logistics.totalAud, s.gstRate);
  const assertions = verify({ supplierUsdSummary, items: cleanItems, priced, rate, margin, logisticsAud: logistics.totalAud, gstRate: s.gstRate, totals });
  const report = profitReport({ items: cleanItems, rate, rateDate, margin, logistics, totals });

  return NextResponse.json({ priced, logistics, totals, assertions, report, flags, incoterm });
}
