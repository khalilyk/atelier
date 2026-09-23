"use client";
import { useEffect, useState } from "react";

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

const clip = (s: string, n: number) => {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20)).trim()}…`;
};

type Entry = { slug: string; title?: string; metaTitle?: string; metaDesc?: string };

/**
 * The search listing for one address, edited where that thing is edited rather
 * than on a separate SEO screen. Left blank, the page writes its own.
 */
export default function SearchListing({ path, name, fallbackTitle, fallbackDescription }: {
  /** The address this listing belongs to, e.g. "/classic/joinery". */
  path: string;
  /** What to call it if an entry has to be created. */
  name: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);


  useEffect(() => {
    let live = true;
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((list: Entry[]) => {
        if (!live) return;
        const found = Array.isArray(list) ? list.find((p) => p.slug === path) : undefined;
        setMetaTitle(found?.metaTitle || "");
        setMetaDesc(found?.metaDesc || "");
      })
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [path]);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/pages", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: path, title: name, metaTitle, metaDesc }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  const shownTitle = metaTitle || clip(fallbackTitle || name, 58);
  const shownDesc = metaDesc || clip(fallbackDescription || "", 155);

  if (loading) return <p className="text-sm text-stone-400">Loading the search listing…</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-400">
        How this appears on Google and in AI answers. Leave blank and the page writes its own.
      </p>

      {/* Google-style preview */}
      <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-4">
        <p className="text-[11px] text-stone-500">ateliersupplygroup.com.au{path === "/" ? "" : path.replace(/\//g, " › ")}</p>
        <p className="text-[#1a0dab] text-base leading-snug mt-0.5">{shownTitle}</p>
        <p className="text-[13px] text-stone-600 leading-snug mt-0.5">{shownDesc || "Add a description so Google has something to show."}</p>
      </div>

      <div>
        <label className={LABEL}>Meta title</label>
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={clip(fallbackTitle || name, 58)} className={FIELD} />
        <p className="text-[11px] text-stone-400 mt-1">{shownTitle.length} characters - aim for under 60.</p>
      </div>

      <div>
        <label className={LABEL}>Meta description</label>
        <textarea rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder={clip(fallbackDescription || "", 155)} className={`${FIELD} resize-y leading-relaxed`} />
        <p className="text-[11px] text-stone-400 mt-1">{shownDesc.length} characters - aim for 70 to 160.</p>
      </div>

      <button type="button" onClick={save} disabled={saving}
        className="text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:border-[#b8934a] hover:text-[#b8934a] disabled:opacity-50">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save search listing"}
      </button>
    </div>
  );
}
