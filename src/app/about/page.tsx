import { pageMetadata, breadcrumbLd, abs } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import PageClient from "./PageClient";

export function generateMetadata() {
  return pageMetadata({
    path: "/about",
    title: "About Us",
    description: "Atelier Supply Group is a Sydney-based supplier of architectural windows and doors, custom joinery and bathroom packages, managing specification, quality inspection and delivery for residential projects Australia-wide.",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["About", "/about"]]),
        { "@context": "https://schema.org", "@type": "AboutPage", name: "About Atelier Supply Group", url: abs("/about"), about: { "@id": abs("/#organization") } },
      ]} />
      <PageClient />
    </>
  );
}
