import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/admin-store";
import { dayKey, mergeSummaries, recentDays, summarise, type DaySummary } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Page views for the last n days. Any finished day that still holds raw views
 * is rolled up into a summary first, so the store stays small and reads stay
 * quick. Today is always counted live from the raw records.
 */
export async function GET(req: NextRequest) {
  const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
  const today = dayKey();

  // Compact anything from an earlier day that has not been summarised yet.
  const pending = (await analytics.rawDays()).filter((d) => d < today);
  for (const d of pending) {
    const raw = await analytics.rawDay(d);
    if (raw.length) await analytics.putSummary(summarise(d, raw));
    await analytics.clearRaw(d);
  }

  const stored = await analytics.summaries();
  const byDay = new Map(stored.map((s) => [s.day, s]));
  byDay.set(today, summarise(today, await analytics.rawDay(today)));

  const wanted = recentDays(days);
  const series: DaySummary[] = wanted.map(
    (d) => byDay.get(d) ?? { day: d, views: 0, visitors: 0, paths: {}, refs: {}, countries: {}, cities: {}, devices: {} },
  );

  return NextResponse.json({
    days: series,
    totals: mergeSummaries(series),
    since: stored.length ? stored[0].day : today,
  });
}
