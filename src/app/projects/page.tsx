import { getPublishedProjects } from "@/lib/get-content";
import { pageMetadata, breadcrumbLd, abs } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import ProjectsList from "./ProjectsList";

export function generateMetadata() {
  return pageMetadata({
    path: "/projects",
    title: "Projects",
    description: "Completed projects supplied by Atelier Supply Group: aluminium windows and doors, custom joinery and bathroom packages across Australian homes and developments.",
  });
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [projects, params] = await Promise.all([getPublishedProjects(), searchParams]);
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Projects", "/projects"]]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Atelier Supply Group Projects",
          url: abs("/projects"),
          hasPart: projects.slice(0, 30).map((p) => ({
            "@type": "CreativeWork",
            name: p.title,
            url: abs(`/projects/${p.slug}`),
            description: p.summary || undefined,
            image: p.coverImage ? abs(p.coverImage) : undefined,
            locationCreated: p.location || undefined,
          })),
        },
      ]} />
      <ProjectsList projects={projects} tag={tag} />
    </>
  );
}
