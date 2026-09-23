"use client";
import { useEffect, useState } from "react";

type Page = { id: string; title: string; slug: string; metaTitle: string; metaDesc: string; status: string };
type Settings = {
  siteName: string; siteUrl: string; defaultMetaTitle: string; defaultMetaDesc: string;
  ogImage: string; twitterHandle: string; googleVerification: string; robotsTxt: string;
};

const EMPTY_SETTINGS: Settings = {
  siteName: "", siteUrl: "", defaultMetaTitle: "", defaultMetaDesc: "",
  ogImage: "", twitterHandle: "", googleVerification: "", robotsTxt: "",
};

function scoreTitle(t: string) {
  const l = t.length;
  if (!t) return { label: "Missing", color: "text-red-400" };
  if (l < 30) return { label: "Too short", color: "text-amber-500" };
  if (l > 60) return { label: "Too long", color: "text-amber-500" };
  return { label: "Good", color: "text-emerald-500" };
}
function scoreDesc(d: string) {
  const l = d.length;
  if (!d) return { label: "Missing", color: "text-red-400" };
  if (l < 70) return { label: "Too short", color: "text-amber-500" };
  if (l > 160) return { label: "Too long", color: "text-amber-500" };
  return { label: "Good", color: "text-emerald-500" };
}

export default function SeoAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageForm, setPageForm] = useState({ metaTitle: "", metaDesc: "" });
  const [savingPage, setSavingPage] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages").then(r => r.json()).then(setPages);
    fetch("/api/admin/settings").then(r => r.json()).then(setSettings);
  }, []);

  function openPage(p: Page) {
    setEditingPage(p);
    setPageForm({ metaTitle: p.metaTitle, metaDesc: p.metaDesc });
  }

  async function savePage() {
    if (!editingPage) return;
    setSavingPage(true);
    await fetch("/api/admin/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingPage.id, ...pageForm }),
    });
    setPages(ps => ps.map(p => p.id === editingPage.id ? { ...p, ...pageForm } : p));
    setSavingPage(false);
    setEditingPage(null);
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSavingSettings(false);
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  }

  const recommendations: { where: string; msg: string; sev: "high" | "med" }[] = [];
  pages.forEach((p) => {
    if (!p.metaTitle) recommendations.push({ where: p.title, msg: "Add a meta title (aim for 50–60 characters, include your key term).", sev: "high" });
    else if (p.metaTitle.length < 30) recommendations.push({ where: p.title, msg: `Meta title is short (${p.metaTitle.length}/60) - expand toward 50–60 characters.`, sev: "med" });
    else if (p.metaTitle.length > 60) recommendations.push({ where: p.title, msg: `Meta title is long (${p.metaTitle.length}/60) - trim to under 60 so it isn't cut off.`, sev: "med" });
    if (!p.metaDesc) recommendations.push({ where: p.title, msg: "Add a meta description (aim for 120–160 characters).", sev: "high" });
    else if (p.metaDesc.length < 70) recommendations.push({ where: p.title, msg: `Meta description is short (${p.metaDesc.length}/160) - expand toward 120–160 characters.`, sev: "med" });
    else if (p.metaDesc.length > 160) recommendations.push({ where: p.title, msg: `Meta description is long (${p.metaDesc.length}/160) - trim to under 160.`, sev: "med" });
  });
  if (!settings.ogImage) recommendations.push({ where: "Global", msg: "Set a default social share image (OG image) so shared links show a preview.", sev: "med" });
  if (!settings.googleVerification) recommendations.push({ where: "Global", msg: "Add Google Search Console verification to monitor search performance.", sev: "med" });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-stone-900 font-semibold text-xl">SEO</h1>
        <p className="text-stone-900 text-sm mt-1">Manage meta titles, descriptions, and global site settings.</p>
      </div>

      {/* Recommendations */}
      <div className="mb-10">
        <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-4">Recommendations {recommendations.length > 0 && <span className="text-stone-400 normal-case tracking-normal font-normal">· {recommendations.length} to improve</span>}</h2>
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {recommendations.length === 0 ? (
            <div className="px-5 py-5 text-sm text-emerald-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Everything looks good - no SEO issues detected.</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${r.sev === "high" ? "bg-red-400" : "bg-amber-400"}`} />
                  <div>
                    <p className="text-sm text-stone-800">{r.msg}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{r.where}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page SEO table */}
      <div className="mb-10">
        <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-4">Pages</h2>
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Page</th>
                <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Meta Title</th>
                <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Meta Description</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {pages.map(p => {
                const ts = scoreTitle(p.metaTitle);
                const ds = scoreDesc(p.metaDesc);
                return (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">{p.title}</p>
                      <p className="text-stone-400 text-xs">{p.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-stone-700 truncate max-w-[200px]">{p.metaTitle || <span className="text-stone-300 italic">-</span>}</p>
                      <span className={`text-xs ${ts.color}`}>{ts.label} · {p.metaTitle.length}/60</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-stone-700 truncate max-w-[240px]">{p.metaDesc || <span className="text-stone-300 italic">-</span>}</p>
                      <span className={`text-xs ${ds.color}`}>{ds.label} · {p.metaDesc.length}/160</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openPage(p)} className="text-xs text-[#b8934a] hover:underline">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global settings */}
      <div className="mb-10">
        <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-widest mb-4">Global Settings</h2>
        <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:order-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Site URL</label>
              <p className="border border-stone-100 bg-stone-50 rounded-xl px-4 py-2.5 text-sm text-stone-500">
                Set automatically from the live domain in Vercel.
              </p>
            </div>
            {[
              { label: "Site Name", key: "siteName" as const, placeholder: "Atelier Supply Group" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                <input
                  type="text"
                  value={settings[f.key]}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Default Meta Title</label>
            <input
              type="text"
              value={settings.defaultMetaTitle}
              onChange={e => setSettings(s => ({ ...s, defaultMetaTitle: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
            />
            <p className={`text-xs mt-1 ${scoreTitle(settings.defaultMetaTitle).color}`}>{scoreTitle(settings.defaultMetaTitle).label} · {settings.defaultMetaTitle.length}/60</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Default Meta Description</label>
            <textarea
              value={settings.defaultMetaDesc}
              onChange={e => setSettings(s => ({ ...s, defaultMetaDesc: e.target.value }))}
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-none"
            />
            <p className={`text-xs mt-1 ${scoreDesc(settings.defaultMetaDesc).color}`}>{scoreDesc(settings.defaultMetaDesc).label} · {settings.defaultMetaDesc.length}/160</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:order-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Site URL</label>
              <p className="border border-stone-100 bg-stone-50 rounded-xl px-4 py-2.5 text-sm text-stone-500">
                Set automatically from the live domain in Vercel.
              </p>
            </div>
            {[
              { label: "Default OG Image URL", key: "ogImage" as const, placeholder: "https://..." },
              { label: "Twitter / X Handle", key: "twitterHandle" as const, placeholder: "@ateliersupply" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">{f.label}</label>
                <input
                  type="text"
                  value={settings[f.key]}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Google Search Console Verification</label>
            <input
              type="text"
              value={settings.googleVerification}
              onChange={e => setSettings(s => ({ ...s, googleVerification: e.target.value }))}
              placeholder="google-site-verification=xxxxxxx"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-stone-400 mb-1.5 block">Extra robots.txt rules</label>
            <p className="text-[11.5px] text-stone-400 mb-2">
              The site already allows Google and AI assistants, blocks the admin and links the sitemap. Only add rules here if you need something extra.
            </p>
            <textarea
              value={settings.robotsTxt}
              onChange={e => setSettings(s => ({ ...s, robotsTxt: e.target.value }))}
              rows={4}
              placeholder="User-agent: ExampleBot&#10;Disallow: /"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="bg-[#b8934a] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a07e3c] transition-colors disabled:opacity-50"
          >
            {savingSettings ? "Saving…" : savedSettings ? "Saved ✓" : "Save Settings"}
          </button>
        </form>
      </div>

      {/* Edit page modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <h2 className="font-semibold text-stone-900">{editingPage.title}</h2>
                <p className="text-stone-400 text-xs">{editingPage.slug}</p>
              </div>
              <button onClick={() => setEditingPage(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            {/* Google preview */}
            <div className="mx-6 mt-5 mb-2 bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Google Preview</p>
              <p className="text-blue-600 text-base truncate">{pageForm.metaTitle || "Page title"}</p>
              <p className="text-emerald-700 text-xs mt-0.5 truncate">ateliersupplygroup.com.au{editingPage.slug}</p>
              <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">{pageForm.metaDesc || "No description set."}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-widest text-stone-400">Meta Title</label>
                  <span className={`text-xs ${scoreTitle(pageForm.metaTitle).color}`}>{pageForm.metaTitle.length}/60</span>
                </div>
                <input
                  type="text"
                  value={pageForm.metaTitle}
                  onChange={e => setPageForm(f => ({ ...f, metaTitle: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-widest text-stone-400">Meta Description</label>
                  <span className={`text-xs ${scoreDesc(pageForm.metaDesc).color}`}>{pageForm.metaDesc.length}/160</span>
                </div>
                <textarea
                  value={pageForm.metaDesc}
                  onChange={e => setPageForm(f => ({ ...f, metaDesc: e.target.value }))}
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#b8934a]/60 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
              <button onClick={() => setEditingPage(null)} className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-xl hover:bg-stone-50">Cancel</button>
              <button onClick={savePage} disabled={savingPage} className="flex-1 bg-[#b8934a] text-white text-sm py-2.5 rounded-xl hover:bg-[#a07e3c] disabled:opacity-50">
                {savingPage ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
