import "server-only";
import crypto from "crypto";

// Gated resources live OUTSIDE /public so they are never directly reachable.
// Access is granted by a short-lived HMAC token issued only after a visitor
// completes the name + email form.
export type GatedResource = {
  file: string;    // filename inside private/downloads
  label: string;
  filename: string; // what the browser saves it as
};

export const RESOURCES: Record<string, GatedResource> = {
  "joinery-colour-collection": {
    file: "atelier-joinery-colour-collection.pdf",
    label: "Atelier Joinery Colour Collection",
    filename: "Atelier Joinery Colour Collection.pdf",
  },
  "joinery-collection": {
    file: "atelier-joinery-collection.pdf",
    label: "Atelier Joinery Collection",
    filename: "Atelier Joinery Collection.pdf",
  },
  "window-collection": {
    file: "atelier-window-collection.pdf",
    label: "Atelier Window Collection",
    filename: "Atelier Window Collection.pdf",
  },
  "window-maintenance": {
    file: "atelier-window-maintenance-guide.pdf",
    label: "Atelier Window Care & Maintenance Guide",
    filename: "Atelier Window Maintenance Guide.pdf",
  },
  "bathroom-maintenance": {
    file: "atelier-bathroom-maintenance-guide.pdf",
    label: "Atelier Bathroom Care & Maintenance Guide",
    filename: "Atelier Bathroom Maintenance Guide.pdf",
  },
  "capability-statement": {
    file: "atelier-capability-statement.pdf",
    label: "Atelier Capability Statement",
    filename: "Atelier Capability Statement.pdf",
  },
};

// Links are emailed, so they need to outlive the browser session.
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.DOWNLOAD_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!s) throw new Error("No DOWNLOAD_SECRET configured");
  return s;
}

function sign(resource: string, exp: number): string {
  return crypto.createHmac("sha256", secret()).update(`${resource}.${exp}`).digest("base64url");
}

/** Issues `<exp>.<signature>` for a resource. */
export function issueToken(resource: string, ttlMs = TTL_MS): string {
  const exp = Date.now() + ttlMs;
  return `${exp}.${sign(resource, exp)}`;
}

/** Constant-time verification of a token against a resource. */
export function verifyToken(resource: string, token: string): boolean {
  const [expRaw, sig] = String(token || "").split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || Number.isNaN(exp)) return false;
  if (Date.now() > exp) return false;
  let expected: string;
  try { expected = sign(resource, exp); } catch { return false; }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** The tokenised, publicly shareable-but-expiring download path. */
export function downloadPath(resource: string): string {
  return `/api/download/${resource}?t=${encodeURIComponent(issueToken(resource))}`;
}
