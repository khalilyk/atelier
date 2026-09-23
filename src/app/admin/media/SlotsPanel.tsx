"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import MediaPicker from "../components/MediaPicker";

type Slot = { key: string; group: string; label: string; note?: string };

// The beige used for an empty placeholder tile (no logo, by design).
const BEIGE = "#ede8df";

function SlotTile({ slot, url, onUpload, onClear, onPick, busy }: {
  slot: Slot; url: string; busy: boolean;
  onUpload: (file: File) => void; onClear: () => void; onPick: () => void;
}) {
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith("image/")) onUpload(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-colors ${over ? "border-[#b8934a] bg-[#b8934a]/10" : url ? "border-transparent" : "border-stone-300 hover:border-[#b8934a]"}`}
        style={!url ? { background: BEIGE } : undefined}
        title={url ? "Click or drop to replace" : "Click or drop an image to upload"}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={slot.label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
            <span className="text-[11px] uppercase tracking-widest text-stone-400">
              {busy ? "Uploading…" : over ? "Drop to upload" : "[Placeholder for image]"}
            </span>
          </div>
        )}
        {busy && url && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-xs text-stone-600">Uploading…</div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />

      <div className="flex items-start justify-between gap-2 mt-2">
        <div className="min-w-0">
          <p className="text-[12.5px] text-stone-800 truncate">{slot.label}</p>
          {slot.note && <p className="text-[11px] text-stone-400 line-clamp-2">{slot.note}</p>}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button onClick={onPick} className="text-[11px] text-stone-400 hover:text-[#b8934a]">Choose</button>
          {url && <button onClick={onClear} className="text-[11px] text-red-400 hover:text-red-600">Remove</button>}
        </div>
      </div>
      <p className="text-[10px] text-stone-300 mt-0.5 truncate">{slot.key}</p>
    </div>
  );
}

export default function SlotsPanel() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string>("");
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  // Which slot is choosing a file from the library.
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/images").then((r) => r.json()).then((d) => {
      setSlots(d.slots || []); setMap(d.images || {}); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const out: { group: string; slots: Slot[] }[] = [];
    for (const s of slots) {
      let g = out.find((x) => x.group === s.group);
      if (!g) { g = { group: s.group, slots: [] }; out.push(g); }
      g.slots.push(s);
    }
    return out;
  }, [slots]);

  // The first group is open until one is picked - derived, so no extra render.
  const active = chosen || groups[0]?.group || "";

  const filledCount = (g: { slots: Slot[] }) => g.slots.filter((s) => map[s.key]).length;
  const totalFilled = slots.filter((s) => map[s.key]).length;

  async function save(patch: Record<string, string>) {
    const res = await fetch("/api/admin/images", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    setMap((m) => {
      const next = { ...m };
      for (const [k, v] of Object.entries(patch)) { if (v) next[k] = v; else delete next[k]; }
      return next;
    });
  }

  async function upload(key: string, file: File) {
    setBusyKey(key);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.url) await save({ [key]: d.url });
    } finally { setBusyKey(null); }
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading image slots…</div>;

  const current = groups.find((g) => g.group === active);
  const visible = current ? (onlyEmpty ? current.slots.filter((s) => !map[s.key]) : current.slots) : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <p className="text-stone-600 text-sm max-w-2xl">
          Each tile is a picture slot on the website. Drop a photo on it, or use Choose to pick one already in the
          library. An empty slot stays hidden on the live site.
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-stone-900">
            <input type="checkbox" checked={onlyEmpty} onChange={(e) => setOnlyEmpty(e.target.checked)} />
            Show empty only
          </label>
          <span className="text-xs text-stone-900">{totalFilled} / {slots.length} filled</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Group nav */}
        <nav className="md:w-64 shrink-0 md:sticky md:top-24 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible w-full pb-2 md:pb-0">
          {groups.map((g) => {
            const filled = filledCount(g);
            const on = active === g.group;
            return (
              <button key={g.group} onClick={() => setChosen(g.group)}
                className={`shrink-0 md:w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${on ? "bg-[#b8934a] text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                <span className="truncate">{g.group}</span>
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${on ? "bg-white/25 text-white" : filled === g.slots.length ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                  {filled}/{g.slots.length}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Tiles */}
        <div className="flex-1 min-w-0">
          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 px-6 py-12 text-center text-stone-400 text-sm">
              {onlyEmpty ? "Every slot in this group is filled." : "No slots in this group."}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-6 grid grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((s) => (
                <SlotTile key={s.key} slot={s} url={map[s.key] || ""} busy={busyKey === s.key}
                  onUpload={(f) => upload(s.key, f)} onClear={() => save({ [s.key]: "" })}
                  onPick={() => setPicking(s.key)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {picking && (
        <MediaPicker
          title="Choose a photo for this slot"
          onClose={() => setPicking(null)}
          onSelect={(url) => { void save({ [picking]: url }); setPicking(null); }}
        />
      )}
    </div>
  );
}
