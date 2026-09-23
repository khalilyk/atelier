"use client";
import { useEffect, useState } from "react";

type Meta = { id: string; createdAt: string; kind: "daily" | "manual" | "pre-change" | "pre-restore"; label: string; scopes: string[]; size: number };

const SCOPE_LABEL: Record<string, string> = {
  "content.json": "Page content", "product-content.json": "Product edits", "products.json": "Catalog",
  "pages.json": "SEO pages", "settings.json": "SEO settings", "company.json": "Company details",
  "team.json": "Team", "quotes.json": "Quotes", "admins.json": "Admin accounts", "vcards.json": "Digital cards",
  "joinery-settings.json": "Joinery Bot settings", leads: "Download leads", categories: "Categories",
  images: "Image slots", submissions: "Enquiries", journal: "Journal posts",
};
const KIND_LABEL: Record<Meta["kind"], string> = {
  daily: "Daily", manual: "Manual", "pre-change": "Before a change", "pre-restore": "Before a restore",
};
const KIND_STYLE: Record<Meta["kind"], string> = {
  daily: "bg-emerald-50 text-emerald-600", manual: "bg-[#b8934a]/10 text-[#b8934a]",
  "pre-change": "bg-stone-100 text-stone-500", "pre-restore": "bg-amber-50 text-amber-600",
};

const size = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const when = (iso: string) => new Date(iso).toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function BackupsAdmin() {
  const [items, setItems] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const load = () => fetch("/api/admin/backups").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function backupNow() {
    setBusy("new"); setNote("");
    await fetch("/api/admin/backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: "Manual backup" }) });
    await load();
    setBusy(""); setNote("Backup taken.");
  }

  async function restore(b: Meta) {
    const scopes = b.scopes.filter((s) => picked[`${b.id}:${s}`] ?? true);
    if (!scopes.length) { setNote("Choose at least one thing to restore."); return; }
    const names = scopes.map((s) => SCOPE_LABEL[s] ?? s).join(", ");
    if (!window.confirm(`Restore ${names} from ${when(b.createdAt)}?\n\nThis replaces what is on the site now. A copy of the current data is saved first, so this can be undone.`)) return;
    setBusy(b.id); setNote("");
    const res = await fetch("/api/admin/backups", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, scopes }) });
    setBusy("");
    setNote(res.ok ? `Restored ${names}.` : "Restore failed.");
    await load();
  }

  async function remove(b: Meta) {
    if (!window.confirm("Delete this backup permanently?")) return;
    setBusy(b.id);
    await fetch("/api/admin/backups", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) });
    setBusy(""); await load();
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading backups…</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Backups</h1>
          <p className="text-stone-900 text-sm mt-1 max-w-2xl">
            A copy of everything in the admin is taken every night and kept for 30 days, plus a copy just before anything is deleted or replaced. Restore puts a copy back, and saves the current data first so you can undo it.
          </p>
        </div>
        <button onClick={backupNow} disabled={busy === "new"} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
          {busy === "new" ? "Backing up…" : "Back up now"}
        </button>
      </div>

      {note && <div className="mb-5 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm">{note}</div>}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-12 text-center text-stone-400 text-sm">
          No backups yet. Use Back up now, or wait for tonight&apos;s scheduled backup.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((b) => {
            const expanded = open === b.id;
            return (
              <section key={b.id} className="bg-white rounded-2xl border border-stone-100">
                <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                  <button onClick={() => setOpen(expanded ? null : b.id)} className="flex-1 min-w-0 basis-full sm:basis-0 text-left flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${KIND_STYLE[b.kind]}`}>{KIND_LABEL[b.kind]}</span>
                    <span className="text-sm text-stone-800 truncate">{when(b.createdAt)}</span>
                    <span className="text-[11px] text-stone-400 truncate">{b.scopes.length === 1 ? SCOPE_LABEL[b.scopes[0]] ?? b.scopes[0] : `${b.scopes.length} items`} · {size(b.size)}</span>
                    <span className={`ml-auto text-stone-400 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  <a href={`/api/admin/backups?id=${encodeURIComponent(b.id)}`} target="_blank" className="text-xs text-stone-500 hover:text-[#b8934a] ml-auto sm:ml-0">Download</a>
                  <button onClick={() => restore(b)} disabled={!!busy} className="text-xs border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 hover:border-[#b8934a] hover:text-[#b8934a] disabled:opacity-40">
                    {busy === b.id ? "Working…" : "Restore"}
                  </button>
                  <button onClick={() => remove(b)} disabled={!!busy} className="text-xs text-stone-300 hover:text-red-500">Delete</button>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-50">
                    {b.label && <p className="text-[12px] text-stone-400 mb-3">{b.label}</p>}
                    <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">Restore only these</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {b.scopes.map((s) => (
                        <label key={s} className="flex items-center gap-2 text-sm text-stone-700">
                          <input type="checkbox" checked={picked[`${b.id}:${s}`] ?? true}
                            onChange={(e) => setPicked((p) => ({ ...p, [`${b.id}:${s}`]: e.target.checked }))} />
                          {SCOPE_LABEL[s] ?? s}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
