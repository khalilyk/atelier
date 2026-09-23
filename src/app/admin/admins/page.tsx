"use client";
import { useEffect, useState } from "react";

type Admin = { id: string; name: string; email: string; role: string; createdAt: string };
const ROLES = ["super-admin", "editor"];

export default function AdminsAdmin() {
  const [list, setList] = useState<Admin[]>([]);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "editor", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/admins").then(r => r.json()).then(setList);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing({ id: "", name: "", email: "", role: "editor", createdAt: "" });
    setForm({ name: "", email: "", role: "editor", password: "" });
    setIsNew(true);
    setError("");
  }

  function openEdit(a: Admin) {
    setEditing(a);
    setForm({ name: a.name, email: a.email, role: a.role, password: "" });
    setIsNew(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    if (isNew) {
      if (!form.password) { setError("Password required for new admins."); setSaving(false); return; }
      const res = await fetch("/api/admin/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }
    } else if (editing) {
      await fetch("/api/admin/admins", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form }) });
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function deleteAdmin(id: string) {
    if (!confirm("Remove this admin?")) return;
    const res = await fetch("/api/admin/admins", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-stone-900 font-medium text-xl">Admins & Logins</h1>
          <p className="text-stone-900 text-sm mt-1">Manage who has access to this admin portal.</p>
        </div>
        <button onClick={openNew} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-[#a07e3c] transition-colors">
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left px-5 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Added</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {list.map(a => (
              <tr key={a.id} className="hover:bg-stone-50/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#b8934a]/15 text-[#b8934a] flex items-center justify-center text-sm font-medium shrink-0">
                      {a.name.charAt(0)}
                    </div>
                    <span className="font-medium text-stone-900">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-stone-500">{a.email}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${a.role === "super-admin" ? "bg-[#b8934a]/10 text-[#b8934a]" : "bg-stone-100 text-stone-500"}`}>
                    {a.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-stone-400 text-xs">{new Date(a.createdAt).toLocaleDateString("en-AU")}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => openEdit(a)} className="text-xs text-[#b8934a] hover:underline">Edit</button>
                    <button onClick={() => deleteAdmin(a.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700">
        <strong>Note:</strong> Super Admins have full access to all areas. Editors can manage content but cannot manage other admins.
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-medium text-stone-900">{isNew ? "Add Admin" : "Edit Admin"}</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Email Address", key: "email", type: "email" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">
                  Password {!isNew && <span className="text-stone-300">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
                  placeholder={isNew ? "Set password" : "New password (optional)"}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
              <button onClick={() => setEditing(null)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-lg hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-[#b8934a] text-white text-sm py-2.5 rounded-lg hover:bg-[#a07e3c] disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
