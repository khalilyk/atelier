"use client";
import { useEffect, useRef, useState } from "react";

type MediaFile = { name: string; url: string; size: number; modifiedAt: string };

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  title?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPicker({ onSelect, onClose, title = "Select Image" }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/admin/media").then(r => r.json()).then(setFiles);
  }

  useEffect(() => { load(); }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files;
    if (!f?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(f).forEach(file => fd.append("file", file));
    await fetch("/api/admin/media", { method: "POST", body: fd });
    setUploading(false);
    load();
    if (fileRef.current) fileRef.current.value = "";
  }

  async function deleteFile(name: string) {
    if (!confirm("Delete this file?")) return;
    setDeleting(name);
    await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setDeleting(null);
    if (selected?.name === name) setSelected(null);
    load();
  }

  const filtered = query
    ? files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : files;

  const isImage = (url: string) => /\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(url);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-semibold text-stone-900">{title}</h2>
            <p className="text-stone-400 text-xs mt-0.5">{files.length} files in library</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search files…"
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#b8934a]/60 w-48"
            />
            <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0">
              {uploading ? "Uploading…" : "Upload"}
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={upload} />
            </label>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-lg shrink-0">✕</button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Files grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-stone-400">
                <p className="text-lg mb-1">No files yet</p>
                <p className="text-sm">Upload images to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filtered.map(file => (
                  <div
                    key={file.name}
                    onClick={() => setSelected(file)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                    style={{ borderColor: selected?.name === file.name ? "#b8934a" : "transparent", background: "#f5f5f4" }}
                  >
                    {isImage(file.url) ? (
                      <img src={file.url} alt={file.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-3xl text-stone-300">
                        {file.name.endsWith(".pdf") ? "📄" : file.name.endsWith(".mp4") ? "🎬" : "📁"}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {/* Selected check */}
                    {selected?.name === file.name && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#b8934a] flex items-center justify-center text-white text-xs font-bold">✓</div>
                    )}
                    {/* Delete on hover */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteFile(file.name); }}
                      disabled={deleting === file.name}
                      className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      {deleting === file.name ? "…" : "✕"}
                    </button>
                    <div className="p-2">
                      <p className="text-xs text-stone-600 truncate">{file.name.replace(/^\d+-/, "")}</p>
                      <p className="text-xs text-stone-400">{formatSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <aside className="w-56 shrink-0 border-l border-stone-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-stone-50">
                {isImage(selected.url) ? (
                  <img src={selected.url} alt={selected.name} className="w-full rounded-xl aspect-video object-cover" />
                ) : (
                  <div className="w-full rounded-xl aspect-video bg-stone-100 flex items-center justify-center text-4xl">📄</div>
                )}
              </div>
              <div className="p-4 flex-1 space-y-3 overflow-y-auto">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Filename</p>
                  <p className="text-xs text-stone-700 break-all">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Size</p>
                  <p className="text-xs text-stone-700">{formatSize(selected.size)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">URL</p>
                  <p className="text-xs text-stone-500 break-all font-mono">{selected.url}</p>
                </div>
              </div>
              <div className="p-4 border-t border-stone-100 space-y-2 shrink-0">
                <button
                  onClick={() => { onSelect(selected.url); onClose(); }}
                  className="w-full bg-[#b8934a] text-white text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-[#a07e3c] transition-colors"
                >
                  Use This Image
                </button>
                <button
                  onClick={() => deleteFile(selected.name)}
                  className="w-full border border-red-200 text-red-400 hover:bg-red-50 text-xs uppercase tracking-widest py-2.5 rounded-xl transition-colors"
                >
                  Delete File
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
