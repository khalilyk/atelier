"use client";
import { useEffect, useState } from "react";

type Company = {
  name: string; abn: string; acn: string; email: string; phone: string;
  website: string; instagram: string; location: string;
  bankName: string; bankAccountName: string; bankBsb: string; bankAccount: string;
};

const GROUPS: { title: string; note?: string; fields: { key: keyof Company; label: string; placeholder?: string }[] }[] = [
  { title: "Legal", fields: [
    { key: "name", label: "Company name" },
    { key: "abn", label: "ABN" },
    { key: "acn", label: "ACN" },
  ] },
  { title: "Contact", note: "Shown in the website footer and on every quote.", fields: [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "website", label: "Website" },
    { key: "instagram", label: "Instagram" },
    { key: "location", label: "Location line", placeholder: "e.g. Sydney based · Delivering Australia Wide" },
  ] },
  { title: "Bank details", note: "Shown in the Payment details section of printed / PDF quotes.", fields: [
    { key: "bankName", label: "Bank" },
    { key: "bankAccountName", label: "Account name" },
    { key: "bankBsb", label: "BSB" },
    { key: "bankAccount", label: "Account number" },
  ] },
];

export default function CompanyAdmin() {
  const [form, setForm] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/company").then((r) => r.json()).then(setForm).catch(() => {});
  }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    await fetch("/api/admin/company", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!form) return <div className="p-8 text-stone-400 text-sm">Loading company details…</div>;

  const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-stone-900 font-semibold text-xl">Company Details</h1>
          <p className="text-stone-900 text-sm mt-1">One source of truth for your legal, contact and bank details. These flow through to the website footer and every quote.</p>
        </div>
        <button onClick={save} disabled={saving} className="shrink-0 bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-40">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-1">{g.title}</h2>
            {g.note && <p className="text-stone-400 text-xs mb-4">{g.note}</p>}
            {!g.note && <div className="mb-4" />}
            <div className="bg-white rounded-2xl border border-stone-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {g.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                  <input className={FIELD} value={form[f.key]} placeholder={f.placeholder} onChange={(e) => setForm((v) => (v ? { ...v, [f.key]: e.target.value } : v))} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
