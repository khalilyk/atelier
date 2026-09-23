"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SlotsPanel from "./SlotsPanel";

type MediaFile = { name: string; url: string; size: number; modifiedAt: string; source?: "upload" | "site"; usedBy?: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

type Tab = "files" | "slots";

export default function MediaAdmin() {
  // /admin/media?tab=slots lands straight on the picture slots.
  const [tab, setTab] = useState<Tab>(() => {
    try { return new URLSearchParams(window.location.search).get("tab") === "slots" ? "slots" : "files"; }
    catch { return "files"; }
  });
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "upload" | "site">("all");
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // "with=site" also returns the pictures the site's own files provide.
  function load() {
    fetch("/api/admin/media?with=site").then(r => r.json()).then(setFiles);
  }

  const isUpload = (f: MediaFile) => f.source !== "site";

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(uploadFiles).forEach(f => fd.append("file", f));
    await fetch("/api/admin/media", { method: "POST", body: fd });
    setUploading(false);
    load();
  }

  async function handleDelete(name: string) {
    if (!confirm("Delete this file?")) return;
    await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (selected?.name === name) setSelected(null);
    setPicked((p) => p.filter((n) => n !== name));
    load();
  }

  /** Only uploaded files can be removed; the site's own pictures are part of the build. */
  async function deletePicked() {
    const names = picked.filter((n) => files.some((f) => f.name === n && isUpload(f)));
    if (!names.length) return;
    if (!confirm(`Delete ${names.length} file${names.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch("/api/admin/media", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: names }),
      });
      setPicked([]); setSelected(null); load();
    } finally { setDeleting(false); }
  }

  const toggle = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));

  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isImage = (f: MediaFile) => /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i.test(f.name);
  const uploadCount = files.filter(isUpload).length;
  const siteCount = files.length - uploadCount;
  const shown = files.filter((f) => (filter === "all" ? true : filter === "upload" ? isUpload(f) : !isUpload(f)));
  const allPickable = files.filter(isUpload).map((f) => f.name);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-stone-900 font-medium">Media Library</h1>
              <p className="text-stone-400 text-xs">{files.length} file{files.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
              {([["files", "Files"], ["slots", "Picture slots"]] as [Tab, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${tab === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-3 ${tab === "files" ? "" : "hidden"}`}>
            <button onClick={() => setView(v => v === "grid" ? "list" : "grid")} className="text-stone-400 hover:text-stone-600 text-sm border border-stone-200 rounded-lg px-3 py-2 transition-colors">
              {view === "grid" ? "⊟ List" : "⊞ Grid"}
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-5 py-2 rounded-lg hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload Files"}
            </button>
            <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {tab === "slots" ? (
          <div className="flex-1 overflow-y-auto"><SlotsPanel /></div>
        ) : (
        <>
        {/* What to show, and what to do with a selection */}
        <div className="flex items-center gap-3 flex-wrap px-6 pt-4 shrink-0">
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            {([["all", `All (${files.length})`], ["upload", `Uploaded (${uploadCount})`], ["site", `In the site (${siteCount})`]] as [typeof filter, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors ${filter === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>
                {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-500">
            <input type="checkbox" checked={allPickable.length > 0 && picked.length === allPickable.length}
              onChange={(e) => setPicked(e.target.checked ? allPickable : [])} />
            Select all uploaded
          </label>

          {picked.length > 0 && (
            <>
              <span className="text-xs text-stone-500">{picked.length} selected</span>
              <button onClick={deletePicked} disabled={deleting}
                className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete selected"}
              </button>
              <button onClick={() => setPicked([])} className="text-xs text-stone-400 hover:text-stone-700">Clear</button>
            </>
          )}
        </div>

        {/* Drop zone hint */}
        <div
          className="mx-6 mt-4 border-2 border-dashed border-stone-200 rounded-2xl py-6 text-center text-stone-400 text-sm cursor-pointer hover:border-[#b8934a]/40 hover:text-[#b8934a] transition-colors shrink-0"
          onClick={() => inputRef.current?.click()}
        >
          Click or drag files here to upload
        </div>

        {/* Grid / List */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {shown.map(f => (
                <div
                  key={f.url}
                  onClick={() => setSelected(f)}
                  className="group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                  style={{ borderColor: selected?.name === f.name ? "#b8934a" : "transparent", background: "#f8f7f5" }}
                >
                  <div className="aspect-square relative">
                    {isImage(f) ? (
                      <Image src={f.url} alt={f.name} fill className="object-cover" sizes="160px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-stone-400">
                        {/\.mp4$/i.test(f.name) ? "▶" : "📄"}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <p className="text-white text-xs px-2 pb-2 truncate w-full">{f.name}</p>
                  </div>
                  {isUpload(f) ? (
                    <input
                      type="checkbox"
                      checked={picked.includes(f.name)}
                      onChange={() => toggle(f.name)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${f.name}`}
                      className="absolute top-2 left-2 z-10 w-4 h-4 accent-[#b8934a]"
                    />
                  ) : (
                    <span className="absolute top-2 left-2 z-10 text-[8.5px] uppercase tracking-widest bg-white/85 text-stone-500 px-1.5 py-0.5 rounded" title={f.usedBy}>In the site</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">File</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Size</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium text-xs uppercase tracking-wider">Modified</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {shown.map(f => (
                    <tr key={f.url} className="hover:bg-stone-50/50 cursor-pointer" onClick={() => setSelected(f)}>
                      <td className="px-4 py-3 flex items-center gap-3">
                        {isUpload(f) ? (
                          <input type="checkbox" checked={picked.includes(f.name)} onChange={() => toggle(f.name)}
                            onClick={(e) => e.stopPropagation()} aria-label={`Select ${f.name}`} className="w-4 h-4 accent-[#b8934a] shrink-0" />
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        {isImage(f) ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-stone-100 shrink-0">
                            <Image src={f.url} alt={f.name} fill className="object-cover" sizes="40px" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">📄</div>
                        )}
                        <span className="text-stone-700 truncate max-w-xs">{f.name}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-400">{isUpload(f) ? formatSize(f.size) : f.usedBy}</td>
                      <td className="px-4 py-3 text-stone-400">{isUpload(f) ? new Date(f.modifiedAt).toLocaleDateString("en-AU") : "In the site files"}</td>
                      <td className="px-4 py-3 text-right">
                        {isUpload(f) && (
                          <button onClick={e => { e.stopPropagation(); handleDelete(f.name); }} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* Detail panel */}
      {tab === "files" && selected && (
        <aside className="w-64 shrink-0 bg-white border-l border-stone-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-700">File Details</p>
            <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isImage(selected) && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-100">
                <Image src={selected.url} alt={selected.name} fill className="object-contain" sizes="256px" />
              </div>
            )}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Filename</p>
              <p className="text-sm text-stone-700 break-all">{selected.name}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">URL</p>
              <p className="text-xs text-stone-500 break-all font-mono">{selected.url}</p>
            </div>
            {isUpload(selected) ? (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Size</p>
                <p className="text-sm text-stone-700">{formatSize(selected.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Used by</p>
                <p className="text-sm text-stone-700">{selected.usedBy || "The website"}</p>
                <p className="text-[11px] text-stone-400 mt-2">This picture is part of the website&rsquo;s own files, so it cannot be deleted here.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-stone-100 space-y-2">
            <button
              onClick={() => copyUrl(selected.url)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
            {isUpload(selected) && (
              <button
                onClick={() => handleDelete(selected.name)}
                className="w-full border border-red-200 hover:bg-red-50 text-red-400 text-xs uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              >
                Delete File
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
