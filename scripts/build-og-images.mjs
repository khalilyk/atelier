// Social scrapers will not fetch a multi-megabyte photograph. WhatsApp and
// iMessage give up well under a megabyte and show a blank card instead, which
// is what our pages were doing: the source images are 1-3.5MB each.
//
// This renders a share-sized copy of every image used as an og:image into
// public/og, writes the source -> copy map that src/lib/og.ts reads, and cuts
// the email header banner.
//
// It runs automatically before every build (the prebuild script), so pointing a
// page at a new image cannot leave it serving the full-size original. Work is
// keyed by content hash, so a build where nothing changed costs a fraction of a
// second. Run it by hand with `npm run og` to see the result before committing.
//
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "og");
const MAP_FILE = path.join(ROOT, "src", "lib", "og-map.json");
// Which source each copy was rendered from, so a build can skip the work when
// nothing changed. Keyed by content hash rather than mtime, which a fresh
// checkout rewrites.
const CACHE_FILE = path.join(ROOT, "public", "og", ".cache.json");

// 1200x630 is what Facebook, WhatsApp, LinkedIn and X all read as a large card.
const W = 1200, H = 630;
const BUDGET = 300 * 1024; // comfortably under every scraper's ceiling

/** Every image referenced as an og:image, gathered from the same places the
 *  metadata comes from, so the two cannot drift apart. */
async function sources() {
  const found = new Set();
  const add = (p) => { if (p && p.startsWith("/") && !p.startsWith("/og/")) found.add(decodeURI(p)); };

  // The static defaults and the category/collection art.
  add("/Atelier_Classic.png");
  add("/Atelier_Signature.png");
  add("/Signature Luxe.png");

  // Anything a page or product hands to pageMetadata: walk the source for
  // image fields rather than importing the app's TypeScript.
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(ts|tsx)$/.test(e.name)) continue;
      const src = fs.readFileSync(p, "utf8");
      for (const m of src.matchAll(/["'`](\/[^"'`]+\.(?:png|jpe?g|webp))["'`]/g)) add(m[1]);

      // Product art is written as `${IMG}/...`, so resolve the prefix
      // constants declared in the same file before matching.
      const prefixes = {};
      for (const m of src.matchAll(/const\s+(\w+)\s*=\s*"(\/[^"]*)"\s*;/g)) prefixes[m[1]] = m[2];
      for (const m of src.matchAll(/`\$\{(\w+)\}(\/[^`]+?\.(?:png|jpe?g|webp))`/g)) {
        if (prefixes[m[1]]) add(prefixes[m[1]] + m[2]);
      }
    }
  };
  walk(path.join(ROOT, "src"));

  // Only the ones that actually exist on disk.
  return [...found].filter((p) => fs.existsSync(path.join(ROOT, "public", p)));
}

/** A stable, readable name: the basename plus a short hash of the full path,
 *  so two "home.png" in different folders cannot collide. */
function outName(rel) {
  const base = path.basename(rel).replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const hash = crypto.createHash("sha1").update(rel).digest("hex").slice(0, 6);
  return `${base || "image"}-${hash}.jpg`;
}

async function render(absIn, absOut) {
  // Step the quality down until it fits the budget; these are photographs, so
  // it lands at the first or second try.
  for (const quality of [82, 72, 62, 52]) {
    const buf = await sharp(absIn)
      .resize(W, H, { fit: "cover", position: "attention" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (buf.length <= BUDGET || quality === 52) {
      fs.writeFileSync(absOut, buf);
      return { bytes: buf.length, quality };
    }
  }
}

const list = await sources();
fs.mkdirSync(OUT_DIR, { recursive: true });

const digest = (abs) => crypto.createHash("sha1").update(fs.readFileSync(abs)).digest("hex");
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { /* first run */ }

const map = {};
const next = {};
let built = 0, skipped = 0, saved = 0;
for (const rel of list) {
  const absIn = path.join(ROOT, "public", rel);
  const name = outName(rel);
  const absOut = path.join(OUT_DIR, name);
  const hash = digest(absIn);
  map[rel] = `/og/${name}`;
  next[rel] = hash;

  if (cache[rel] === hash && fs.existsSync(absOut)) { skipped++; continue; }

  const before = fs.statSync(absIn).size;
  const { bytes, quality } = await render(absIn, absOut);
  built++; saved += before - bytes;
  console.log(`  ${(before / 1048576).toFixed(2)}MB -> ${(bytes / 1024).toFixed(0)}KB  q${quality}  ${rel}`);
}

fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + "\n");

// The emails open with the same photograph as the site header, cropped to a
// banner. Mail clients cannot crop, so the file is the shape it is shown at,
// at twice the size for high-density screens.
const HEADER_SRC = "/products/Main Classic.png";
const headerDir = path.join(ROOT, "public", "email");
const headerOut = path.join(headerDir, "header.jpg");
fs.mkdirSync(headerDir, { recursive: true });
const headerHash = digest(path.join(ROOT, "public", HEADER_SRC));
next["email:header"] = headerHash;
if (cache["email:header"] !== headerHash || !fs.existsSync(headerOut)) {
  const headerBuf = await sharp(path.join(ROOT, "public", HEADER_SRC))
    .resize(1240, 480, { fit: "cover", position: "attention" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(headerOut, headerBuf);
  built++;
  console.log(`  email header: ${(headerBuf.length / 1024).toFixed(0)}KB from ${HEADER_SRC}`);
} else {
  skipped++;
}

fs.writeFileSync(CACHE_FILE, JSON.stringify(next, null, 2) + "\n");

// Drop copies whose source is gone.
const keep = new Set(Object.values(map).map((p) => path.basename(p)));
keep.add(".cache.json");
for (const f of fs.readdirSync(OUT_DIR)) if (!keep.has(f)) fs.unlinkSync(path.join(OUT_DIR, f));

console.log(`\n${built} rendered, ${skipped} already current${saved ? `, ${(saved / 1048576).toFixed(1)}MB saved this run` : ""}`);
