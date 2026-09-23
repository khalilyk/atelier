"use client";
import { useEffect, useState } from "react";

type Item = { name: string; categoryLabel: string; size: string; qty: number; unit: string };
type Submission = { id: string; name: string; email: string; phone: string; company: string; message: string; items: Item[]; createdAt: string; status: "new" | "read" | "replied" };

const STATUS_COLORS: Record<string, string> = {
  new: "bg-[#b8934a]/10 text-[#b8934a]",
  read: "bg-stone-100 text-stone-500",
  replied: "bg-emerald-50 text-emerald-600",
};

export default function SubmissionsAdmin() {
  const [list, setList] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<string>("all");

  function load() {
    fetch("/api/admin/submissions").then(r => r.json()).then((data: Submission[]) => {
      setList(data);
    });
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
    if (selected?.id === id) setSelected(s => s ? { ...s, status: status as Submission["status"] } : s);
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Delete this submission?")) return;
    await fetch("/api/admin/submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (selected?.id === id) setSelected(null);
    load();
  }

  const filtered = filter === "all" ? list : list.filter(s => s.status === filter);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100 shrink-0">
          <div>
            <h1 className="text-stone-900 font-medium">Enquiry Submissions</h1>
            <p className="text-stone-400 text-xs">{list.length} total · {list.filter(s => s.status === "new").length} new</p>
          </div>
          <div className="flex gap-2">
            {["all", "new", "read", "replied"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors capitalize"
                style={{
                  background: filter === f ? "#b8934a" : "white",
                  borderColor: filter === f ? "#b8934a" : "#e5e5e5",
                  color: filter === f ? "white" : "#78716c",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <p className="text-lg mb-2">No submissions</p>
              <p className="text-sm">Enquiries from your basket will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {filtered.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSelected(s); if (s.status === "new") updateStatus(s.id, "read"); }}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  style={{ background: selected?.id === s.id ? "#fdf9f3" : undefined }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === "new" ? "bg-[#b8934a]" : "bg-transparent"}`} />
                    <div className="min-w-0">
                      <p className="text-stone-900 text-sm font-medium truncate">{s.name}</p>
                      <p className="text-stone-400 text-xs truncate">{s.email} · {s.items.length} item{s.items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    <span className="text-stone-300 text-xs">{new Date(s.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <aside className="w-80 shrink-0 bg-white border-l border-stone-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
            <p className="font-medium text-stone-900 text-sm">{selected.name}</p>
            <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Contact */}
            <div className="space-y-1.5 text-sm">
              <p><span className="text-stone-400">Email:</span> <a href={`mailto:${selected.email}`} className="text-[#b8934a] hover:underline">{selected.email}</a></p>
              {selected.phone && <p><span className="text-stone-400">Phone:</span> {selected.phone}</p>}
              {selected.company && <p><span className="text-stone-400">Company:</span> {selected.company}</p>}
              <p><span className="text-stone-400">Date:</span> {new Date(selected.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Items Enquired</p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="bg-stone-50 rounded-xl px-4 py-3">
                    <p className="text-stone-900 text-sm font-medium">{item.name}</p>
                    <p className="text-stone-400 text-xs">{item.categoryLabel} · {item.size} · {item.qty} {item.qty === 1 ? item.unit : item.unit + "s"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Message</p>
                <p className="text-stone-600 text-sm leading-relaxed">{selected.message}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-stone-100 space-y-2 shrink-0">
            <div className="flex gap-2">
              {(["new", "read", "replied"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  className="flex-1 text-xs py-2 rounded-lg border transition-colors capitalize"
                  style={{
                    background: selected.status === s ? "#b8934a" : "white",
                    borderColor: selected.status === s ? "#b8934a" : "#e5e5e5",
                    color: selected.status === s ? "white" : "#78716c",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <a
              href={`mailto:${selected.email}?subject=Re: Your Atelier Enquiry`}
              className="block w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            >
              Reply via Email
            </a>
            <button
              onClick={() => deleteSubmission(selected.id)}
              className="w-full border border-red-200 hover:bg-red-50 text-red-400 text-xs uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
