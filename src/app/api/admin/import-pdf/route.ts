import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/admin-store";
import { makeSku } from "@/lib/sku";

async function parsePdf(buffer: Buffer): Promise<string> {
  // pdf-parse v2 - class-based API
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

type Extracted = { name: string; desc: string; tag: string; image: string };

// A dimensions string like 910x465x550mm, 1200×500×430, 585*360*455mm
const DIM_RE = /\d{2,4}\s*[x×*]\s*\d{2,4}(?:\s*[x×*]\s*\d{2,4})?\s*(?:mm|cm)?/i;
// A product heading: name words followed by a model code, e.g. "Elvera KDK027R", "Alpha KDK033"
const HEADING_RE = /^([A-Za-z][\w&.\- ]*?)\s+([A-Z]{2,5}\d{2,4}[A-Z]?)\s*$/;
// A bare model code on its own line, e.g. OJS261-900A (OJANS catalogue style)
const BARE_RE = /^([A-Z]{1,6}-?\d{2,5}[A-Z]?(?:-\d{2,4}[A-Z]?)?)$/;
// Accessory / spec lines that resemble headings but are not products
const SKIP_RE = /\b(seat|cistern|pan|trap|cover|flush|inlet|optional|available|features|colou?r|size|button|connector|flange|bracket|kit|hose|valve|waste|outlet)\b/i;

function extractProducts(text: string) {
  const results: Extracted[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("+") || line.startsWith("(") || SKIP_RE.test(line)) continue;

    let namePart = "";
    let code = "";
    const h = line.match(HEADING_RE);
    const b = line.match(BARE_RE);
    if (h) { namePart = h[1].trim(); code = h[2]; }
    else if (b) { code = b[1]; }
    else continue;
    if (seen.has(code)) continue;

    // Gather dimensions from a forward window - prefer labelled lines
    let cabinet = "";
    let mirror = "";
    let size = "";
    const dims: string[] = [];
    for (let j = i + 1; j < Math.min(i + 16, lines.length); j++) {
      const s = lines[j].match(/Size:\s*(.+)/i);
      if (s && !size) size = s[1].trim();
      const c = lines[j].match(/(?:Main\s+)?Cabinet:\s*(.+)/i);
      if (c && !cabinet) cabinet = c[1].trim();
      const m = lines[j].match(/Mirror:\s*(.+)/i);
      if (m && !mirror) mirror = m[1].trim();
      if (!s && !c && !m && DIM_RE.test(lines[j]) && dims.length < 2 && !lines[j].includes(":")) {
        dims.push(lines[j]);
      }
    }

    let desc = "";
    let tag = "Custom";
    if (cabinet || mirror) {
      desc = [cabinet ? `Cabinet: ${cabinet}` : "", mirror ? `Mirror: ${mirror}` : ""].filter(Boolean).join(" · ");
      const w = cabinet.match(/(\d{2,4})/);
      if (w) tag = `${w[1]}mm`;
    } else if (size) {
      desc = `Size: ${size}`;
      const w = size.match(/(\d{2,4})/);
      if (w) tag = `${w[1]}mm`;
    } else if (dims.length) {
      desc = dims.join(" · ");
      const w = dims[0].match(/(\d{2,4})/);
      if (w) tag = `${w[1]}mm`;
    }

    if (!desc) continue;
    seen.add(code);
    results.push({ name: namePart ? `${namePart} ${code}` : code, desc, tag, image: "" });
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    const catId = formData.get("catId") as string | null;

    if (!file) return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    if (!catId) return NextResponse.json({ error: "No category selected" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text directly from the buffer
    const text = await parsePdf(buffer);
    const extracted = extractProducts(text);

    // When nothing matched, surface a text sample so the layout can be adapted
    const rawSample = extracted.length === 0 ? text.slice(0, 4000) : undefined;
    return NextResponse.json({ products: extracted, count: extracted.length, rawSample });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Save extracted products to a category
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as {
      catId: string;
      items: { name: string; desc: string; tag: string; image: string }[];
    };
    const { catId, items } = body;

    const all = await products.get();
    const catExists = all.classic.some(c => c.id === catId);

    if (!catExists) {
      // Create new category
      const label = catId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      all.classic.push({
        id: catId,
        name: label,
        intro: "",
        products: items.map((p, idx) => ({ ...p, sku: makeSku(catId, idx), id: `${catId}-${Date.now()}-${idx}` })),
      });
    } else {
      all.classic = all.classic.map(c => {
        if (c.id !== catId) return c;
        const base = c.products.length;
        const newItems = items.map((p, idx) => ({ ...p, sku: makeSku(catId, base + idx), id: `${catId}-${Date.now()}-${idx}` }));
        return { ...c, products: [...c.products, ...newItems] };
      });
    }

    await products.save(all);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
