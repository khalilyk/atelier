import { NextResponse } from "next/server";
import { joinerySettings } from "@/lib/admin-store";
import { fetchUsdAud, fxGuard } from "@/lib/joinery/fx";

export const dynamic = "force-dynamic";

// Fetches the live USD→AUD rate and runs it through the sanity band. Does NOT
// auto-persist as the new baseline - that happens only when a run is committed.
export async function GET() {
  try {
    const s = await joinerySettings.get();
    const fx = await fetchUsdAud();
    const halt = fxGuard(fx.rate, s.lastRate, s.fxSanityBandPct);
    return NextResponse.json({ ...fx, lastRate: s.lastRate, bandPct: s.fxSanityBandPct, halt });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "FX fetch failed" }, { status: 502 });
  }
}
