"use client";
import { useCallback, useEffect, useState } from "react";
import { ROLES, ROLE_KEYS, roleLabel, isSuperAdmin, normaliseRole } from "@/lib/roles";

type Person = { id: string; name: string; email: string; role: string; createdAt: string };

const BLANK = { name: "", email: "", role: "editor", password: "" };

/**
 * The team is the people who can sign in. Profiles and accounts used to be
 * two sections holding the same names, and the profile half only ever fed the
 * contact-card download, so with that gone there is one list.
 */
export default function TeamPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const boss = isSuperAdmin(me?.role);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/admins");
    setPeople(res.ok ? await res.json() : []);
  }, []);

  useEffect(() => {
    // The endpoint answers { admin: {...} }, not the person directly.
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => {
        const who = d?.admin ?? null;
        setMe(who);
        return who && isSuperAdmin(who.role) ? load() : null;
      })
      .catch(() => setMe(null))
      .finally(() => setLoaded(true));
  }, [load]);

  function openNew() {
    setError(""); setIsNew(true); setForm({ ...BLANK });
    setEditing({ id: "", name: "", email: "", role: "editor", createdAt: "" });
  }

  function openEdit(p: Person) {
    setError(""); setIsNew(false);
    setEditing(p);
    setForm({ name: p.name, email: p.email, role: normaliseRole(p.role), password: "" });
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) { setError("A name and email are needed."); return; }
    if (isNew && !form.password) { setError("Set a password so they can sign in."); return; }
    setSaving(true); setError("");
    const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
    if (form.password) body.password = form.password;
    if (!isNew) body.id = editing!.id;
    const res = await fetch("/api/admin/admins", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? "Could not save."); return; }
    setEditing(null);
    load();
  }

  async function remove(p: Person) {
    if (!confirm(`Remove ${p.name}? They will no longer be able to sign in.`)) return;
    const res = await fetch("/api/admin/admins", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    if (!res.ok) { alert((await res.json()).error ?? "Could not remove."); return; }
    load();
  }

  const field = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50";
  const lbl = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

  if (loaded && !boss) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-stone-900 font-medium text-xl mb-2">Team</h1>
        <p className="text-stone-500 text-sm">Only a Super Admin can see and manage the team.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-stone-900 font-medium text-xl">Team</h1>
          <p className="text-stone-500 text-sm mt-1">{people.length} {people.length === 1 ? "person" : "people"} with access</p>
        </div>
        <button onClick={openNew} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-[#a07e3c] transition-colors">
          Add person
        </button>
      </div>
      <p className="text-stone-500 text-sm mb-8 max-w-xl leading-relaxed">
        Everyone here can sign in to the admin. What they can reach depends on their role.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-10">
        {people.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-[#b8934a]/15 text-[#b8934a] shrink-0 flex items-center justify-center text-lg font-medium">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900">{p.name}{me?.id === p.id && <span className="text-stone-400 font-normal text-sm"> — you</span>}</p>
              <p className="text-stone-400 text-xs mt-0.5 truncate">{p.email}</p>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-full shrink-0 ${isSuperAdmin(p.role) ? "bg-[#b8934a]/10 text-[#b8934a]" : "bg-stone-100 text-stone-500"}`}>
              {roleLabel(p.role)}
            </span>
            <div className="flex gap-3 shrink-0 items-center">
              <button onClick={() => openEdit(p)} className="text-xs text-[#b8934a] hover:underline">Edit</button>
              <button onClick={() => remove(p)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* What the roles mean, where they are chosen from. */}
      <div className="border border-stone-100 rounded-2xl p-6 bg-white">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">What each role can do</p>
        <div className="space-y-4">
          {ROLE_KEYS.map((r) => (
            <div key={r} className="flex gap-4">
              <span className={`text-[11px] px-2.5 py-1 rounded-full h-fit shrink-0 w-28 text-center ${r === "super-admin" ? "bg-[#b8934a]/10 text-[#b8934a]" : "bg-stone-100 text-stone-500"}`}>
                {ROLES[r].label}
              </span>
              <p className="text-sm text-stone-600 leading-relaxed">{ROLES[r].blurb}</p>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-medium text-stone-900">{isNew ? "Add person" : "Edit person"}</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={lbl}>Full name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={field} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={field} />
                <p className="text-xs text-stone-400 mt-1.5">They sign in with this.</p>
              </div>
              <div>
                <label className={lbl}>Role</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={field}>
                  {ROLE_KEYS.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                </select>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{ROLES[form.role as keyof typeof ROLES]?.blurb}</p>
              </div>
              <div>
                <label className={lbl}>
                  Password {!isNew && <span className="text-stone-300 normal-case tracking-normal">(leave blank to keep the current one)</span>}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={field} autoComplete="new-password" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
              <button onClick={() => setEditing(null)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-lg hover:bg-stone-50 transition-colors">Cancel</button>
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
