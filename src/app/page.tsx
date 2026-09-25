import HeroSplit from "./components/HeroSplit";
import ProjectsCarousel from "./components/ProjectsCarousel";
import AtelierDifference from "./components/AtelierDifference";
import HowWeWork from "./components/HowWeWork";
import SiteFooter from "./components/SiteFooter";
import BlockPage from "./components/BlockPage";
import { HomeAbout, HomeCta, HomeJournal, OfferingStrip } from "./components/HomeSections";
import { pageLayoutKey } from "@/lib/page-copy";
import { getPublishedPosts, getPublishedProjects } from "@/lib/get-content";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/",
    title: "Atelier Supply Group | Windows, Doors & Joinery Australia",
    description: "Architectural aluminium windows and doors, custom joinery and coordinated bathroom packages for Australian homes. Specified to your plans, quality inspected and delivered Australia-wide.",
    absoluteTitle: true,
  });
}


export default async function Home() {
  const [posts, projects] = await Promise.all([getPublishedPosts(), getPublishedProjects()]);
  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Atelier Supply Group: architectural windows and doors, custom joinery and bathroom packages in Australia</h1>
      <BlockPage
        kind="home"
        layoutKey={pageLayoutKey("home")}
        sections={{
          offering: <OfferingStrip />,
          hero: <HeroSplit />,
          about: <HomeAbout />,
          difference: <AtelierDifference />,
          how: <HowWeWork />,
          projects: <ProjectsCarousel items={projects.filter((p) => !p.comingSoon).slice(0, 8)} />,
          journal: <HomeJournal posts={posts.filter((p) => !p.comingSoon).slice(0, 3)} />,
          cta: <HomeCta />,
        }}
      />
      <SiteFooter />
    </div>
  );
}
