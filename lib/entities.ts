import { CATEGORIES, GALLERY_SECTIONS } from "./content";

export type Field = {
  name: string;
  label: string;
  type:
    | "text" | "textarea" | "number" | "select" | "checkbox" | "checkboxes" | "image" | "images" | "slug"
    | "relation" | "date";
  options?: readonly string[];
  /** For type "relation": which table supplies the choices (value = id). */
  source?: "services";
  help?: string;
  required?: boolean;
};

export type Entity = {
  table: string;
  label: string;
  plural: string;
  titleField: string;
  orderBy: string;
  columns: string[];
  fields: Field[];
  /** Table whose slug column must stay unique for this entity's "slug" field. */
  slugTable?: string;
};

export const PROJECT_STATUSES = ["Completed", "Ongoing", "Concept"] as const;

export const ENTITIES: Record<string, Entity> = {
  slides: {
    table: "slides", label: "Hero slide", plural: "Hero slides", titleField: "title",
    orderBy: "sort, id", columns: ["title", "label", "sort"],
    fields: [
      { name: "label", label: "Small label above the title", type: "text", help: "e.g. Building Beyond Boundaries" },
      { name: "title", label: "Title", type: "text", required: true, help: "Wrap a word in *asterisks* to show it outlined, e.g. Construction *Renovation* Remodeling" },
      { name: "button_text", label: "Button text", type: "text" },
      { name: "button_link", label: "Button link", type: "text" },
      { name: "image_id", label: "Background image", type: "image", required: true },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  services: {
    table: "services", label: "Service", plural: "Services", titleField: "title",
    orderBy: "sort, id", columns: ["title", "slug", "sort"], slugTable: "services",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Page address: /services/<slug>. Leave blank to generate from the title." },
      { name: "subtitle", label: "Subtitle (small caps line on the card)", type: "text" },
      { name: "description", label: "Text shown on hover", type: "textarea", help: "Wrap key phrases in **double asterisks** to make them bold." },
      { name: "image_id", label: "Card image", type: "image" },
      { name: "back_image_id", label: "Hover image (optional, shown at full size behind the text)", type: "image" },
      { name: "banner_id", label: "Service page banner image", type: "image" },
      { name: "intro", label: "Service page introduction", type: "textarea", help: "Blank lines create new paragraphs." },
      { name: "scope", label: "What's included (one per line)", type: "textarea" },
      { name: "related_category", label: "Show projects from", type: "select", options: ["", ...CATEGORIES] },
      { name: "link", label: "Card button link (optional)", type: "text", help: "Leave blank to open the service page." },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  projects: {
    table: "projects", label: "Project", plural: "Projects", titleField: "title",
    orderBy: "sort, id", columns: ["title", "categories", "year", "published"], slugTable: "projects",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave blank to generate from the title." },
      { name: "categories", label: "Show in categories", type: "checkboxes", options: CATEGORIES },
      { name: "subtitle", label: "Subtitle (shown under the title on the project page)", type: "text" },
      { name: "cover_id", label: "Cover image", type: "image" },
      { name: "client", label: "Client", type: "text" },
      { name: "location", label: "Location", type: "text", help: "Used by the project filters, e.g. Lagos" },
      { name: "year", label: "Year", type: "text" },
      { name: "size", label: "Size", type: "text", help: "e.g. 1,200 sqm" },
      { name: "status", label: "Status", type: "select", options: ["", ...PROJECT_STATUSES] },
      { name: "body", label: "Project information", type: "textarea", help: "Blank lines create new paragraphs." },
      { name: "scope", label: "Project scope (one per line)", type: "textarea" },
      { name: "concept_title", label: "Design concept title", type: "text" },
      { name: "concept_text", label: "Design concept text", type: "textarea" },
      { name: "video_url", label: "Video link (YouTube or Vimeo)", type: "text" },
      { name: "before_id", label: "Before photo (renovations)", type: "image" },
      { name: "after_id", label: "After photo (renovations)", type: "image" },
      { name: "gallery_ids", label: "Project images", type: "images" },
      { name: "featured", label: "Feature on the home page", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  stats: {
    table: "stats", label: "Statistic", plural: "Stats counters", titleField: "label",
    orderBy: "sort, id", columns: ["label", "value", "suffix", "sort"],
    fields: [
      { name: "value", label: "Number", type: "number", required: true },
      { name: "suffix", label: "After the number", type: "text", help: "e.g. + or %" },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  steps: {
    table: "steps", label: "Process step", plural: "How we work (steps)", titleField: "title",
    orderBy: "sort, id", columns: ["title", "sort"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  faqs: {
    table: "faqs", label: "FAQ", plural: "FAQs", titleField: "question",
    orderBy: "sort, id", columns: ["question", "sort"],
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "service_id", label: "Show on service page", type: "relation", source: "services", help: "Leave empty for a general FAQ shown on the home page." },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  posts: {
    table: "posts", label: "Article", plural: "Insights (blog)", titleField: "title",
    orderBy: "published_at DESC, id DESC", columns: ["title", "published_at", "published"], slugTable: "posts",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave blank to generate from the title." },
      { name: "excerpt", label: "Short summary", type: "textarea" },
      { name: "body", label: "Article", type: "textarea", help: "Blank lines create new paragraphs. Lines starting with ## become sub-headings." },
      { name: "cover_id", label: "Cover image", type: "image" },
      { name: "published_at", label: "Publish date", type: "date" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  clients: {
    table: "clients", label: "Client logo", plural: "Client logos", titleField: "name",
    orderBy: "sort, id", columns: ["name", "sort"],
    fields: [
      { name: "name", label: "Client name", type: "text", required: true },
      { name: "image_id", label: "Logo", type: "image", required: true },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  testimonials: {
    table: "testimonials", label: "Testimonial", plural: "Testimonials", titleField: "name",
    orderBy: "sort, id", columns: ["name", "company", "sort"],
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "image_id", label: "Photo or company logo", type: "image" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  gallery: {
    table: "gallery", label: "Event photo", plural: "Gallery (Events)", titleField: "caption",
    orderBy: "section, sort, id", columns: ["caption", "section", "sort"],
    fields: [
      { name: "image_id", label: "Image", type: "image", required: true },
      { name: "section", label: "Show in", type: "select", options: GALLERY_SECTIONS, help: "The Events page has three carousels. Add the same photo to several to repeat it." },
      { name: "caption", label: "Caption", type: "text" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
};

export const SETTINGS_GROUPS: { title: string; fields: Field[] }[] = [
  { title: "Brand & contact", fields: [
    { name: "site_name", label: "Company name", type: "text" },
    { name: "logo_id", label: "Logo", type: "image" },
    { name: "address", label: "Address", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "hours", label: "Opening hours", type: "text" },
    { name: "whatsapp", label: "WhatsApp number (digits only, with country code)", type: "text" },
    { name: "map_query", label: "Map location (address used for the Google map)", type: "text" },
    { name: "seo_description", label: "Default SEO description", type: "textarea" },
    { name: "same_as", label: "Social profile links (one per line)", type: "textarea", help: "Used in search-engine data, e.g. your Instagram or LinkedIn page." },
  ]},
  { title: "Home: intro & carousel", fields: [
    { name: "intro_heading", label: "Intro heading", type: "textarea" },
    { name: "about_text", label: "About snippet", type: "textarea" },
    { name: "carousel_ids", label: "Project photo carousel", type: "images" },
  ]},
  { title: "Home: services", fields: [
    { name: "services_title", label: "Section title", type: "text" },
    { name: "services_subtitle", label: "Section subtitle", type: "text" },
  ]},
  { title: "Home: leadership message", fields: [
    { name: "ceo_name", label: "Name", type: "text" },
    { name: "ceo_title", label: "Title", type: "text" },
    { name: "ceo_image_id", label: "Photo", type: "image" },
    { name: "ceo_heading", label: "Heading", type: "text" },
    { name: "ceo_text", label: "Message", type: "textarea" },
  ]},
  { title: "Home: more sections", fields: [
    { name: "featured_title", label: "Featured projects title", type: "text" },
    { name: "process_title", label: "How we work: title", type: "text" },
    { name: "process_subtitle", label: "How we work: subtitle", type: "text" },
    { name: "faq_title", label: "FAQ title", type: "text" },
    { name: "cta_title", label: "Call to action: title", type: "text" },
    { name: "cta_text", label: "Call to action: text", type: "textarea" },
    { name: "cta_button", label: "Call to action: button text", type: "text" },
  ]},
  { title: "Home: showcase slideshow", fields: [
    { name: "showcase_ids", label: "Slideshow images (before the map)", type: "images" },
  ]},
  { title: "About page", fields: [
    { name: "about_heading", label: "Heading", type: "textarea" },
    { name: "about_page_text", label: "Text", type: "textarea", help: "Blank lines create new paragraphs." },
    { name: "about_images", label: "Photos (slider)", type: "images" },
    { name: "values_intro", label: "Core values intro", type: "textarea" },
    { name: "values", label: "Core values (one per line: Title | Text)", type: "textarea" },
    { name: "brochure_url", label: "Brochure PDF link", type: "text" },
    { name: "brochure_image_id", label: "Brochure cover image", type: "image" },
  ]},
  { title: "Quote / appointment page", fields: [
    { name: "quote_intro", label: "Introduction", type: "textarea" },
    { name: "quote_budgets", label: "Budget ranges (one per line)", type: "textarea" },
    { name: "quote_timelines", label: "Timelines (one per line)", type: "textarea" },
    { name: "quote_types", label: "Project types (one per line)", type: "textarea" },
    { name: "banner_quote_id", label: "Page banner", type: "image" },
  ]},
  { title: "Project category cards", fields: [
    { name: "cat_conceptual_id", label: "Conceptual Design image", type: "image" },
    { name: "cat_architectural_id", label: "Architectural Design image", type: "image" },
    { name: "cat_construction_id", label: "Construction image", type: "image" },
    { name: "cat_management_id", label: "Project Management image", type: "image" },
  ]},
  { title: "Page banners", fields: [
    { name: "banner_about_id", label: "About page banner", type: "image" },
    { name: "banner_projects_id", label: "Projects page banner", type: "image" },
    { name: "banner_gallery_id", label: "Gallery page banner", type: "image" },
    { name: "banner_contact_id", label: "Contact page banner", type: "image" },
    { name: "banner_insights_id", label: "Insights page banner", type: "image" },
  ]},
  { title: "Footer", fields: [
    { name: "footer_services", label: "Footer services list (one per line)", type: "textarea" },
  ]},
];
