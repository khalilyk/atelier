/**
 * Who can do what in the admin.
 *
 * Three roles, and every one of them is checked in the API - a role that only
 * changes what the sidebar shows is a label, not a permission, because anyone
 * can still call the endpoint directly.
 */

export const ROLES = {
  "super-admin": {
    label: "Super Admin",
    blurb: "Complete control: everything below, plus team accounts, roles and backups.",
    rank: 3,
  },
  admin: {
    label: "Admin",
    blurb: "Everything an Editor can do, plus quotes, enquiries, download leads, company details and analytics.",
    rank: 2,
  },
  editor: {
    label: "Editor",
    blurb: "Content only: pages, categories, journal, projects, products and the media library.",
    rank: 1,
  },
} as const;

export type Role = keyof typeof ROLES;
export const ROLE_KEYS = Object.keys(ROLES) as Role[];

/** Accounts made before the roles were named may still hold other values. */
export function normaliseRole(role?: string | null): Role {
  if (role === "super-admin" || role === "admin" || role === "editor") return role;
  return "editor";
}

const rank = (role?: string | null) => ROLES[normaliseRole(role)].rank;

/** What each area of the admin needs. */
export const AREAS = {
  content: "editor",   // pages, categories, journal, projects, products, media
  business: "admin",   // quotes, submissions, leads, company details, analytics
  accounts: "super-admin", // people, roles, backups
} as const;

export type Area = keyof typeof AREAS;

export const can = (role: string | null | undefined, area: Area): boolean =>
  rank(role) >= rank(AREAS[area]);

export const isSuperAdmin = (role?: string | null): boolean => normaliseRole(role) === "super-admin";

export const roleLabel = (role?: string | null): string => ROLES[normaliseRole(role)].label;
export const roleBlurb = (role?: string | null): string => ROLES[normaliseRole(role)].blurb;
