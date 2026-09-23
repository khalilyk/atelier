import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { RESOURCES, verifyToken } from "@/lib/download-token";

export const dynamic = "force-dynamic";

// Streams a gated PDF, but only for a valid, unexpired token. The files live in
// private/downloads (outside /public) so there is no direct URL to share.
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const res = RESOURCES[resource];
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!verifyToken(resource, token)) {
    return NextResponse.json(
      { error: "This download link is invalid or has expired. Please request the file again." },
      { status: 403 },
    );
  }

  try {
    const file = path.join(process.cwd(), "private", "downloads", res.file);
    const data = await fs.readFile(file);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(data.byteLength),
        "Content-Disposition": `attachment; filename="${res.filename}"`,
        // Never let a CDN or browser cache a tokenised response.
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Gated download read failed", err);
    return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  }
}
