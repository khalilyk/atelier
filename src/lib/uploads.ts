import fs from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const USE_BLOB = !!BLOB_TOKEN;

// Save an uploaded image. Returns a URL usable in <img>/next Image.
// Vercel Blob in production (returns absolute blob URL); local /uploads in dev.
export async function saveUpload(file: File, prefix = "upload"): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${prefix}-${Date.now()}-${safe}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (USE_BLOB) {
    const blob = await put(`uploads/${filename}`, bytes, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: file.type || undefined,
    });
    return blob.url;
  }

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

export type MediaFile = { name: string; url: string; size: number; modifiedAt: string };

// List uploaded media (newest first).
export async function listUploads(): Promise<MediaFile[]> {
  if (USE_BLOB) {
    const { blobs } = await list({ prefix: "uploads/", token: BLOB_TOKEN });
    return blobs
      .map(b => ({
        name: b.pathname.replace(/^uploads\//, ""),
        url: b.url,
        size: b.size,
        modifiedAt: b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : String(b.uploadedAt),
      }))
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  if (!fs.existsSync(UPLOADS_DIR)) return [];
  return fs.readdirSync(UPLOADS_DIR)
    .map(name => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, name));
      return { name, url: `/uploads/${name}`, size: stat.size, modifiedAt: stat.mtime.toISOString() };
    })
    .reverse();
}

// Delete an uploaded media file by its name or URL.
export async function deleteUpload(nameOrUrl: string): Promise<void> {
  if (USE_BLOB) {
    // Blob deletes by URL; if given a bare name, resolve it via list.
    if (/^https?:\/\//.test(nameOrUrl)) {
      await del(nameOrUrl, { token: BLOB_TOKEN });
      return;
    }
    const { blobs } = await list({ prefix: `uploads/${nameOrUrl}`, token: BLOB_TOKEN });
    const match = blobs.find(b => b.pathname === `uploads/${nameOrUrl}`);
    if (match) await del(match.url, { token: BLOB_TOKEN });
    return;
  }
  const filePath = path.join(UPLOADS_DIR, nameOrUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
