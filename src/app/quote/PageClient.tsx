"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useBasket } from "../context/BasketContext";
import LocationSearch from "../components/LocationSearch";

function AddCustomItem() {
  const { add } = useBasket();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function reset() {
    setName(""); setNotes(""); setImage(null); setPreview(""); setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function addToBasket() {
    if (!name.trim()) { setError("Give the item a name so we know what to look for."); return; }
    setError("");
    setSaving(true);
    let heroImg = "";
    try {
      if (image) {
        const fd = new FormData();
        fd.append("image", image);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) heroImg = data.url;
      }
    } catch { /* image optional - proceed without it */ }

    add({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: "custom",
      categoryLabel: "Seen Elsewhere",
      tagline: notes.trim(),
      size: "Reference item",
      qty: 1,
      unit: "unit",
      heroImg,
      custom: true,
    });
    setSaving(false);
    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-8 w-full flex items-center justify-center gap-3 border border-dashed px-4 py-5 transition-colors hover:border-[#b8934a] group"
        style={{ borderColor: "#d4ccc0", color: "#8a7d70" }}
      >
        <svg className="w-5 h-5 transition-colors group-hover:text-[#b8934a]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="type-button text-sm transition-colors group-hover:text-[#b8934a]">Seen something elsewhere? Add it to your enquiry</span>
      </button>
    );
  }

  const inputStyle = { background: "#f5f0e8", border: "1px solid #d4ccc0", color: "#1a1714" };

  return (
    <div className="mt-8 p-5" style={{ border: "1px solid #d4ccc0", background: "#ede8df" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="type-label" style={{ letterSpacing: "0.14em", color: "#b8934a" }}>ADD AN ITEM YOU&rsquo;VE SEEN</p>
        <button onClick={() => { reset(); setOpen(false); }} className="transition-colors hover:opacity-60" style={{ color: "#8a7d70" }} aria-label="Cancel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Item name or brand*"
          className="w-full px-4 py-3 type-body outline-none transition-colors" style={inputStyle}
        />
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          rows={3} placeholder="Where you saw it, dimensions, finish - anything that helps us source it."
          className="w-full px-4 py-3 type-body outline-none transition-colors resize-none" style={{ ...inputStyle, lineHeight: 1.7 }}
        />

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0] || null)} />
        {preview ? (
          <div className="flex items-center gap-4 p-3" style={{ background: "#f5f0e8", border: "1px solid #d4ccc0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Reference" className="w-16 h-16 object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="type-body text-sm truncate" style={{ color: "#1a1714" }}>{image?.name}</p>
              <button type="button" onClick={() => { setImage(null); setPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-xs text-[#b8934a] hover:underline mt-1">Remove photo</button>
            </div>
          </div>
        ) : (
          <button
            type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-3 border border-dashed px-4 py-4 transition-colors hover:border-[#b8934a] hover:text-[#b8934a]"
            style={{ borderColor: "#d4ccc0", color: "#8a7d70" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
            </svg>
            <span className="type-button text-sm">Attach a reference photo</span>
          </button>
        )}

        {error && <p className="type-body text-sm" style={{ color: "#c0392b" }}>{error}</p>}

        <button
          onClick={addToBasket} disabled={saving}
          className="w-full type-button bg-[#b8934a] text-white px-8 py-3.5 flex items-center justify-center gap-3 hover:bg-[#a07d3c] transition-colors duration-300 disabled:opacity-60"
        >
          {saving ? "ADDING…" : <>ADD TO ENQUIRY &nbsp;<span>→</span></>}
        </button>
      </div>
    </div>
  );
}

// Quick navigation to add more items, grouped by collection and category.
const ADD_MORE_GROUPS = [
  { label: "ATELIER CLASSIC", items: [
    { name: "Windows & Doors", href: "/classic/windows-doors" },
    { name: "Custom Joinery", href: "/classic/joinery" },
    { name: "Bathroom Packages", href: "/classic/bathrooms" },
  ] },
  { label: "SIGNATURE LUXE", items: [
    { name: "Windows & Doors", href: "/signature/windows-doors" },
  ] },
];

function AddMoreItems() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="mt-8 relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-center gap-3 border px-4 py-5 transition-colors hover:border-[#b8934a] group"
        style={{ borderColor: "#d4ccc0", color: "#8a7d70" }}
      >
        <svg className="w-5 h-5 transition-colors group-hover:text-[#b8934a]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="type-button text-sm transition-colors group-hover:text-[#b8934a]">Add more items</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 z-30 shadow-lg" style={{ background: "#f5f0e8", border: "1px solid #d4ccc0" }}>
          {ADD_MORE_GROUPS.map(g => (
            <div key={g.label} className="py-2" style={{ borderBottom: "1px solid #e0d8cc" }}>
              <p className="type-label px-4 pt-1 pb-2" style={{ letterSpacing: "0.12em", color: "#b8934a", fontSize: "10px" }}>{g.label}</p>
              {g.items.map(it => (
                <a key={it.href} href={it.href} className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-[#ede8df]">
                  <span className="type-body" style={{ color: "#1a1714", fontSize: "14px" }}>{it.name}</span>
                  <span className="text-[#b8934a]">→</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type UF = { name: string; url: string };

// A review block in the Quote Summary - renders only the rows/files that have a value.
type Row = readonly [string, string | undefined | false | null] | false | null | undefined;
function ReviewBlock({ title, rows = [], files = [] }: { title: string; rows?: Row[]; files?: [string, UF[]][] }) {
  const validRows = rows.filter((r): r is readonly [string, string] => Array.isArray(r) && Boolean(r[1]));
  const validFiles = files.filter(([, f]) => f.length > 0);
  if (validRows.length === 0 && validFiles.length === 0) return null;
  return (
    <div>
      <p className="type-label mb-2" style={{ letterSpacing: "0.12em", color: "#1a1714", fontSize: "11px" }}>{title}</p>
      <div>
        {validRows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-6 py-1.5" style={{ borderBottom: "1px solid #e8e1d6" }}>
            <span className="type-label shrink-0" style={{ letterSpacing: "0.08em", color: "#8a7d70", fontSize: "10.5px", paddingTop: "1px" }}>{label}</span>
            <span className="type-body text-right" style={{ color: "#1a1714", fontSize: "13px", lineHeight: 1.4 }}>{value}</span>
          </div>
        ))}
        {validFiles.map(([label, f]) => (
          <div key={label} className="py-1.5" style={{ borderBottom: "1px solid #e8e1d6" }}>
            <span className="type-label" style={{ letterSpacing: "0.08em", color: "#8a7d70", fontSize: "10.5px" }}>{label}</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {f.map((file, i) => (
                <span key={i} className="type-body inline-flex items-center gap-1.5" style={{ fontSize: "11px", padding: "3px 8px", background: "#f5f0e8", border: "1px solid #d4ccc0", color: "#1a1714" }}>
                  <svg className="w-3 h-3" style={{ color: "#b8934a" }} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                  {file.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FIELD_STYLE = { background: "#f5f0e8", border: "1px solid #d4ccc0", color: "#1a1714" } as const;
// Selects use backgroundColor (not the `background` shorthand) so the `.select-arrow` chevron isn't reset.
const SELECT_STYLE = { backgroundColor: "#f5f0e8", border: "1px solid #d4ccc0", color: "#1a1714" } as const;
const LABEL_STYLE = { letterSpacing: "0.14em", color: "#8a7d70" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block type-label mb-2" style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

function FileField({ label, files, setFiles, accept = ".pdf,.doc,.docx,image/*" }: { label: string; files: UF[]; setFiles: (f: UF[]) => void; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function onPick(list: FileList | null) {
    if (!list || !list.length) return;
    setBusy(true);
    const uploaded: UF[] = [];
    for (const file of Array.from(list)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) uploaded.push({ name: data.name || file.name, url: data.url });
      } catch { /* skip failed file */ }
    }
    setFiles([...files, ...uploaded]);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }
  return (
    <Field label={label}>
      <input ref={ref} type="file" accept={accept} multiple className="hidden" onChange={e => onPick(e.target.files)} />
      {files.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-sm" style={FIELD_STYLE}>
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-[#b8934a] hover:underline shrink-0">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className="w-full flex items-center justify-center gap-2 border border-dashed px-4 py-3 transition-colors hover:border-[#b8934a] hover:text-[#b8934a] disabled:opacity-60"
        style={{ borderColor: "#d4ccc0", color: "#8a7d70" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
        <span className="type-button text-sm">{busy ? "Uploading…" : "Attach files"}</span>
      </button>
    </Field>
  );
}

export default function BasketPage() {
  const { items, remove, setQty, clear } = useBasket();

  const hasClassicWD = items.some(i => i.id === "classic-windows-doors-package");
  const hasSignatureWD = items.some(i => i.id === "signature-windows-doors-package");
  const hasWD = hasClassicWD || hasSignatureWD;
  const hasJoinery = items.some(i => i.id === "classic-joinery-package");
  const bathroomItems = items.filter(i => i.category === "bathrooms" || i.id.startsWith("bathrooms/"));
  const multiple = items.length > 1;

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  // Step 1 - only relevant when there is more than one package.
  const [sameProject, setSameProject] = useState<"" | "yes" | "no">("");
  // Step 2 - shared project information.
  const [proj, setProj] = useState({ address: "", projectType: "", stage: "", onSiteDate: "", onSiteTBC: false, role: "" });
  const [plans, setPlans] = useState<UF[]>([]);
  const [supportDocs, setSupportDocs] = useState<UF[]>([]);
  // Step 3 - windows & doors.
  const [wd, setWd] = useState({ system: "", frameColour: "", plansStatus: "" });
  const [wdSchedule, setWdSchedule] = useState<UF[]>([]);
  const [wdBasix, setWdBasix] = useState<UF[]>([]);
  const [wdNathers, setWdNathers] = useState<UF[]>([]);
  const [wdSpecs, setWdSpecs] = useState<UF[]>([]);
  const [wdOther, setWdOther] = useState<UF[]>([]);
  // Step 4 - custom joinery.
  const [joinery, setJoinery] = useState({ areas: "", style: "", colourFinish: "", stone: "", notes: "" });
  const [joineryDrawings, setJoineryDrawings] = useState<UF[]>([]);
  const [joineryInspo, setJoineryInspo] = useState<UF[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function fileLines(label: string, files: UF[]) {
    return files.length ? `${label}:\n${files.map(f => `  - ${f.name}: ${f.url}`).join("\n")}\n` : "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    if (multiple && !sameProject) return;
    setStatus("sending");
    const same = !multiple || sameProject === "yes";

    const L: string[] = [];
    L.push("PROJECT RELATIONSHIP");
    L.push(multiple ? (same ? "All packages are for the same project." : "Packages are for separate projects.") : "Single package enquiry.");
    L.push("");
    L.push("PROJECT INFORMATION");
    L.push(`Address / postcode: ${proj.address || "-"}`);
    L.push(`Project type: ${proj.projectType || "-"}`);
    L.push(`Project stage: ${proj.stage || "-"}`);
    L.push(`Required on site: ${proj.onSiteTBC ? "Not yet confirmed" : (proj.onSiteDate || "-")}`);
    L.push(`Customer role: ${proj.role || "-"}`);
    const plansLine = fileLines("Architectural plans", plans); if (plansLine) L.push(plansLine.trimEnd());
    const supLine = fileLines("Supporting documents", supportDocs); if (supLine) L.push(supLine.trimEnd());

    if (hasWD) {
      L.push("");
      L.push("WINDOWS & DOORS");
      L.push(`Collections in cart: ${[hasClassicWD && "Classic", hasSignatureWD && "Signature Luxe"].filter(Boolean).join(", ")}`);
      L.push(`Preferred collection/system: ${wd.system || "-"}`);
      L.push(`Frame colour: ${wd.frameColour || "-"}`);
      L.push(`Plans status: ${wd.plansStatus || "-"}`);
      [["Window schedule", wdSchedule], ["BASIX Certificate", wdBasix], ["NatHERS Certificate", wdNathers], ["Specifications", wdSpecs], ["Other documents", wdOther]].forEach(([l, f]) => { const line = fileLines(l as string, f as UF[]); if (line) L.push(line.trimEnd()); });
    }

    if (hasJoinery) {
      L.push("");
      L.push("CUSTOM JOINERY");
      L.push(`Joinery areas: ${joinery.areas || "-"}`);
      L.push(`Preferred style: ${joinery.style || "-"}`);
      L.push(`Colour & finish: ${joinery.colourFinish || "-"}`);
      L.push(`Stone preferences: ${joinery.stone || "-"}`);
      L.push(`Additional notes: ${joinery.notes || "-"}`);
      const d = fileLines("Interior drawings / elevations", joineryDrawings); if (d) L.push(d.trimEnd());
      const insp = fileLines("Inspiration images", joineryInspo); if (insp) L.push(insp.trimEnd());
    }

    if (bathroomItems.length) {
      L.push("");
      L.push("BATHROOM PACKAGES (configured on product page)");
      bathroomItems.forEach(b => L.push(`${b.name}: ${b.tagline}`));
    }

    const message = L.filter(l => l !== undefined).join("\n");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, name: form.name, email: form.email, phone: form.phone, company: form.company, message, sameProject: same }),
      });
      if (res.ok) {
        setStatus("sent");
        clear();
        // The confirmation replaces the whole page - start the visitor at its top.
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen bg-[#0d0c0b] flex flex-col">
        <SiteHeader variant="solid" />
        <div className="flex-1 flex items-center justify-center px-8 py-20" style={{ background: "#f5f0e8" }}>
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full border border-[#b8934a] flex items-center justify-center mx-auto mb-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.1 }} className="mb-4">
              Enquiry Sent
            </h1>
            <p className="type-body mb-10" style={{ lineHeight: 1.8, color: "#6b6057" }}>
              Thank you. We've received your enquiry and will be in touch shortly with availability, pricing and any further details.
            </p>
            <a href="/signature" className="type-button border px-8 py-3 inline-flex items-center gap-3 transition-all duration-300" style={{ borderColor: "#1a1714", color: "#1a1714" }}>
              Continue Browsing &nbsp;<span>→</span>
            </a>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0c0b" }}>
      <SiteHeader variant="solid" />

      {/* Light content area */}
      <div className="flex-1 flex flex-col" style={{ background: "#f5f0e8" }}>

        <div className="px-6 md:px-14 pt-14 pb-6" style={{ borderBottom: "1px solid #e0d8cc" }}>
          <p className="type-label mb-3" style={{ letterSpacing: "0.18em", color: "#b8934a" }}>Your Basket</p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 5vw, 72px)", color: "#1a1714", fontWeight: 300, lineHeight: 1.0 }}>
            Build Your Quote
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-40">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="type-body mb-8" style={{ color: "#8a7d70" }}>Your basket is empty.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mt-4">
              <a href="/classic" className="group relative overflow-hidden rounded-2xl shadow-[0_18px_44px_-18px_rgba(26,23,20,0.45)] min-h-[260px] md:min-h-[320px] flex items-center justify-center transition-transform duration-300 hover:-translate-y-1">
                <Image src="/products/Main Classic.png" alt="Atelier Classic" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
                <span className="relative z-10 text-white inline-flex items-center gap-3" style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.05, letterSpacing: "0.02em" }}><span style={{ fontSize: "0.6em" }}>←</span> Browse Classic</span>
              </a>
              <a href="/signature" className="group relative overflow-hidden rounded-2xl shadow-[0_18px_44px_-18px_rgba(26,23,20,0.45)] min-h-[260px] md:min-h-[320px] flex items-center justify-center transition-transform duration-300 hover:-translate-y-1">
                <Image src="/products/Signature Luxe.png" alt="Signature Luxe" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
                <span className="relative z-10 text-white inline-flex items-center gap-3" style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.05, letterSpacing: "0.02em" }}>Browse Signature <span style={{ fontSize: "0.6em" }}>→</span></span>
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2" style={{ borderTop: "none" }}>

            {/* Item list - sticks in view while the questionnaire scrolls */}
            <div className="md:border-r" style={{ borderColor: "#e0d8cc" }}>
             <div className="px-6 md:px-10 py-10 md:sticky md:top-20 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-8">
                <p className="type-label" style={{ letterSpacing: "0.14em", color: "#8a7d70" }}>
                  {items.length} ITEM{items.length !== 1 ? "S" : ""}
                </p>
                <button
                  onClick={clear}
                  className="type-button transition-colors hover:opacity-60"
                  style={{ letterSpacing: "0.1em", color: "#8a7d70" }}
                >
                  CLEAR ALL
                </button>
              </div>

              <div>
                {items.map((item, i) => (
                  <div key={`${item.id}|${item.size}|${i}`} className="flex items-center gap-5 py-5 group" style={{ borderBottom: "1px solid #e0d8cc" }}>
                    <div className="relative flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: "72px", height: "72px", background: "#e0d8cc" }}>
                      {item.heroImg ? (
                        <Image src={item.heroImg} alt={item.name} fill className="object-cover" />
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b8934a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="type-label mb-1" style={{ letterSpacing: "0.14em", color: "#b8934a" }}>{item.categoryLabel.toUpperCase()}</p>
                      <p className="type-body mb-1" style={{ color: "#1a1714" }}>{item.name}</p>
                      {item.custom && item.tagline ? (
                        <p className="type-body mb-3" style={{ color: "#8a7d70", lineHeight: 1.6 }}>{item.tagline}</p>
                      ) : item.category === "bathrooms" && item.tagline ? (
                        <div className="mb-3">
                          <p className="type-body mb-2" style={{ color: "#1a1714", fontSize: "13px" }}>{item.size}</p>
                          <ul className="space-y-1">
                            {item.tagline.split(" · ").map((opt, oi) => (
                              <li key={oi} className="flex items-start gap-2 type-body" style={{ color: "#8a7d70", fontSize: "12px", lineHeight: 1.5 }}>
                                <span className="shrink-0" style={{ color: "#b8934a", marginTop: "1px" }}>·</span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="type-body mb-3" style={{ color: "#8a7d70" }}>{item.size}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center" style={{ border: "1px solid #d4ccc0", background: "#f5f0e8" }}>
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.size, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[#e0d8cc]"
                            style={{ color: "#1a1714" }}
                            aria-label="Decrease quantity"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) setQty(item.id, item.size, Math.max(1, n)); }}
                            className="w-10 h-8 text-center type-body outline-none bg-transparent"
                            style={{ color: "#1a1714", MozAppearance: "textfield" as const }}
                            aria-label="Quantity"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.size, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[#e0d8cc]"
                            style={{ color: "#1a1714" }}
                            aria-label="Increase quantity"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        </div>
                        <span className="type-body" style={{ color: "#8a7d70" }}>{item.qty === 1 ? item.unit : item.unit + "s"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.id, item.size)}
                      className="flex-shrink-0 transition-colors p-1 hover:opacity-60"
                      style={{ color: "#b8a898" }}
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add more items from Classic or Signature */}
              <AddMoreItems />

              <p className="type-body mt-8" style={{ lineHeight: 1.8, color: "#a09080" }}>
                This is an enquiry basket - no payment is required at this stage. Our team will contact you with availability, lead times and pricing.
              </p>

              {/* Seen it elsewhere? - add as a custom enquiry item */}
              <AddCustomItem />
             </div>
            </div>

            {/* Adaptive project questionnaire */}
            <div className="px-6 md:px-12 py-10" style={{ background: "#ede8df" }}>
              <p className="type-label mb-2" style={{ letterSpacing: "0.14em", color: "#b8934a" }}>PROJECT ENQUIRY</p>
              <p className="type-body mb-8" style={{ color: "#8a7d70", fontSize: "13px", lineHeight: 1.6 }}>
                One coordinated enquiry for the {items.length} package{items.length === 1 ? "" : "s"} in your basket.
              </p>
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* STEP 1 - project relationship (only when multiple packages) */}
                {multiple && (
                  <section>
                    <p className="type-label mb-3" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>1 · ARE ALL PACKAGES FOR THE SAME PROJECT?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["yes", "no"] as const).map(v => (
                        <button key={v} type="button" onClick={() => setSameProject(v)}
                          className="px-4 py-3 type-button transition-colors"
                          style={sameProject === v ? { background: "#b8934a", color: "#fff", border: "1px solid #b8934a" } : { ...FIELD_STYLE, color: "#8a7d70" }}>
                          {v === "yes" ? "Yes, one project" : "No, separate projects"}
                        </button>
                      ))}
                    </div>
                    {sameProject === "no" && (
                      <p className="type-body mt-3" style={{ color: "#8a7d70", fontSize: "12.5px", lineHeight: 1.6 }}>
                        We&rsquo;ll treat these as separate projects. Share the shared contact and the details below, and note in each section which package applies - or submit a separate enquiry per project.
                      </p>
                    )}
                  </section>
                )}

                {(!multiple || sameProject) && (<>
                  {/* STEP 2 - shared project information */}
                  <section className="space-y-5 pt-6" style={{ borderTop: multiple ? "1px solid #d4ccc0" : "none" }}>
                    <p className="type-label" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>{multiple ? "2 · " : ""}PROJECT INFORMATION</p>

                    <Field label="PROJECT ADDRESS OR POSTCODE *">
                      <LocationSearch value={proj.address} onChange={v => setProj(p => ({ ...p, address: v }))}
                        className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="Start typing a suburb or postcode" />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="PROJECT TYPE *">
                        <select required value={proj.projectType} onChange={e => setProj(p => ({ ...p, projectType: e.target.value }))}
                          className="w-full px-4 py-3 type-body outline-none select-arrow" style={SELECT_STYLE}>
                          <option value="" disabled>Select…</option>
                          {["New build", "Renovation", "Extension"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                      <Field label="PROJECT STAGE *">
                        <select required value={proj.stage} onChange={e => setProj(p => ({ ...p, stage: e.target.value }))}
                          className="w-full px-4 py-3 type-body outline-none select-arrow" style={SELECT_STYLE}>
                          <option value="" disabled>Select…</option>
                          {["Concept or design", "Development Application lodged", "Approved but not started", "Under construction"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label="REQUIRED ON SITE">
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <input type="month" value={proj.onSiteDate} disabled={proj.onSiteTBC}
                          onChange={e => setProj(p => ({ ...p, onSiteDate: e.target.value }))}
                          className="px-4 py-3 type-body outline-none disabled:opacity-50" style={FIELD_STYLE} />
                        <label className="flex items-center gap-2 type-body" style={{ color: "#8a7d70" }}>
                          <input type="checkbox" checked={proj.onSiteTBC} onChange={e => setProj(p => ({ ...p, onSiteTBC: e.target.checked }))} className="accent-[#b8934a]" />
                          Not yet confirmed
                        </label>
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="FULL NAME *">
                        <input required value={form.name} onChange={e => set("name", e.target.value)} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="Jane Smith" />
                      </Field>
                      <Field label="EMAIL ADDRESS *">
                        <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="jane@studio.com" />
                      </Field>
                      <Field label="PHONE NUMBER *">
                        <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="+61 4xx xxx xxx" />
                      </Field>
                      <Field label="CUSTOMER ROLE *">
                        <select required value={proj.role} onChange={e => setProj(p => ({ ...p, role: e.target.value }))} className="w-full px-4 py-3 type-body outline-none select-arrow" style={SELECT_STYLE}>
                          <option value="" disabled>Select…</option>
                          {["Builder", "Homeowner", "Architect", "Developer", "Other"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FileField label="ARCHITECTURAL PLANS" files={plans} setFiles={setPlans} />
                      <FileField label="SUPPORTING DOCUMENTS" files={supportDocs} setFiles={setSupportDocs} />
                    </div>
                  </section>

                  {/* STEP 3 - windows & doors (conditional) */}
                  {hasWD && (
                    <section className="space-y-5 pt-6" style={{ borderTop: "1px solid #d4ccc0" }}>
                      <p className="type-label" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>WINDOWS &amp; DOORS</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="PREFERRED COLLECTION / SYSTEM">
                          <select value={wd.system} onChange={e => setWd(w => ({ ...w, system: e.target.value }))} className="w-full px-4 py-3 type-body outline-none select-arrow" style={SELECT_STYLE}>
                            <option value="">Select…</option>
                            {[
                              ...(hasClassicWD ? ["ASG Series 102 (Classic)", "ASG Series 86 (Classic)", "ASG Series 75 (Classic)", "ASG Series 101 (Classic)"] : []),
                              ...(hasSignatureWD ? ["Performance Series 102 (Signature Luxe)", "Panoramic Series 39 (Signature Luxe)"] : []),
                              "Not sure - please advise",
                            ].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </Field>
                        <Field label="FRAME COLOUR">
                          <select value={wd.frameColour} onChange={e => setWd(w => ({ ...w, frameColour: e.target.value }))} className="w-full px-4 py-3 type-body outline-none select-arrow" style={SELECT_STYLE}>
                            <option value="">Select…</option>
                            {["Matt Black", "Monument", "Pure White", "Custom / to be confirmed"].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="PLANS STATUS">
                        <div className="flex flex-col gap-2">
                          {["I have plans (attached above)", "Plans are being prepared", "No plans are currently available"].map(o => (
                            <label key={o} className="flex items-center gap-2 type-body" style={{ color: "#1a1714" }}>
                              <input type="radio" name="wdPlans" checked={wd.plansStatus === o} onChange={() => setWd(w => ({ ...w, plansStatus: o }))} className="accent-[#b8934a]" />
                              {o}
                            </label>
                          ))}
                        </div>
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileField label="WINDOW SCHEDULE (IF AVAILABLE)" files={wdSchedule} setFiles={setWdSchedule} />
                        <FileField label="BASIX CERTIFICATE" files={wdBasix} setFiles={setWdBasix} />
                        <FileField label="NATHERS CERTIFICATE" files={wdNathers} setFiles={setWdNathers} />
                        <FileField label="RELEVANT SPECIFICATIONS" files={wdSpecs} setFiles={setWdSpecs} />
                        <FileField label="OTHER SUPPORTING DOCUMENTS" files={wdOther} setFiles={setWdOther} />
                      </div>
                    </section>
                  )}

                  {/* STEP 4 - custom joinery (conditional) */}
                  {hasJoinery && (
                    <section className="space-y-5 pt-6" style={{ borderTop: "1px solid #d4ccc0" }}>
                      <p className="type-label" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>CUSTOM JOINERY</p>
                      <Field label="JOINERY AREAS REQUIRED">
                        <input value={joinery.areas} onChange={e => setJoinery(j => ({ ...j, areas: e.target.value }))} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="e.g. Kitchen, butler's pantry, wardrobes" />
                      </Field>
                      <Field label="PREFERRED JOINERY STYLE">
                        <input value={joinery.style} onChange={e => setJoinery(j => ({ ...j, style: e.target.value }))} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="e.g. Handleless, shaker, fluted" />
                      </Field>
                      <Field label="COLOUR & FINISH PREFERENCES">
                        <input value={joinery.colourFinish} onChange={e => setJoinery(j => ({ ...j, colourFinish: e.target.value }))} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="e.g. Natural oak, matte white" />
                      </Field>
                      <Field label="STONE PREFERENCES">
                        <input value={joinery.stone} onChange={e => setJoinery(j => ({ ...j, stone: e.target.value }))} className="w-full px-4 py-3 type-body outline-none" style={FIELD_STYLE} placeholder="e.g. Calacatta, travertine" />
                      </Field>
                      <FileField label="INTERIOR DRAWINGS OR ELEVATIONS" files={joineryDrawings} setFiles={setJoineryDrawings} />
                      <FileField label="INSPIRATION IMAGES" files={joineryInspo} setFiles={setJoineryInspo} accept="image/*" />
                      <Field label="ADDITIONAL NOTES">
                        <textarea rows={3} value={joinery.notes} onChange={e => setJoinery(j => ({ ...j, notes: e.target.value }))} className="w-full px-4 py-3 type-body outline-none resize-none" style={{ ...FIELD_STYLE, lineHeight: 1.7 }} placeholder="Anything else that helps us understand the joinery." />
                      </Field>
                    </section>
                  )}

                  {/* STEP 5 - bathroom packages (already configured) */}
                  {bathroomItems.length > 0 && (
                    <section className="pt-6" style={{ borderTop: "1px solid #d4ccc0" }}>
                      <p className="type-label mb-3" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>BATHROOM PACKAGES</p>
                      <p className="type-body mb-3" style={{ color: "#8a7d70", fontSize: "13px", lineHeight: 1.6 }}>
                        Your bathroom selections were captured on the product page - no further configuration needed here.
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {bathroomItems.map((b, i) => (
                          <li key={i} className="px-3 py-2 text-sm" style={FIELD_STYLE}>
                            <span style={{ color: "#1a1714" }}>{b.name}</span>
                            <span style={{ color: "#8a7d70" }}> - {b.tagline}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Quote summary */}
                  <section className="pt-6" style={{ borderTop: "1px solid #d4ccc0" }}>
                    <p className="type-label mb-4" style={{ letterSpacing: "0.12em", color: "#1a1714" }}>QUOTE SUMMARY</p>
                    <ul className="mb-4" style={{ border: "1px solid #d4ccc0" }}>
                      {items.map((item, i) => (
                        <li key={i} className="flex items-center justify-between gap-4 px-4 py-3" style={{ borderBottom: "1px solid #e0d8cc" }}>
                          <div className="min-w-0">
                            <p className="type-label mb-0.5" style={{ letterSpacing: "0.12em", color: "#b8934a", fontSize: "10px" }}>{item.categoryLabel.toUpperCase()}</p>
                            <p className="type-body truncate" style={{ color: "#1a1714", fontSize: "14px" }}>{item.name}</p>
                          </div>
                          <span className="type-body shrink-0" style={{ color: "#8a7d70", fontSize: "13px" }}>{item.qty} {item.qty === 1 ? item.unit : item.unit + "s"}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pb-6" style={{ borderBottom: "1px solid #d4ccc0" }}>
                      <span className="type-label" style={{ letterSpacing: "0.12em", color: "#8a7d70" }}>TOTAL ITEMS</span>
                      <span className="type-body" style={{ color: "#1a1714" }}>{items.reduce((n, it) => n + it.qty, 0)} across {items.length} {items.length === 1 ? "package" : "packages"}</span>
                    </div>

                    {/* Review of everything entered above */}
                    <div className="mt-6 space-y-5">
                      <ReviewBlock title="CONTACT" rows={[["Name", form.name], ["Email", form.email], ["Phone", form.phone], ["Company", form.company], ["Role", proj.role]]} />
                      <ReviewBlock
                        title="PROJECT"
                        rows={[
                          multiple && ["Relationship", sameProject === "yes" ? "Same project" : sameProject === "no" ? "Separate projects" : ""],
                          ["Address / postcode", proj.address],
                          ["Project type", proj.projectType],
                          ["Project stage", proj.stage],
                          ["Required on site", proj.onSiteTBC ? "Not yet confirmed" : proj.onSiteDate],
                        ]}
                        files={[["Architectural plans", plans], ["Supporting documents", supportDocs]]}
                      />
                      {hasWD && (
                        <ReviewBlock
                          title="WINDOWS & DOORS"
                          rows={[["Preferred system", wd.system], ["Frame colour", wd.frameColour], ["Plans status", wd.plansStatus]]}
                          files={[["Window schedule", wdSchedule], ["BASIX certificate", wdBasix], ["NatHERS certificate", wdNathers], ["Specifications", wdSpecs], ["Other documents", wdOther]]}
                        />
                      )}
                      {hasJoinery && (
                        <ReviewBlock
                          title="CUSTOM JOINERY"
                          rows={[["Areas", joinery.areas], ["Style", joinery.style], ["Colour & finish", joinery.colourFinish], ["Stone", joinery.stone], ["Notes", joinery.notes]]}
                          files={[["Interior drawings", joineryDrawings], ["Inspiration images", joineryInspo]]}
                        />
                      )}
                    </div>
                  </section>

                  {status === "error" && (
                    <p className="type-body" style={{ color: "#c0392b" }}>Something went wrong. Please try again or email info@ateliersupplygroup.com.au.</p>
                  )}

                  <button type="submit" disabled={status === "sending"}
                    className="w-full type-button bg-[#b8934a] text-white px-8 py-4 flex items-center justify-between hover:bg-[#a07d3c] transition-colors duration-300 disabled:opacity-60">
                    <span>{status === "sending" ? "SENDING…" : "SEND PROJECT ENQUIRY"}</span>
                    <span>→</span>
                  </button>
                  <p className="type-body" style={{ lineHeight: 1.7, color: "#a09080" }}>
                    By submitting you agree to be contacted by our team. No payment is required.
                  </p>
                </>)}
              </form>
            </div>

          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
