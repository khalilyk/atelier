"use client";
import { useEffect, useState } from "react";

type Member = { id: string; name: string; role: string; bio: string; email: string; phone?: string; image?: string; order: number };
const EMPTY: Omit<Member, "id"> = { name: "", role: "", bio: "", email: "", phone: "", order: 99 };

export default function TeamAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<Omit<Member, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  function load() {
    fetch("/api/admin/team").then(r => r.json()).then(setMembers);
  }

  useEffect(() => { load(); }, []);

  function openEdit(m: Member) {
    setEditing(m);
    setForm({ name: m.name, role: m.role, bio: m.bio, email: m.email, phone: m.phone ?? "", image: m.image, order: m.order });
    setIsNew(false);
  }

  function openNew() {
    setEditing({ id: "", ...EMPTY });
    setForm(EMPTY);
    setIsNew(true);
  }

  async function save() {
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else if (editing) {
      await fetch("/api/admin/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form }) });
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function deleteMember(id: string) {
    if (!confirm("Delete this team member?")) return;
    await fetch("/api/admin/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (editing?.id === id) setEditing(null);
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-stone-900 font-medium text-xl">Team</h1>
          <p className="text-stone-900 text-sm mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-[#a07e3c] transition-colors">
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {members.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4">
            <div className="w-14 h-14 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-stone-500 text-xl font-light">
              {m.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900">{m.name}</p>
              <p className="text-stone-500 text-sm">{m.role}</p>
              <p className="text-stone-400 text-xs mt-1 truncate">{m.email}</p>
            </div>
            <div className="flex gap-3 shrink-0 items-center">
              <a href={`/api/vcard/${m.id}`} className="text-xs text-stone-500 hover:text-[#b8934a]" title="Download this member's contact card (.vcf)">vCard ↓</a>
              <button onClick={() => openEdit(m)} className="text-xs text-[#b8934a] hover:underline">Edit</button>
              <button onClick={() => deleteMember(m.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / New modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-medium text-stone-900">{isNew ? "Add Team Member" : "Edit Member"}</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Role / Title", key: "role", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone (for vCard)", key: "phone", type: "text" },
                { label: "Display Order", key: "order", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, unknown>)[f.key] as string}
                    onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
              <button onClick={() => setEditing(null)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-lg hover:bg-stone-50 transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex-1 bg-[#b8934a] text-white text-sm py-2.5 rounded-lg hover:bg-[#a07e3c] transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
