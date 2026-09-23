import { pageMetadata, breadcrumbLd, collectionLd } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";
import { listProducts, COLLECTION_INTRO } from "../data";
import PageClient from "./PageClient";

const DESC = "Signature Luxe windows and doors: thermally broken aluminium and ultra-slim panoramic systems for premium Australian homes, specified against BASIX, NatHERS and Australian Standards.";

export function generateMetadata() {
  return pageMetadata({ path: "/signature/windows-doors", title: "Signature Luxe Windows & Doors", description: DESC, image: "/Signature Luxe.png" });
}

export default function Page() {
  const items = listProducts("windows-doors").map((p) => ({ name: p.data.name, path: `/signature/windows-doors/${p.slug}` }));
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([["Home", "/"], ["Signature", "/signature"], ["Windows & Doors", "/signature/windows-doors"]]),
        collectionLd({ name: "Signature Luxe Windows & Doors", description: COLLECTION_INTRO.join(" "), path: "/signature/windows-doors", items }),
      ]} />
      <PageClient />
    </>
  );
}
