#!/usr/bin/env node
// Monthly local backup: downloads EVERYTHING from the live Vercel Blob store
// (admin data, per-record files, uploaded images and the server-side backups)
// into ./backups/<YYYY-MM>/ inside this project, so there is always an offline
// copy on this machine.
//
//   node scripts/backup-local.mjs            # backup into ./backups/<YYYY-MM>/
//   node scripts/backup-local.mjs --keep 24  # keep 24 monthly folders (default 12)
//
// The token is read from .env.local (BLOB_READ_WRITE_TOKEN).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { list } from "@vercel/blob";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(ROOT, "backups");
const keepArg = process.argv.indexOf("--keep");
const KEEP_MONTHS = keepArg > -1 ? Number(process.argv[keepArg + 1]) || 12 : 12;

function token() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const envFile = path.join(ROOT, ".env.local");
  if (fs.existsSync(envFile)) {
    const line = fs.readFileSync(envFile, "utf8").split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="));
    if (line) return line.slice("BLOB_READ_WRITE_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const log = (msg) => {
  const line = `${new Date().toISOString()}  ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(OUT_ROOT, { recursive: true });
    fs.appendFileSync(path.join(OUT_ROOT, "backup.log"), `${line}\n`);
  } catch { /* logging must never break the backup */ }
};


// Versioned writes mean the same name is both a file (the current pointer,
// e.g. data/content.json) and a folder (its versions, data/content.json/<ts>.json).
// A filesystem cannot have both, so a name that has to be both becomes a folder
// with the pointer stored inside it as _current. The manifest keeps the real
// blob pathnames either way.
const POINTER = "_current";

function localPath(root, pathname) {
  const parts = pathname.split("/");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = path.join(cur, parts[i]);
    // An ancestor already written as a file has to become a folder.
    if (fs.existsSync(cur) && fs.statSync(cur).isFile()) {
      const held = fs.readFileSync(cur);
      fs.rmSync(cur);
      fs.mkdirSync(cur, { recursive: true });
      fs.writeFileSync(path.join(cur, POINTER), held);
    }
  }
  const target = path.join(cur, parts[parts.length - 1]);
  // The name is already a folder, so the file belongs inside it.
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) return path.join(target, POINTER);
  return target;
}

async function main() {
  const BLOB_TOKEN = token();
  if (!BLOB_TOKEN) { log("ERROR: BLOB_READ_WRITE_TOKEN not found (.env.local)"); process.exit(1); }

  const stamp = new Date().toISOString().slice(0, 7); // YYYY-MM
  const dir = path.join(OUT_ROOT, stamp);
  fs.mkdirSync(dir, { recursive: true });

  // 1. Everything in the blob store.
  const blobs = [];
  let cursor;
  do {
    const page = await list({ token: BLOB_TOKEN, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  let ok = 0, failed = 0, bytes = 0;
  for (const b of blobs) {
    const target = localPath(dir, b.pathname);
    try {
      const res = await fetch(`${b.url}${b.url.includes("?") ? "&" : "?"}cb=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
      ok++; bytes += buf.length;
    } catch (err) {
      failed++;
      log(`FAILED ${b.pathname}: ${err.message}`);
    }
  }

  // 2. A manifest so the contents can be checked without opening every file.
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({
    createdAt: new Date().toISOString(),
    files: blobs.length, downloaded: ok, failed,
    bytes,
    items: blobs.map((b) => ({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })),
  }, null, 2));

  log(`Backup ${stamp}: ${ok}/${blobs.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB${failed ? `, ${failed} FAILED` : ""} -> ${dir}`);

  // 3. Keep only the most recent months.
  const months = fs.readdirSync(OUT_ROOT)
    .filter((n) => /^\d{4}-\d{2}$/.test(n) && fs.statSync(path.join(OUT_ROOT, n)).isDirectory())
    .sort()
    .reverse();
  for (const old of months.slice(KEEP_MONTHS)) {
    fs.rmSync(path.join(OUT_ROOT, old), { recursive: true, force: true });
    log(`Removed old backup ${old}`);
  }

  if (failed) process.exit(1);
}

main().catch((err) => { log(`ERROR: ${err.stack || err.message}`); process.exit(1); });
