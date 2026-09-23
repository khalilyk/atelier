import { NextRequest, NextResponse } from "next/server";
import { dailyBackup } from "@/lib/blob-backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily backup, run by the Vercel cron in vercel.json. Vercel sends
// `Authorization: Bearer $CRON_SECRET`; without a matching secret this does
// nothing, so the URL is useless to anyone else.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { backup, pruned } = await dailyBackup();
    return NextResponse.json({ ok: true, id: backup.id, scopes: backup.scopes.length, size: backup.size, pruned });
  } catch (err) {
    console.error("Daily backup failed", err);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
