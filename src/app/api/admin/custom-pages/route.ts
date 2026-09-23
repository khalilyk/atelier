import { NextRequest, NextResponse } from "next/server";
import { customPages } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";
import { PAGE_RESERVED, emptyCustomPage, pageSlug, sortCustomPages, type CustomPage } from "@/lib/custom-pages";

export const dynamic = "force-dynamic";

const EDITABLE: (keyof CustomPage)[] = [
  "title", "subtitle", "heroImage", "heroAlt", "body",
  "published", "showInNav", "order", "metaTitle", "metaDescription", "ogImage",
];

export async function GET() {
  return NextResponse.json(sortCustomPages(await customPages.list()));
}

/** The wanted address, or the first free -2, -3 ... after it. */
async function freeSlug(wanted: string) {
  if (!PAGE_RESERVED.has(wanted) && !(await customPages.exists(wanted))) return wanted;
  for (let n = 2; n < 100; n++) {
    const candidate = `${wanted}-${n}`;
    if (!PAGE_RESERVED.has(candidate) && !(await customPages.exists(candidate))) return candidate;
  }
  return "";
}

// Create: { title, slug? } — or copy an existing page with { duplicateOf }.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const source = body.duplicateOf ? await customPages.get(pageSlug(String(body.duplicateOf))) : null;
  if (body.duplicateOf && !source) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const title = String(body.title ?? source?.title ?? "").trim();
  if (title.length < 2) return NextResponse.json({ error: "Enter a page name." }, { status: 400 });

  const wanted = pageSlug(String(body.slug || title));
  if (!wanted) return NextResponse.json({ error: "Choose a different name or web address." }, { status: 400 });

  let slug = wanted;
  if (source) {
    slug = await freeSlug(wanted);
    if (!slug) return NextResponse.json({ error: "Too many copies of this page." }, { status: 400 });
  } else {
    if (PAGE_RESERVED.has(slug)) return NextResponse.json({ error: `"/${slug}" is already used by the site. Choose another address.` }, { status: 400 });
    if (await customPages.exists(slug)) return NextResponse.json({ error: `A page at "/${slug}" already exists.` }, { status: 400 });
  }

  const now = new Date().toISOString();
  // A copy keeps everything except its identity, and always starts as a draft.
  const page: CustomPage = source
    ? { ...source, title, slug, published: false, showInNav: false, createdAt: now, updatedAt: now }
    : { ...emptyCustomPage(title), slug, createdAt: now, updatedAt: now };
  await customPages.put(page);
  return NextResponse.json(page);
}

// Update: the editor sends the whole record, so it is written as-is (whitelisted).
// Renaming the web address writes the new record and removes the old one.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const slug = pageSlug(String(body.slug ?? ""));
  const previous = pageSlug(String(body.previousSlug ?? slug));
  if (!slug || PAGE_RESERVED.has(slug)) return NextResponse.json({ error: `"/${slug}" is not an address you can use.` }, { status: 400 });
  if (!(await customPages.exists(previous))) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  if (slug !== previous && (await customPages.exists(slug))) {
    return NextResponse.json({ error: `A page at "/${slug}" already exists.` }, { status: 400 });
  }

  const next = { slug, createdAt: String(body.createdAt || new Date().toISOString()) } as Record<string, unknown>;
  for (const k of EDITABLE) if (k in body) next[k] = body[k];
  next.title = String(next.title ?? "").trim() || slug;
  next.published = !!next.published;
  next.showInNav = !!next.showInNav;
  next.order = Math.max(0, Number(next.order) || 0);
  next.updatedAt = new Date().toISOString();

  await customPages.put(next as CustomPage);
  if (slug !== previous) await customPages.remove(previous);
  return NextResponse.json(next);
}

export async function DELETE(req: NextRequest) {
  await snapshot("custom-pages");
  const { slug } = await req.json();
  const key = pageSlug(String(slug ?? ""));
  if (!(await customPages.exists(key))) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  await customPages.remove(key);
  return NextResponse.json({ ok: true });
}
