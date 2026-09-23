"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons, ACCENT, type IconName } from "./_icons";

const NAV: { section: string; items: { label: string; href: string; icon: IconName; tab?: "classic" | "signature" }[] }[] = [
  { section: "Workspace", items: [
    { label: "Pages", href: "/admin/content", icon: "pages" },
    { label: "Categories", href: "/admin/categories", icon: "pages" },
    { label: "Journal", href: "/admin/journal", icon: "pages" },
    { label: "Projects", href: "/admin/projects", icon: "pages" },
    { label: "Products", href: "/admin/products", icon: "pages" },
    { label: "Media Library", href: "/admin/media", icon: "media" },
  ]},
  { section: "Company", items: [
    { label: "Quotes", href: "/admin/quotes", icon: "pages" },
    { label: "Submissions", href: "/admin/submissions", icon: "inbox" },
    { label: "Download Leads", href: "/admin/leads", icon: "users" },
    { label: "Team", href: "/admin/team", icon: "team" },
  ]},
  { section: "Support", items: [
    { label: "Help", href: "/admin/help", icon: "pages" },
  ]},
  { section: "Backend", items: [
    { label: "Company Details", href: "/admin/company", icon: "pages" },
    { label: "Accounts", href: "/admin/admins", icon: "users" },
    { label: "Backups", href: "/admin/backups", icon: "pages" },
    { label: "SEO", href: "/admin/seo", icon: "seo" },
    { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
  ]},
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type Me = { name: string; email: string; role: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hello, setHello] = useState("Good morning");
  const [today, setToday] = useState("");
  const [me, setMe] = useState<Me>({ name: "Administrator", email: "", role: "admin" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [tabParam, setTabParam] = useState<string | null>(null);

  useEffect(() => {
    setHello(greeting());
    setToday(new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    setTabParam(new URLSearchParams(window.location.search).get("tab"));
    fetch("/api/admin/auth").then(r => r.json()).then(d => { if (d.admin) setMe(d.admin); }).catch(() => {});
  }, [pathname]);

  // Poll submissions for the notification badge (status "new" = unread).
  useEffect(() => {
    if (pathname === "/admin/login") return;
    const load = () => fetch("/api/admin/submissions").then(r => (r.ok ? r.json() : [])).then((list) => {
      if (Array.isArray(list)) setUnread(list.filter((s: { status?: string }) => s.status === "new").length);
    }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  const firstName = me.name.split(" ")[0];
  const initials = me.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = me.role === "super-admin" ? "Super Admin" : me.role === "admin" ? "Administrator" : me.role;

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex text-stone-800" style={{ background: "#f4f5f7", fontFamily: "var(--font-sans)" }}>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - floating dark card. Fixed on desktop, slide-in drawer on mobile. */}
      <aside
        className={`flex flex-col w-[224px] fixed left-4 top-4 bottom-4 z-40 rounded-2xl border border-white/8 shadow-[0_8px_30px_rgba(15,12,8,0.22)] overflow-hidden transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-[130%]"}`}
        style={{ background: "#0a0908" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-6 py-6">
          <a href="/admin" className="block">
            <Image src="/Atelier-logo.png" alt="Atelier" width={140} height={56} className="object-contain mx-auto" priority />
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5" onClick={() => setMobileOpen(false)}>
          <a
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition mb-1 ${isActive("/admin") && pathname === "/admin" ? "text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}`}
            style={isActive("/admin") && pathname === "/admin" ? { background: ACCENT } : undefined}
          >
            <Icons.dashboard size={18} /> Dashboard
          </a>

          {NAV.map(group => (
            <div key={group.section} className="mt-6">
              <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-white/30">{group.section}</p>
              {group.items.map(item => {
                const Icon = Icons[item.icon];
                const active = item.tab
                  ? pathname === "/admin/products" && tabParam === item.tab
                  : isActive(item.href);
                const showBadge = item.href === "/admin/submissions" && unread > 0;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition mb-1 ${active ? "text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}`}
                    style={active ? { background: ACCENT } : undefined}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: active ? "rgba(255,255,255,0.25)" : "#ef4444", color: "#fff" }}>{unread > 9 ? "9+" : unread}</span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Quick actions */}
        <div className="p-3 grid grid-cols-3 gap-1.5" onClick={() => setMobileOpen(false)}>
          <a href="/admin/account" className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-semibold transition ${isActive("/admin/account") ? "text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}`} style={isActive("/admin/account") ? { background: ACCENT } : undefined}>
            <Icons.user size={17} /> Account
          </a>
          <a href="/" target="_blank" className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-semibold text-white/55 hover:bg-white/8 hover:text-white transition">
            <Icons.globe size={17} /> Website
          </a>
          <button onClick={logout} className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-semibold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition">
            <Icons.logout size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-[240px] min-w-0">
        {/* Topbar - floating white card aligned with the sidebar top */}
        <header className="h-16 bg-white border border-stone-200/80 rounded-2xl shadow-[0_8px_30px_rgba(15,12,8,0.06)] flex items-center justify-between px-5 sm:px-7 sticky top-4 z-20 mt-4 mx-4 sm:mx-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 -ml-1 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-600 flex-shrink-0"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="min-w-0">
              <p className="text-[19px] text-stone-900 leading-tight truncate" style={{ fontWeight: 500 }}>{hello}, {firstName} 👋</p>
              <p className="text-[11.5px] text-stone-400 truncate">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/admin/submissions" className="w-10 h-10 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-500 relative" aria-label={`${unread} new submission${unread === 1 ? "" : "s"}`} title={unread ? `${unread} new submission${unread === 1 ? "" : "s"}` : "No new submissions"}>
              <Icons.bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: "#ef4444" }}>{unread > 9 ? "9+" : unread}</span>
              )}
            </a>
            <div className="flex items-center gap-2.5 pl-1">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg, ${ACCENT}, #8a6d38)` }}>{initials}</span>
              <div className="hidden md:block leading-tight">
                <p className="text-[12.5px] font-semibold text-stone-800">{me.name}</p>
                <p className="text-[10.5px] text-stone-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 pt-5 pb-8 max-w-[1500px]">{children}</main>
      </div>
    </div>
  );
}
