"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Chart from "./Chart";
import { cityName, countryName, top, type DaySummary } from "@/lib/analytics";

type Totals = Omit<DaySummary, "day">;
type Data = { days: DaySummary[]; totals: Totals; since: string };

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "12 months", days: 365 },
];

const DEVICE_LABEL: Record<string, string> = { mobile: "Mobile", tablet: "Tablet", desktop: "Desktop" };


/** Counts up to a number, so the headline figures land rather than appear. */
const REDUCED = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

function useCountUp(target: number, ms = 700) {
  const [n, setN] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    from.current = target;
    if (start === target || REDUCED()) return;
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setN(Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);

  return n;
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  const numeric = typeof value === "number";
  const counted = useCountUp(numeric ? value : 0);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-2">{label}</p>
      <p className="text-3xl font-light text-stone-900 tabular-nums">{numeric ? counted.toLocaleString() : value}</p>
      {note && <p className="text-xs text-stone-400 mt-1">{note}</p>}
    </div>
  );
}

/** A ranked list with a bar behind each row, so the shape is readable at a glance. */
function Ranked({ title, rows, empty, format }: {
  title: string;
  rows: [string, number][];
  empty: string;
  format?: (key: string) => string;
}) {
  const peak = Math.max(1, ...rows.map(([, v]) => v));
  // Restarting the list replays the grow-in whenever the numbers change.
  const signature = rows.map(([k, v]) => `${k}:${v}`).join("|");

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <style>{`
        @keyframes bar-grow { from { width: 0; } }
        .bar { animation: bar-grow .7s cubic-bezier(.4,0,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .bar { animation: none; } }
      `}</style>
      <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-400 py-4">{empty}</p>
      ) : (
        <ul key={signature} className="space-y-1.5">
          {rows.map(([key, value], i) => (
            <li key={key} className="relative flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg overflow-hidden">
              <span
                className="bar absolute inset-y-0 left-0 bg-[#b8934a]/10 rounded-lg"
                style={{ width: `${(value / peak) * 100}%`, animationDelay: `${i * 45}ms` }}
              />
              <span className="relative text-sm text-stone-700 truncate">{format ? format(key) : key}</span>
              <span className="relative text-sm text-stone-500 tabular-nums shrink-0">{value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalyticsAdmin() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [metric, setMetric] = useState<"views" | "visitors">("views");
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState("");

  const load = useCallback(async (days: number) => {
    try {
      const d: Data = await fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json());
      setData(d);
      setRefreshedAt(new Date().toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(range); }, [range, load]);

  // Keep the numbers current while the page is open.
  useEffect(() => {
    const t = setInterval(() => { void load(range); }, 60_000);
    return () => clearInterval(t);
  }, [range, load]);

  if (loading && !data) return <div className="p-8 text-stone-400 text-sm">Loading analytics…</div>;

  const totals = data?.totals;
  const days = data?.days ?? [];
  const busiest = [...days].sort((a, b) => b.views - a.views)[0];
  const perVisitor = totals && totals.visitors ? (totals.views / totals.visitors).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Analytics</h1>
          <p className="text-stone-700 text-sm mt-1">
            Page views on your website, counted without cookies. Updates every minute.
            {refreshedAt && <span className="text-stone-400"> Last checked {refreshedAt}.</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {RANGES.map((r) => (
            <button key={r.days} onClick={() => setRange(r.days)}
              className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${range === r.days ? "bg-[#b8934a] text-white" : "text-stone-500 hover:text-stone-900"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Page views" value={totals?.views ?? 0} note={`In the last ${range} days`} />
        <Stat label="Visitors" value={totals?.visitors ?? 0} note="Counted once per day" />
        <Stat label="Pages per visitor" value={perVisitor} note="How much they looked at" />
        <Stat label="Busiest day" value={busiest && busiest.views ? busiest.views : 0}
          note={busiest && busiest.views ? new Date(`${busiest.day}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "Nothing yet"} />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Over time</h2>
          <div className="flex items-center gap-1">
            {(["views", "visitors"] as const).map((m) => (
              <button key={m} onClick={() => setMetric(m)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${metric === m ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"}`}>
                {m === "views" ? "Views" : "Visitors"}
              </button>
            ))}
          </div>
        </div>
        <Chart days={days} metric={metric} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Ranked title="Most viewed pages" rows={top(totals?.paths ?? {}, 10)} empty="No page views yet." />
        <Ranked title="Where visitors came from" rows={top(totals?.refs ?? {}, 10)} empty="Nothing yet." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Ranked title="Cities" rows={top(totals?.cities ?? {}, 10)} empty="Nothing yet." format={cityName} />
        <Ranked title="Countries" rows={top(totals?.countries ?? {}, 8)} empty="Nothing yet." format={countryName} />
        <Ranked title="Devices" rows={top(totals?.devices ?? {}, 5)} empty="Nothing yet." format={(k) => DEVICE_LABEL[k] ?? k} />
      </div>

      <p className="text-[11px] text-stone-400 mt-6">
        Visitors are counted with a daily code made from the browser and network address; it changes every day and cannot
        be traced back to a person. Known bots are ignored.
      </p>
    </div>
  );
}
