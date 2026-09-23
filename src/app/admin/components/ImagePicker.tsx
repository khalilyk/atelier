"use client";
import { useEffect, useRef, useState } from "react";

type MediaFile = { name: string; url: string; size: number; modifiedAt: string };

export default function ImagePicker({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/media").then((r) => r.json()).then((d) => setMedia(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, [open]);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) { onChange(data.url); setOpen(false); }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-stone-300 text-xl">◫</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-[#b8934a]/60" />
        </div>
        <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-xs border border-stone-200 rounded-xl px-3 py-2 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a] transition-colors">Choose</button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Choose an image</h3>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#a07e3c] disabled:opacity-50">
                  {uploading ? "Uploading…" : "Upload new"}
                </button>
                <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700 text-xl leading-none">✕</button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            <div className="p-5 overflow-y-auto">
              {loading ? (
                <p className="text-stone-400 text-sm text-center py-10">Loading media…</p>
              ) : media.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-10">No media yet. Upload an image to get started.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {media.map((m) => (
                    <button key={m.url} type="button" onClick={() => { onChange(m.url); setOpen(false); }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${value === m.url ? "border-[#b8934a]" : "border-transparent hover:border-stone-300"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
