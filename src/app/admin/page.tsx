import Link from "next/link";
import { quotes, submissions } from "@/lib/admin-store";
import DashboardViews from "./DashboardViews";

export default async function AdminDashboard() {
  const allQuotes = await quotes.list();
  const allSubmissions = await submissions.list();


  return (
    <div className="max-w-6xl">
      {/* Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-stone-900 font-medium">Analytics</h2>
          <Link href="/admin/analytics" className="text-[#b8934a] text-sm hover:underline">Open Analytics →</Link>
        </div>
        <DashboardViews />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent submissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="text-stone-900 font-medium">Recent Enquiries</h2>
            <Link href="/admin/submissions" className="text-[#b8934a] text-sm hover:underline">View all →</Link>
          </div>
          {allSubmissions.length === 0 ? (
            <div className="px-6 py-10 text-center text-stone-400 text-sm">No enquiries yet.</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {allSubmissions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-stone-900 text-sm font-medium">{s.name}</p>
                    <p className="text-stone-400 text-xs">{s.email} · {(s.items as unknown[]).length} item{(s.items as unknown[]).length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${s.status === "new" ? "bg-[#b8934a]/10 text-[#b8934a]" : s.status === "replied" ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                      {s.status}
                    </span>
                    <span className="text-stone-300 text-xs">{new Date(s.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="text-stone-900 font-medium mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Edit Pages", href: "/admin/content", icon: "☰" },
                { label: "Build a Quote", href: "/admin/quotes", icon: "❖" },
                { label: "Upload Media", href: "/admin/media", icon: "⊡" },
                { label: "View Submissions", href: "/admin/submissions", icon: "◎" },
              ].map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-stone-700 text-sm"
                >
                  <span className="text-[#b8934a]">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-stone-900 font-medium">Recent Quotes</h2>
              <Link href="/admin/quotes" className="text-[#b8934a] text-sm hover:underline">View all →</Link>
            </div>
            {allQuotes.length === 0 ? (
              <p className="text-stone-400 text-sm">No quotes yet.</p>
            ) : (
              <div className="space-y-2">
                {allQuotes.slice(0, 6).map(q => (
                  <div key={q.id} className="flex items-center justify-between">
                    <Link href="/admin/quotes" className="text-stone-600 text-sm hover:text-[#b8934a] transition-colors truncate">{q.number} · {q.clientName || "No client"}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === "accepted" ? "bg-emerald-50 text-emerald-600" : q.status === "sent" ? "bg-[#b8934a]/10 text-[#b8934a]" : q.status === "declined" ? "bg-red-50 text-red-500" : "bg-stone-100 text-stone-500"}`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
