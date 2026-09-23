import { NextRequest, NextResponse } from "next/server";
import { journal } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";
import { JOURNAL_RESERVED, emptyPost, journalSlug, sortPosts, type JournalPost } from "@/lib/journal";

export const dynamic = "force-dynamic";

const EDITABLE: (keyof JournalPost)[] = [
  "title", "subtitle", "excerpt", "coverImage", "coverAlt", "tags", "body",
  "published", "comingSoon", "publishedAt", "readMinutes", "metaTitle", "metaDescription", "ogImage",
];

export async function GET() {
  return NextResponse.json(sortPosts(await journal.list()));
}

/** The wanted address, or the first free -2, -3 ... after it. */
async function freeSlug(wanted: string) {
  if (!(await journal.exists(wanted))) return wanted;
  for (let n = 2; n < 100; n++) {
    const candidate = `${wanted}-${n}`;
    if (!(await journal.exists(candidate))) return candidate;
  }
  return "";
}

// Create: { title, slug? } — or copy an existing post with { duplicateOf }.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const source = body.duplicateOf ? await journal.get(journalSlug(String(body.duplicateOf))) : null;
  if (body.duplicateOf && !source) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const title = String(body.title ?? source?.title ?? "").trim();
  if (title.length < 2) return NextResponse.json({ error: "Enter a title." }, { status: 400 });

  const wanted = journalSlug(String(body.slug || title));
  if (!wanted || JOURNAL_RESERVED.has(wanted)) return NextResponse.json({ error: "Choose a different title or web address." }, { status: 400 });

  // A copy quietly takes the next free address; a new post says the name is taken.
  let slug = wanted;
  if (source) {
    slug = await freeSlug(wanted);
    if (!slug) return NextResponse.json({ error: "Too many copies of this post." }, { status: 400 });
  } else if (await journal.exists(slug)) {
    return NextResponse.json({ error: `A post with the address "${slug}" already exists.` }, { status: 400 });
  }

  const now = new Date().toISOString();
  // A copy keeps everything except its identity, and always starts as a draft.
  const post: JournalPost = source
    ? { ...source, title, slug, published: false, publishedAt: now.slice(0, 10), createdAt: now, updatedAt: now }
    : { ...emptyPost(title), slug, createdAt: now, updatedAt: now };
  await journal.put(post);
  return NextResponse.json(post);
}

// Update: the editor sends the whole record, so it is written as-is (whitelisted).
// Renaming the web address writes the new record and removes the old one.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const slug = journalSlug(String(body.slug ?? ""));
  const previous = journalSlug(String(body.previousSlug ?? slug));
  if (!slug || JOURNAL_RESERVED.has(slug)) return NextResponse.json({ error: "Invalid web address." }, { status: 400 });
  if (!(await journal.exists(previous))) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (slug !== previous && (await journal.exists(slug))) {
    return NextResponse.json({ error: `A post with the address "${slug}" already exists.` }, { status: 400 });
  }

  const next = { slug, createdAt: String(body.createdAt || new Date().toISOString()) } as Record<string, unknown>;
  for (const k of EDITABLE) if (k in body) next[k] = body[k];
  next.title = String(next.title ?? "").trim() || slug;
  next.tags = Array.isArray(next.tags) ? (next.tags as string[]).map((t) => String(t).trim()).filter(Boolean).slice(0, 12) : [];
  next.published = !!next.published;
  next.comingSoon = !!next.comingSoon;
  next.readMinutes = Math.max(0, Number(next.readMinutes) || 0);
  next.publishedAt = String(next.publishedAt || new Date().toISOString().slice(0, 10));
  next.updatedAt = new Date().toISOString();

  await journal.put(next as JournalPost);
  if (slug !== previous) await journal.remove(previous);
  return NextResponse.json(next);
}

export async function DELETE(req: NextRequest) {
  await snapshot("journal");
  const { slug } = await req.json();
  const key = journalSlug(String(slug ?? ""));
  if (!(await journal.exists(key))) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  await journal.remove(key);
  return NextResponse.json({ ok: true });
}
