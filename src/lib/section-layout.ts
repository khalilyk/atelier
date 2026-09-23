// The built-in sections of each category page, in their default order.
// Client-safe. Pages are stored as blocks - see page-blocks.ts.

export type SectionDef = { id: string; label: string; pinned?: boolean };

export type PageKind =
  | "windows-doors" | "joinery" | "bathrooms" | "custom"             // category pages
  | "home" | "about" | "classic" | "signature" | "contact"            // site pages
  | "p-joinery" | "p-windows" | "p-bathroom"                          // product pages
  | "journal-post"                                                    // journal article body
  | "project"                                                         // project case study body
  | "custom-page";                                                    // a page you created yourself

export const PAGE_SECTIONS: Record<PageKind, SectionDef[]> = {
  "windows-doors": [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "The story" },
    { id: "supplier", label: "More than a window supplier" },
    { id: "tailored", label: "Tailored to your project" },
    { id: "range", label: "Our range" },
    { id: "options", label: "Specification & options" },
    { id: "downloads", label: "Technical downloads" },
    { id: "building", label: "Building with Classic?" },
    { id: "explore", label: "Explore other collections" },
  ],
  joinery: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "The story" },
    { id: "range", label: "The range" },
    { id: "process", label: "The process" },
    { id: "materials", label: "Materials and finishes" },
    { id: "download", label: "Collection download" },
    { id: "building", label: "Building with Classic?" },
    { id: "faqs", label: "FAQs" },
    { id: "explore", label: "Explore other collections" },
  ],
  bathrooms: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "The story" },
    { id: "how", label: "How it works" },
    { id: "range", label: "The range" },
    { id: "supply", label: "Supply + install" },
    { id: "included", label: "What's included" },
    { id: "why", label: "Why Atelier" },
    { id: "downloads", label: "Technical downloads" },
    { id: "building", label: "Building with Classic?" },
    { id: "faqs", label: "FAQs" },
    { id: "explore", label: "Explore other collections" },
  ],
  custom: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "The story" },
    { id: "process", label: "The process" },
    { id: "range", label: "The range" },
    { id: "tiles", label: "Feature tiles" },
    { id: "building", label: "Building with Classic?" },
    { id: "faqs", label: "FAQs" },
    { id: "explore", label: "Explore other collections" },
  ],
  home: [
    { id: "offering", label: "Offering strip" },
    { id: "hero", label: "Hero (Classic / Signature)" },
    { id: "about", label: "About" },
    { id: "difference", label: "The Atelier difference" },
    { id: "how", label: "How we work" },
    { id: "projects", label: "Projects carousel" },
    { id: "journal", label: "Journal" },
    { id: "cta", label: "Call to action" },
  ],
  about: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "Our story" },
    { id: "capability", label: "Capability statement" },
    { id: "process", label: "Our process" },
    { id: "contact", label: "Contact call to action" },
  ],
  classic: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "categories", label: "Collections" },
    { id: "why", label: "Why Classic" },
    { id: "closing", label: "Closing split" },
  ],
  signature: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "intro", label: "Collection intro" },
    { id: "categories", label: "Collections" },
    { id: "sourcing", label: "Bespoke sourcing" },
  ],
  contact: [
    { id: "hero", label: "Hero", pinned: true },
    { id: "info", label: "Contact details" },
    { id: "form", label: "Enquiry form" },
  ],
  "p-joinery": [
    { id: "hero", label: "Hero", pinned: true },
    { id: "description", label: "Description" },
    { id: "hotspots", label: "Hotspot image" },
    { id: "sample", label: "Sample project" },
    { id: "renders", label: "Renders & drawings" },
    { id: "enquiry", label: "Package enquiry" },
    { id: "others", label: "Other packages" },
  ],
  "p-windows": [
    { id: "hero", label: "Hero", pinned: true },
    { id: "description", label: "System description" },
    { id: "hotspots", label: "Hotspot image" },
    { id: "configurations", label: "Configurations" },
    { id: "profiles", label: "Frame profiles & details" },
    { id: "performance", label: "Performance features" },
    { id: "options", label: "Glass + finish options" },
    { id: "project", label: "Project example" },
    { id: "gallery", label: "Gallery" },
    { id: "enquiry", label: "Package enquiry" },
    { id: "others", label: "Other systems" },
  ],
  "p-bathroom": [
    { id: "hero", label: "Hero", pinned: true },
    { id: "story", label: "The story" },
    { id: "hotspots", label: "Hotspot image" },
    { id: "palette", label: "The palette" },
    { id: "room", label: "The room" },
    { id: "included", label: "What's in this package" },
    { id: "tapware", label: "Tapware" },
    { id: "certified", label: "Certified" },
    { id: "inspiration", label: "Inspiration gallery" },
    { id: "configure", label: "Configure your package" },
    { id: "building", label: "Building with Classic?" },
    { id: "others", label: "Other packages" },
  ],
  // A journal article is built only from the general-purpose blocks.
  "journal-post": [],
  // A project case study, likewise.
  "project": [],
  // A page you created yourself is all general-purpose blocks.
  "custom-page": [],
};
