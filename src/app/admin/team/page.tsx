"use client";
import { useCallback, useEffect, useState } from "react";
import { ROLES, ROLE_KEYS, roleLabel, isOwner } from "@/lib/roles";

type Profile = { id: string; name: string; role: string; bio: string; email: string; phone?: string; image?: string; order: number };
type Account = { id: string; name: string; email: string; role: string; createdAt: string };

/**
 * One person, one entry. A profile is how someone appears on the website; an
 * account is whether they can sign in here. They used to be separate sections,
 * so adding a colleague meant filling in the same name and email twice with
 * nothing connecting the two. They are matched on email now.
 */
type Person = { email: string; profile?: Profile; account?: Account };

const BLANK = {
  name: "", jobTitle: "", email: "", phone: "", bio: "", order: 99,
  onSite: true, canSignIn: false, role: "editor", password: "",
};

export default function TeamPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const owner = isOwner(me?.role);

  const load = useCallback(async () => {
    const [p, a] = await Promise.all([
      fetch("/api/admin/team").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/admins").then((r) => r.json()).catch(() => []),
    ]);
    setProfiles(Array.isArray(p) ? p : []);
    setAccounts(Array.isArray(a) ? a : []);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/admin/auth").then((r) => r.json()).then(setMe).catch(() => setMe(null));
  }, [load]);

  // The two lists joined on email, so one colleague is one row.
  const key = (e: string) => (e || "").trim().toLowerCase();
  const people: Person[] = [];
  const byEmail = new Map<string, Person>();
  for (const p of profiles) {
    const k = key(p.email);
    const entry: Person = { email: p.email, profile: p };
    byEmail.set(k, entry);
    people.push(entry);
  }
  for (const a of accounts) {
    const k = key(a.email);
    const found = byEmail.get(k);
    if (found) found.account = a;
    else {
      const entry: Person = { email: a.email, account: a };
      byEmail.set(k, entry);
      people.push(entry);
    }
  }
  people.sort((x, y) => (x.profile?.order ?? 99) - (y.profile?.order ?? 99) || (x.profile?.name ?? x.account?.name ?? "").localeCompare(y.profile?.name ?? y.account?.name ?? ""));

  function open(person: Person | null) {
    setError("");
    if (!person) { setEditing({ email: "" }); setForm({ ...BLANK }); return; }
    setEditing(person);
    setForm({
      name: person.profile?.name ?? person.account?.name ?? "",
      jobTitle: person.profile?.role ?? "",
      email: person.email,
      phone: person.profile?.phone ?? "",
      bio: person.profile?.bio ?? "",
      order: person.profile?.order ?? 99,
      onSite: !!person.profile,
      canSignIn: !!person.account,
      role: person.account?.role ?? "editor",
      password: "",
    });
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) { setError("A name and email are needed."); return; }
    if (form.canSignIn && !editing?.account && !form.password) { setError("Set a password so they can sign in."); return; }
    setSaving(true);
    setError("");
    const json = (body: unknown) => ({ method: "", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    try {
      // The website profile.
      const prof = { name: form.name, role: form.jobTitle, bio: form.bio, email: form.email, phone: form.phone, order: Number(form.order) };
      if (form.onSite && editing?.profile) {
        await fetch("/api/admin/team", { ...json({ id: editing.profile.id, ...prof }), method: "PATCH" });
      } else if (form.onSite) {
        await fetch("/api/admin/team", { ...json(prof), method: "POST" });
      } else if (editing?.profile) {
        await fetch("/api/admin/team", { ...json({ id: editing.profile.id }), method: "DELETE" });
      }

      // The admin account. Only an owner may create, remove or re-role one;
      // the API enforces the same thing.
      if (owner) {
        const acct: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
        if (form.password) acct.password = form.password;
        if (form.canSignIn && editing?.account) {
          const res = await fetch("/api/admin/admins", { ...json({ id: editing.account.id, ...acct }), method: "PATCH" });
          if (!res.ok) throw new Error((await res.json()).error || "Could not update the account");
        } else if (form.canSignIn) {
          const res = await fetch("/api/admin/admins", { ...json(acct), method: "POST" });
          if (!res.ok) throw new Error((await res.json()).error || "Could not create the account");
        } else if (editing?.account) {
          const res = await fetch("/api/admin/admins", { ...json({ id: editing.account.id }), method: "DELETE" });
          if (!res.ok) throw new Error((await res.json()).error || "Could not remove the account");
        }
      }

      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function removePerson(person: Person) {
    const what = person.profile && person.account ? "profile and admin account" : person.account ? "admin account" : "profile";
    if (!confirm(`Remove ${person.profile?.name ?? person.account?.name}'s ${what}?`)) return;
    if (person.profile) await fetch("/api/admin/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: person.profile.id }) });
    if (person.account && owner) {
      const res = await fetch("/api/admin/admins", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: person.account.id }) });
      if (!res.ok) alert((await res.json()).error || "Could not remove the account");
    }
    await load();
  }

  const field = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/50";
  const lbl = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-stone-900 font-medium text-xl">Team &amp; Accounts</h1>
          <p className="text-stone-500 text-sm mt-1">{people.length} {people.length === 1 ? "person" : "people"}</p>
        </div>
        <button onClick={() => open(null)} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-[#a07e3c] transition-colors">
          Add person
        </button>
      </div>
      <p className="text-stone-500 text-sm mb-8 max-w-xl leading-relaxed">
        A profile is how someone appears on the website. An account is whether they can sign in here.
        The same person can have either, or both.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {people.map((p) => {
          const name = p.profile?.name ?? p.account?.name ?? p.email;
          return (
            <div key={p.email || name} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-stone-500 text-lg font-light">
                {name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900">{name}</p>
                {p.profile?.role && <p className="text-stone-500 text-sm">{p.profile.role}</p>}
                <p className="text-stone-400 text-xs mt-0.5 truncate">{p.email}</p>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                {p.profile && <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">On the website</span>}
                {p.account && (
                  <span className={`text-[11px] px-2.5 py-1 rounded-full ${isOwner(p.account.role) ? "bg-[#b8934a]/10 text-[#b8934a]" : "bg-stone-100 text-stone-500"}`}>
                    {roleLabel(p.account.role)}
                  </span>
                )}
              </div>
              <div className="flex gap-3 shrink-0 items-center">
                {p.profile && <a href={`/api/vcard/${p.profile.id}`} className="text-xs text-stone-500 hover:text-[#b8934a]" title="Download this person's contact card (.vcf)">vCard ↓</a>}
                <button onClick={() => open(p)} className="text-xs text-[#b8934a] hover:underline">Edit</button>
                <button onClick={() => removePerson(p)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-medium text-stone-900">{editing.profile || editing.account ? "Edit person" : "Add person"}</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={lbl}>Full name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={field} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={field} />
                <p className="text-xs text-stone-400 mt-1.5">Links the website profile and the sign-in account.</p>
              </div>

              {/* Website profile */}
              <div className="border-t border-stone-100 pt-5">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input type="checkbox" checked={form.onSite} onChange={(e) => setForm((p) => ({ ...p, onSite: e.target.checked }))} className="w-4 h-4 accent-[#b8934a]" />
                  <span className="text-sm text-stone-800">Show on the website</span>
                </label>
                {form.onSite && (
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className={lbl}>Job title</label>
                      <input value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} className={field} placeholder="Director, Project Manager…" />
                    </div>
                    <div>
                      <label className={lbl}>Phone (for vCard)</label>
                      <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={field} />
                    </div>
                    <div>
                      <label className={lbl}>Bio</label>
                      <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} className={`${field} resize-none`} />
                    </div>
                    <div>
                      <label className={lbl}>Display order</label>
                      <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} className={field} />
                    </div>
                  </div>
                )}
              </div>

              {/* Admin access */}
              <div className="border-t border-stone-100 pt-5">
                <label className={`flex items-center gap-3 mb-4 ${owner ? "cursor-pointer" : "opacity-60"}`}>
                  <input type="checkbox" disabled={!owner} checked={form.canSignIn} onChange={(e) => setForm((p) => ({ ...p, canSignIn: e.target.checked }))} className="w-4 h-4 accent-[#b8934a]" />
                  <span className="text-sm text-stone-800">Can sign in to the admin</span>
                </label>
                {!owner && <p className="text-xs text-stone-400 pl-7 -mt-2">Only an owner can grant or change access.</p>}
                {owner && form.canSignIn && (
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className={lbl}>Role</label>
                      <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={field}>
                        {ROLE_KEYS.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                      </select>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{ROLES[form.role as keyof typeof ROLES]?.blurb}</p>
                    </div>
                    <div>
                      <label className={lbl}>
                        Password {editing.account && <span className="text-stone-300 normal-case tracking-normal">(leave blank to keep the current one)</span>}
                      </label>
                      <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={field} autoComplete="new-password" />
                    </div>
                  </div>
                )}
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
