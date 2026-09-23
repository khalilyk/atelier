"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Chart from "./analytics/Chart";
import { top, type DaySummary } from "@/lib/analytics";

type Data = { days: DaySummary[]; totals: Omit<DaySummary, "day"> };

/** The last 30 days of traffic, on the dashboard. Refreshes while open. */
export default function DashboardViews() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const load = () => { void fetch("/api/admin/analytics?days=30").then((r) => r.json()).then(setData).catch(() => {}); };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const totals = data?.totals;
  const pages = top(totals?.paths ?? {}, 5);
  const nothingYet = !!data && (totals?.views ?? 0) === 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mb-5">
        <div>
          <p className="text-3xl font-light text-stone-900">{(totals?.views ?? 0).toLocaleString()}</p>
          <p className="text-stone-500 text-sm">Page views</p>
        </div>
        <div>
          <p className="text-3xl font-light text-stone-900">{(totals?.visitors ?? 0).toLocaleString()}</p>
          <p className="text-stone-500 text-sm">Visitors</p>
        </div>
        <p className="text-xs text-stone-400 ml-auto">Last 30 days</p>
      </div>

      {data ? <Chart days={data.days} metric="views" /> : <div className="h-[260px] animate-pulse bg-stone-50 rounded-xl" />}

      {nothingYet && (
        <p className="text-sm text-stone-400 mt-4">
          Nothing recorded yet. Visits appear here within a minute of someone opening the website.
        </p>
      )}

      {pages.length > 0 && (
        <div className="mt-6 pt-5 border-t border-stone-100">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-3">Most viewed</p>
          <ul className="space-y-1.5">
            {pages.map(([path, views]) => (
              <li key={path} className="flex items-center justify-between gap-3 text-sm">
                <Link href={path} target="_blank" className="text-stone-600 hover:text-[#b8934a] truncate">{path}</Link>
                <span className="text-stone-400 tabular-nums shrink-0">{views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
