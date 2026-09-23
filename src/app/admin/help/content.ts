// The help text for the admin portal. Plain data, so it is easy to keep up to
// date as the backend changes.

export type Topic = {
  title: string;
  href?: string;          // the admin page it describes
  what: string;           // what this section is for
  how: string[];          // step by step
  notes?: string[];       // things that catch people out
};

export type HelpGroup = { group: string; blurb: string; topics: Topic[] };

export const HELP: HelpGroup[] = [
  {
    group: "Everyday editing",
    blurb: "The parts you will use most: page wording, articles, projects and photos.",
    topics: [
      {
        title: "Pages",
        href: "/admin/content",
        what: "The wording on every page of the website - the homepage, About, Classic, Signature and Contact.",
        how: [
          "Pick the page you want from the list, then the section within it.",
          "Type straight into a field. Changes are not live until you press Save.",
          "Use Add block to drop in a new section - text, a photo, a gallery, numbered steps, questions and answers, or a call to action.",
          "Drag the handle on the left of a block to move it, or use the up and down arrows.",
          "The eye icon hides a block without deleting it. The copy icon duplicates it. The bin removes it.",
        ],
        notes: [
          "Leaving a field blank falls back to the original wording. Reset puts a single field back.",
          "A block you duplicated keeps its own wording, separate from the original.",
        ],
      },
      {
        title: "Journal",
        href: "/admin/journal",
        what: "The blog. Each article has its own web address, cover photo, tags and Google listing.",
        how: [
          "New post, give it a name, then Create draft.",
          "Type the title and subtitle straight onto the page, then build the article from blocks below.",
          "The live preview on the right shows the real article as you type. Preview turns it off if you want the full width.",
          "Fill in the right-hand panels: Publishing (live or draft, date, read time), Summary and tags, Cover photo.",
          "Save post when you are done. Published turns it live; a draft is invisible to visitors and to Google.",
        ],
        notes: [
          "Search & AI listing at the bottom writes itself from the article. Generate copies it into the fields so you can edit it.",
          "Duplicate makes a copy as a new draft - handy for a series of similar articles.",
        ],
      },
      {
        title: "Projects",
        href: "/admin/projects",
        what: "The portfolio. Completed projects with photos, location, client and scope.",
        how: [
          "New project, name it, then Create draft.",
          "Add the story in blocks - plain text and photos read best.",
          "Cover photo sets the card image; More photos adds the thumbnail strip under it, which visitors can open full size.",
          "Project details holds location, year, client and scope. Anything left blank is simply left off the page.",
          "Position in the Publishing panel controls the order: 1 shows first, 0 sorts by year.",
        ],
        notes: ["The homepage carousel shows your published projects automatically."],
      },
      {
        title: "Categories",
        href: "/admin/categories",
        what: "The three built-in collections (Windows & Doors, Custom Joinery, Bathroom Packages) plus any you add yourself.",
        how: [
          "Open a category to edit its hero, story, range and FAQ sections.",
          "Each section is a block, so it can be reordered, hidden or duplicated like a page.",
          "New category creates a collection with its own web address and product list.",
        ],
      },
      {
        title: "Products",
        href: "/admin/products",
        what: "Every Classic and Signature product: wording, specifications, photos and hotspots.",
        how: [
          "Choose the collection, then the product.",
          "Edit the copy, the specification rows and the photo gallery.",
          "Hotspots let you tag a photo with labelled points that open a card - useful for pointing out a detail on a window or a vanity.",
        ],
        notes: ["Products that come from code fall back to their defaults; Reset clears your edit and restores them."],
      },
      {
        title: "Images and Media Library",
        href: "/admin/media",
        what: "Media Library is every file you have uploaded. Images is the list of picture slots across the site waiting to be filled.",
        how: [
          "Upload in the Media Library, then use Choose anywhere a photo is asked for.",
          "In Images, each row is a slot on a page; an empty slot is simply hidden on the live site.",
          "Always fill in the photo description - it is what Google and screen readers read.",
        ],
      },
    ],
  },
  {
    group: "Enquiries and clients",
    blurb: "What comes in from the website, and the quotes that go back out.",
    topics: [
      {
        title: "Enquiry Submissions",
        href: "/admin/submissions",
        what: "Every enquiry sent from the website's forms.",
        how: [
          "New enquiries show a badge on the bell at the top of the screen.",
          "Open one to read it, see the attached plans, and mark it as handled.",
          "You can turn an enquiry straight into a quote.",
        ],
      },
      {
        title: "Quotes",
        href: "/admin/quotes",
        what: "Project quotations, built from an enquiry or from scratch.",
        how: [
          "Start a quote, add line items, and the totals work themselves out.",
          "Your legal, contact and bank details come from Company Details, so fix them there once.",
          "Send or download the quote when it is ready.",
        ],
      },
      {
        title: "Download Leads",
        href: "/admin/leads",
        what: "The names and emails captured when someone downloads a gated guide or maintenance document.",
        how: [
          "The list fills itself as people download.",
          "Each row shows which document they asked for, so you know what they are working on.",
          "Export the list when you want to follow up.",
        ],
        notes: ["The visitor gets the download by email, and your team gets a notification, both automatically."],
      },
      {
        title: "Team",
        href: "/admin/team",
        what: "The people shown on the website and on quotes, with their contact cards.",
        how: ["Add a member with their name, role, photo and contact details.", "Their digital contact card is generated from these details."],
      },
    ],
  },
  {
    group: "Settings and safety",
    blurb: "Set these once and they flow through the whole site.",
    topics: [
      {
        title: "Company Details",
        href: "/admin/company",
        what: "One source of truth for your legal name, ABN, addresses, phone, email and bank details.",
        how: ["Fill it in once. It flows through to the website footer and every quote."],
        notes: ["Bank details are used on quotes, so check them carefully before sending anything."],
      },
      {
        title: "Accounts",
        href: "/admin/admins",
        what: "Who can sign in to this portal.",
        how: [
          "Add someone with their name and email; they set their own password the first time they sign in.",
          "Remove an account the moment someone leaves.",
        ],
        notes: ["Forgot password sends a reset email, so every account needs a real address."],
      },
      {
        title: "Backups",
        href: "/admin/backups",
        what: "A safety net. Everything you type is backed up automatically.",
        how: [
          "A backup is taken every night, and again before anything is deleted or restored.",
          "The list shows what each backup holds and when it was taken.",
          "Restore puts the site back to that point - and takes a fresh backup first, so restoring is itself reversible.",
        ],
        notes: [
          "Backups are kept for 30 days. A full copy is also mirrored to the studio's own machine monthly.",
          "Deleting a post, project or category is recoverable. Ask before restoring if you are unsure.",
        ],
      },
      {
        title: "SEO",
        href: "/admin/seo",
        what: "How the site appears in Google and in AI answers.",
        how: [
          "Check the meta title and description for each page.",
          "Titles read best under 60 characters, descriptions between 70 and 160.",
          "Journal articles and projects write their own listing, which you can override on the page itself.",
        ],
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        what: "Visitor numbers, and where to connect tracking tools.",
        how: ["Paste in your tracking codes to start collecting data.", "Come back here to see traffic once it is connected."],
      },
    ],
  },
];

export const BASICS: Topic[] = [
  {
    title: "Signing in",
    what: "Your own email address and password.",
    how: [
      "Go to the website address followed by /admin.",
      "First time in, your password is set on first use - type the one you want and it is saved.",
      "Forgot password sends a reset link to your email.",
    ],
  },
  {
    title: "Saving your work",
    what: "Nothing goes live until you press Save.",
    how: [
      "Every editor has a Save button at the top of the screen that stays put as you scroll.",
      "Leaving a page without saving loses those changes - the site is untouched.",
      "After saving, use View to open the real page in a new tab.",
    ],
    notes: ["If a change does not appear straight away, give it a few seconds and reload."],
  },
  {
    title: "Blocks",
    what: "Most pages are built from blocks: a stack of sections you can rearrange.",
    how: [
      "Add block puts a new section wherever you want it.",
      "Drag the handle, or use the arrows, to change the order.",
      "The eye hides a block from visitors without deleting it.",
      "The copy icon duplicates a block; the bin removes it.",
    ],
  },
];
