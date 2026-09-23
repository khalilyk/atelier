"use client";
import { useRef, useState } from "react";
import ImagePicker from "./ImagePicker";
import HotspotEditor from "./HotspotEditor";
import type { HotspotBlock } from "@/lib/hotspots";
import { PAGE_SECTIONS, type PageKind } from "@/lib/section-layout";
import {
  GENERIC_BLOCKS, GENERIC_BY_TYPE, duplicateBlock, isPinned, newBlock, parseBlocks, sectionLabel, serializeBlocks,
  type Block, type FieldSpec,
} from "@/lib/page-blocks";

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400";
const iconBtn = "w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 disabled:opacity-25 disabled:hover:bg-transparent";

const splitRows = (s: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("::").map((c) => c.trim()));
const joinRows = (rows: string[][]) => rows.map((r) => r.join(" :: ").replace(/(\s::\s)+$/, "")).join("\n");

// Repeating list (one item per line, parts separated by "::") with typed columns.
export function RowsEditor({ spec, value, onChange }: { spec: FieldSpec; value: string; onChange: (v: string) => void }) {
  const cols = spec.columns ?? [{ label: "Item" }];
  // Blank rows can't be stored (empty lines are dropped), so new rows stay here until typed into.
  const [pending, setPending] = useState(0);
  const saved = splitRows(value).map((r) => cols.map((_, i) => r[i] ?? ""));
  const rows = [...saved, ...Array.from({ length: pending }, () => cols.map(() => ""))];
  const set = (next: string[][]) => {
    const filled = next.filter((r) => r.some((c) => c.trim()));
    setPending(next.length - filled.length);
    onChange(joinRows(filled));
  };
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= rows.length) return; const n = [...rows]; [n[i], n[j]] = [n[j], n[i]]; set(n); };
  const single = cols.length === 1;
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className={`rounded-xl border border-stone-200 ${single ? "flex items-center gap-2 p-2" : "p-3"}`}>
          {!single && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-stone-500">#{i + 1}</span>
              <div className="flex items-center">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={iconBtn} aria-label="Move up">▲</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className={iconBtn} aria-label="Move down">▼</button>
                <button type="button" onClick={() => set(rows.filter((_, k) => k !== i))} className={`${iconBtn} text-red-400`} aria-label="Remove">✕</button>
              </div>
            </div>
          )}
          <div className={single ? "flex-1" : "grid grid-cols-1 md:grid-cols-2 gap-2"}>
            {cols.map((c, ci) => {
              const v = r[ci];
              const update = (nv: string) => set(rows.map((row, k) => (k === i ? row.map((x, xi) => (xi === ci ? nv.replace(/::/g, ":").replace(/\n/g, " ") : x)) : row)));
              return (
                <div key={ci} className={c.long || c.image ? "md:col-span-2" : ""}>
                  {!single && <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">{c.label}</label>}
                  {c.image ? (
                    <ImagePicker value={v} onChange={update} />
                  ) : c.long ? (
                    <textarea value={v} rows={2} onChange={(e) => update(e.target.value)} className={`${FIELD} resize-y`} />
                  ) : (
                    <input value={v} onChange={(e) => update(e.target.value)} className={FIELD} />
                  )}
                </div>
              );
            })}
          </div>
          {single && (
            <div className="flex items-center shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={iconBtn} aria-label="Move up">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className={iconBtn} aria-label="Move down">▼</button>
              <button type="button" onClick={() => set(rows.filter((_, k) => k !== i))} className={`${iconBtn} text-red-400`} aria-label="Remove">✕</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setPending((n) => n + 1)} className="text-xs text-[#b8934a] hover:underline">
        + Add {cols.some((c) => c.image) && cols.length <= 2 ? "photo" : (cols[0]?.label || "item").toLowerCase()}
      </button>
    </div>
  );
}

/** The hotspot block stores its photo and points as JSON in one field. */
function parseHotspots(raw: string): HotspotBlock | null {
  try {
    const v = JSON.parse(raw || "null");
    return v && typeof v === "object" ? (v as HotspotBlock) : null;
  } catch {
    return null;
  }
}

function FieldEditor({ spec, value, onChange, onReset }: { spec: FieldSpec; value: string; onChange: (v: string) => void; onReset?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <label className={LABEL}>{spec.label}</label>
        {onReset && <button type="button" onClick={onReset} className="text-[11px] text-stone-400 hover:text-[#b8934a] shrink-0">Reset</button>}
      </div>
      {spec.kind === "hotspots" ? (
        // The photo and its points are kept as JSON in one field.
        <HotspotEditor
          value={parseHotspots(value)}
          onChange={(v) => onChange(JSON.stringify(v))}
        />
      ) : spec.kind === "image" ? (
        <ImagePicker value={value} onChange={onChange} />
      ) : spec.kind === "rows" ? (
        <RowsEditor spec={spec} value={value} onChange={onChange} />
      ) : spec.kind === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={FIELD}>
          {spec.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : spec.kind === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(12, Math.max(3, value.split("\n").length + 1))} className={`${FIELD} resize-y leading-relaxed`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={FIELD} />
      )}
      {spec.hint && <p className="text-[11px] text-stone-400 mt-1">{spec.hint}</p>}
    </div>
  );
}

/**
 * Block editor for a page.
 * - fieldsFor(type): editable fields of one of the page's own sections
 * - resolve(key):   the page's current value for a field
 * The page's own sections in their original slot edit the page content directly;
 * duplicated copies keep their own text.
 */
export default function BlockList({ kind, value, onChange, fieldsFor, resolve, setBase, resetBase, isBaseKey, emptyNote, renderExtra, preview }: {
  kind: PageKind;
  value: string | undefined;
  onChange: (raw: string) => void;
  fieldsFor: (type: string) => FieldSpec[];
  resolve: (key: string) => string;
  /** Edits to a page's own section in its original slot go to the page content. */
  setBase: (key: string, value: string) => void;
  /** Put a page content field back to its standard wording (omit if not supported). */
  resetBase?: (key: string) => void;
  /** Fields that live on the page itself; others are always stored on the block. */
  isBaseKey?: (key: string) => boolean;
  /** Message for a block with no fields, by block type. */
  emptyNote?: (type: string) => string | undefined;
  /** Extra editor shown inside a block (e.g. the hotspot picker). */
  renderExtra?: (type: string, block: Block) => React.ReactNode;
  /** Live preview of a block, shown as it looks on the site. */
  preview?: (block: Block) => React.ReactNode;
}) {
  const blocks = parseBlocks(value, kind);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [addAt, setAddAt] = useState<number | null>(null); // where a new block goes
  const [drag, setDrag] = useState<string | null>(null);   // uid being dragged
  const [over, setOver] = useState<number | null>(null);   // drop position
  const listRef = useRef<HTMLDivElement>(null);
  const commit = (next: Block[]) => onChange(serializeBlocks(next, kind));
  const firstMovable = blocks.findIndex((b) => !isPinned(kind, b.type));

  const update = (uid: string, fn: (b: Block) => Block) => commit(blocks.map((b) => (b.uid === uid ? fn(b) : b)));
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < firstMovable || j >= blocks.length) return; const n = [...blocks]; [n[i], n[j]] = [n[j], n[i]]; commit(n); };
  const specs = (b: Block) => GENERIC_BY_TYPE[b.type]?.fields ?? fieldsFor(b.type);
  const current = (b: Block, key: string) => (b.data[key] !== undefined ? b.data[key] : GENERIC_BY_TYPE[b.type] ? "" : resolve(key));

  /** Move the dragged block to position `to` (index in the current list). */
  const dropAt = (uid: string, to: number) => {
    const from = blocks.findIndex((b) => b.uid === uid);
    if (from < 0 || to < firstMovable || isPinned(kind, blocks[from].type)) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, item);
    commit(next);
  };

  /** Where the pointer currently sits, as an insert position. */
  const positionAt = (clientY: number) => {
    const cards = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-block]") ?? []);
    let pos = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) { pos = i; break; }
    }
    return Math.max(firstMovable, pos);
  };

  /** Drag by pointer so it works with a mouse and on a touch screen. */
  const startDrag = (uid: string) => (e: React.PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setDrag(uid);
    setOver(positionAt(e.clientY));
    const onMove = (ev: PointerEvent) => setOver(positionAt(ev.clientY));
    const onUp = (ev: PointerEvent) => {
      target.releasePointerCapture?.(ev.pointerId);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      dropAt(uid, positionAt(ev.clientY));
      setDrag(null); setOver(null);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  };

  const duplicate = (i: number) => {
    const b = blocks[i];
    const resolved = GENERIC_BY_TYPE[b.type] ? {} : Object.fromEntries(specs(b).map((s) => [s.key, current(b, s.key)]));
    const copy = duplicateBlock(b, resolved);
    const n = [...blocks];
    n.splice(i + 1, 0, copy);
    commit(n);
    setOpen((o) => ({ ...o, [copy.uid]: true }));
  };
  const remove = (i: number) => {
    const b = blocks[i];
    if (!window.confirm(`Remove "${sectionLabel(kind, b.type)}" from this page? You can add it back later.`)) return;
    commit(blocks.filter((_, k) => k !== i));
  };
  const add = (type: string) => {
    const at = Math.max(firstMovable, addAt ?? blocks.length);
    const b = GENERIC_BY_TYPE[type] ? newBlock(type) : { ...newBlock(type), data: {} };
    const next = [...blocks];
    next.splice(at, 0, b);
    commit(next);
    setOpen((o) => ({ ...o, [b.uid]: true }));
    setAddAt(null);
    setTimeout(() => document.getElementById(`blk-${b.uid}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  const allOpen = blocks.length > 0 && blocks.every((b) => open[b.uid]);
  const counts: Record<string, number> = {};

  // The picker, shown from the toolbar or from a gap between two blocks.
  const picker = (
    <div className="bg-white rounded-2xl border border-[#b8934a]/40 shadow-[0_18px_44px_-24px_rgba(44,38,32,0.6)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-stone-400">Add a new block</p>
        <button type="button" onClick={() => setAddAt(null)} className="text-xs text-stone-400 hover:text-stone-700">Cancel</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {GENERIC_BLOCKS.map((g) => (
          <button key={g.type} type="button" onClick={() => add(g.type)} className="text-left rounded-xl border border-stone-100 px-3 py-2.5 hover:border-[#b8934a] hover:bg-[#b8934a]/5">
            <span className="block text-sm font-semibold text-stone-800">{g.label}</span>
            <span className="block text-[11px] text-stone-400">{g.description}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-4 mb-2">This page&apos;s own sections</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PAGE_SECTIONS[kind].filter((d) => !d.pinned).map((d) => (
          <button key={d.id} type="button" onClick={() => add(d.id)} className="text-left rounded-xl border border-stone-100 px-3 py-2 hover:border-[#b8934a] hover:bg-[#b8934a]/5">
            <span className="block text-[13px] text-stone-700">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /** The thin "insert here" strip between two blocks (also the drop target). */
  const gap = (index: number) => (
    <div className={`group relative flex items-center justify-center transition-all ${drag ? "h-8" : "h-4"} ${index < firstMovable ? "pointer-events-none" : ""}`}>
      <span className={`absolute inset-x-0 h-[3px] rounded-full transition-all ${drag && over === index ? "bg-[#b8934a]" : "bg-transparent"}`} />
      {!drag && index >= firstMovable && (
        <button
          type="button"
          onClick={() => setAddAt(addAt === index ? null : index)}
          title="Add a block here"
          className={`relative z-10 w-6 h-6 rounded-full border text-[13px] leading-none flex items-center justify-center transition-all ${addAt === index ? "bg-[#b8934a] border-[#b8934a] text-white" : "opacity-0 group-hover:opacity-100 bg-white border-stone-200 text-stone-400 hover:border-[#b8934a] hover:text-[#b8934a]"}`}
        >
          +
        </button>
      )}
    </div>
  );

  return (
    <div ref={listRef} className={drag ? "select-none" : undefined}>
      {/* Toolbar */}
      <div className="sticky top-[84px] z-10 mb-2 bg-stone-50/95 backdrop-blur rounded-2xl border border-stone-200 px-3 py-2.5 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setAddAt(addAt === blocks.length ? null : blocks.length)}
          className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#a07e3c] flex items-center gap-1.5"
        >
          <span className="text-sm leading-none">+</span> Add block
        </button>
        <span className="text-[11px] text-stone-400">{blocks.length} blocks · drag to reorder</span>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" onClick={() => setOpen(allOpen ? {} : Object.fromEntries(blocks.map((b) => [b.uid, true])))} className="text-[11px] text-stone-500 hover:text-[#b8934a]">
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
          {value && <button type="button" onClick={() => { if (window.confirm("Reset this page to its original blocks? Added and duplicated blocks will be removed.")) onChange(""); }} className="text-[11px] text-stone-400 hover:text-red-500">Reset</button>}
        </div>
      </div>

      {addAt === blocks.length && <div className="mb-3">{picker}</div>}

      {blocks.map((b, i) => {
        const pinned = isPinned(kind, b.type);
        const expanded = !!open[b.uid];
        const generic = !!GENERIC_BY_TYPE[b.type];
        counts[b.type] = (counts[b.type] || 0) + 1;
        const copyNo = counts[b.type];
        const fields = expanded ? specs(b) : [];
        const extra = expanded ? renderExtra?.(b.type, b) : null;
        return (
          <div key={b.uid}>
            {gap(i)}
            {addAt === i && <div className="mb-3">{picker}</div>}
            <section
              id={`blk-${b.uid}`}
              data-block={b.uid}
              className={`bg-white rounded-2xl border transition-all ${b.hidden ? "border-dashed border-stone-200" : "border-stone-100"} ${drag === b.uid ? "opacity-40 ring-2 ring-[#b8934a]/40" : ""}`}
            >
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-1 px-2 sm:px-3 py-3">
                <span
                  onPointerDown={pinned ? undefined : startDrag(b.uid)}
                  title={pinned ? "This block always stays first" : "Drag to reorder"}
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 ${pinned ? "" : "cursor-grab active:cursor-grabbing hover:text-stone-600 hover:bg-stone-100"}`}
                  aria-hidden
                >
                  {pinned ? "" : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
                  )}
                </span>
                <span className={`w-6 h-6 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center ${b.hidden ? "bg-stone-100 text-stone-400" : "bg-stone-900 text-white"}`}>{i + 1}</span>
                <button type="button" onClick={() => setOpen((o) => ({ ...o, [b.uid]: !o[b.uid] }))} className="flex-1 min-w-0 basis-[calc(100%-4.5rem)] sm:basis-0 flex items-center gap-2 text-left pl-1">
                  <span className={`text-sm font-semibold truncate ${b.hidden ? "text-stone-400 line-through" : "text-stone-800"}`}>
                    {sectionLabel(kind, b.type)}{copyNo > 1 ? ` (${copyNo})` : ""}
                  </span>
                  {generic && <span className="text-[10px] uppercase tracking-widest text-[#b8934a] border border-[#b8934a]/30 rounded px-1 shrink-0">Added</span>}
                  {pinned && <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-stone-400">Always first</span>}
                  {b.hidden && <span className="text-[10px] uppercase tracking-widest text-amber-600">Hidden</span>}
                  <span className={`ml-auto text-stone-400 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                </button>
                {!pinned && (
                  <div className="flex items-center ml-auto sm:ml-0 shrink-0">
                    <button type="button" onClick={() => move(i, -1)} disabled={i <= firstMovable} aria-label="Move up" title="Move up" className={iconBtn}>▲</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down" title="Move down" className={iconBtn}>▼</button>
                    <button type="button" onClick={() => update(b.uid, (x) => ({ ...x, hidden: !x.hidden }))} aria-label={b.hidden ? "Show" : "Hide"} title={b.hidden ? "Show" : "Hide"} className={`${iconBtn} ${b.hidden ? "text-stone-300" : "text-[#b8934a]"}`}>
                      {b.hidden ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 3.9M6.1 6.1C3.5 7.9 2 12 2 12s4 7 10 7a9.6 9.6 0 004-.9" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                    <button type="button" onClick={() => duplicate(i)} aria-label="Duplicate" title="Duplicate" className={iconBtn}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" /></svg>
                    </button>
                    <button type="button" onClick={() => remove(i)} aria-label="Remove" title="Remove" className={`${iconBtn} hover:text-red-500`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                    </button>
                  </div>
                )}
              </div>
              {preview && (
                <div className="px-3 sm:px-4 pb-4">
                  {/* How this block looks on the site. Clicking it opens the fields. */}
                  <button type="button" onClick={() => setOpen((o) => ({ ...o, [b.uid]: !o[b.uid] }))}
                    className={`block w-full text-left rounded-xl border border-stone-100 bg-stone-50/60 overflow-hidden cursor-pointer hover:border-[#b8934a]/40 transition-colors ${b.hidden ? "opacity-40" : ""}`}>
                    <div className="pointer-events-none px-4 py-3">{preview(b)}</div>
                  </button>
                </div>
              )}
              {expanded && (
                <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-stone-50 space-y-4">
                  {fields.length === 0 && !extra ? (
                    <p className="text-[12px] text-stone-400">{emptyNote?.(b.type) ?? "This block shows the page's products or collections automatically, so there is nothing to type here. You can still move, hide or duplicate it."}</p>
                  ) : fields.map((s) => {
                    const original = !generic && b.uid === b.type && (isBaseKey?.(s.key) ?? true);
                    const ownValue = b.data[s.key] !== undefined;
                    return (
                      <FieldEditor
                        key={s.key}
                        spec={s}
                        value={current(b, s.key)}
                        onChange={(v) => {
                          if (original && !ownValue) setBase(s.key, v);
                          else update(b.uid, (x) => ({ ...x, data: { ...x.data, [s.key]: v } }));
                        }}
                        onReset={
                          generic ? undefined
                            : ownValue ? () => update(b.uid, (x) => { const d = { ...x.data }; delete d[s.key]; return { ...x, data: d }; })
                            : original && resetBase ? () => resetBase(s.key)
                            : undefined
                        }
                      />
                    );
                  })}
                  {extra}
                  {!generic && fields.length > 0 && (
                    <p className="text-[11px] text-stone-400">
                      {b.uid === b.type ? "Changes here update this page's standard wording (also shown under Pages)." : "This is a copy, so its text is separate from the original block."}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        );
      })}

      {gap(blocks.length)}

      <button
        type="button"
        onClick={() => setAddAt(addAt === blocks.length ? null : blocks.length)}
        className="w-full border-2 border-dashed border-stone-200 rounded-2xl py-3.5 text-sm text-stone-500 hover:border-[#b8934a] hover:text-[#b8934a] transition-colors"
      >
        + Add block
      </button>
    </div>
  );
}
