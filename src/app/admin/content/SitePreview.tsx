"use client";
import { ContentProvider } from "@/app/components/ContentProvider";
import BlockPage from "@/app/components/BlockPage";
import HeroSplit from "@/app/components/HeroSplit";
import AtelierDifference from "@/app/components/AtelierDifference";
import HowWeWork from "@/app/components/HowWeWork";
import ProjectsCarousel from "@/app/components/ProjectsCarousel";
import { HomeAbout, HomeCta, HomeJournal, OfferingStrip } from "@/app/components/HomeSections";
import SiteFooter from "@/app/components/SiteFooter";
import AboutPage from "@/app/about/PageClient";
import ClassicPage from "@/app/classic/PageClient";
import SignaturePage from "@/app/signature/PageClient";
import ContactPage from "@/app/contact/PageClient";
import { pageLayoutKey, type SitePage } from "@/lib/page-copy";

/** The homepage, composed exactly as the live one is. */
function HomePreview() {
  return (
    <div className="min-h-screen">
      <BlockPage
        kind="home"
        layoutKey={pageLayoutKey("home")}
        sections={{
          offering: <OfferingStrip />,
          hero: <HeroSplit />,
          about: <HomeAbout />,
          difference: <AtelierDifference />,
          how: <HowWeWork />,
          // Real posts and projects are not loaded here; the placeholders stand in.
          projects: <ProjectsCarousel />,
          journal: <HomeJournal posts={[]} />,
          cta: <HomeCta />,
        }}
      />
      <SiteFooter />
    </div>
  );
}

const PAGES: Record<SitePage, () => React.ReactNode> = {
  home: HomePreview,
  about: AboutPage,
  classic: ClassicPage,
  signature: SignaturePage,
  contact: ContactPage,
};

/**
 * The real page, rendered from the wording currently in the editor - so it
 * shows unsaved changes. Everything the pages use reads from the providers,
 * and each one falls back to a safe default here.
 */
export default function SitePreview({ kind, values }: { kind: SitePage; values: Record<string, string> }) {
  const Page = PAGES[kind];
  return (
    <ContentProvider overrides={values}>
      <Page />
    </ContentProvider>
  );
}
