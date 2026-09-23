"use client";
import { useEffect, useRef, useState } from "react";
import ImagePicker from "./ImagePicker";
import { HOTSPOT_HEIGHTS, hotspotHeightVh, newSpotId, type Hotspot, type HotspotBlock } from "@/lib/hotspots";

const EMPTY: HotspotBlock = { image: "", alt: "", eyebrow: "", heading: "", height: "auto", spots: [] };
const input = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const label = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";
const clamp = (n: number) => Math.round(Math.min(98, Math.max(2, n)) * 10) / 10;

// Click the image to drop a hotspot, drag a hotspot to move it, then fill in
// its card. Order in the list is the order visitors step through.
export default function HotspotEditor({ value, onChange }: { value?: HotspotBlock | null; onChange: (v: HotspotBlock) => void }) {
  const block = { ...EMPTY, ...(value || {}), spots: value?.spots ?? [] };
  const [sel, setSel] = useState<string | null>(block.spots[0]?.id ?? null);
  const [screen, setScreen] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const read = () => setScreen({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  const set = (patch: Partial<HotspotBlock>) => onChange({ ...block, ...patch });
  const setSpot = (id: string, patch: Partial<Hotspot>) =>
    set({ spots: block.spots.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const posFrom = (e: { clientX: number; clientY: number }) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const addAt = (e: React.MouseEvent) => {
    if (drag.current) return;
    const { x, y } = posFrom(e);
    const spot: Hotspot = { id: newSpotId(), x, y, title: `Feature ${block.spots.length + 1}`, text: "" };
    set({ spots: [...block.spots, spot] });
    setSel(spot.id);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= block.spots.length) return;
    const spots = [...block.spots];
    [spots[i], spots[j]] = [spots[j], spots[i]];
    set({ spots });
  };

  const remove = (id: string) => {
    const spots = block.spots.filter((s) => s.id !== id);
    set({ spots });
    if (sel === id) setSel(spots[0]?.id ?? null);
  };

  const current = block.spots.find((s) => s.id === sel) || null;
  // The preview mimics the real section: a share of THIS screen's height across
  // the full page width, so a hotspot lands where you put it.
  const vh = hotspotHeightVh(block);
  const crop = vh && screen.w ? `${screen.w} / ${(screen.h * vh) / 100}` : "";

  return (
    <div className="space-y-4">
      <ImagePicker label="Hotspot image (full width)" value={block.image} onChange={(url) => set({ image: url })} />

      {block.image ? (
        <>
          <p className="text-[12px] text-stone-500">Click anywhere on the image to add a hotspot. Drag a hotspot to move it.</p>
          <div
            ref={stage}
            onClick={addAt}
            style={crop ? { aspectRatio: crop } : undefined}
            className="relative w-full rounded-xl overflow-hidden border border-stone-200 cursor-crosshair select-none touch-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.image} alt="" draggable={false} className={crop ? "absolute inset-0 w-full h-full object-cover pointer-events-none" : "w-full h-auto block pointer-events-none"} />
            {block.spots.map((s, i) => (
              <button
                key={s.id}
                type="button"
                title={s.title}
                onClick={(e) => { e.stopPropagation(); if (!drag.current?.moved) setSel(s.id); }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  drag.current = { id: s.id, moved: false };
                  setSel(s.id);
                }}
                onPointerMove={(e) => {
                  if (drag.current?.id !== s.id) return;
                  drag.current.moved = true;
                  setSpot(s.id, posFrom(e));
                }}
                onPointerUp={() => { setTimeout(() => { drag.current = null; }, 0); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-[12px] font-bold flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing transition-colors ${sel === s.id ? "bg-[#b8934a] text-white ring-4 ring-[#b8934a]/30" : "bg-white text-stone-900"}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Eyebrow (optional)</label>
              <input className={input} value={block.eyebrow || ""} onChange={(e) => set({ eyebrow: e.target.value })} placeholder="Explore the details" />
            </div>
            <div>
              <label className={label}>Heading (optional)</label>
              <input className={input} value={block.heading || ""} onChange={(e) => set({ heading: e.target.value })} placeholder="Designed around the way you live" />
            </div>
            <div>
              <label className={label}>Section height</label>
              <select className={input} value={block.height || "auto"} onChange={(e) => set({ height: e.target.value })}>
                {HOTSPOT_HEIGHTS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              {block.height === "custom" && (
                <div className="flex items-center gap-3 mt-2">
                  <input type="range" min={10} max={90} step={5} value={block.heightVh ?? 60}
                    onChange={(e) => set({ heightVh: Number(e.target.value) })} className="flex-1 accent-[#b8934a]" />
                  <span className="text-xs text-stone-600 w-20 shrink-0">{block.heightVh ?? 60}% of screen</span>
                </div>
              )}
              <p className="text-[11px] text-stone-400 mt-1">
                {vh ? `${vh}% of the visitor's screen height; the middle of the image is shown. The preview matches your screen.` : "The whole image is shown at its natural height."}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Image description (for search and screen readers)</label>
              <input className={input} value={block.alt || ""} onChange={(e) => set({ alt: e.target.value })} />
            </div>
          </div>

          {block.spots.length === 0 ? (
            <p className="text-sm text-stone-400 bg-stone-50 rounded-xl px-4 py-6 text-center">No hotspots yet. Click the image to add one. The section stays hidden on the website until it has at least one.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4 items-start">
              <ol className="space-y-1.5">
                {block.spots.map((s, i) => (
                  <li key={s.id} className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${sel === s.id ? "border-[#b8934a] bg-[#b8934a]/5" : "border-stone-200"}`}>
                    <button type="button" onClick={() => setSel(s.id)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-[13px] text-stone-800 truncate">{s.title || "Untitled"}</span>
                    </button>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-stone-400 hover:text-stone-800 disabled:opacity-30 text-xs" aria-label="Move up">▲</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === block.spots.length - 1} className="text-stone-400 hover:text-stone-800 disabled:opacity-30 text-xs" aria-label="Move down">▼</button>
                  </li>
                ))}
              </ol>

              {current && (
                <div className="rounded-xl border border-stone-200 p-4 space-y-3">
                  <div>
                    <label className={label}>Title</label>
                    <input className={input} value={current.title} onChange={(e) => setSpot(current.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className={label}>Text <span className="text-stone-300 lowercase tracking-normal">- blank line starts a new paragraph</span></label>
                    <textarea className={`${input} resize-y`} rows={5} value={current.text} onChange={(e) => setSpot(current.id, { text: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label}>Link URL (optional)</label>
                      <input className={input} value={current.linkUrl || ""} onChange={(e) => setSpot(current.id, { linkUrl: e.target.value })} placeholder="/classic/colour-card" />
                    </div>
                    <div>
                      <label className={label}>Link text</label>
                      <input className={input} value={current.linkLabel || ""} onChange={(e) => setSpot(current.id, { linkLabel: e.target.value })} placeholder="Learn more" />
                    </div>
                  </div>
                  <ImagePicker label="Card image (optional)" value={current.image || ""} onChange={(url) => setSpot(current.id, { image: url })} />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400">Position {current.x}% across, {current.y}% down</span>
                    <button type="button" onClick={() => remove(current.id)} className="text-xs text-red-500 hover:underline">Delete hotspot</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button type="button" onClick={() => { if (window.confirm("Remove the hotspot image and all its hotspots?")) { onChange({ ...EMPTY }); setSel(null); } }} className="text-xs text-stone-400 hover:text-red-500">
            Remove hotspot section
          </button>
        </>
      ) : (
        <p className="text-[12px] text-stone-400">Choose an image to start placing hotspots. Leave empty to hide this section.</p>
      )}
    </div>
  );
}
