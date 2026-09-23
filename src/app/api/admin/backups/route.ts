import { NextRequest, NextResponse } from "next/server";
import { ALL_SCOPES, createBackup, deleteBackup, listBackups, readBackup, restoreBackup, type Scope } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET            -> list backups
// GET ?id=...    -> one backup's contents (for a preview / download)
// POST           -> take a backup now
// PATCH {id}     -> restore (optionally only some scopes)
// DELETE {id}    -> remove one backup
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json(await listBackups());
  const backup = await readBackup(id);
  if (!backup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(backup);
}

export async function POST(req: NextRequest) {
  const { label } = await req.json().catch(() => ({ label: "" }));
  const meta = await createBackup({ kind: "manual", label: String(label || "Manual backup") });
  return NextResponse.json(meta);
}

export async function PATCH(req: NextRequest) {
  const { id, scopes } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing backup id" }, { status: 400 });
  const wanted = Array.isArray(scopes) ? (scopes.filter((s: string) => (ALL_SCOPES as string[]).includes(s)) as Scope[]) : undefined;
  try {
    const result = await restoreBackup(String(id), wanted);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Restore failed", err);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing backup id" }, { status: 400 });
  await deleteBackup(String(id));
  return NextResponse.json({ ok: true });
}
