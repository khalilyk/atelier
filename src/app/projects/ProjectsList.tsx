"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useT } from "../components/ContentProvider";
import { allTags, projectMeta, type Project } from "@/lib/projects";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function Card({ project, big }: { project: Project; big?: boolean }) {
  // A project still being prepared is listed, but does not open.
  const soon = !!project.comingSoon;
  const shell = `group block relative overflow-hidden rounded-2xl bg-stone-200 ${big ? "md:col-span-2 aspect-[16/10] md:aspect-[2/1]" : "aspect-[4/5]"}`;
  const inner = (
    <>
      {project.coverImage && (
        <Image
          src={project.coverImage}
          alt={project.coverAlt || project.title}
          fill
          sizes={big ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          className={`object-cover transition-transform duration-700 ${soon ? "" : "group-hover:scale-105"}`}
        />
      )}
      {/* Kept dark enough at the foot for the name to stay readable on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-colors duration-500 group-hover:from-black/80" />
      {soon && (
        <span className="absolute top-4 left-4 z-10 type-label bg-[#2c2620]/85 text-[#e9c98a] px-2.5 py-1 rounded-full" style={{ fontSize: "9.5px", letterSpacing: "0.14em" }}>COMING SOON</span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        {project.tags.slice(0, 2).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.slice(0, 2).map((t) => (
              <span key={t} className="type-label text-white/90 border border-white/30 rounded-full px-2.5 py-0.5" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>{t}</span>
            ))}
          </div>
        )}
        <h2 className="type-product text-white mb-1" style={{ fontSize: big ? "clamp(26px, 3vw, 44px)" : "clamp(19px, 2vw, 26px)", lineHeight: 1.15 }}>{project.title}</h2>
        {projectMeta(project) && <p className="type-body text-white/60" style={{ fontSize: "13px" }}>{projectMeta(project)}</p>}
        {soon ? (
          <span className="type-button text-white/70 border-b border-white/25 pb-px w-fit mt-4 inline-block" style={{ letterSpacing: "0.1em" }}>Coming soon</span>
        ) : (
          <span className="arrow-link type-button text-white border-b border-white/25 pb-px w-fit mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ letterSpacing: "0.1em" }}>
            View project &nbsp;<span className="arrow">→</span>
          </span>
        )}
      </div>
    </>
  );

  return soon
    ? <div className={shell} aria-disabled>{inner}</div>
    : <Link href={`/projects/${project.slug}`} className={shell}>{inner}</Link>;
}

export default function ProjectsList({ projects, tag }: { projects: Project[]; tag?: string }) {
  const t = useT();
  const tags = useMemo(() => allTags(projects), [projects]);
  const [active, setActive] = useState(tag ?? "");
  const shown = active ? projects.filter((p) => p.tags.includes(active)) : projects;
  const [lead, ...rest] = shown;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Projects" />

      {/* Hero - the same split layout as About and Journal */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[62vh]">
        <div className="flex flex-col justify-center px-10 md:px-16 py-20 md:py-28">
          <p className="type-label text-[#b8934a] mb-8" style={{ letterSpacing: "0.18em" }}>{t("projects.eyebrow")}</p>
          <h1 className="type-large text-stone-900 mb-6" style={{ fontSize: "clamp(34px, 5vw, 68px)", lineHeight: 1.05 }}>
            {lines(t("projects.headline")).map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)}
          </h1>
          <div className="w-8 h-px bg-[#b8934a] mb-8" />
          {t("projects.intro") && <p className="type-body text-stone-600 max-w-sm" style={{ lineHeight: 1.9 }}>{t("projects.intro")}</p>}
        </div>
        <div className="relative min-h-[46vh] md:min-h-0">
          {t("projects.heroImg") && <Image src={t("projects.heroImg")} alt="Atelier projects" fill className="object-cover object-center" priority />}
        </div>
      </section>

      {tags.length > 0 && (
        <section className="px-6 md:px-8 pt-12">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
            <button onClick={() => setActive("")} className={`type-label px-3 py-1.5 rounded-full border transition-colors ${!active ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"}`} style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>ALL</button>
            {tags.map((tg) => (
              <button key={tg} onClick={() => setActive(tg === active ? "" : tg)} className={`type-label px-3 py-1.5 rounded-full border transition-colors ${active === tg ? "bg-stone-900 text-white border-stone-900" : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"}`} style={{ fontSize: "10.5px", letterSpacing: "0.12em" }}>{tg.toUpperCase()}</button>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 md:px-8 pt-12 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
          {shown.length === 0 ? (
            <p className="type-body text-stone-400 py-16 text-center">{t("projects.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {lead && <Card project={lead} big />}
              {rest.map((p) => <Card key={p.slug} project={p} />)}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
