import { pageMetadata, breadcrumbLd, abs } from "@/lib/seo";
import JsonLd from "../components/JsonLd";
import PageClient from "./PageClient";

export function generateMetadata() {
  return pageMetadata({
    path: "/contact",
    title: "Contact Us",
    description: "Talk to Atelier Supply Group about windows and doors, custom joinery or bathroom packages. Send your plans for a detailed, project-specific proposal, delivered Australia-wide.",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Contact", "/contact"]]),
        { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Atelier Supply Group", url: abs("/contact"), about: { "@id": abs("/#organization") } },
      ]} />
      <PageClient />
    </>
  );
}
