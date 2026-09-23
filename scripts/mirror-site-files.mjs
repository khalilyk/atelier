// Copies the site's own files (public/ and the gated downloads) into Blob, so
// the photography and PDFs have a second home alongside GitHub and are covered
// by the same storage everything else lives in.
//
//   node scripts/mirror-site-files.mjs          # copy anything new or changed
//   node scripts/mirror-site-files.mjs --prune  # also remove copies of files
//                                                 that no longer exist locally
import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const PREFIX = "site-files/";
// public/uploads already lives in Blob; there is no point copying it twice.
const SOURCES = [
  { dir: path.join(ROOT, "public"), skip: ["uploads"] },
  { dir: path.join(ROOT, "private", "downloads"), skip: [] },
];
const MAX_BYTES = 100 * 1024 * 1024;

function token() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const line = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8")
      .split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="));
    if (line) return line.slice("BLOB_READ_WRITE_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
  } catch { /* no local env file */ }
  return "";
}

const log = (msg) => console.log(`${new Date().toISOString()}  ${msg}`);

/** Every file under a directory, as paths relative to it. */
function walk(dir, skip = [], base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skip.includes(path.relative(base, full))) continue;
      out.push(...walk(full, skip, base));
    } else {
      out.push(full);
    }
  }
  return out;
}

const fingerprint = (file) => {
  const s = fs.statSync(file);
  return crypto.createHash("sha1").update(`${s.size}:${Math.round(s.mtimeMs)}`).digest("hex").slice(0, 16);
};

async function main() {
  const BLOB_TOKEN = token();
  if (!BLOB_TOKEN) { log("ERROR: BLOB_READ_WRITE_TOKEN not found (.env.local)"); process.exit(1); }

  // What is already up there, so unchanged files are left alone.
  const existing = new Map();
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, token: BLOB_TOKEN, cursor, limit: 1000 });
    for (const b of page.blobs) existing.set(b.pathname, b);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  let manifest = {};
  const manifestKey = `${PREFIX}_manifest.json`;
  const manifestBlob = existing.get(manifestKey);
  if (manifestBlob) {
    try {
      const res = await fetch(`${manifestBlob.url}?cb=${Date.now()}`, { cache: "no-store" });
      if (res.ok) manifest = await res.json();
    } catch { /* start from scratch */ }
  }

  const seen = new Set();
  let copied = 0, skipped = 0, failed = 0, bytes = 0;

  for (const { dir, skip } of SOURCES) {
    const from = dir.startsWith(path.join(ROOT, "private")) ? "private/downloads" : "public";
    for (const file of walk(dir, skip)) {
      const rel = `${from}/${path.relative(dir, file).split(path.sep).join("/")}`;
      const key = `${PREFIX}${rel}`;
      seen.add(key);

      const stat = fs.statSync(file);
      if (stat.size > MAX_BYTES) { log(`SKIPPED (too large) ${rel}`); skipped++; continue; }

      const print = fingerprint(file);
      if (manifest[rel] === print && existing.has(key)) { skipped++; continue; }

      try {
        await put(key, fs.readFileSync(file), {
          access: "public", token: BLOB_TOKEN, addRandomSuffix: false,
          allowOverwrite: true, cacheControlMaxAge: 31536000,
        });
        manifest[rel] = print;
        copied++; bytes += stat.size;
      } catch (err) {
        failed++;
        log(`FAILED ${rel}: ${err.message}`);
      }
    }
  }

  if (process.argv.includes("--prune")) {
    const stale = [...existing.keys()].filter((k) => k !== manifestKey && !seen.has(k));
    if (stale.length) {
      await del(stale.map((k) => existing.get(k).url), { token: BLOB_TOKEN });
      for (const k of stale) delete manifest[k.slice(PREFIX.length)];
      log(`Removed ${stale.length} file(s) no longer in the project`);
    }
  }

  await put(manifestKey, JSON.stringify(manifest, null, 2), {
    access: "public", token: BLOB_TOKEN, addRandomSuffix: false,
    allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0,
  });

  log(`Site files: ${copied} copied (${(bytes / 1048576).toFixed(1)} MB), ${skipped} already current${failed ? `, ${failed} FAILED` : ""}`);
}

main().catch((err) => { log(`Mirror failed: ${err.message}`); process.exit(1); });
