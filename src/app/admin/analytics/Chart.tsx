"use client";
import { useState } from "react";
import type { DaySummary } from "@/lib/analytics";

const GOLD = "#b8934a";

/** Views and visitors over time, drawn as an area with a hover readout. */
export default function Chart({ days, metric }: { days: DaySummary[]; metric: "views" | "visitors" }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 1000, H = 260, PAD_L = 8, PAD_R = 8, PAD_T = 16, PAD_B = 28;
  const values = days.map((d) => d[metric]);
  const peak = Math.max(1, ...values);
  const stepX = (W - PAD_L - PAD_R) / Math.max(1, days.length - 1);
  const x = (i: number) => PAD_L + i * stepX;
  const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - v / peak);

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${H - PAD_B} L${x(0).toFixed(1)},${H - PAD_B} Z`;

  // Roughly six date labels, however long the range is.
  const labelEvery = Math.max(1, Math.round(days.length / 6));
  const active = hover ?? days.length - 1;
  const shown = days[active];

  // Replay the draw-in whenever the range or the metric changes.
  const runKey = `${metric}-${days.length}-${days[0]?.day ?? ""}`;

  return (
    <div>
      <style>{`
        @keyframes chart-draw { to { stroke-dashoffset: 0; } }
        @keyframes chart-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes chart-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .chart-line { stroke-dasharray: 4000; stroke-dashoffset: 4000; animation: chart-draw 1.1s cubic-bezier(.4,0,.2,1) forwards; }
        .chart-area { opacity: 0; transform-origin: bottom; animation: chart-rise .9s cubic-bezier(.4,0,.2,1) .15s forwards; }
        .chart-dot  { opacity: 0; animation: chart-fade .4s ease forwards; }
        .chart-grid { opacity: 0; animation: chart-fade .5s ease forwards; }
        @media (prefers-reduced-motion: reduce) {
          .chart-line, .chart-area, .chart-dot, .chart-grid {
            animation: none; opacity: 1; stroke-dashoffset: 0; transform: none;
          }
        }
      `}</style>
      <div className="flex items-baseline gap-3 mb-4">
        <p className="text-3xl font-light text-stone-900">{shown ? shown[metric].toLocaleString() : 0}</p>
        <p className="text-xs text-stone-400">
          {metric === "views" ? "page views" : "visitors"} on{" "}
          {shown ? new Date(`${shown.day}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 260 }} role="img" aria-label={`${metric} per day`}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.28" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Four guide lines, with the busiest day at the top */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f} className="chart-grid" style={{ animationDelay: `${f * 120}ms` }}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(peak * f)} y2={y(peak * f)} stroke="#e7e5e4" strokeWidth="1" />
            <text x={PAD_L} y={y(peak * f) - 4} fontSize="11" fill="#a8a29e">{Math.round(peak * f)}</text>
          </g>
        ))}

        <path key={`a-${runKey}`} className="chart-area" d={area} fill="url(#fill)" />
        <path key={`l-${runKey}`} className="chart-line" d={line} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {days.map((d, i) => (
          <circle key={`${runKey}-${d.day}`} className="chart-dot" cx={x(i)} cy={y(values[i])} r={active === i ? 4.5 : 2.5}
            fill={active === i ? GOLD : "#fff"} stroke={GOLD} strokeWidth="1.5"
            style={{ animationDelay: `${300 + (i / Math.max(1, days.length - 1)) * 800}ms`, transition: "r .15s ease, fill .15s ease" }} />
        ))}

        {/* An invisible column per day, so hovering anywhere works */}
        {days.map((d, i) => (
          <rect key={`hit-${d.day}`} x={x(i) - stepX / 2} y={0} width={stepX} height={H - PAD_B}
            fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={H - PAD_B} stroke={GOLD} strokeWidth="1" strokeDasharray="3 3" />
        )}

        {days.map((d, i) => (i % labelEvery === 0 || i === days.length - 1 ? (
          <text key={`lbl-${d.day}`} x={x(i)} y={H - 8} fontSize="11" fill="#a8a29e" textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}>
            {new Date(`${d.day}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </text>
        ) : null))}
      </svg>
    </div>
  );
}
