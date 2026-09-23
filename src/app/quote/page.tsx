import { pageMetadata } from "@/lib/seo";
import PageClient from "./PageClient";

export function generateMetadata() {
  return pageMetadata({
    path: "/quote",
    title: "Your Project Selection",
    description: "Review the products you have selected and send them to Atelier Supply Group for a project-specific quotation.",
    noindex: true,
  });
}

export default function Page() {
  return <PageClient />;
}
