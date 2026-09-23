import fs from "fs";
import path from "path";
import { list, put, del } from "@vercel/blob";
import { makeSku } from "./sku";
import type { CustomCategory } from "./categories";
import type { JournalPost } from "./journal";
import type { Project } from "./projects";
import type { CustomPage } from "./custom-pages";
import type { DaySummary, ViewEvent } from "./analytics";

export const DATA_DIR = path.join(process.cwd(), "data");
export const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export const USE_BLOB = !!BLOB_TOKEN;

function uid() {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

// ── Storage backend: Vercel Blob in production, local filesystem in dev ───────

// Blob overwrites are served stale by the CDN for a while, so a save followed
// soon after by another save could read the old file and wipe the newer change.
// Instead every save writes a NEW immutable version under data/<file>/ (named
// so they sort by time); reads take the newest; old versions are pruned.
const VERSIONS_KEPT = 5;

async function blobVersions(file: string) {
  const prefix = `data/${file}/`;
  const found: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, token: BLOB_TOKEN, cursor });
    found.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return found.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest first
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  return res.ok ? ((await res.json()) as T) : null;
}


// ── Per-record blobs, written as immutable versions ──────────────────────────
// Overwriting a blob at a fixed path can serve a stale copy for up to about
// half a minute, so a save could look like it had not happened. Every save
// instead writes a NEW file under <prefix><key>/<timestamp>-<uid>.json and the
// newest one wins. Nothing is ever overwritten, so a read is always current.
// Records written the old way (a flat <prefix><key>.json) are still read, and
// are cleaned up the first time that record is saved.

const RECORD_VERSIONS_KEPT = 3;

const versionName = () => `${String(Date.now()).padStart(15, "0")}-${crypto.randomUUID().slice(0, 8)}.json`;

/** Every blob under a prefix, following the pagination. */
async function allBlobs(prefix: string) {
  const found: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, token: BLOB_TOKEN, cursor });
    found.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return found;
}

/** The newest blob for one record, or null. Falls back to the flat legacy file. */
async function newestRecordBlob(prefix: string, key: string) {
  const versions = (await allBlobs(`${prefix}${key}/`))
    .sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  if (versions.length) return versions[0];
  const legacyKey = `${prefix}${key}.json`;
  return (await allBlobs(legacyKey)).find((b) => b.pathname === legacyKey) ?? null;
}

/** The newest blob for each record under a prefix. */
async function newestRecordBlobs(prefix: string) {
  const byKey = new Map<string, { pathname: string; url: string }>();
  for (const b of await allBlobs(prefix)) {
    const rest = b.pathname.slice(prefix.length);
    const slash = rest.indexOf("/");
    const key = slash === -1 ? rest.replace(/\.json$/, "") : rest.slice(0, slash);
    const current = byKey.get(key);
    // A versioned file always beats the legacy flat file, then newest wins.
    const isVersion = slash !== -1;
    const currentIsVersion = current ? current.pathname.slice(prefix.length).includes("/") : false;
    if (!current || (isVersion && !currentIsVersion) || (isVersion === currentIsVersion && b.pathname > current.pathname)) {
      byKey.set(key, b);
    }
  }
  return [...byKey.values()];
}

/** Write a new version of one record, then tidy up older copies. */
async function putRecordBlob(prefix: string, key: string, body: string) {
  await put(`${prefix}${key}/${versionName()}`, body, {
    access: "public", token: BLOB_TOKEN, addRandomSuffix: false,
    contentType: "application/json",
  });
  try {
    const stale = (await allBlobs(`${prefix}${key}/`))
      .sort((a, b) => (a.pathname < b.pathname ? 1 : -1))
      .slice(RECORD_VERSIONS_KEPT)
      .map((b) => b.url);
    const legacyKey = `${prefix}${key}.json`;
    const legacy = (await allBlobs(legacyKey)).filter((b) => b.pathname === legacyKey).map((b) => b.url);
    if (stale.length || legacy.length) await del([...stale, ...legacy], { token: BLOB_TOKEN });
  } catch (err) {
    console.error(`Pruning old versions of ${prefix}${key} failed`, err);
  }
}

/** Remove every copy of one record. */
async function removeRecordBlob(prefix: string, key: string) {
  const legacyKey = `${prefix}${key}.json`;
  const urls = [
    ...(await allBlobs(`${prefix}${key}/`)).map((b) => b.url),
    ...(await allBlobs(legacyKey)).filter((b) => b.pathname === legacyKey).map((b) => b.url),
  ];
  if (urls.length) await del(urls, { token: BLOB_TOKEN });
}

async function recordExists(prefix: string, key: string) {
  return !!(await newestRecordBlob(prefix, key));
}

export async function readStore<T>(file: string, fallback: T): Promise<T> {
  if (USE_BLOB) {
    try {
      const versions = await blobVersions(file);
      if (versions.length) return (await fetchJSON<T>(versions[0].url)) ?? fallback;
      // Legacy single-file layout (before versioning) - read until first save.
      const key = `data/${file}`;
      const { blobs } = await list({ prefix: key, token: BLOB_TOKEN });
      const match = blobs.find(b => b.pathname === key);
      if (!match) return fallback;
      return (await fetchJSON<T>(`${match.url}${match.url.includes("?") ? "&" : "?"}cb=${Date.now()}`)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export async function writeStore(file: string, data: unknown): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  if (USE_BLOB) {
    const name = `data/${file}/${String(Date.now()).padStart(15, "0")}-${crypto.randomUUID().slice(0, 8)}.json`;
    await put(name, body, {
      access: "public",
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    // Best-effort housekeeping: drop old versions and the legacy single file.
    try {
      const stale = (await blobVersions(file)).slice(VERSIONS_KEPT).map((b) => b.url);
      const legacyKey = `data/${file}`;
      const legacy = (await list({ prefix: legacyKey, token: BLOB_TOKEN })).blobs.filter((b) => b.pathname === legacyKey).map((b) => b.url);
      if (stale.length || legacy.length) await del([...stale, ...legacy], { token: BLOB_TOKEN });
    } catch (err) {
      console.error(`Pruning old versions of ${file} failed`, err);
    }
    return;
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, file), body);
}

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "editor";
  passwordHash: string;
  createdAt: string;
  resetTokenHash?: string;
  resetTokenExpiry?: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  phone?: string;
  image?: string;
  order: number;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  status: "published" | "draft";
  metaTitle: string;
  metaDesc: string;
  content: string;
  updatedAt: string;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  items: unknown[];
  createdAt: string;
  status: "new" | "read" | "replied";
};

// ── Admins ─────────────────────────────────────────────────────────────────

export const admins = {
  list: () => readStore<AdminUser[]>("admins.json", []),
  findByEmail: async (email: string) => (await admins.list()).find(a => a.email === email),
  findById: async (id: string) => (await admins.list()).find(a => a.id === id),
  save: (all: AdminUser[]) => writeStore("admins.json", all),
  create: async (data: Omit<AdminUser, "id" | "createdAt">) => {
    const all = await admins.list();
    const item: AdminUser = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    all.push(item);
    await admins.save(all);
    return item;
  },
  update: async (id: string, data: Partial<AdminUser>) => {
    const all = (await admins.list()).map(a => a.id === id ? { ...a, ...data } : a);
    await admins.save(all);
  },
  delete: async (id: string) => {
    await admins.save((await admins.list()).filter(a => a.id !== id));
  },
};

// ── Team ───────────────────────────────────────────────────────────────────

export const team = {
  list: async () => (await readStore<TeamMember[]>("team.json", [])).sort((a, b) => a.order - b.order),
  save: (all: TeamMember[]) => writeStore("team.json", all),
  create: async (data: Omit<TeamMember, "id">) => {
    const all = await team.list();
    const item: TeamMember = { ...data, id: Date.now().toString() };
    all.push(item);
    await team.save(all);
    return item;
  },
  update: async (id: string, data: Partial<TeamMember>) => {
    await team.save((await team.list()).map(m => m.id === id ? { ...m, ...data } : m));
  },
  delete: async (id: string) => {
    await team.save((await team.list()).filter(m => m.id !== id));
  },
};

// ── Pages ──────────────────────────────────────────────────────────────────

export const pages = {
  list: () => readStore<Page[]>("pages.json", []),
  findById: async (id: string) => (await pages.list()).find(p => p.id === id),
  save: (all: Page[]) => writeStore("pages.json", all),
  update: async (id: string, data: Partial<Page>) => {
    await pages.save((await pages.list()).map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  },
};

// ── Products ────────────────────────────────────────────────────────────────

export type ClassicProduct = { id: string; name: string; desc: string; tag: string; image: string; sku?: string };
export type ClassicCategory = { id: string; name: string; intro: string; products: ClassicProduct[] };
export type SignatureCategory = { id: string; n: string; name: string; quote: string; body: string; img: string; img2: string; imgAlt: string; flip: boolean; doubleImg: boolean };
export type ProductsData = { classic: ClassicCategory[]; signature: SignatureCategory[] };

const EMPTY_PRODUCTS: ProductsData = { classic: [], signature: [] };

export const products = {
  get: (): Promise<ProductsData> => readStore<ProductsData>("products.json", EMPTY_PRODUCTS),
  save: (data: ProductsData) => writeStore("products.json", data),
  updateClassicCategory: async (catId: string, data: Partial<ClassicCategory>) => {
    const all = await products.get();
    all.classic = all.classic.map(c => c.id === catId ? { ...c, ...data } : c);
    await products.save(all);
  },
  updateClassicProduct: async (catId: string, productId: string, data: Partial<ClassicProduct>) => {
    const all = await products.get();
    all.classic = all.classic.map(c => c.id === catId
      ? { ...c, products: c.products.map(p => p.id === productId ? { ...p, ...data } : p) }
      : c);
    await products.save(all);
  },
  addClassicProduct: async (catId: string, product: Omit<ClassicProduct, "id">) => {
    const all = await products.get();
    const cat = all.classic.find(c => c.id === catId);
    const sku = product.sku || makeSku(catId, cat ? cat.products.length : 0);
    const newProduct = { ...product, sku, id: `${catId}-${Date.now()}` };
    all.classic = all.classic.map(c => c.id === catId ? { ...c, products: [...c.products, newProduct] } : c);
    await products.save(all);
  },
  deleteClassicProduct: async (catId: string, productId: string) => {
    const all = await products.get();
    all.classic = all.classic.map(c => c.id === catId
      ? { ...c, products: c.products.filter(p => p.id !== productId) }
      : c);
    await products.save(all);
  },
  updateSignatureCategory: async (catId: string, data: Partial<SignatureCategory>) => {
    const all = await products.get();
    all.signature = all.signature.map(c => c.id === catId ? { ...c, ...data } : c);
    await products.save(all);
  },
};

// ── Settings ───────────────────────────────────────────────────────────────

export type Settings = {
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDesc: string;
  ogImage: string;
  twitterHandle: string;
  googleVerification: string;
  analyticsEmbedUrl: string;
  robotsTxt: string;
};

const DEFAULT_SETTINGS: Settings = {
  siteName: "", siteUrl: "", defaultMetaTitle: "", defaultMetaDesc: "", ogImage: "",
  twitterHandle: "", googleVerification: "",
  analyticsEmbedUrl: "", robotsTxt: "",
};

export const settings = {
  get: (): Promise<Settings> => readStore<Settings>("settings.json", DEFAULT_SETTINGS),
  update: async (data: Partial<Settings>) => {
    const current = await settings.get();
    await writeStore("settings.json", { ...current, ...data });
  },
};

// ── Company details ──────────────────────────────────────────────────────────
// One source of truth for legal + contact + bank info, reflected on the website
// footer and the printed/PDF quotations.
export type Company = {
  name: string;
  abn: string;
  acn: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  location: string;
  bankName: string;
  bankAccountName: string;
  bankBsb: string;
  bankAccount: string;
};

export const DEFAULT_COMPANY: Company = {
  name: "Atelier Supply Group Pty Ltd",
  abn: "ABN 99 696 292 001",
  acn: "ACN 696 292 001",
  email: "info@ateliersupplygroup.com.au",
  phone: "+61 449 513 614",
  website: "ateliersupplygroup.com.au",
  instagram: "@ateliersupplygroup",
  location: "Sydney based · Delivering Australia Wide",
  bankName: "",
  bankAccountName: "Atelier Supply Group Pty Ltd",
  bankBsb: "",
  bankAccount: "",
};

export const company = {
  get: async (): Promise<Company> => ({ ...DEFAULT_COMPANY, ...(await readStore<Partial<Company>>("company.json", {})) }),
  update: async (data: Partial<Company>) => {
    const current = await company.get();
    await writeStore("company.json", { ...current, ...data });
  },
};

// ── Download leads (gated resource form captures) ────────────────────────────
// One record per file/blob. A single shared JSON array would lose captures when
// two visitors submit at once (read-then-write races against Blob's eventual
// consistency), so each lead is written to its own key.
export type Lead = {
  id: string;
  name: string;
  email: string;
  resource: string;   // which gated file they requested
  createdAt: string;
};

const LEAD_PREFIX = "leads/";
const LEAD_DIR = path.join(DATA_DIR, "leads");

async function readOneLead(url: string): Promise<Lead | null> {
  try {
    const bust = `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;
    const res = await fetch(bust, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Lead;
  } catch {
    return null;
  }
}

export const leads = {
  list: async (): Promise<Lead[]> => {
    let items: Lead[] = [];
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(LEAD_PREFIX);
      const loaded = await Promise.all(blobs.map(b => readOneLead(b.url)));
      items = loaded.filter((l): l is Lead => !!l);
    } else if (fs.existsSync(LEAD_DIR)) {
      items = fs.readdirSync(LEAD_DIR)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(LEAD_DIR, f), "utf-8")) as Lead);
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  add: async (data: Omit<Lead, "id" | "createdAt">) => {
    const item: Lead = { ...data, id: uid(), createdAt: new Date().toISOString() };
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(LEAD_PREFIX, item.id, body);
    } else {
      if (!fs.existsSync(LEAD_DIR)) fs.mkdirSync(LEAD_DIR, { recursive: true });
      fs.writeFileSync(path.join(LEAD_DIR, `${item.id}.json`), body);
    }
    return item;
  },
  /** Write one record as-is (used when restoring a backup). */
  put: async (item: Lead) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(LEAD_PREFIX, item.id, body);
    } else {
      if (!fs.existsSync(LEAD_DIR)) fs.mkdirSync(LEAD_DIR, { recursive: true });
      fs.writeFileSync(path.join(LEAD_DIR, `${item.id}.json`), body);
    }
  },
  remove: async (id: string) => {
    if (USE_BLOB) {
      await removeRecordBlob(LEAD_PREFIX, id);
    } else {
      const p = path.join(LEAD_DIR, `${id}.json`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  },
};

// ── Custom Classic categories (created in Admin > Categories) ────────────────
// One record per file/blob. A shared JSON file would serve stale reads for a few
// seconds after each write, so "create then immediately edit" could fail or
// silently undo a change. Writes here never depend on a prior read.
const CAT_PREFIX = "categories/";
const CAT_DIR = path.join(DATA_DIR, "categories");

async function readCategoryBlob(url: string): Promise<CustomCategory | null> {
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as CustomCategory) : null;
  } catch {
    return null;
  }
}

export const customCategories = {
  list: async (): Promise<CustomCategory[]> => {
    let items: CustomCategory[] = [];
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(CAT_PREFIX);
      items = (await Promise.all(blobs.map((b) => readCategoryBlob(b.url)))).filter((c): c is CustomCategory => !!c);
    } else if (fs.existsSync(CAT_DIR)) {
      items = fs.readdirSync(CAT_DIR).filter((f) => f.endsWith(".json"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(CAT_DIR, f), "utf-8")) as CustomCategory);
    }
    return items.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  },
  exists: async (slug: string): Promise<boolean> => {
    if (USE_BLOB) return await recordExists(CAT_PREFIX, slug);
    return fs.existsSync(path.join(CAT_DIR, `${slug}.json`));
  },
  /** Writes the whole record for one category. */
  put: async (item: CustomCategory) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(CAT_PREFIX, item.slug, body);
    } else {
      if (!fs.existsSync(CAT_DIR)) fs.mkdirSync(CAT_DIR, { recursive: true });
      fs.writeFileSync(path.join(CAT_DIR, `${item.slug}.json`), body);
    }
  },
  remove: async (slug: string) => {
    if (USE_BLOB) {
      await removeRecordBlob(CAT_PREFIX, slug);
    } else {
      const f = path.join(CAT_DIR, `${slug}.json`);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  },
};

// ── Journal posts ────────────────────────────────────────────────────────────
// One record per post, like categories: a post can be created and edited again
// straight away without a stale read wiping the change.
const POST_PREFIX = "journal/";
const POST_DIR = path.join(DATA_DIR, "journal");

async function readPostBlob(url: string): Promise<JournalPost | null> {
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as JournalPost) : null;
  } catch {
    return null;
  }
}

export const journal = {
  list: async (): Promise<JournalPost[]> => {
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(POST_PREFIX);
      return (await Promise.all(blobs.map((b) => readPostBlob(b.url)))).filter((p): p is JournalPost => !!p);
    }
    if (!fs.existsSync(POST_DIR)) return [];
    return fs.readdirSync(POST_DIR).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(POST_DIR, f), "utf-8")) as JournalPost);
  },
  exists: async (slug: string): Promise<boolean> => {
    if (USE_BLOB) return await recordExists(POST_PREFIX, slug);
    return fs.existsSync(path.join(POST_DIR, `${slug}.json`));
  },
  /** One post, or null if there is no such address. */
  get: async (slug: string): Promise<JournalPost | null> => {
    if (USE_BLOB) {
      const match = await newestRecordBlob(POST_PREFIX, slug);
      return match ? await readPostBlob(match.url) : null;
    }
    const f = path.join(POST_DIR, `${slug}.json`);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf-8")) as JournalPost) : null;
  },
  /** Writes the whole record for one post. */
  put: async (item: JournalPost) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(POST_PREFIX, item.slug, body);
    } else {
      if (!fs.existsSync(POST_DIR)) fs.mkdirSync(POST_DIR, { recursive: true });
      fs.writeFileSync(path.join(POST_DIR, `${item.slug}.json`), body);
    }
  },
  remove: async (slug: string) => {
    if (USE_BLOB) {
      await removeRecordBlob(POST_PREFIX, slug);
    } else {
      const f = path.join(POST_DIR, `${slug}.json`);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  },
};

// ── Projects ─────────────────────────────────────────────────────────────────
// One record per project, same shape as the journal.
const PROJECT_PREFIX = "projects/";
const PROJECT_DIR = path.join(DATA_DIR, "projects");

async function readProjectBlob(url: string): Promise<Project | null> {
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Project) : null;
  } catch {
    return null;
  }
}

export const projects = {
  list: async (): Promise<Project[]> => {
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(PROJECT_PREFIX);
      return (await Promise.all(blobs.map((b) => readProjectBlob(b.url)))).filter((p): p is Project => !!p);
    }
    if (!fs.existsSync(PROJECT_DIR)) return [];
    return fs.readdirSync(PROJECT_DIR).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, f), "utf-8")) as Project);
  },
  exists: async (slug: string): Promise<boolean> => {
    if (USE_BLOB) return await recordExists(PROJECT_PREFIX, slug);
    return fs.existsSync(path.join(PROJECT_DIR, `${slug}.json`));
  },
  get: async (slug: string): Promise<Project | null> => {
    if (USE_BLOB) {
      const match = await newestRecordBlob(PROJECT_PREFIX, slug);
      return match ? await readProjectBlob(match.url) : null;
    }
    const f = path.join(PROJECT_DIR, `${slug}.json`);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf-8")) as Project) : null;
  },
  put: async (item: Project) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(PROJECT_PREFIX, item.slug, body);
    } else {
      if (!fs.existsSync(PROJECT_DIR)) fs.mkdirSync(PROJECT_DIR, { recursive: true });
      fs.writeFileSync(path.join(PROJECT_DIR, `${item.slug}.json`), body);
    }
  },
  remove: async (slug: string) => {
    if (USE_BLOB) {
      await removeRecordBlob(PROJECT_PREFIX, slug);
    } else {
      const f = path.join(PROJECT_DIR, `${slug}.json`);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  },
};

// ── Custom pages ─────────────────────────────────────────────────────────────
// Standalone pages you create yourself. One record per page.
const CPAGE_PREFIX = "custom-pages/";
const CPAGE_DIR = path.join(DATA_DIR, "custom-pages");

async function readCustomPageBlob(url: string): Promise<CustomPage | null> {
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as CustomPage) : null;
  } catch {
    return null;
  }
}

export const customPages = {
  list: async (): Promise<CustomPage[]> => {
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(CPAGE_PREFIX);
      return (await Promise.all(blobs.map((b) => readCustomPageBlob(b.url)))).filter((p): p is CustomPage => !!p);
    }
    if (!fs.existsSync(CPAGE_DIR)) return [];
    return fs.readdirSync(CPAGE_DIR).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(CPAGE_DIR, f), "utf-8")) as CustomPage);
  },
  exists: async (slug: string): Promise<boolean> => {
    if (USE_BLOB) return await recordExists(CPAGE_PREFIX, slug);
    return fs.existsSync(path.join(CPAGE_DIR, `${slug}.json`));
  },
  get: async (slug: string): Promise<CustomPage | null> => {
    if (USE_BLOB) {
      const match = await newestRecordBlob(CPAGE_PREFIX, slug);
      return match ? await readCustomPageBlob(match.url) : null;
    }
    const f = path.join(CPAGE_DIR, `${slug}.json`);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf-8")) as CustomPage) : null;
  },
  put: async (item: CustomPage) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(CPAGE_PREFIX, item.slug, body);
    } else {
      if (!fs.existsSync(CPAGE_DIR)) fs.mkdirSync(CPAGE_DIR, { recursive: true });
      fs.writeFileSync(path.join(CPAGE_DIR, `${item.slug}.json`), body);
    }
  },
  remove: async (slug: string) => {
    if (USE_BLOB) {
      await removeRecordBlob(CPAGE_PREFIX, slug);
    } else {
      const f = path.join(CPAGE_DIR, `${slug}.json`);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  },
};

// ── Analytics ────────────────────────────────────────────────────────────────
// One blob per page view under analytics/<day>/, so concurrent visits never
// overwrite each other. Once a day is over its views are rolled up into a
// single summary at analytics-daily/<day> and the raw records are removed.
const VIEW_PREFIX = "analytics/";
const DAILY_PREFIX = "analytics-daily/";
const VIEW_DIR = path.join(DATA_DIR, "analytics");
const DAILY_DIR = path.join(DATA_DIR, "analytics-daily");

async function readJsonBlob<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export const analytics = {
  /** Record one page view. Never reads first, so it cannot lose a count. */
  track: async (day: string, event: ViewEvent) => {
    const body = JSON.stringify(event);
    if (USE_BLOB) {
      await put(`${VIEW_PREFIX}${day}/${versionName()}`, body, {
        access: "public", token: BLOB_TOKEN, addRandomSuffix: false, contentType: "application/json",
      });
    } else {
      const dir = path.join(VIEW_DIR, day);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, versionName()), body);
    }
  },

  /** The raw views recorded for one day. */
  rawDay: async (day: string): Promise<ViewEvent[]> => {
    if (USE_BLOB) {
      const blobs = await allBlobs(`${VIEW_PREFIX}${day}/`);
      return (await Promise.all(blobs.map((b) => readJsonBlob<ViewEvent>(b.url)))).filter((e): e is ViewEvent => !!e);
    }
    const dir = path.join(VIEW_DIR, day);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as ViewEvent);
  },

  /** Days that still have raw views waiting to be rolled up. */
  rawDays: async (): Promise<string[]> => {
    if (USE_BLOB) {
      const days = new Set<string>();
      for (const b of await allBlobs(VIEW_PREFIX)) {
        const rest = b.pathname.slice(VIEW_PREFIX.length);
        const slash = rest.indexOf("/");
        if (slash > 0) days.add(rest.slice(0, slash));
      }
      return [...days].sort();
    }
    if (!fs.existsSync(VIEW_DIR)) return [];
    return fs.readdirSync(VIEW_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  },

  /** Stored summaries, newest last. */
  summaries: async (): Promise<DaySummary[]> => {
    let items: DaySummary[] = [];
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(DAILY_PREFIX);
      items = (await Promise.all(blobs.map((b) => readJsonBlob<DaySummary>(b.url)))).filter((d): d is DaySummary => !!d);
    } else if (fs.existsSync(DAILY_DIR)) {
      items = fs.readdirSync(DAILY_DIR).filter((f) => f.endsWith(".json"))
        .map((f) => JSON.parse(fs.readFileSync(path.join(DAILY_DIR, f), "utf-8")) as DaySummary);
    }
    return items.sort((a, b) => a.day.localeCompare(b.day));
  },

  putSummary: async (summary: DaySummary) => {
    const body = JSON.stringify(summary, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(DAILY_PREFIX, summary.day, body);
    } else {
      if (!fs.existsSync(DAILY_DIR)) fs.mkdirSync(DAILY_DIR, { recursive: true });
      fs.writeFileSync(path.join(DAILY_DIR, `${summary.day}.json`), body);
    }
  },

  /** Drop the raw views for a day once it has been summarised. */
  clearRaw: async (day: string) => {
    if (USE_BLOB) {
      const urls = (await allBlobs(`${VIEW_PREFIX}${day}/`)).map((b) => b.url);
      if (urls.length) await del(urls, { token: BLOB_TOKEN });
    } else {
      const dir = path.join(VIEW_DIR, day);
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }
  },
};

// ── Image slots (CMS placeholders) ───────────────────────────────────────────
// slotKey -> uploaded image URL, stored ONE SLOT PER FILE/BLOB. A shared map
// would lose uploads dropped in quick succession (each save re-read a stale
// map). A slot with no record is an unfilled placeholder: hidden on the live
// site, shown as a plain beige tile in the admin.
const IMG_PREFIX = "images/";
const IMG_DIR = path.join(DATA_DIR, "images");
const slotFile = (key: string) => `${encodeURIComponent(key)}.json`;
/** The record name for one slot: the encoded key, without the .json. */
const slotKeyName = (key: string) => encodeURIComponent(key);

export const images = {
  get: async (): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(IMG_PREFIX);
      await Promise.all(blobs.map(async (b) => {
        try {
          const res = await fetch(`${b.url}${b.url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) return;
          const rec = (await res.json()) as { key: string; url: string };
          if (rec?.key && rec.url) out[rec.key] = rec.url;
        } catch { /* skip unreadable record */ }
      }));
    } else if (fs.existsSync(IMG_DIR)) {
      for (const f of fs.readdirSync(IMG_DIR).filter((n) => n.endsWith(".json"))) {
        const rec = JSON.parse(fs.readFileSync(path.join(IMG_DIR, f), "utf-8")) as { key: string; url: string };
        if (rec?.key && rec.url) out[rec.key] = rec.url;
      }
    }
    return out;
  },
  /** Set slots; an empty string clears that slot. Never reads before writing. */
  update: async (patch: Record<string, string>) => {
    await Promise.all(Object.entries(patch).map(async ([key, url]) => {
      const slot = slotKeyName(key);
      if (USE_BLOB) {
        if (url) await putRecordBlob(IMG_PREFIX, slot, JSON.stringify({ key, url }));
        else await removeRecordBlob(IMG_PREFIX, slot);
      } else {
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
        const f = path.join(IMG_DIR, slotFile(key));
        if (url) fs.writeFileSync(f, JSON.stringify({ key, url }));
        else if (fs.existsSync(f)) fs.unlinkSync(f);
      }
    }));
  },
};

// ── Joinery Bot settings (SERVER-ONLY - never send to client-side code) ───────
// Margin factor, FX guard band, and the six-component landed-logistics
// benchmark defaults (all AUD). Used to price supplier joinery quotes.
export type JoinerySettings = {
  marginFactor: number;        // e.g. 1.6 → supplier USD × rate × 1.6
  fxSanityBandPct: number;     // reject a fetched rate outside ±this% of lastRate
  lastRate: number;            // last accepted USD→AUD rate (for the guard band)
  gstRate: number;             // 0.10
  // Six-component landed-logistics benchmarks (AUD), pre-filled per run:
  logChinaLegFob: number;      // FOB: consolidation/origin contingency only
  logChinaLegExw: number;      // EXW: full origin leg
  logQaInspection: number;     // China QA/QC pre-shipment inspection + photo report
  logOceanFreight: number;     // FCL S.China → Sydney (40ft benchmark)
  logAuPortTerminal: number;   // Port Botany THC, wharfage, levies, security
  logCustomsStatutory: number; // import processing + biosecurity (duty 0% under ChAFTA w/ DOO)
  logBrokerageDelivery: number;// broker fees + wharf cartage + unpack/deliver
};

export const DEFAULT_JOINERY_SETTINGS: JoinerySettings = {
  marginFactor: 1.6,
  fxSanityBandPct: 10,
  lastRate: 1.52,
  gstRate: 0.1,
  logChinaLegFob: 350,
  logChinaLegExw: 1400,
  logQaInspection: 450,
  logOceanFreight: 4200,
  logAuPortTerminal: 1250,
  logCustomsStatutory: 320,
  logBrokerageDelivery: 1650,
};

export const joinerySettings = {
  get: async (): Promise<JoinerySettings> => ({ ...DEFAULT_JOINERY_SETTINGS, ...(await readStore<Partial<JoinerySettings>>("joinery-settings.json", {})) }),
  update: async (data: Partial<JoinerySettings>) => {
    const current = await joinerySettings.get();
    await writeStore("joinery-settings.json", { ...current, ...data });
  },
};

// ── Editable site content (CMS overrides) ───────────────────────────────────
// A flat map of contentKey -> override string. Any key not present here falls
// back to the code default in content-registry.ts, so the site renders
// unchanged until an editor overrides a value in the admin.
export const content = {
  get: (): Promise<Record<string, string>> => readStore<Record<string, string>>("content.json", {}),
  // Replace the entire override map. The admin always sends the complete set of
  // non-default values, so a field reset (omitted here) is correctly cleared.
  set: async (data: Record<string, string>) => {
    await writeStore("content.json", data);
  },
};

// ── Product catalog overrides (structured CMS) ──────────────────────────────
// Keyed by `${category}/${slug}`; each value is a partial product with only the
// overridden fields. Merged over the code catalog at render time.
export const productContent = {
  get: (): Promise<Record<string, Record<string, unknown>>> =>
    readStore<Record<string, Record<string, unknown>>>("product-content.json", {}),
  set: async (data: Record<string, Record<string, unknown>>) => {
    await writeStore("product-content.json", data);
  },
};

// ── Quotes ──────────────────────────────────────────────────────────────────
export type QuoteItem = { name: string; description: string; qty: number; unitPrice: number };
export type Quote = {
  id: string;
  number: string;
  status: "draft" | "sent" | "accepted" | "declined";
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  projectAddress: string;
  items: QuoteItem[];
  notes: string;
  taxRate: number;
  sourceSubmissionId?: string;
  createdAt: string;
};

export const quotes = {
  list: async (): Promise<Quote[]> => (await readStore<Quote[]>("quotes.json", [])).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  save: (all: Quote[]) => writeStore("quotes.json", all),
  findById: async (id: string) => (await quotes.list()).find((q) => q.id === id),
  create: async (data: Omit<Quote, "id" | "createdAt" | "number">) => {
    const all = await quotes.list();
    const maxNum = all.reduce((m, q) => Math.max(m, parseInt((q.number || "").replace(/\D/g, "")) || 1000), 1000);
    const item: Quote = { ...data, id: uid(), number: `Q-${maxNum + 1}`, createdAt: new Date().toISOString() };
    await quotes.save([item, ...all]);
    return item;
  },
  update: async (id: string, data: Partial<Quote>) => {
    const all = await quotes.list();
    await quotes.save(all.map((q) => (q.id === id ? { ...q, ...data } : q)));
  },
  remove: async (id: string) => {
    const all = await quotes.list();
    await quotes.save(all.filter((q) => q.id !== id));
  },
};

// ── vCards ─────────────────────────────────────────────────────────────────

export type VCard = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
  linkedin: string;
  createdAt: string;
};

export const vcards = {
  list: () => readStore<VCard[]>("vcards.json", []),
  findById: async (id: string) => (await vcards.list()).find(v => v.id === id),
  save: (all: VCard[]) => writeStore("vcards.json", all),
  create: async (data: Omit<VCard, "id" | "createdAt">) => {
    const all = await vcards.list();
    const item: VCard = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    all.push(item);
    await vcards.save(all);
    return item;
  },
  update: async (id: string, data: Partial<VCard>) => {
    await vcards.save((await vcards.list()).map(v => v.id === id ? { ...v, ...data } : v));
  },
  delete: async (id: string) => {
    await vcards.save((await vcards.list()).filter(v => v.id !== id));
  },
};

// ── Submissions ──────────────────────────────────────────────────────────────
// Stored append-only: one blob (or file) per submission. This avoids the
// read-modify-write race of a shared JSON array, where two enquiries arriving
// within Blob's propagation window could clobber each other.

const SUB_PREFIX = "submissions/";
const SUB_DIR = path.join(DATA_DIR, "submissions");

async function readOneSubmission(url: string): Promise<Submission | null> {
  try {
    const bust = `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;
    const res = await fetch(bust, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Submission) : null;
  } catch {
    return null;
  }
}

export const submissions = {
  list: async (): Promise<Submission[]> => {
    let items: Submission[] = [];
    if (USE_BLOB) {
      const blobs = await newestRecordBlobs(SUB_PREFIX);
      const loaded = await Promise.all(blobs.map(b => readOneSubmission(b.url)));
      items = loaded.filter((s): s is Submission => !!s);
    } else if (fs.existsSync(SUB_DIR)) {
      items = fs.readdirSync(SUB_DIR)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(SUB_DIR, f), "utf-8")) as Submission);
    } else if (fs.existsSync(path.join(DATA_DIR, "submissions.json"))) {
      // Legacy single-file fallback (pre-migration data)
      items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "submissions.json"), "utf-8"));
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  create: async (data: Omit<Submission, "id" | "createdAt" | "status">) => {
    const item: Submission = { ...data, id: uid(), createdAt: new Date().toISOString(), status: "new" };
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(SUB_PREFIX, item.id, body);
    } else {
      if (!fs.existsSync(SUB_DIR)) fs.mkdirSync(SUB_DIR, { recursive: true });
      fs.writeFileSync(path.join(SUB_DIR, `${item.id}.json`), body);
    }
    return item;
  },
  update: async (id: string, data: Partial<Submission>) => {
    // Read just this submission's own blob/file - don't depend on a full-list read
    let item: Submission | null = null;
    if (USE_BLOB) {
      const match = await newestRecordBlob(SUB_PREFIX, id);
      if (match) item = await readOneSubmission(match.url);
    } else {
      const p = path.join(SUB_DIR, `${id}.json`);
      if (fs.existsSync(p)) item = JSON.parse(fs.readFileSync(p, "utf-8"));
    }
    if (!item) return;
    const body = JSON.stringify({ ...item, ...data }, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(SUB_PREFIX, id, body);
    } else {
      if (!fs.existsSync(SUB_DIR)) fs.mkdirSync(SUB_DIR, { recursive: true });
      fs.writeFileSync(path.join(SUB_DIR, `${id}.json`), body);
    }
  },
  /** Write one record as-is (used when restoring a backup). */
  put: async (item: Submission) => {
    const body = JSON.stringify(item, null, 2);
    if (USE_BLOB) {
      await putRecordBlob(SUB_PREFIX, item.id, body);
    } else {
      if (!fs.existsSync(SUB_DIR)) fs.mkdirSync(SUB_DIR, { recursive: true });
      fs.writeFileSync(path.join(SUB_DIR, `${item.id}.json`), body);
    }
  },
  remove: async (id: string) => submissions.delete(id),
  delete: async (id: string) => {
    if (USE_BLOB) {
      const { blobs } = await list({ prefix: `${SUB_PREFIX}${id}.json`, token: BLOB_TOKEN });
      const match = blobs.find(b => b.pathname === `${SUB_PREFIX}${id}.json`);
      if (match) await del(match.url, { token: BLOB_TOKEN });
    } else {
      const p = path.join(SUB_DIR, `${id}.json`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  },
};
