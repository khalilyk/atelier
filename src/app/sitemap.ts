import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { publicCatalog } from "@/lib/seo-catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  return (await publicCatalog()).map((e) => {
    const depth = e.path === "/" ? 0 : e.path.split("/").length - 1;
    return {
      url: abs(e.path),
      lastModified: now,
      changeFrequency: depth <= 1 ? "weekly" : "monthly",
      priority: depth === 0 ? 1 : depth === 1 ? 0.9 : depth === 2 ? 0.8 : 0.6,
      ...(e.image ? { images: [abs(e.image)] } : {}),
    };
  });
}
