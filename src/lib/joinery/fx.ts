// Live USD→AUD mid-market rate (Stage 3). Fetched per run; guarded by a sanity
// band so a broken/stale fetch halts the run rather than silently mispricing.

export type FxResult = { rate: number; date: string; source: string };

export async function fetchUsdAud(): Promise<FxResult> {
  // Free, keyless endpoint. If it moves/breaks, the caller's sanity band catches it.
  const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
  if (!res.ok) throw new Error(`FX fetch failed (${res.status})`);
  const data = await res.json();
  const rate = data?.rates?.AUD;
  if (typeof rate !== "number" || !isFinite(rate) || rate <= 0) throw new Error("FX response missing AUD rate");
  const date = data?.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return { rate: Math.round(rate * 1e4) / 1e4, date, source: "open.er-api.com" };
}

/** Returns null if the rate is within the band; otherwise a halt reason string. */
export function fxGuard(rate: number, lastRate: number, bandPct: number): string | null {
  if (!lastRate || lastRate <= 0) return null; // no baseline yet
  const lo = lastRate * (1 - bandPct / 100);
  const hi = lastRate * (1 + bandPct / 100);
  if (rate < lo || rate > hi) {
    return `Fetched rate ${rate} is outside ±${bandPct}% of last accepted ${lastRate} (band ${lo.toFixed(4)}–${hi.toFixed(4)}). Halting for review.`;
  }
  return null;
}
