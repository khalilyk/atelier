"use client";
import { useEffect, useState } from "react";
import ImagePicker from "../components/ImagePicker";

type Settings = {
  siteName: string; defaultMetaTitle: string; defaultMetaDesc: string;
  ogImage: string; twitterHandle: string; googleVerification: string; robotsTxt: string;
};

const EMPTY: Settings = {
  siteName: "", defaultMetaTitle: "", defaultMetaDesc: "",
  ogImage: "", twitterHandle: "", googleVerification: "", robotsTxt: "",
};

const FIELD = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60";
const LABEL = "text-xs uppercase tracking-widest text-stone-400 mb-1.5 block";

/**
 * Site-wide search settings: the wording used when a page has not written its
 * own. Each page, product and category sets its own listing on its own screen.
 */
export default function SiteDefaults() {
  const [s, setS] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json())
      .then((d) => setS({ ...EMPTY, ...d }))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="text-sm text-stone-400">Loading the site defaults…</div>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-stone-800 font-semibold text-sm uppercase tracking-widest">Site defaults</h2>
          <p className="text-xs text-stone-400 mt-1">
            Used when a page has not written its own listing. Each page, product and category has its own
            Search listing on its own screen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={LABEL}>Site name</label>
            <input value={s.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="Atelier Supply Group" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Web address</label>
            <p className="border border-stone-100 bg-stone-50 rounded-xl px-4 py-2.5 text-sm text-stone-500">Set automatically from the live domain.</p>
          </div>
        </div>

        <div>
          <label className={LABEL}>Default meta title</label>
          <input value={s.defaultMetaTitle} onChange={(e) => set("defaultMetaTitle", e.target.value)} className={FIELD} />
          <p className="text-[11px] text-stone-400 mt-1">{s.defaultMetaTitle.length} characters - aim for under 60.</p>
        </div>

        <div>
          <label className={LABEL}>Default meta description</label>
          <textarea rows={3} value={s.defaultMetaDesc} onChange={(e) => set("defaultMetaDesc", e.target.value)} className={`${FIELD} resize-y leading-relaxed`} />
          <p className="text-[11px] text-stone-400 mt-1">{s.defaultMetaDesc.length} characters - aim for 70 to 160.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={LABEL}>Default share image</label>
            <ImagePicker value={s.ogImage} onChange={(v) => set("ogImage", v)} />
            <p className="text-[11px] text-stone-400 mt-1">Shown when a link is shared and the page has no picture of its own.</p>
          </div>
          <div>
            <label className={LABEL}>X (Twitter) handle</label>
            <input value={s.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} placeholder="@ateliersupply" className={FIELD} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Google Search Console verification</label>
          <input value={s.googleVerification} onChange={(e) => set("googleVerification", e.target.value)} placeholder="google-site-verification=…" className={FIELD} />
        </div>

        <div>
          <label className={LABEL}>Extra robots.txt rules</label>
          <textarea rows={3} value={s.robotsTxt} onChange={(e) => set("robotsTxt", e.target.value)} className={`${FIELD} resize-y font-mono text-xs`} />
          <p className="text-[11px] text-stone-400 mt-1">Added to the rules the site already publishes. Leave blank unless you know you need it.</p>
        </div>

        <button type="button" onClick={save} disabled={saving}
          className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save site defaults"}
        </button>
      </div>
    </div>
  );
}
