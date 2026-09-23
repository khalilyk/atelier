"use client";
import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";

type VCard = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
  linkedin: string;
  createdAt: string;
};

const EMPTY: Omit<VCard, "id" | "createdAt"> = {
  name: "", title: "", company: "", email: "",
  phone: "", mobile: "", website: "", address: "", linkedin: "",
};

const FIELDS: { label: string; key: keyof typeof EMPTY; type?: string; placeholder?: string }[] = [
  { label: "Full Name", key: "name", placeholder: "Jane Smith" },
  { label: "Job Title", key: "title", placeholder: "Interior Designer" },
  { label: "Company", key: "company", placeholder: "Atelier Supply Group" },
  { label: "Email", key: "email", type: "email", placeholder: "jane@atelier.com" },
  { label: "Work Phone", key: "phone", type: "tel", placeholder: "+61 2 0000 0000" },
  { label: "Mobile", key: "mobile", type: "tel", placeholder: "+61 4xx xxx xxx" },
  { label: "Website", key: "website", placeholder: "https://ateliersupplygroup.com" },
  { label: "Address", key: "address", placeholder: "123 Collins St, Melbourne VIC 3000" },
  { label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/..." },
];

function getVcfUrl(id: string) {
  return `${window.location.origin}/api/vcard/${id}`;
}

export default function VCardAdmin() {
  const [list, setList] = useState<VCard[]>([]);
  const [editing, setEditing] = useState<VCard | null>(null);
  const [form, setForm] = useState<Omit<VCard, "id" | "createdAt">>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function load() {
    fetch("/api/admin/vcards").then(r => r.json()).then(setList);
  }

  useEffect(() => { load(); }, []);

  const generateQR = useCallback(async (id: string) => {
    const url = getVcfUrl(id);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: { dark: "#0a0908", light: "#ffffff" },
    });
    setQrDataUrl(dataUrl);
  }, []);

  function openNew() {
    setEditing({ id: "", createdAt: "", ...EMPTY });
    setForm(EMPTY);
    setIsNew(true);
    setQrDataUrl(null);
  }

  function openEdit(v: VCard) {
    setEditing(v);
    setForm({ name: v.name, title: v.title, company: v.company, email: v.email, phone: v.phone, mobile: v.mobile, website: v.website, address: v.address, linkedin: v.linkedin });
    setIsNew(false);
    generateQR(v.id);
  }

  async function save() {
    setSaving(true);
    if (isNew) {
      const res = await fetch("/api/admin/vcards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      setSaving(false);
      setEditing(null);
      load();
      // Re-open to show QR
      setTimeout(() => openEdit(created), 200);
    } else if (editing) {
      await fetch("/api/admin/vcards", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form }) });
      setSaving(false);
      load();
      generateQR(editing.id);
    }
  }

  async function deleteCard(id: string) {
    if (!confirm("Delete this vCard?")) return;
    await fetch("/api/admin/vcards", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (editing?.id === id) setEditing(null);
    load();
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(getVcfUrl(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    if (!qrDataUrl || !editing) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${editing.name || "vcard"}-qr.png`;
    a.click();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-stone-100 shrink-0">
          <div>
            <h1 className="text-stone-900 font-medium text-lg">vCard Creator</h1>
            <p className="text-stone-400 text-xs mt-0.5">Create digital business cards with a scannable QR code.</p>
          </div>
          <button onClick={openNew} className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors">
            New Card
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl mb-4">◻</div>
              <p className="font-medium text-stone-500 mb-1">No vCards yet</p>
              <p className="text-sm">Create your first digital business card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.map(v => (
                <div
                  key={v.id}
                  onClick={() => openEdit(v)}
                  className="bg-white border border-stone-100 rounded-2xl p-5 cursor-pointer hover:border-[#b8934a]/30 hover:shadow-sm transition-all"
                  style={{ borderColor: editing?.id === v.id ? "#b8934a" : undefined }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#b8934a]/10 text-[#b8934a] flex items-center justify-center text-lg font-light shrink-0">
                      {v.name.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-sm truncate">{v.name || "Untitled"}</p>
                      <p className="text-stone-400 text-xs truncate">{v.title}{v.title && v.company ? " · " : ""}{v.company}</p>
                      {v.email && <p className="text-stone-400 text-xs truncate mt-0.5">{v.email}</p>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteCard(v.id); }}
                      className="text-stone-300 hover:text-red-400 transition-colors shrink-0 text-sm"
                    >✕</button>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-stone-50">
                    <button
                      onClick={e => { e.stopPropagation(); copyLink(v.id); }}
                      className="flex-1 text-xs text-stone-500 hover:text-[#b8934a] transition-colors py-1.5 rounded-lg bg-stone-50 hover:bg-[#b8934a]/5"
                    >
                      {copied ? "Copied ✓" : "Copy Link"}
                    </button>
                    <a
                      href={`/api/vcard/${v.id}`}
                      download
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-center text-xs text-stone-500 hover:text-[#b8934a] transition-colors py-1.5 rounded-lg bg-stone-50 hover:bg-[#b8934a]/5"
                    >
                      Download .vcf
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {editing && (
        <aside className="w-96 shrink-0 bg-white border-l border-stone-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
            <p className="font-medium text-stone-900 text-sm">{isNew ? "New vCard" : "Edit vCard"}</p>
            <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* QR Code */}
            {!isNew && qrDataUrl && (
              <div className="p-5 border-b border-stone-50 flex flex-col items-center gap-3">
                <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 rounded-xl" />
                <p className="text-xs text-stone-400 text-center">Scan to download contact</p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => copyLink(editing.id)}
                    className="flex-1 text-xs py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                  >
                    {copied ? "Copied ✓" : "Copy Link"}
                  </button>
                  <button
                    onClick={downloadQR}
                    className="flex-1 text-xs py-2 rounded-lg bg-[#b8934a]/10 hover:bg-[#b8934a]/20 text-[#b8934a] transition-colors"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-5 space-y-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 transition-colors placeholder:text-stone-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-stone-100 shrink-0">
            <button
              onClick={save}
              disabled={saving || !form.name}
              className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create & Generate QR" : "Save Changes"}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
