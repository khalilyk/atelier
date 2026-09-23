import { NextRequest, NextResponse } from "next/server";
import { saveUpload } from "@/lib/uploads";

// Public upload - basket "seen elsewhere" images ("image" field) and
// checkout questionnaire documents/plans ("file" field: images, PDF, docs).
const DOC_OK = /^(image\/|application\/pdf|application\/msword|application\/vnd|text\/)/;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const image = form.get("image") as File | null;
    const file = image ?? (form.get("file") as File | null);
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }
    // Images-only for the legacy "image" field; the "file" field also allows documents.
    if (image ? !file.type.startsWith("image/") : !DOC_OK.test(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const url = await saveUpload(file, image ? "ref" : "enquiry");
    return NextResponse.json({ url, name: file.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
