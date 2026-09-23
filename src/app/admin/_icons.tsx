"use client";
import React from "react";

/** Atelier gold accent for active nav items. */
export const ACCENT = "#b8934a";

type IconProps = { className?: string; size?: number };
const wrap = (path: React.ReactNode) => ({ className, size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

export const Icons = {
  dashboard: wrap(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  pages: wrap(<><path d="M14 3v5h5" /><path d="M19 8v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1h8l5 5z" /><path d="M9 13h6M9 17h6" /></>),
  media: wrap(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>),
  products: wrap(<><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>),
  gem: wrap(<><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20" /><path d="M8 3l-2 6 6 12M16 3l2 6-6 12" /></>),
  upload: wrap(<><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></>),
  inbox: wrap(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  team: wrap(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>),
  users: wrap(<><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 3.5a3 3 0 010 5.8M21 20a5 5 0 00-4-4.9" /></>),
  seo: wrap(<><circle cx="11" cy="11" r="7" /><path d="M16 16l5 5" /><path d="M11 8v6M8 11h6" /></>),
  analytics: wrap(<><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16l3-4 3 2 4-6" /></>),
  vcard: wrap(<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M7 15c0-1.1.9-2 2-2s2 .9 2 2" /><path d="M14 10h3M14 13h2" /></>),
  user: wrap(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>),
  globe: wrap(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></>),
  logout: wrap(<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>),
  bell: wrap(<><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></>),
} as const;

export type IconName = keyof typeof Icons;
