// Editable copy for the built-in category pages, grouped by page section.
// Defaults are the live wording. Multi-item fields use one item per line with
// "::" between parts (and "||" between paragraphs inside a part).

type Field = { key: string; label: string; default: string; multiline?: boolean; image?: boolean };

const WD = "Category - Windows & Doors";
const JN = "Category - Custom Joinery";
const BA = "Category - Bathroom Packages";

const IMG = "/products/classic/windows";

// ── New fields (section → fields) ────────────────────────────────────────────
const NEW: Record<string, { group: string; sections: Record<string, Field[]> }> = {
  "windows-doors": {
    group: WD,
    sections: {
      hero: [{ key: "wd.hero.cta", label: "Button label", default: "Explore the Range" }],
      story: [{ key: "wd.story.eyebrow", label: "Eyebrow", default: "Architectural Simplicity. Specified for Your Project." }],
      supplier: [
        { key: "wd.supplier.eyebrow", label: "Eyebrow", default: "MORE THAN A WINDOW SUPPLIER" },
        { key: "wd.supplier.headline", label: "Headline", default: "A single point of coordination, from first drawing to final handover." },
        { key: "wd.supplier.body", label: "Body", multiline: true, default: "Atelier manages the process from project review and specification through shop drawings, manufacturing coordination, factory inspection and delivery - giving builders, designers and homeowners a single point of coordination for the whole package." },
        { key: "wd.supplier.steps", label: "Steps (Label, one per line)", multiline: true, default: ["Project review & specification", "Shop drawings", "Manufacturing coordination", "Factory inspection", "Delivery"].join("\n") },
      ],
      tailored: [
        { key: "wd.tailored.eyebrow", label: "Eyebrow", default: "TAILORED TO YOUR PROJECT" },
        { key: "wd.tailored.headline", label: "Headline", multiline: true, default: "Every Classic package is manufactured to approved project dimensions and can be tailored with:" },
        {
          key: "wd.tailored.items", label: "Options (Label :: Image URL, one per line)", multiline: true,
          default: [
            `Coordinated shop drawings prior to production :: ${IMG}/ASG 102 Series Sliding Window Doors/ASG102-Side Profile.png`,
            `Custom opening sizes and configurations :: ${IMG}/ASG 102 Series Pocket Sliding Door/ASG102 Pocket Home.png`,
            `Single or double glazing, including Low-E and performance glazing :: ${IMG}/ASG 102 Series Louvre Glass/ASG102 Louvre Glass.png`,
            `Sliding, stacking, awning, casement and fixed configurations :: ${IMG}/ASG 102 Series Awning Windows/ASG102-Awning Window.png`,
            `Architectural powdercoat finishes :: ${IMG}/ASG 86 Sliding Doors Windows/ASG86 Sliding Doors.png`,
            `Project-specific hardware selections :: ${IMG}/asg102/ASG102-Hardware.png`,
          ].join("\n"),
        },
        { key: "wd.tailored.closing", label: "Closing line", multiline: true, default: "The result is a window and door package that is considered before it is manufactured - not simply ordered from a catalogue." },
      ],
      range: [{ key: "wd.range.eyebrow", label: "Eyebrow", default: "OUR RANGE" }],
      options: [
        { key: "wd.options.eyebrow", label: "Eyebrow", default: "SPECIFICATION & OPTIONS" },
        {
          key: "wd.options.tiles", label: "Image tiles (Title :: Description :: Link :: Button :: Image URL, one per line)", multiline: true,
          default: [
            "Colours & Finishes :: A considered palette of architectural powdercoat finishes, curated for contemporary Australian architecture. :: /classic/colour-card :: View the Colour Card :: /Atelier_Classic.png",
            `Door Hardware & Accessories :: Handles, locks and operating hardware from leading architectural manufacturers, selected to suit your systems. :: /classic/door-hardware :: View the Hardware Collection :: ${IMG}/asg102/ASG102-Hardware.png`,
          ].join("\n"),
        },
        {
          key: "wd.options.accordions", label: "Expandable panels (Title :: Subtitle :: Paragraph || Paragraph, one per line)", multiline: true,
          default: [
            "Flyscreens :: Integrated protection without compromising the view :: Available configurations include fixed, sliding, rolling and retractable flyscreens, with mesh options including fibreglass, 304 stainless steel and aluminium. || Flyscreens can be specified alongside your windows and doors to create a coordinated, complete package for your project.",
            "Glass Options :: Glazing specified for performance, comfort and compliance :: Available options include single glazing, double glazing, Low-E glass, laminated glass, acoustic glass and obscure glass, with combinations selected to suit the application. || Glazing is specified to meet the project's BASIX/NatHERS requirements and applicable AS 1288 requirements, helping ensure the complete window and door package is considered as part of the building's overall performance.",
            "Installation Materials :: Thought through beyond the window and door :: Options include subheads, subsills, flashings, angles, connection bars, fixing and packing components, seals, trims and timber reveals, selected to suit the window or door system and project requirements. || By considering these components at specification stage, we help reduce last-minute sourcing, site improvisation and compatibility issues - creating a more complete package.",
          ].join("\n"),
        },
      ],
      downloads: [
        { key: "wd.dl.eyebrow", label: "Eyebrow", default: "TECHNICAL DOWNLOADS" },
        { key: "wd.dl.headline", label: "Headline", default: "Download the guides." },
        { key: "wd.dl.intro", label: "Intro", multiline: true, default: "Reference documentation for your project - the full window collection, care and maintenance." },
        { key: "wd.dl.collection.img", label: "Collection card - cover image", image: true, default: "/guides/window-collection.png" },
        { key: "wd.dl.collection.title", label: "Collection card - title", default: "Atelier Window Collection" },
        { key: "wd.dl.collection.body", label: "Collection card - text", multiline: true, default: "Every Classic window and door system in one PDF - profiles, configurations and specifications." },
        { key: "wd.dl.care.img", label: "Care guide card - cover image", image: true, default: "/guides/window-care.png" },
        { key: "wd.dl.care.title", label: "Care guide card - title", default: "Care & Maintenance Guide" },
        { key: "wd.dl.care.body", label: "Care guide card - text", multiline: true, default: "Simple guidance to keep your windows and doors operating and looking their best." },
        { key: "wd.dl.care.button", label: "Care guide card - button", default: "Get the care guide" },
      ],
      building: [
        { key: "wd.bwc.eyebrow", label: "Eyebrow", default: "Selection Support" },
        { key: "wd.bwc.headline", label: "Headline", default: "Building with Classic?" },
        { key: "wd.bwc.body", label: "Body (one paragraph per line; first is larger)", multiline: true, default: ["Not sure which system is right for your project?", "You don't need to work through every profile, glass type and hardware option yourself. Whether you are building a single residence, completing a renovation or specifying windows and doors across a larger development, we can help turn your architectural documentation into a coordinated, quotation-ready package.", "Send us your plans. We'll help specify the rest."].join("\n") },
        { key: "wd.bwc.cta", label: "Button label", default: "Start your project today" },
      ],
    },
  },
  joinery: {
    group: JN,
    sections: {
      hero: [{ key: "jn.hero.cta", label: "Button label", default: "Request a Project Quote" }],
      story: [{ key: "jn.story.eyebrow", label: "Eyebrow", default: "THE STORY" }],
      range: [
        { key: "jn.range.eyebrow", label: "Eyebrow", default: "THE RANGE" },
        { key: "jn.range.headline", label: "Headline", default: "Custom joinery, room by room." },
        { key: "jn.range.intro", label: "Intro", multiline: true, default: "Every package includes shop drawings and manufacture - custom to your plans." },
        { key: "jn.range.cta", label: "Card button label", default: "EXPLORE" },
      ],
      process: [
        { key: "jn.process.eyebrow", label: "Eyebrow", default: "THE PROCESS" },
        { key: "jn.process.headline", label: "Headline", default: "From concept to completion." },
        { key: "jn.process.intro", label: "Intro", default: "Six stages, each resolved before the next begins." },
        {
          key: "jn.process.steps", label: "Steps (Title :: Description :: Note, one per line)", multiline: true,
          default: [
            "Share Your Plans :: Send us your architectural plans, selections and brief. Renovating? A measured drawing or your builder's dimensions is all we need to start. Our team reviews the drawings and reaches out to discuss the project. :: What happens: we review and get in touch.",
            "Design & Details :: We work through the details with you - layout, finishes, colours and textures, appliance selections, hardware and storage - so every decision is made before anything is drawn. :: What you receive: a resolved design and quotation.",
            "Shop Drawings & 3D Visualisation :: Every cabinet, dimension, material and hardware item documented in CAD shop drawings, with standard construction tolerances built into the detailing. Once prepared, we present the design in 3D so you see the joinery in context before sign-off. :: What you receive: shop drawings and 3D visualisations for approval.",
            "Manufacture :: Production runs to the approved drawings. Premium materials, precise detailing, made specifically for your project. :: What happens: your joinery is made.",
            "Factory Inspection :: Our team inspects the completed joinery at the factory - finish, hardware operation, dimensions and packaging - before it ships. :: What you receive: inspection confirmation.",
            "Delivery & Installation :: Delivered to site and installed by the Atelier team, sequenced to your build. Or supplied for your builder to install - your choice at quotation. :: What you receive: joinery, fitted.",
          ].join("\n"),
        },
      ],
      materials: [
        { key: "jn.mat.eyebrow", label: "Eyebrow", default: "MATERIALS AND FINISHES" },
        { key: "jn.mat.headline", label: "Headline", default: "Every surface, selected to belong together." },
        { key: "jn.mat.intro", label: "Intro", multiline: true, default: "Finishes, stone and hardware are chosen as one palette across the project." },
        {
          key: "jn.mat.tiles", label: "Image tiles (Title :: Description :: Link :: Button :: Image URL, one per line)", multiline: true,
          default: [
            "Joinery Colour Card :: Woodgrains, natural timbers, painted, matte and textured finishes, with a range of door profiles to suit. :: /classic/joinery-colour-card :: View the Colour Card :: /vanities/OJS261-900A.jpg",
            "Stone Collection :: Natural stone and quartz surfaces for benchtops, splashbacks and feature panels, coordinated with your cabinetry finish. :: /classic/stone-collection :: View the Stone Collection :: /Atelier_Classic.png",
          ].join("\n"),
        },
      ],
      download: [
        { key: "jn.dl.eyebrow", label: "Eyebrow", default: "The full collection" },
        { key: "jn.dl.headline", label: "Headline", default: "Take the Atelier Joinery Collection with you." },
        { key: "jn.dl.body", label: "Body", multiline: true, default: "The complete Custom Joinery collection in one PDF - rooms, cabinetry detailing, materials and finishes. Tell us where to send it and it's yours." },
        { key: "jn.dl.button", label: "Button label", default: "Download the collection" },
      ],
      building: [
        { key: "jn.bwc.eyebrow", label: "Eyebrow", default: "Atelier Classic" },
        { key: "jn.bwc.headline", label: "Headline", default: "Building with Classic?" },
        { key: "jn.bwc.body", label: "Body (one paragraph per line)", multiline: true, default: "Share your plans with Atelier and we'll review the details, understand your requirements and develop a considered Classic quotation for your project." },
        { key: "jn.bwc.cta", label: "Button label", default: "Start Your Project Today" },
      ],
      faqs: [
        { key: "jn.faq.headline", label: "Headline", default: "Questions, answered." },
        { key: "jn.faq.intro", label: "Intro", multiline: true, default: "Everything you might want to know before we begin - from finishes and appliances to lead times and warranty." },
      ],
    },
  },
  bathrooms: {
    group: BA,
    sections: {
      hero: [{ key: "bath.hero.img", label: "Hero image", image: true, default: "/vanities/OJS265-1200.jpg" }],
      story: [
        { key: "bath.story.eyebrow", label: "Eyebrow", default: "THE STORY" },
        { key: "bath.story.img", label: "Story image", image: true, default: "/vanities/OJS246-1200.jpg" },
      ],
      range: [{ key: "bath.range.eyebrow", label: "Eyebrow", default: "THE RANGE" }],
      supply: [
        { key: "bath.si.eyebrow", label: "Eyebrow", default: "SUPPLY + INSTALL" },
        { key: "bath.si.img", label: "Background image", image: true, default: "/vanities/OJS270-900.jpg" },
      ],
      included: [{ key: "bath.inc.eyebrow", label: "Eyebrow", default: "WHAT'S INCLUDED" }],
      why: [{ key: "bath.why.eyebrow", label: "Eyebrow", default: "WHY ATELIER" }],
      downloads: [
        { key: "bath.dl.eyebrow", label: "Eyebrow", default: "TECHNICAL DOWNLOADS" },
        { key: "bath.dl.headline", label: "Headline", default: "Download the bathroom care guide." },
        { key: "bath.dl.img", label: "Cover image", image: true, default: "/guides/bathroom-care.png" },
        { key: "bath.dl.button", label: "Button label", default: "Get the bathroom care guide" },
      ],
      building: [{ key: "bath.bwc.eyebrow", label: "Eyebrow", default: "Atelier Classic" }],
      faqs: [{ key: "bath.faq.headline", label: "Headline", default: "Questions, answered." }],
    },
  },
};

// Existing registry keys, assigned to their sections for the Categories editor.
const EXISTING: Record<string, Record<string, string[]>> = {
  "windows-doors": {
    hero: ["category.windows-doors.intro", "category.windows-doors.heroImg"],
    story: ["category.windows-doors.headline", "category.windows-doors.story", "category.windows-doors.storyImg"],
  },
  joinery: {
    hero: ["category.joinery.intro", "category.joinery.heroImg"],
    story: ["category.joinery.headline", "category.joinery.story", "category.joinery.storyImg"],
    faqs: ["category.joinery.faqs"],
  },
  bathrooms: {
    hero: ["bath.hero.eyebrow", "bath.hero.headline", "bath.hero.body", "bath.hero.cta"],
    story: ["bath.story.headline", "bath.story.body"],
    how: ["bath.how.headline", "bath.how.steps"],
    range: ["bath.cards", "bath.available"],
    supply: ["bath.si.headline", "bath.si.lead", "bath.si.body", "bath.si.includes", "bath.si.includesNote", "bath.si.pricing.headline", "bath.si.pricing.body", "bath.si.newbuilds", "bath.si.fullreno", "bath.si.ctaLine", "bath.si.ctaButton"],
    included: ["bath.inc.headline", "bath.inc.fixed", "bath.inc.choose"],
    why: ["bath.why.tiles"],
    downloads: ["bath.dl.note"],
    building: ["bath.bwc.headline", "bath.bwc.body", "bath.bwc.cta"],
    faqs: ["bath.faqs"],
  },
};

/** Registry entries for the new fields plus one layout field per built-in page. */
export function categoryCopyFields() {
  const out: { key: string; group: string; label: string; default: string; multiline?: boolean; image?: boolean; layout?: boolean }[] = [];
  for (const [slug, { group, sections }] of Object.entries(NEW)) {
    out.push({ key: layoutKey(slug), group, label: "Section order", default: "", layout: true });
    for (const fields of Object.values(sections)) for (const f of fields) out.push({ ...f, group });
  }
  return out;
}

export const layoutKey = (slug: string) => `category.${slug}.layout`;

/** Section id → content keys (in display order) for a built-in category. */
export function sectionFieldKeys(slug: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const add = (id: string, keys: string[]) => { out[id] = [...(out[id] || []), ...keys]; };
  for (const [id, keys] of Object.entries(EXISTING[slug] || {})) add(id, keys);
  for (const [id, fields] of Object.entries(NEW[slug]?.sections || {})) add(id, fields.map((f) => f.key));
  return out;
}

// ── Parsing helpers used by the pages ────────────────────────────────────────
export const splitLines = (s: string) => (s || "").split("\n").map((l) => l.trim()).filter(Boolean);
export const splitRows = (s: string) => splitLines(s).map((l) => l.split("::").map((c) => c.trim()));
export const splitParas = (s: string) => (s || "").split("||").map((p) => p.trim()).filter(Boolean);
