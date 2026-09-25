import { pageMetadata, breadcrumbLd, collectionLd } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import PageClient from "./PageClient";

const DESC = "The Atelier Signature Luxe Collection: thermally broken and ultra-slim panoramic aluminium window and door systems for premium Australian homes, custom manufactured for each project.";

export function generateMetadata() {
  return pageMetadata({ path: "/signature", title: "Signature Luxe: Thermally Broken Windows Australia", description: DESC, image: "/Signature Luxe.png" });
}

export default function Page() {
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Signature", "/signature"]]),
        collectionLd({ name: "Atelier Signature Luxe Collection", description: DESC, path: "/signature", items: [{ name: "Signature Luxe Windows & Doors", path: "/signature/windows-doors" }] }),
      ]} />
      <PageClient />
    </>
  );
}
