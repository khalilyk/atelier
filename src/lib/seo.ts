// Server-side SEO helpers: site URL, per-page metadata (with admin overrides)
// and schema.org JSON-LD builders.
import type { Metadata } from "next";
import { cache } from "react";
import { pages, settings, type Settings } from "./admin-store";
import { getCompany } from "./get-content";

export const SITE_NAME = "Atelier Supply Group";

/** The public origin. SITE_URL wins; otherwise Vercel's production domain. */
export function siteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export const abs = (path: string) =>
  /^https?:/.test(path) ? path : encodeURI(decodeURI(`${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`));

export const DEFAULT_TITLE = "Atelier Supply Group | Windows, Doors & Joinery Australia";
export const DEFAULT_DESC =
  "Architectural aluminium windows and doors, custom joinery and coordinated bathroom packages for Australian homes. Specified to your plans and delivered Australia-wide.";
export const DEFAULT_OG = "/Atelier_Classic.png";

const getSettings = cache(async (): Promise<Partial<Settings>> => {
  try { return await settings.get(); } catch { return {}; }
});

const getPageOverrides = cache(async (): Promise<Record<string, { metaTitle: string; metaDesc: string }>> => {
  try {
    const out: Record<string, { metaTitle: string; metaDesc: string }> = {};
    for (const p of await pages.list()) out[p.slug] = { metaTitle: p.metaTitle || "", metaDesc: p.metaDesc || "" };
    return out;
  } catch { return {}; }
});

export const truncate = (s: string, n = 158) => {
  const t = (s || "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/[\s,.;:]+\S*$/, "")}…`;
};

type PageSeo = {
  path: string;
  title: string;          // without the brand suffix
  description: string;
  image?: string;
  noindex?: boolean;
  absoluteTitle?: boolean; // use title verbatim (home page)
};

/** Metadata for one page. An admin SEO entry for the same path overrides title/description. */
export async function pageMetadata(p: PageSeo): Promise<Metadata> {
  const [ov, s] = await Promise.all([getPageOverrides(), getSettings()]);
  const o = ov[p.path];
  const title = o?.metaTitle?.trim() || p.title;
  const description = truncate(o?.metaDesc?.trim() || p.description);
  // Drop the brand suffix when it would push the title past ~60 characters.
  const absolute = p.absoluteTitle || !!o?.metaTitle?.trim() || `${title} | ${SITE_NAME}`.length > 62;
  const image = p.image || s.ogImage || DEFAULT_OG;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: p.path },
    openGraph: {
      type: "website",
      locale: "en_AU",
      siteName: s.siteName || SITE_NAME,
      url: p.path,
      title: absolute ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...(p.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Site-wide defaults used by the root layout. */
export async function rootMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.defaultMetaTitle?.trim() || DEFAULT_TITLE;
  const desc = truncate(s.defaultMetaDesc?.trim() || DEFAULT_DESC);
  const handle = (s.twitterHandle || "").trim();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description: desc,
    applicationName: SITE_NAME,
    alternates: { canonical: "/" },
    formatDetection: { telephone: false },
    openGraph: {
      type: "website", locale: "en_AU", siteName: SITE_NAME, url: "/",
      title, description: desc,
      images: [{ url: s.ogImage || DEFAULT_OG, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image", title, description: desc,
      images: [s.ogImage || DEFAULT_OG],
      ...(handle ? { site: handle.startsWith("@") ? handle : `@${handle}` } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    ...(s.googleVerification ? { verification: { google: s.googleVerification } } : {}),
  };
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────

type Json = Record<string, unknown>;

export async function organizationLd(): Promise<Json> {
  const c = await getCompany();
  const ig = (c.instagram || "").replace(/^@/, "");
  const abn = (c.abn || "").replace(/^ABN\s*/i, "");
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": abs("/#organization"),
    name: SITE_NAME,
    legalName: c.name,
    url: abs("/"),
    logo: abs("/Atelier-logo.png"),
    image: abs(DEFAULT_OG),
    description: DEFAULT_DESC,
    email: c.email || undefined,
    telephone: c.phone || undefined,
    ...(abn ? { taxID: abn, identifier: { "@type": "PropertyValue", propertyID: "ABN", value: abn } } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Sydney", addressRegion: "NSW", addressCountry: "AU" },
    areaServed: { "@type": "Country", name: "Australia" },
    knowsAbout: [
      "Aluminium windows", "Aluminium doors", "Double glazing", "Custom joinery", "Kitchen joinery",
      "Bathroom vanities", "Bathroom packages", "Stone benchtops", "Residential building supply",
    ],
    ...(ig ? { sameAs: [`https://www.instagram.com/${ig}`] } : {}),
    contactPoint: [{
      "@type": "ContactPoint", contactType: "sales", areaServed: "AU", availableLanguage: "English",
      email: c.email || undefined, telephone: c.phone || undefined,
    }],
  };
}

export function websiteLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    name: SITE_NAME,
    url: abs("/"),
    inLanguage: "en-AU",
    publisher: { "@id": abs("/#organization") },
  };
}

export function breadcrumbLd(items: [string, string][]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): Json | null {
  const list = faqs.filter((f) => f.q && f.a);
  if (!list.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

// Items are custom-made to order and quoted per project (no public price), so they are
// described as a Service offered by the business rather than a priced Product.
export function productLd(p: { name: string; description: string; path: string; image?: string; category: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    serviceType: p.category,
    description: truncate(p.description, 500),
    url: abs(p.path),
    ...(p.image ? { image: abs(p.image) } : {}),
    provider: { "@id": abs("/#organization") },
    areaServed: { "@type": "Country", name: "Australia" },
  };
}

export function collectionLd(p: { name: string; description: string; path: string; items: { name: string; path: string }[] }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: p.name,
    description: truncate(p.description, 500),
    url: abs(p.path),
    isPartOf: { "@id": abs("/#website") },
    about: { "@id": abs("/#organization") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: p.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(it.path) })),
    },
  };
}
