/**
 * Who can do what in the admin.
 *
 * Two levels, because two is what the code can honestly enforce. Anything
 * finer would be a label in the interface that nothing checks, which is worse
 * than not offering it.
 */
export const ROLES = {
  "super-admin": {
    label: "Owner",
    blurb: "Everything, including adding people, changing roles and passwords, backups and company details.",
  },
  editor: {
    label: "Editor",
    blurb: "Pages, journal, projects, products, media, quotes and enquiries. Cannot manage accounts or backups.",
  },
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_KEYS = Object.keys(ROLES) as Role[];

/** Accounts created before the roles were named may hold "admin". */
export const isOwner = (role?: string | null): boolean =>
  role === "super-admin" || role === "admin";

export const roleLabel = (role?: string | null): string =>
  isOwner(role) ? ROLES["super-admin"].label
    : role === "editor" ? ROLES.editor.label
    : (role ?? "");

export const roleBlurb = (role?: string | null): string =>
  isOwner(role) ? ROLES["super-admin"].blurb : role === "editor" ? ROLES.editor.blurb : "";
