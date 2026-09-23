import { NextRequest, NextResponse } from "next/server";
import { projects } from "@/lib/admin-store";
import { snapshot } from "@/lib/blob-backup";
import { PROJECT_RESERVED, emptyProject, projectSlug, sortProjects, type Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

const EDITABLE: (keyof Project)[] = [
  "title", "location", "year", "client", "scope", "summary", "coverImage", "coverAlt", "gallery", "tags", "body",
  "published", "comingSoon", "order", "metaTitle", "metaDescription", "ogImage",
];

export async function GET() {
  return NextResponse.json(sortProjects(await projects.list()));
}

/** The wanted address, or the first free -2, -3 ... after it. */
async function freeSlug(wanted: string) {
  if (!(await projects.exists(wanted))) return wanted;
  for (let n = 2; n < 100; n++) {
    const candidate = `${wanted}-${n}`;
    if (!(await projects.exists(candidate))) return candidate;
  }
  return "";
}

// Create: { title, slug? } — or copy an existing project with { duplicateOf }.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const source = body.duplicateOf ? await projects.get(projectSlug(String(body.duplicateOf))) : null;
  if (body.duplicateOf && !source) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const title = String(body.title ?? source?.title ?? "").trim();
  if (title.length < 2) return NextResponse.json({ error: "Enter a name." }, { status: 400 });

  const wanted = projectSlug(String(body.slug || title));
  if (!wanted || PROJECT_RESERVED.has(wanted)) return NextResponse.json({ error: "Choose a different name or web address." }, { status: 400 });

  let slug = wanted;
  if (source) {
    slug = await freeSlug(wanted);
    if (!slug) return NextResponse.json({ error: "Too many copies of this project." }, { status: 400 });
  } else if (await projects.exists(slug)) {
    return NextResponse.json({ error: `A project with the address "${slug}" already exists.` }, { status: 400 });
  }

  const now = new Date().toISOString();
  // A copy keeps everything except its identity, and always starts as a draft.
  const project: Project = source
    ? { ...source, title, slug, published: false, createdAt: now, updatedAt: now }
    : { ...emptyProject(title), slug, createdAt: now, updatedAt: now };
  await projects.put(project);
  return NextResponse.json(project);
}

// Update: the editor sends the whole record, so it is written as-is (whitelisted).
// Renaming the web address writes the new record and removes the old one.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const slug = projectSlug(String(body.slug ?? ""));
  const previous = projectSlug(String(body.previousSlug ?? slug));
  if (!slug || PROJECT_RESERVED.has(slug)) return NextResponse.json({ error: "Invalid web address." }, { status: 400 });
  if (!(await projects.exists(previous))) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (slug !== previous && (await projects.exists(slug))) {
    return NextResponse.json({ error: `A project with the address "${slug}" already exists.` }, { status: 400 });
  }

  const next = { slug, createdAt: String(body.createdAt || new Date().toISOString()) } as Record<string, unknown>;
  for (const k of EDITABLE) if (k in body) next[k] = body[k];
  next.title = String(next.title ?? "").trim() || slug;
  next.tags = Array.isArray(next.tags) ? (next.tags as string[]).map((t) => String(t).trim()).filter(Boolean).slice(0, 12) : [];
  next.published = !!next.published;
  next.comingSoon = !!next.comingSoon;
  next.order = Math.max(0, Number(next.order) || 0);
  next.updatedAt = new Date().toISOString();

  await projects.put(next as Project);
  if (slug !== previous) await projects.remove(previous);
  return NextResponse.json(next);
}

export async function DELETE(req: NextRequest) {
  await snapshot("projects");
  const { slug } = await req.json();
  const key = projectSlug(String(slug ?? ""));
  if (!(await projects.exists(key))) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  await projects.remove(key);
  return NextResponse.json({ ok: true });
}
