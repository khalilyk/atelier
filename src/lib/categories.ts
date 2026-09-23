// Admin-created Classic categories. Client-safe (no server imports).
//
// A custom category duplicates the structure of an existing page family:
//   • "windows-doors" - system-style product pages (like Windows & Doors)
//   • "joinery"       - room/package-style product pages (like Custom Joinery)
// Its landing page, copy and images are all edited in Admin > Categories, and
// its products are added in Admin > Products like any other category.

export type CategoryTemplate = "windows-doors" | "joinery";

export type CustomCategory = {
  slug: string;
  label: string;
  template: CategoryTemplate;
  published: boolean;
  showInNav: boolean;
  showOnLanding: boolean;
  /** Listed with a "Coming soon" badge and no link through to the page. */
  comingSoon?: boolean;
  order: number;

  heroEyebrow: string;
  heroIntro: string;
  heroCta: string;
  heroImg: string;

  storyEyebrow: string;
  storyHeadline: string;
  storyBody: string;     // paragraphs, one per line
  storyImg: string;

  processHeadline: string;
  processSteps: string;  // "Title :: Description" per line (blank = section hidden)

  rangeHeadline: string;
  rangeIntro: string;
  cardCta: string;

  featureTiles: string;  // "Title :: Description :: Link :: Image" per line (blank = hidden)
  faqs: string;          // "Question :: Answer" per line (blank = hidden)

  ctaHeadline: string;
  ctaBody: string;

  landingQuote: string;  // Classic landing page block
  landingBody: string;
  landingImg: string;

  layout?: string;       // section order, one id per line ("!id" = hidden)

  createdAt: string;
  updatedAt: string;
};

// Routes that already exist under /classic - a category can't take these slugs.
export const RESERVED_SLUGS = new Set([
  "windows-doors", "joinery", "bathrooms",
  "colour-card", "door-hardware", "joinery-colour-card", "stone-collection",
  "series", "quote", "admin", "api",
]);

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const TEMPLATE_LABEL: Record<CategoryTemplate, string> = {
  "windows-doors": "Windows & Doors style (system pages)",
  joinery: "Custom Joinery style (room / package pages)",
};

/** Starting content copied from the chosen template so a new page is never empty. */
export function templateDefaults(template: CategoryTemplate, label: string): Omit<CustomCategory, "slug" | "label" | "template" | "createdAt" | "updatedAt"> {
  const base = {
    published: false, showInNav: true, showOnLanding: true, comingSoon: false, order: 100,
    heroEyebrow: "Classic",
    heroCta: "Explore the Range",
    ctaHeadline: `Building with ${label}?`,
    ctaBody: "Share your plans with Atelier and we'll review the details, understand your requirements and develop a considered Classic quotation for your project.",
    landingImg: "/Atelier_Classic.png",
    heroImg: "/Atelier_Classic.png",
    storyImg: "/Atelier_Signature.png",
  };
  if (template === "windows-doors") {
    return {
      ...base,
      heroIntro: `The Atelier Classic ${label} collection brings together architectural systems, precise specification and project-specific manufacturing for new homes, renovations and residential developments.`,
      storyEyebrow: "Architectural Simplicity. Specified for Your Project.",
      storyHeadline: `The ${label} Collection.`,
      storyBody: `Every ${label.toLowerCase()} system is tailored to the architecture, scale and performance requirements of each project.\nDesigned for Australian conditions and specified to meet the applicable Australian Standards.`,
      processHeadline: "A single point of coordination.",
      processSteps: "Project review :: We review your plans and specification.\nShop drawings :: Every item is documented before production.\nManufacture :: Produced to the approved drawings.\nDelivery :: Coordinated to your build programme.",
      rangeHeadline: "Our range",
      rangeIntro: "",
      cardCta: "View system",
      featureTiles: "",
      faqs: "",
      landingQuote: `${label}, specified for the way you live.`,
      landingBody: `Architectural ${label.toLowerCase()} tailored to the architecture, scale and performance requirements of each project.`,
    };
  }
  return {
    ...base,
    heroIntro: `${label} that combines refined proportions, premium materials and precise detailing - designed to your project and made to fit as built.`,
    storyEyebrow: "The Story",
    storyHeadline: "Made for the home you're building.",
    storyBody: `Every ${label.toLowerCase()} package is developed around your plans, material palette and functional requirements.\nThe result is a space that feels cohesive, refined and considered.`,
    processHeadline: "From concept to completion.",
    processSteps: "Share Your Plans :: Send us your plans, selections and brief.\nDesign & Details :: We resolve layout, finishes and hardware with you.\nShop Drawings :: Every item documented for your approval.\nManufacture :: Made specifically for your project.\nDelivery & Installation :: Delivered and installed, sequenced to your build.",
    rangeHeadline: `${label}, room by room.`,
    rangeIntro: "Every package includes shop drawings and manufacture - custom to your plans.",
    cardCta: "Explore",
    featureTiles: "",
    faqs: "",
    landingQuote: `${label} should feel integrated into the architecture.`,
    landingBody: `${label} developed around your plans, material palette and functional requirements.`,
  };
}

export const lines = (s: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean);
export const rows = (s: string) => lines(s).map((l) => l.split("::").map((c) => c.trim()));
