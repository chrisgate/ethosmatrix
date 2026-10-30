import { CATEGORIES, GALLERY_SECTIONS } from "./content";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "checkboxes" | "image" | "images" | "slug";
  options?: readonly string[];
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
};

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
    orderBy: "sort, id", columns: ["title", "subtitle", "sort"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle (small caps line)", type: "text" },
      { name: "description", label: "Text shown on hover", type: "textarea", help: "Wrap key phrases in **double asterisks** to make them bold." },
      { name: "image_id", label: "Card image", type: "image" },
      { name: "back_image_id", label: "Hover image (optional, shown at full size behind the text)", type: "image" },
      { name: "link", label: "Link", type: "text", help: "e.g. /projects/construction" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
    ],
  },
  projects: {
    table: "projects", label: "Project", plural: "Projects", titleField: "title",
    orderBy: "sort, id", columns: ["title", "categories", "published"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Leave blank to generate from the title." },
      { name: "categories", label: "Show in categories", type: "checkboxes", options: CATEGORIES },
      { name: "subtitle", label: "Subtitle (shown under the title on the project page)", type: "text" },
      { name: "cover_id", label: "Cover image", type: "image" },
      { name: "body", label: "Project information", type: "textarea", help: "Blank lines create new paragraphs." },
      { name: "scope", label: "Project scope (one per line)", type: "textarea" },
      { name: "concept_title", label: "Design concept title", type: "text" },
      { name: "concept_text", label: "Design concept text", type: "textarea" },
      { name: "gallery_ids", label: "Project images", type: "images" },
      { name: "featured", label: "Highlight", type: "checkbox" },
      { name: "published", label: "Published", type: "checkbox" },
      { name: "sort", label: "Order (lowest first)", type: "number" },
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
  ]},
  { title: "Footer", fields: [
    { name: "footer_services", label: "Footer services list (one per line)", type: "textarea" },
  ]},
];
