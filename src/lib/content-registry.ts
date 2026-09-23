// Registry of editable site content. Each field has a stable key, a display
// group/label for the admin, the code default (current live copy), and whether
// it is multiline. Pages read values via resolve(); the admin renders an editor
// form from this registry. Add a field here + reference it in a component to
// make new copy editable - the admin picks it up automatically.

import { CATEGORY_META } from "@/app/classic/data";
import { JOINERY_FAQS } from "@/app/classic/joinery-faqs";
import { categoryCopyFields } from "./category-copy";
import { pageCopyFields } from "./page-copy";

export type ContentField = {
  key: string;
  group: string;
  label: string;
  default: string;
  multiline?: boolean;
  image?: boolean;
  layout?: boolean; // section order (edited in Admin > Categories)
};

export const CONTENT_REGISTRY: ContentField[] = [
  // ── Homepage ──────────────────────────────────────────────────────────────
  { key: "home.hero.classic.image", group: "Homepage", label: "Hero image - Classic (left)", image: true, default: "/products/Main Classic.png" },
  { key: "home.hero.signature.image", group: "Homepage", label: "Hero image - Signature (right)", image: true, default: "/products/Signature Luxe.png" },
  { key: "home.offering", group: "Homepage", label: "Offering strip (top bar)", default: "Aluminium windows and doors, custom joinery and bathroom packages" },
  { key: "home.about.eyebrow", group: "Homepage", label: "About eyebrow", default: "Atelier" },
  { key: "home.about.headline", group: "Homepage", label: "About headline", default: "Architectural products, tailored to every project." },
  { key: "home.about.body", group: "Homepage", label: "About body", multiline: true, default: "Custom aluminium windows and doors, joinery and bathroom packages, brought together for new homes, renovations and residential developments." },

  // ── The Atelier Difference ─────────────────────────────────────────────────
  { key: "difference.eyebrow", group: "Atelier Difference", label: "Section title", default: "The Atelier\nDifference" },
  { key: "difference.1.title", group: "Atelier Difference", label: "Pillar 1 title", multiline: true, default: "Considered\nProduct Selection" },
  { key: "difference.1.desc", group: "Atelier Difference", label: "Pillar 1 description", multiline: true, default: "Architectural products selected for their design, performance and suitability for Australian projects." },
  { key: "difference.2.title", group: "Atelier Difference", label: "Pillar 2 title", multiline: true, default: "Technical\nExpertise" },
  { key: "difference.2.desc", group: "Atelier Difference", label: "Pillar 2 description", multiline: true, default: "We understand the details behind the product - from glazing and window systems to joinery finishes, hardware and project requirements." },
  { key: "difference.3.title", group: "Atelier Difference", label: "Pillar 3 title", multiline: true, default: "One\nAtelier" },
  { key: "difference.3.desc", group: "Atelier Difference", label: "Pillar 3 description", multiline: true, default: "Windows, doors, joinery and bathroom packages coordinated through one experienced team, creating a more considered approach across the project." },
  { key: "difference.4.title", group: "Atelier Difference", label: "Pillar 4 title", multiline: true, default: "Made for\nYour Project" },
  { key: "difference.4.desc", group: "Atelier Difference", label: "Pillar 4 description", multiline: true, default: "From tailored aluminium window and door systems to complete joinery and bathroom packages, we coordinate solutions around the architecture, specification and intent of your project." },

  // ── Classic landing ────────────────────────────────────────────────────────
  { key: "classic.hero.body", group: "Classic Landing", label: "Hero body", multiline: true, default: "Everyday luxury. Refined architectural products in a curated, ready-to-specify range - for builders, developers and homeowners who want considered design without a bespoke process or price." },
  { key: "classic.windows-doors.quote", group: "Classic Landing", label: "Windows & Doors - quote", multiline: true, default: "Architectural glazing has the power to define how a home feels, performs and connects with its surroundings." },
  { key: "classic.windows-doors.body", group: "Classic Landing", label: "Windows & Doors - body", multiline: true, default: "From expansive sliding and stacking systems to refined fixed glazing, awning windows and statement entry doors, our aluminium window and door systems are tailored to the architecture, scale and performance requirements of each project. Designed for Australian conditions and specified to meet applicable Australian Standards, including AS 2047 and AS 1288, every system is considered for performance, detailing and integration with the architecture." },
  { key: "classic.joinery.quote", group: "Classic Landing", label: "Custom Joinery - quote", multiline: true, default: "Joinery should feel integrated into the architecture, not added after it." },
  { key: "classic.joinery.body", group: "Classic Landing", label: "Custom Joinery - body", multiline: true, default: "From kitchens and wardrobes to vanities, laundries and built-in cabinetry, our joinery is developed around your plans, material palette and functional requirements to create spaces that feel cohesive, refined and considered. Atelier brings your vision into reality." },
  { key: "classic.bathrooms.quote", group: "Classic Landing", label: "Bathroom Packages - quote", multiline: true, default: "A beautifully resolved bathroom shouldn't require endless decisions." },
  { key: "classic.bathrooms.body", group: "Classic Landing", label: "Bathroom Packages - body", multiline: true, default: "We've simplified the process by curating every element into five complete bathroom collections. Vanities, basins, mirrors, tapware, sanitaryware and complementary finishes are selected to work together - creating a cohesive, considered space without months of sourcing from multiple suppliers. Choose the collection that speaks to your project. We've already considered the details." },
  { key: "classic.why.headline", group: "Classic Landing", label: "Why Classic - headline", default: "Considered design. Proven systems. Simply specified." },
  { key: "classic.why.body", group: "Classic Landing", label: "Why Classic - body", multiline: true, default: "Atelier Classic brings together a refined collection of aluminium windows, doors, joinery and bathroom packages for contemporary residential projects - created for those who value good design without unnecessary complexity." },
  { key: "classic.cta.headline", group: "Classic Landing", label: "Closing CTA - headline", default: "Building with Atelier Classic?" },
  { key: "classic.cta.body", group: "Classic Landing", label: "Closing CTA - body", multiline: true, default: "Share your plans with Atelier and we'll review the details, understand your requirements and develop a considered Classic quotation for your project." },
  { key: "classic.signature.headline", group: "Classic Landing", label: "Signature upsell - headline", default: "Signature is our guided consultation service for exceptional homes." },
  { key: "classic.signature.body", group: "Classic Landing", label: "Signature upsell - body", multiline: true, default: "Bespoke systems, custom joinery and finishes developed one project at a time." },

  // ── Category pages (Classic) ───────────────────────────────────────────────
  { key: "category.windows-doors.headline", group: "Category - Windows & Doors", label: "Story headline", default: "The Classic Collection." },
  { key: "category.windows-doors.intro", group: "Category - Windows & Doors", label: "Hero intro", multiline: true, default: "The Atelier Classic Collection brings together architectural aluminium window and door systems, precise specification and project-specific manufacturing for new homes, renovations and residential developments." },
  { key: "category.joinery.headline", group: "Category - Custom Joinery", label: "Story headline", default: "Made for the home you're building." },
  { key: "category.joinery.intro", group: "Category - Custom Joinery", label: "Hero intro", multiline: true, default: "Joinery that combines refined proportions, premium materials and precise detailing - designed to your project and made to fit as built." },
  { key: "category.windows-doors.story", group: "Category - Windows & Doors", label: "Story body (one paragraph per line)", multiline: true, default: (CATEGORY_META["windows-doors"].story ?? CATEGORY_META["windows-doors"].body).join("\n") },
  { key: "category.windows-doors.heroImg", group: "Category - Windows & Doors", label: "Hero image", image: true, default: CATEGORY_META["windows-doors"].heroImg },
  { key: "category.windows-doors.storyImg", group: "Category - Windows & Doors", label: "Story image", image: true, default: CATEGORY_META["windows-doors"].storyImg },
  { key: "category.joinery.story", group: "Category - Custom Joinery", label: "Story body (one paragraph per line)", multiline: true, default: (CATEGORY_META["joinery"].story ?? CATEGORY_META["joinery"].body).join("\n") },
  { key: "category.joinery.heroImg", group: "Category - Custom Joinery", label: "Hero image", image: true, default: CATEGORY_META["joinery"].heroImg },
  { key: "category.joinery.storyImg", group: "Category - Custom Joinery", label: "Story image", image: true, default: CATEGORY_META["joinery"].storyImg },
  { key: "category.joinery.faqs", group: "Category - Custom Joinery", label: "FAQs (Question :: Answer, one per line)", multiline: true, default: JOINERY_FAQS.map((f) => `${f.q} :: ${f.a}`).join("\n") },
  // Hero
  { key: "bath.hero.eyebrow", group: "Category - Bathroom Packages", label: "Hero eyebrow", default: "BATHROOM PACKAGES" },
  { key: "bath.hero.headline", group: "Category - Bathroom Packages", label: "Hero headline", default: "One decision. One team. One finished bathroom." },
  { key: "bath.hero.body", group: "Category - Bathroom Packages", label: "Hero body (one paragraph per line)", multiline: true, default: "Five considered bathroom packages, coordinated from selection through to installation.\nWhether you're building new or completing a full renovation, choose your style and Atelier handles the rest." },
  { key: "bath.hero.cta", group: "Category - Bathroom Packages", label: "Hero button label", default: "Explore the range" },
  // Story
  { key: "bath.story.headline", group: "Category - Bathroom Packages", label: "Story headline", default: "Renovating a bathroom shouldn't mean visiting fifteen showrooms." },
  { key: "bath.story.body", group: "Category - Bathroom Packages", label: "Story body (one paragraph per line; last is italic)", multiline: true, default: "A typical bathroom involves dozens of decisions across tiles, tapware, toilets, vanities, mirrors and finishes - before you even begin coordinating trades, deliveries and installation.\nAtelier simplifies the process.\nEach of our five bathroom packages have been designed as a complete, considered whole, with every surface, fixture and finish selected to work together.\nChoose your preferred style, personalise the key details, and we coordinate the supply and installation.\nOne point of contact. One coordinated schedule. One team responsible for bringing your vision together." },
  // How it works
  { key: "bath.how.headline", group: "Category - Bathroom Packages", label: "How It Works headline", default: "From selection to installation." },
  { key: "bath.how.steps", group: "Category - Bathroom Packages", label: "How It Works steps (Title :: Description, one per line)", multiline: true, default: "Choose Your Package :: Explore our five bathroom styles and select the one that best suits your home.\nMake It Yours :: Select your toilet, choose a single or double vanity and decide whether to add a feature tile wall.\nWe Supply :: Your bathroom selections are carefully packed at our warehouse before being delivered to site as one coordinated package.\nWe Install :: Our licensed installation team coordinates the complete fit-out including plumbing, electrical, wall linings, waterproofing, tiling and ventilation." },
  // The Range cards
  { key: "bath.cards", group: "Category - Bathroom Packages", label: "Range cards (slug :: description :: style, one per line)", multiline: true, default: "the-mode :: Crisp black-and-white styling, matte-black fixtures and streamlined finishes for a strong contemporary architectural look. :: Modern Monochrome\nthe-estate :: Marble-inspired surfaces, sophisticated cabinetry and polished detailing balanced with modern functionality. :: Contemporary Classic\nthe-coast :: Soft whites, pale timber tones and natural textures for a light, relaxed and distinctly Australian character. :: Australian Coastal\nthe-terra :: Earthy stone, timber and sculptural forms creating a calm, wellness-focused retreat. :: Organic Spa\nthe-regent :: Rich timber, smoky stone, deep metallic finishes and warm ambient lighting for a dramatic premium atmosphere. :: Boutique Hotel Luxe" },
  { key: "bath.available", group: "Category - Bathroom Packages", label: "Available package slugs (one per line; others show Coming Soon)", multiline: true, default: "the-mode\nthe-coast" },

  // ── Package detail page (shared across all bathroom packages) ───────────────
  { key: "bath.pkg.palette.body", group: "Bathroom Package Page", label: "The Palette - intro", multiline: true, default: "A considered palette of surfaces, finishes and tones, selected to work together across the whole room." },
  { key: "bath.pkg.room.body", group: "Bathroom Package Page", label: "The Room - intro", multiline: true, default: "See how the package comes together. Select a point to reveal the fixture, finish or surface in place." },
  { key: "bath.pkg.tapware.headline", group: "Bathroom Package Page", label: "Tapware headline", default: "Tapware, made to be serviced." },
  { key: "bath.pkg.tapware.body", group: "Bathroom Package Page", label: "Tapware body", multiline: true, default: "The tapware in every package uses cartridge-based mixers that can be serviced or replaced without removing the fitting - so a worn cartridge is a simple fix, not a renovation.\nWaterMark-certified and backed by readily available replacement parts, chosen for longevity as much as for looks." },
  { key: "bath.pkg.certified.headline", group: "Bathroom Package Page", label: "Certified headline", default: "Certified for Australian bathrooms." },
  { key: "bath.pkg.certified.body", group: "Bathroom Package Page", label: "Certified body", multiline: true, default: "Every toilet and tapware item is selected to meet Australian requirements, so your bathroom complies from the outset." },
  { key: "bath.pkg.certified.points", group: "Bathroom Package Page", label: "Certified points (one per line)", multiline: true, default: "WaterMark certified\nWELS water-efficiency rated\nCompliant with AS/NZS standards\nCovered by Australian warranty" },
  // Supply + Install
  { key: "bath.si.headline", group: "Category - Bathroom Packages", label: "Supply+Install headline", default: "The hardest part of a bathroom isn't choosing the products. It's coordinating everything around them." },
  { key: "bath.si.lead", group: "Category - Bathroom Packages", label: "Supply+Install lead (one paragraph per line)", multiline: true, default: "Add installation to any Atelier bathroom package and we can coordinate the complete fit-out - whether it's a new build or a full renovation.\nYour bathroom package, trades and installation are brought together under one coordinated scope, with a single point of contact throughout the project." },
  { key: "bath.si.body", group: "Category - Bathroom Packages", label: "Supply+Install body (one paragraph per line)", multiline: true, default: "A bathroom can involve plumbers, electricians, waterproofers, tilers, carpenters and multiple deliveries - all needing to happen in the right sequence. Atelier simplifies that process.\nWith Supply + Install, your bathroom package and fit-out are coordinated as one project, helping ensure the products, trades and programme all work together from the outset." },
  { key: "bath.si.includes", group: "Category - Bathroom Packages", label: "What installation can include (one per line)", multiline: true, default: "Plumbing rough-in and fit-off\nElectrical works and fit-off\nWall linings and preparation\nWaterproofing\nFloor and wall tiling\nExhaust ventilation\nRecessed shower niche\nVanity and basin installation\nTapware and shower fitting installation\nToilet installation\nMirror and accessory installation" },
  { key: "bath.si.includesNote", group: "Category - Bathroom Packages", label: "Installation includes note", multiline: true, default: "Any additional or project-specific works are identified during the quotation process so the scope is clear before work begins." },
  { key: "bath.si.pricing.headline", group: "Category - Bathroom Packages", label: "Pricing headline", default: "How installation pricing works" },
  { key: "bath.si.pricing.body", group: "Category - Bathroom Packages", label: "Pricing body (one paragraph per line)", multiline: true, default: "Every bathroom is different.\nInstallation is quoted around the requirements of your project, including whether it is a new build or renovation, the existing construction, bathroom size, access and the extent of works required.\nProvide your plans, photographs and project details and we'll prepare a coordinated quotation covering your bathroom package and installation scope." },
  { key: "bath.si.newbuilds", group: "Category - Bathroom Packages", label: "New Builds column (one paragraph per line; last is italic)", multiline: true, default: "Are you a builder looking to simplify the bathroom scope?\nA bathroom requires multiple trades to happen in the right order - plumbing rough-in, wall linings, waterproofing, tiling, electrical work, cabinetry and final fit-off. Instead of coordinating each trade separately, Atelier brings the bathroom package and installation together as one coordinated scope.\nOur team manages the sequence of works, coordinates the relevant trades and works alongside your construction programme so the bathroom progresses when it needs to.\nOne team. One point of contact. One coordinated bathroom package from rough-in through to final fit-off." },
  { key: "bath.si.fullreno", group: "Category - Bathroom Packages", label: "Full Renovations column (one paragraph per line; last is italic)", multiline: true, default: "Renovating a bathroom shouldn't mean managing six different trades yourself.\nAtelier can coordinate the entire renovation from strip-out through to completion - demolition, plumbing, electrical, wall preparation, waterproofing, tiling, cabinetry and final fit-off.\nYour selected bathroom package and the renovation works are planned together, so the products, trades and programme are coordinated from the outset.\nOne team manages the process. One point of contact keeps you informed. One completed bathroom at the end." },
  { key: "bath.si.ctaLine", group: "Category - Bathroom Packages", label: "Supply+Install CTA line", default: "Choose your package. We coordinate the rest." },
  { key: "bath.si.ctaButton", group: "Category - Bathroom Packages", label: "Supply+Install CTA button", default: "Start Your Bathroom Project" },
  // What's Included
  { key: "bath.inc.headline", group: "Category - Bathroom Packages", label: "What's Included headline", default: "Everything considered. Nothing left to chance." },
  { key: "bath.inc.fixed", group: "Category - Bathroom Packages", label: "Fixed in every package (one paragraph per line)", multiline: true, default: "Every package is built around one carefully curated design style, with each element selected to work together as a complete bathroom. Rather than choosing each product individually, every finish, shape and detail has already been coordinated - giving you a bathroom that feels considered, consistent and complete.\nThis includes floor and wall tiles, tapware, vanity style, LED mirror, showerhead, towel rack, toilet roll holder, basin waste and shower screen." },
  { key: "bath.inc.choose", group: "Category - Bathroom Packages", label: "Yours to choose (Label :: Description, one per line)", multiline: true, default: "Your toilet :: Three options in every package, from back-to-wall through wall-hung with concealed cistern to a fully featured smart toilet.\nYour vanity :: Single or double, to suit the room.\nYour feature wall :: Add the package feature tile for a signature moment, or keep it minimal." },
  // Why Atelier
  { key: "bath.why.tiles", group: "Category - Bathroom Packages", label: "Why Atelier tiles (Title :: Description, one per line)", multiline: true, default: "A complete design, already considered :: Every package is curated as one complete bathroom - from tiles and tapware through to the vanity, mirror and accessories. No mismatched finishes. No piecing it together yourself.\nDesigned to work together :: Every tile, finish, fitting and fixture is curated as part of one cohesive design, taking the guesswork out of creating a beautiful bathroom.\nCertified and compliant :: WaterMark-certified toilets and tapware, selected to meet Australian requirements.\nOne team, from selection to installation :: From choosing your package through to delivery and installation, Atelier manages the process for you - with fewer suppliers, fewer decisions and less to coordinate." },
  // Downloads
  { key: "bath.dl.note", group: "Category - Bathroom Packages", label: "Downloads note", default: "Simple guidance to keep your Atelier bathroom looking its best." },
  // Building with Classic
  { key: "bath.bwc.headline", group: "Category - Bathroom Packages", label: "Building with Classic headline", default: "Building with Classic?" },
  { key: "bath.bwc.body", group: "Category - Bathroom Packages", label: "Building with Classic body (one paragraph per line)", multiline: true, default: "Your new bathroom starts with one form.\nTell us your package, your options and a little about your project. We'll come back with a firm, fixed quote - supply only or fully installed." },
  { key: "bath.bwc.cta", group: "Category - Bathroom Packages", label: "Building with Classic button", default: "Start your bathroom project" },
  // FAQs
  { key: "bath.faqs", group: "Category - Bathroom Packages", label: "FAQs (Question :: Answer, one per line)", multiline: true, default: "Can I buy a package supply-only? :: Yes. Our bathroom packages are available supply-only, delivered to site as one coordinated order. Installation is optional.\nDo you handle renovations as well as new builds? :: Yes. Atelier works with both existing bathroom renovations and new builds. Your project type, site conditions and installation requirements are considered when we prepare your quote.\nCan I swap products between packages? :: Each package has been carefully curated as a complete design, so the core products and finishes remain fixed. You can still choose your toilet, vanity configuration and whether to include the feature tile. For something more customised, speak with us about a bespoke project.\nWho carries out the installation? :: Installation is carried out by our licensed installation team with plumbing and electrical work completed by appropriately licensed trades and certified on completion.\nHow long does the process take? :: Most complete bathroom renovations take approximately 3-4 weeks on site, once products are ready and installation begins. We'll confirm your project timeframe before works commence.\nWhere do you supply and install? :: Supply Australia-wide; installation currently Sydney metro." },

  // ── About page ─────────────────────────────────────────────────────────────
  { key: "about.hero.headline", group: "About", label: "Hero headline", multiline: true, default: "A more considered\nway to source." },
  { key: "about.hero.body", group: "About", label: "Hero body", multiline: true, default: "A coordinated architectural supply partner for aluminium windows and doors, custom joinery and complete bathroom packages - across Australian residential and commercial projects." },
  { key: "about.story.headline", group: "About", label: "Our Story - headline", default: "Simpler, more transparent sourcing." },
  { key: "about.story.body", group: "About", label: "Our Story - paragraphs", multiline: true, default: `Atelier Supply Group was created to make sourcing architectural products simpler, more transparent and better connected to the way projects are actually designed and built.

We saw that builders, designers and homeowners were often required to manage multiple suppliers, interpret unclear quotations and make important product decisions without enough technical support. Atelier was established to provide a more considered approach - one that brings product selection, specification, manufacturing, quality control and delivery into a single coordinated process.

Today, we specialise in aluminium windows and doors, custom joinery and complete bathroom packages for Australian residential and commercial projects. We work closely with our clients to understand the design intent, define the requirements and develop product packages that balance appearance, performance, practicality and value.

Our team combines experience in construction, building regulations, product sourcing and project coordination. This allows us to look beyond the product itself and consider how it will be documented, manufactured, delivered and ultimately incorporated into the finished project.

Atelier is built around the belief that good design should not be difficult to access. Whether the project is a single renovation, a new home or a larger development, we aim to provide products that balance architectural appearance, performance, practicality and value.` },
  { key: "about.capability.headline", group: "About", label: "Capability - headline", default: "A coordinated architectural supply service." },
  { key: "about.capability.body", group: "About", label: "Capability - paragraphs", multiline: true, default: `Atelier Supply Group provides more than a catalogue of products. We offer a coordinated architectural supply service designed around the specific needs of each project.

Our capability spans aluminium windows and doors, bathroom packages and custom joinery - with support available from the early planning and selection stages through to manufacturing, quality control, packaging and delivery.

What makes us different is the way we connect the project documentation with the manufacturing process. We review plans, schedules and specifications, help clarify selections and coordinate the information required before production begins. This creates a clearer scope, reduces unnecessary assumptions and gives clients greater visibility throughout the process.

Our capability statement provides a detailed overview of our product categories, supply process, manufacturing capabilities, quality-control approach and delivery options.

It is designed for builders, architects, designers, developers and homeowners who are looking for a reliable supply partner - not simply another product supplier.` },
  { key: "about.process.headline", group: "About", label: "Our Process - headline", default: "One point of contact, one streamlined process." },
  { key: "about.process.intro", group: "About", label: "Our Process - intro", multiline: true, default: "Atelier Supply Group provides a considered and coordinated approach to architectural product supply - bringing greater clarity, consistency and confidence to every project." },
  { key: "about.process.1.title", group: "About", label: "Process step 1 - title", default: "Send your documentation" },
  { key: "about.process.1.body", group: "About", label: "Process step 1 - body", multiline: true, default: "Begin by sending us your plans, schedules or project brief. Our team reviews the documentation, identifies the products required and works with you to establish a clear and complete scope." },
  { key: "about.process.2.title", group: "About", label: "Process step 2 - title", default: "Coordinate selections" },
  { key: "about.process.2.body", group: "About", label: "Process step 2 - body", multiline: true, default: "For aluminium windows and doors, we recommend suitable systems, glazing and configurations based on the architectural design and applicable energy-performance requirements. Bathroom and joinery selections are then coordinated to complement the project’s design, functionality and budget." },
  { key: "about.process.3.title", group: "About", label: "Process step 3 - title", default: "Detailed project quotation" },
  { key: "about.process.3.body", group: "About", label: "Process step 3 - body", multiline: true, default: "Once the scope and selections are confirmed, we prepare a detailed project quotation for your review and approval." },
  { key: "about.process.4.title", group: "About", label: "Process step 4 - title", default: "Manufacture & delivery" },
  { key: "about.process.4.body", group: "About", label: "Process step 4 - body", multiline: true, default: "Following approval, we coordinate documentation, manufacturing, quality control, packaging and delivery - one point of contact and one streamlined process from the first drawing to the final delivery." },

  // ── Legal ──────────────────────────────────────────────────────────────────
  { key: "legal.privacy", group: "Legal", label: "Privacy Policy", multiline: true, default: `Atelier Supply Group Pty Ltd (ABN 99 696 292 001) ("Atelier", "we", "us") is committed to handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.

We collect personal information you provide when you contact us, request a quote, place an order or use our website. This may include your name, business name, email address, phone number, delivery and site addresses and project details such as plans and specifications. We also collect limited technical information about visits to our website, such as the pages viewed, the type of device and browser used and the general location and referring website, through a privacy-friendly analytics service that does not use cookies and does not identify you.

We may disclose personal information where reasonably necessary to provide our products or services including to manufacturers, suppliers, consultants, contractors, installers, freight and logistics providers, payment or accounting providers, IT and website service providers and other parties involved in delivering your project. Some suppliers, manufacturers or service providers used by Atelier may be located outside Australia. Where personal information is disclosed to an overseas recipient, we will take reasonable steps as required by applicable privacy laws to ensure the information is handled appropriately.

We do not sell personal information. We may also disclose information where required by law.

We take reasonable steps to protect personal information from misuse, interference, loss and unauthorised access, and retain it only as long as needed for the purposes above or as required by law. Our website does not use tracking or advertising cookies, and we do not use third-party advertising networks; the website analytics we use collect aggregate visit statistics only and cannot be used to identify you.

We may update this Privacy Policy from time to time to reflect changes to our business practices, services or legal obligations.

For questions about this Privacy Policy or the way we handle personal information, please contact info@ateliersupplygroup.com.au` },
  { key: "legal.terms", group: "Legal", label: "Terms & Conditions", multiline: true, default: `This website is operated by Atelier Supply Group Pty Ltd (ABN 99 696 292 001) ("Atelier"). By accessing or using this website you agree to these terms.

All content on this website including text, images, drawings, logos and design, is owned by or licensed to Atelier and may not be reproduced, distributed or used for commercial purposes without our written permission.

Information on this website including product descriptions, specifications, finishes, images, indicative pricing, lead times and compliance statements, is provided as a general guide only. Products are supplied to project-specific specifications and final details, pricing, availability and compliance are confirmed in a written quotation and are subject to Atelier's Terms of Supply, which prevail over anything on this website. Nothing on this website is an offer to supply and no order is binding until accepted by Atelier in writing.

While we take care to keep this website accurate and current, we do not warrant that it is complete, error-free or uninterrupted, and we may change its content at any time without notice. This website may contain links to third-party websites which we do not control and for which we accept no responsibility.

To the extent permitted by law, Atelier excludes liability for any loss arising from your use of, or reliance on, this website. Nothing in these terms excludes, restricts or modifies any guarantee, right or remedy that cannot lawfully be excluded, including under the Australian Consumer Law.

For questions relating to these Website Terms of Use, please contact info@ateliersupplygroup.com.au` },
];

CONTENT_REGISTRY.push(...categoryCopyFields(), ...pageCopyFields());

export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_REGISTRY.map((f) => [f.key, f.default])
);

export function resolve(overrides: Record<string, string> | undefined, key: string): string {
  const v = overrides?.[key];
  return v !== undefined && v !== "" ? v : (CONTENT_DEFAULTS[key] ?? "");
}
