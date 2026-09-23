// Backups for the admin data (server only).
//
// Vercel Blob has no version history: an overwrite is final. Single-file stores
// already keep their last few versions (see admin-store), but per-record data
// (leads, categories, image slots, submissions) does not, and nothing protects
// against a bad edit noticed days later.
//
// This module takes a dated copy of everything into `backups/`, keeps 30 days
// of daily copies, and can restore any one of them. Snapshots are also taken
// automatically just before anything is deleted or restored.
import fs from "fs";
import path from "path";
import { list, put, del } from "@vercel/blob";
import {
  readStore, writeStore, leads, customCategories, images, submissions, journal, projects, customPages, documents, USE_BLOB, BLOB_TOKEN, DATA_DIR,
  type Lead, type Submission,
} from "./admin-store";
import type { CustomCategory } from "./categories";
import type { JournalPost } from "./journal";
import type { Project } from "./projects";
import type { CustomPage } from "./custom-pages";
import type { DocOverride } from "./admin-store";

const PREFIX = "backups/";
const BACKUP_DIR = path.join(DATA_DIR, "backups");
export const RETENTION_DAYS = 30;
/** Manual and pre-change snapshots are always kept on top of the daily ones. */
const KEEP_RECENT = 20;

/** Single-file stores, by their file name. */
export const DATA_FILES = [
  "content.json", "product-content.json", "products.json", "pages.json", "settings.json",
  "company.json", "team.json", "quotes.json", "admins.json", "vcards.json", "joinery-settings.json",
] as const;

/** Per-record stores, by scope name. */
export const COLLECTIONS = ["leads", "categories", "images", "submissions", "journal", "projects", "custom-pages", "documents"] as const;
export type Scope = (typeof DATA_FILES)[number] | (typeof COLLECTIONS)[number];
export const ALL_SCOPES: Scope[] = [...DATA_FILES, ...COLLECTIONS];

export type BackupKind = "daily" | "manual" | "pre-change" | "pre-restore";
export type BackupMeta = { id: string; createdAt: string; kind: BackupKind; label: string; scopes: string[]; size: number };
export type Backup = BackupMeta & { data: Record<string, unknown> };

const stamp = (d = new Date()) => d.toISOString().replace(/[:.]/g, "-");
const blobName = (id: string) => `${PREFIX}${id}.json`;

// ── Reading the current data ─────────────────────────────────────────────────

async function readScope(scope: Scope): Promise<unknown> {
  switch (scope) {
    case "leads": return await leads.list();
    case "categories": return await customCategories.list();
    case "images": return await images.get();
    case "submissions": return await submissions.list();
    case "journal": return await journal.list();
    case "projects": return await projects.list();
    case "custom-pages": return await customPages.list();
    case "documents": return await documents.list();
    default: return await readStore<unknown>(scope, null);
  }
}

async function writeScope(scope: Scope, value: unknown): Promise<void> {
  switch (scope) {
    case "leads": {
      const items = (Array.isArray(value) ? value : []) as Lead[];
      const keep = new Set(items.map((i) => i.id));
      for (const existing of await leads.list()) if (!keep.has(existing.id)) await leads.remove(existing.id);
      for (const item of items) await leads.put(item);
      return;
    }
    case "submissions": {
      const items = (Array.isArray(value) ? value : []) as Submission[];
      const keep = new Set(items.map((i) => i.id));
      for (const existing of await submissions.list()) if (!keep.has(existing.id)) await submissions.remove(existing.id);
      for (const item of items) await submissions.put(item);
      return;
    }
    case "journal": {
      const items = (Array.isArray(value) ? value : []) as JournalPost[];
      const keep = new Set(items.map((i) => i.slug));
      for (const existing of await journal.list()) if (!keep.has(existing.slug)) await journal.remove(existing.slug);
      for (const item of items) await journal.put(item);
      return;
    }
    case "projects": {
      const items = (Array.isArray(value) ? value : []) as Project[];
      const keep = new Set(items.map((i) => i.slug));
      for (const existing of await projects.list()) if (!keep.has(existing.slug)) await projects.remove(existing.slug);
      for (const item of items) await projects.put(item);
      return;
    }
    case "custom-pages": {
      const items = (Array.isArray(value) ? value : []) as CustomPage[];
      const keep = new Set(items.map((i) => i.slug));
      for (const existing of await customPages.list()) if (!keep.has(existing.slug)) await customPages.remove(existing.slug);
      for (const item of items) await customPages.put(item);
      return;
    }
    case "documents": {
      const items = (Array.isArray(value) ? value : []) as DocOverride[];
      const keep = new Set(items.map((i) => i.resource));
      for (const existing of await documents.list()) if (!keep.has(existing.resource)) await documents.remove(existing.resource);
      for (const item of items) await documents.put(item);
      return;
    }
    case "categories": {
      const items = (Array.isArray(value) ? value : []) as CustomCategory[];
      const keep = new Set(items.map((i) => i.slug));
      for (const existing of await customCategories.list()) if (!keep.has(existing.slug)) await customCategories.remove(existing.slug);
      for (const item of items) await customCategories.put(item);
      return;
    }
    case "images": {
      const map = (value && typeof value === "object" ? value : {}) as Record<string, string>;
      const patch: Record<string, string> = { ...map };
      for (const key of Object.keys(await images.get())) if (!(key in map)) patch[key] = ""; // clear slots not in the backup
      await images.update(patch);
      return;
    }
    default:
      if (value !== null && value !== undefined) await writeStore(scope, value);
  }
}

// ── Writing / listing backups ────────────────────────────────────────────────

async function save(meta: Omit<BackupMeta, "size">, data: Record<string, unknown>) {
  const body = JSON.stringify({ ...meta, data });
  if (USE_BLOB) {
    await put(blobName(meta.id), body, {
      access: "public", token: BLOB_TOKEN, addRandomSuffix: false, allowOverwrite: true,
      contentType: "application/json", cacheControlMaxAge: 0,
    });
  } else {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.writeFileSync(path.join(BACKUP_DIR, `${meta.id}.json`), body);
  }
  return { ...meta, size: body.length };
}

/** Copy the given scopes (everything by default) into a new backup. */
export async function createBackup(opts: { kind?: BackupKind; label?: string; scopes?: Scope[] } = {}): Promise<BackupMeta> {
  const kind = opts.kind ?? "manual";
  const scopes = opts.scopes ?? ALL_SCOPES;
  const data: Record<string, unknown> = {};
  await Promise.all(scopes.map(async (s) => { data[s] = await readScope(s); }));
  const id = `${stamp()}-${kind}`;
  return save({ id, createdAt: new Date().toISOString(), kind, label: opts.label ?? "", scopes }, data);
}

// One pre-change snapshot per store every few minutes is plenty; without this a
// burst of saves would leave dozens of near-identical copies.
const SNAPSHOT_COOLDOWN_MS = 10 * 60 * 1000;
const lastSnapshot = new Map<string, number>();

/**
 * Copy one store before it is overwritten or deleted. Best effort: a failure
 * here must never block the save the caller is about to make.
 */
export async function snapshot(scope: Scope, label = ""): Promise<void> {
  const now = Date.now();
  if (now - (lastSnapshot.get(scope) ?? 0) < SNAPSHOT_COOLDOWN_MS) return;
  lastSnapshot.set(scope, now);
  try {
    await createBackup({ kind: "pre-change", label: label || scope, scopes: [scope] });
  } catch (err) {
    console.error(`Snapshot of ${scope} failed`, err);
  }
}

export async function listBackups(): Promise<BackupMeta[]> {
  const out: BackupMeta[] = [];
  if (USE_BLOB) {
    let cursor: string | undefined;
    const blobs: { pathname: string; url: string; size: number }[] = [];
    do {
      const page = await list({ prefix: PREFIX, token: BLOB_TOKEN, cursor });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    await Promise.all(blobs.map(async (b) => {
      const id = b.pathname.slice(PREFIX.length).replace(/\.json$/, "");
      const meta = await readBackup(id, { metaOnly: true });
      if (meta) out.push({ ...meta, size: b.size });
    }));
  } else if (fs.existsSync(BACKUP_DIR)) {
    for (const f of fs.readdirSync(BACKUP_DIR).filter((n) => n.endsWith(".json"))) {
      const full = path.join(BACKUP_DIR, f);
      const meta = JSON.parse(fs.readFileSync(full, "utf-8")) as Backup;
      out.push({ id: meta.id, createdAt: meta.createdAt, kind: meta.kind, label: meta.label, scopes: meta.scopes, size: fs.statSync(full).size });
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readBackup(id: string, opts: { metaOnly?: boolean } = {}): Promise<Backup | null> {
  let raw: string | null = null;
  if (USE_BLOB) {
    const key = blobName(id);
    const { blobs } = await list({ prefix: key, token: BLOB_TOKEN });
    const match = blobs.find((b) => b.pathname === key);
    if (!match) return null;
    const res = await fetch(`${match.url}${match.url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    raw = await res.text();
  } else {
    const p = path.join(BACKUP_DIR, `${id}.json`);
    if (!fs.existsSync(p)) return null;
    raw = fs.readFileSync(p, "utf-8");
  }
  try {
    const parsed = JSON.parse(raw) as Backup;
    return opts.metaOnly ? { ...parsed, data: {} } : parsed;
  } catch { return null; }
}

/** Put a backup's contents back. Takes a "pre-restore" copy of the current data first. */
export async function restoreBackup(id: string, scopes?: Scope[]): Promise<{ restored: Scope[] }> {
  const backup = await readBackup(id);
  if (!backup) throw new Error("Backup not found");
  const wanted = (scopes ?? (backup.scopes as Scope[])).filter((s) => ALL_SCOPES.includes(s) && s in backup.data);
  await createBackup({ kind: "pre-restore", label: `before restoring ${id}`, scopes: wanted });
  for (const scope of wanted) await writeScope(scope, backup.data[scope]);
  return { restored: wanted };
}

export async function deleteBackup(id: string): Promise<void> {
  if (USE_BLOB) {
    const key = blobName(id);
    const { blobs } = await list({ prefix: key, token: BLOB_TOKEN });
    const match = blobs.find((b) => b.pathname === key);
    if (match) await del(match.url, { token: BLOB_TOKEN });
  } else {
    const p = path.join(BACKUP_DIR, `${id}.json`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

/** Drop backups older than the retention window, always keeping the newest few. */
export async function pruneBackups(days = RETENTION_DAYS): Promise<number> {
  const all = await listBackups();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const stale = all.slice(KEEP_RECENT).filter((b) => new Date(b.createdAt).getTime() < cutoff);
  for (const b of stale) await deleteBackup(b.id);
  return stale.length;
}

/** The daily job: one full copy, then prune. */
export async function dailyBackup(): Promise<{ backup: BackupMeta; pruned: number }> {
  const backup = await createBackup({ kind: "daily", label: "Scheduled daily backup" });
  const pruned = await pruneBackups();
  return { backup, pruned };
}
