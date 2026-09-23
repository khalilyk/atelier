"use client";
import Link from "next/link";
import ProjectBody from "./[slug]/ProjectBody";
import ProjectGallery from "./[slug]/ProjectGallery";
import ShareRow from "../components/ShareRow";
import { galleryRows, projectMeta, type Project } from "@/lib/projects";

/** The facts strip under the photos: only the ones that have been filled in. */
function Facts({ items }: { items: [string, string][] }) {
  const shown = items.filter(([, v]) => v);
  if (shown.length === 0) return null;
  return (
    <div className="px-6 md:px-8 pt-7">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 border-t border-stone-200 pt-5">
        {shown.map(([label, value]) => (
          <div key={label}>
            <p className="type-label text-stone-400 mb-1" style={{ fontSize: "10px", letterSpacing: "0.14em" }}>{label}</p>
            <p className="type-body text-stone-800" style={{ fontSize: "14px", lineHeight: 1.6 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The visible part of a project case study. Shared by the live page and the
 * admin's live preview, so the preview cannot drift from the real thing.
 * In preview mode the links are inert and the photos do not open.
 */
export default function ProjectView({ project, preview }: { project: Project; preview?: boolean }) {
  return (
    <article>
      <header className="px-6 md:px-8 pt-14 md:pt-20 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          {preview ? (
            <span className="type-label text-stone-400" style={{ letterSpacing: "0.14em" }}>← PROJECTS</span>
          ) : (
            <Link href="/projects" className="type-label text-stone-400 hover:text-stone-700 transition-colors" style={{ letterSpacing: "0.14em" }}>← PROJECTS</Link>
          )}
          <h1 className="type-large text-stone-900 mb-5" style={{ fontSize: "clamp(32px, 4.6vw, 60px)", lineHeight: 1.06 }}>
            {project.title || "Untitled"}
          </h1>
          {project.summary && <p className="type-intro text-stone-500 mb-6" style={{ fontSize: "clamp(16px, 1.8vw, 21px)", lineHeight: 1.7 }}>{project.summary}</p>}
          {projectMeta(project) && <p className="type-label text-stone-400" style={{ fontSize: "11px" }}>{projectMeta(project)}</p>}
        </div>
      </header>

      <ProjectGallery
        cover={project.coverImage}
        alt={project.coverAlt || project.title}
        rows={galleryRows(project.gallery)}
        preview={preview}
      />

      <Facts items={[["Location", project.location], ["Year", project.year], ["Client", project.client], ["Scope", project.scope]]} />

      <ProjectBody body={project.body}>
        <ShareRow title={project.title} path={`/projects/${project.slug}`} tags={project.tags ?? []} tagBase="/projects" />
      </ProjectBody>
    </article>
  );
}
