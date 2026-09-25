import { pageMetadata, breadcrumbLd, collectionLd } from "@/lib/seo";
import { CATEGORY_META } from "./data";
import { getPublishedCategories } from "@/lib/get-content";
import JsonLd from "../components/JsonLd";
import PageClient from "./PageClient";

const DESC = "The Atelier Classic Collection: architectural aluminium windows and doors, custom joinery and fully coordinated bathroom packages for new homes, renovations and developments across Australia.";

export function generateMetadata() {
  return pageMetadata({ path: "/classic", title: "Classic Collection: Windows, Doors & Joinery Australia", description: DESC });
}

export default async function Page() {
  const custom = (await getPublishedCategories()).filter((c) => c.showOnLanding);
  const items = [
    ...Object.entries(CATEGORY_META).map(([slug, m]) => ({ name: m.label, path: `/classic/${slug}` })),
    ...custom.map((c) => ({ name: c.label, path: `/classic/${c.slug}` })),
  ];
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Classic", "/classic"]]),
        collectionLd({ name: "Atelier Classic Collection", description: DESC, path: "/classic", items }),
      ]} />
      <PageClient />
    </>
  );
}
