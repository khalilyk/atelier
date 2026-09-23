import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import JsonLd from "../../components/JsonLd";
import ProjectView from "../ProjectView";
import { getContent, getPublishedProjects } from "@/lib/get-content";
import { abs, breadcrumbLd, pageMetadata, truncate } from "@/lib/seo";
import { projectMeta } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const projects = await getPublishedProjects();
  const project = projects.find((p) => p.slug === slug) ?? null;
  return { project, projects };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { project } = await load(slug);
  if (!project) return { title: "Not found", robots: { index: false } };
  return {
    ...(await pageMetadata({
      path: `/projects/${project.slug}`,
      title: project.metaTitle || project.title,
      description: project.metaDescription || project.summary || projectMeta(project) || project.title,
      image: project.ogImage || project.coverImage || undefined,
    })),
    keywords: project.tags.length ? project.tags : undefined,
    ...(project.comingSoon ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { project, projects } = await load(slug);
  if (!project) notFound();
  const t = await getContent();

  // Projects sharing a tag come first, so there is always somewhere to go next.
  const others = projects.filter((p) => p.slug !== project.slug && !p.comingSoon);
  const sameTag = others.filter((p) => p.tags.some((tag) => project.tags.includes(tag)));
  const related = [...sameTag, ...others.filter((p) => !sameTag.includes(p))].slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <SiteHeader variant="solid" breadcrumb="Projects" />
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Projects", "/projects"], [project.title, `/projects/${project.slug}`]]),
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: truncate(project.metaDescription || project.summary || "", 300),
          image: project.ogImage || project.coverImage ? abs(project.ogImage || project.coverImage) : undefined,
          locationCreated: project.location || undefined,
          dateCreated: project.year || undefined,
          keywords: project.tags.join(", ") || undefined,
          mainEntityOfPage: abs(`/projects/${project.slug}`),
          creator: { "@id": abs("/#organization") },
        },
      ]} />

      <ProjectView project={project} />

      {related.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-200">
          {related.map((p, i) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group relative flex flex-col justify-end overflow-hidden px-8 md:px-14 py-12 md:py-16 min-h-[42vh] md:min-h-[440px]">
              {p.coverImage && <Image src={p.coverImage} alt={p.coverAlt || p.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
              {/* Stacked on mobile: the first panel hugs the left, the second the right. */}
              <div className={`relative z-10 max-w-md ${i === 0 ? "" : "ml-auto text-right md:ml-0 md:text-left"}`}>
                <p className="type-label text-[#d9b877] mb-3" style={{ letterSpacing: "0.16em" }}>NEXT PROJECT</p>
                <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 300, lineHeight: 1.1 }}>{p.title}</h2>
                {projectMeta(p) && <p className="type-body text-white/75 mb-5" style={{ lineHeight: 1.75, fontSize: "14px" }}>{projectMeta(p)}</p>}
                <span className={`arrow-link type-button text-white border-b border-white/50 pb-px w-fit inline-block ${i === 0 ? "arrow-left" : "ml-auto md:ml-0"}`} style={{ letterSpacing: "0.1em" }}>
                  {i === 0 ? <><span className="arrow">←</span>&nbsp; View project</> : <>View project &nbsp;<span className="arrow">→</span></>}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="relative py-24 md:py-32 px-6 md:px-8 text-center border-t border-stone-200 overflow-hidden">
        {t("projects.cta.img") && <Image src={t("projects.cta.img")} alt="" fill className="object-cover object-center" />}
        <div className="absolute inset-0 bg-[#f5f0e8]/85" />
        <div className="relative z-10">
          <p className="type-label text-[#b8934a] mb-6">{t("projects.cta.eyebrow")}</p>
          <h2 className="type-large text-stone-900 mb-6 mx-auto" style={{ fontSize: "clamp(28px, 4vw, 60px)", maxWidth: "560px", lineHeight: 1.1 }}>{t("projects.cta.headline")}</h2>
          <p className="type-body text-stone-600 mb-10 mx-auto max-w-md" style={{ lineHeight: 1.9 }}>{t("projects.cta.body")}</p>
          <Link href="/quote" className="arrow-link type-button inline-block border border-stone-800 text-stone-900 px-8 py-4 hover:bg-stone-900 hover:text-white transition-colors duration-300">
            {t("projects.cta.button")} &nbsp;<span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
