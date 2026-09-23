"use client";
import { useEffect, useState } from "react";

export default function AccountAdmin() {
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/auth").then(r => r.json()).then(data => {
      if (data.admin) {
        setAdmin(data.admin);
        setForm(f => ({ ...f, name: data.admin.name, email: data.admin.email }));
      }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    const body: Record<string, string> = { id: admin!.id, name: form.name, email: form.email };
    if (form.password) body.password = form.password;
    await fetch("/api/admin/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!admin) return <div className="p-8 text-stone-400">Loading…</div>;

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-stone-900 font-medium text-xl">My Account</h1>
        <p className="text-stone-900 text-sm mt-1">Update your name, email and password.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
          <div className="w-14 h-14 rounded-full bg-[#b8934a]/15 text-[#b8934a] flex items-center justify-center text-2xl font-light">
            {admin.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-stone-900">{admin.name}</p>
            <p className="text-stone-400 text-sm">{admin.email}</p>
            <span className="text-xs bg-[#b8934a]/10 text-[#b8934a] px-2 py-0.5 rounded-full">{admin.role}</span>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
            />
          </div>
          <div className="pt-2 border-t border-stone-100">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Change Password</p>
            <div className="space-y-3">
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="New password"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
              />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
