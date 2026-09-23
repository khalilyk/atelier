"use client";
import { useEffect, useMemo, useState } from "react";

type Lead = { id: string; name: string; email: string; resource: string; createdAt: string };

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [resource, setResource] = useState("");

  useEffect(() => {
    fetch("/api/admin/leads").then((r) => r.json())
      .then((d) => setLeads(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const resources = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) counts[l.resource] = (counts[l.resource] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (resource && l.resource !== resource) return false;
      if (!s) return true;
      return `${l.name} ${l.email} ${l.resource}`.toLowerCase().includes(s);
    });
  }, [leads, q, resource]);

  async function remove(id: string) {
    if (!window.confirm("Delete this lead?")) return;
    await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setLeads((ls) => ls.filter((l) => l.id !== id));
  }

  function exportCsv() {
    const rows = [["Name", "Email", "Resource", "Date"], ...filtered.map((l) => [l.name, l.email, l.resource, new Date(l.createdAt).toLocaleString("en-AU")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `atelier-download-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (loading) return <div className="p-8 text-stone-400 text-sm">Loading leads…</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Download Leads</h1>
          <p className="text-stone-900 text-sm mt-1">Name and email captured by the gated resource downloads.</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
            className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#b8934a]/60" />
          <button onClick={exportCsv} disabled={filtered.length === 0}
            className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-40">Export CSV</button>
        </div>
      </div>

      {resources.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <button onClick={() => setResource("")}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${resource === "" ? "bg-[#b8934a] text-white border-[#b8934a]" : "border-stone-200 text-stone-600 hover:border-[#b8934a]"}`}>
            All <span className="opacity-60">({leads.length})</span>
          </button>
          {resources.map(([r, n]) => (
            <button key={r} onClick={() => setResource(r)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${resource === r ? "bg-[#b8934a] text-white border-[#b8934a]" : "border-stone-200 text-stone-600 hover:border-[#b8934a]"}`}>
              {r} <span className="opacity-60">({n})</span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-12 text-center text-stone-400 text-sm">
          {leads.length === 0 ? "No downloads yet." : "No leads match that search."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-stone-400 bg-stone-50">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Resource</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-stone-50">
                  <td className="px-5 py-3.5 text-stone-900">{l.name}</td>
                  <td className="px-5 py-3.5"><a href={`mailto:${l.email}`} className="text-[#b8934a] hover:underline">{l.email}</a></td>
                  <td className="px-5 py-3.5 text-stone-500">{l.resource}</td>
                  <td className="px-5 py-3.5 text-stone-400">{new Date(l.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-3.5 text-right"><button onClick={() => remove(l.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
