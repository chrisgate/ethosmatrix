// Starter content for the revamp sections. Everything here is taken from what the original site
// already says (services, categories, address, hours) so nothing invented ends up on the site.
// Used by seed.mjs and by migrate-revamp.mjs (for databases seeded before the revamp).
import { scrapeProject } from "./scrape.mjs";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SERVICES = {
  "Architectural Design": {
    slug: "architectural-design",
    related: "Architectural Design",
    scope: ["Exterior / Facade Design", "Interior Design"],
  },
  "Construction Services": {
    slug: "construction",
    related: "Construction",
    scope: ["Renovation", "Remodeling", "Project Management"],
  },
  "Real Estate Services": {
    slug: "real-estate",
    related: "Architectural Design",
    scope: ["Consultancy services", "Property Development"],
  },
  "Development": {
    slug: "development",
    related: "Construction",
    scope: ["Concept creation and feasibility studies", "Strategic planning", "Design coordination", "Execution and completion"],
  },
};

const STEPS = [
  ["Conceptual Design", "Concept creation and feasibility studies that turn an ambitious vision into a clear direction."],
  ["Architectural Design", "Innovative, functional exterior, facade and interior design tailored to your needs."],
  ["Construction", "Quality, efficiency and durability at every stage, including renovation and remodeling."],
  ["Project Management", "Planning, coordination, budgeting and timely delivery, from start to handover."],
];

const FAQS = [
  ["What does Ethos Matrix do?", "We are a Nigerian-based turnkey real estate company offering a comprehensive range of services, from design and planning to construction and finishing. We have worked on office, hospitality and residential projects."],
  ["Do you handle both design and construction?", "Yes. Our turnkey approach covers conceptual design, architectural design, construction and project management, so one team can take a project from idea to completion."],
  ["Where are you based and when can I visit?", "Our office is at {address}. We are open {hours}."],
  ["How do I start a project?", "Request an appointment or send us your project brief on the quote page, and we will get back to you to discuss your requirements."],
];

const SETTINGS = {
  featured_title: "Featured projects",
  process_title: "How we work",
  process_subtitle: "From concept to handover",
  faq_title: "Frequently asked questions",
  cta_title: "Let's build something exceptional.",
  cta_text: "Tell us about your project and we will help you take it from concept to completion.",
  cta_button: "Start your project",
  quote_intro: "Tell us about your project. Share what you have in mind and we will get back to you to discuss the next steps.",
  quote_types: "Conceptual Design\nArchitectural Design\nConstruction\nRenovation & Remodeling\nProject Management\nReal Estate Consultancy\nProperty Development\nOther",
  quote_timelines: "As soon as possible\nWithin 3 months\n3 to 6 months\n6 to 12 months\nJust exploring",
  quote_budgets: "",
  same_as: "",
  wa_title: "Hello there",
  wa_message: "Welcome to Ethos Matrix Limited. We are a Nigerian turnkey real estate company offering design, planning, construction and finishing.

Please tell us your name and how we can help you today.",
  wa_prefill: "Hello Ethos Matrix, I would like to make an enquiry.",
  wa_button: "Open chat",
  wa_delay: "8",
};

// Projects worth highlighting on the home page (one or two per service line).
const FEATURED = [
  "trustfund-pensions", "nigerian-breweries-nb", "chapel-hill-denham",
  "lekki-phase-1-development", "vi-house-renovation", "insight-publicis-office-project",
];

const PAGES = {
  "nigerian-breweries-nb": "/portfolio/nigerian-breweries-nb/", "lekki-phase-1-development": "/portfolio/bluemarine-estate/",
  "insight-publicis-office-project": "/portfolio/insight/", "eyo-cultural-center": "/portfolio/erelu/", "heineken": "/portfolio/heneiken/",
  "the-venue": "/portfolio/the-venue/", "beach-front": "/portfolio/beach-front/", "gerrard-3": "/portfolio/restaurant/",
  "the-archbishop-s-grotto": "/portfolio/grotto/", "trustfund-pensions": "/portfolio/trust-fund-2/",
  "chapel-hill-denham": "/portfolio/retails/", "danfodio-residential-development-apapa": "/portfolio/mr-opes-residence-development/",
  "brompton-city": "/portfolio/brompton-city/", "christ-avenue-residences": "/portfolio/paragon/",
  "shopping-mall": "/portfolio/surulere-shopping-mall/", "the-tri-towers": "/portfolio/the-tri-towers/",
  "zim-lansal": "/portfolio/zim-apapa/", "vi-house-renovation": "/portfolio/vi-apartment-renovation/",
  "gra-ikeja": "/portfolio/culture-library/", "ile-ounje": "/portfolio/ile-ounje/",
  "university-hostel": "/portfolio/beauty-center/", "eric-kayser": "/portfolio/eric-kayser/",
};

export async function applyRevampContent(q, { scrapeFacts = true } = {}) {
  const strip = (s) => s.replace(/\*\*/g, "");

  // Service pages
  for (const [title, v] of Object.entries(SERVICES)) {
    const [row] = await q("SELECT id, description FROM services WHERE title = $1", [title]);
    if (!row) continue;
    await q(
      "UPDATE services SET slug=$1, intro=$2, scope=$3, related_category=$4, link='' WHERE id=$5",
      [v.slug, strip(row.description), v.scope.join("\n"), v.related, row.id],
    );
  }

  // Settings (do not overwrite anything an editor already changed)
  for (const [k, v] of Object.entries(SETTINGS)) {
    await q("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING", [k, v]);
  }
  for (const [to, from] of [["banner_quote_id", "banner_contact_id"], ["banner_insights_id", "banner_projects_id"]]) {
    const [r] = await q("SELECT value FROM settings WHERE key=$1", [from]);
    if (r) await q("INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING", [to, r.value]);
  }

  // Counters and steps only if still empty
  if (!(await q("SELECT 1 FROM stats LIMIT 1")).length) {
    const [{ n: projects }] = await q("SELECT count(*)::int AS n FROM projects WHERE published");
    const [{ n: services }] = await q("SELECT count(*)::int AS n FROM services");
    const [{ n: clients }] = await q("SELECT count(*)::int AS n FROM clients");
    const stats = [[projects, "", "Projects showcased"], [services, "", "Service lines"], [clients, "", "Featured clients"]];
    for (const [i, [value, suffix, label]] of stats.entries()) {
      await q("INSERT INTO stats (value, suffix, label, sort) VALUES ($1,$2,$3,$4)", [value, suffix, label, i]);
    }
  }
  if (!(await q("SELECT 1 FROM steps LIMIT 1")).length) {
    for (const [i, [t, d]] of STEPS.entries()) await q("INSERT INTO steps (title, description, sort) VALUES ($1,$2,$3)", [t, d, i]);
  }
  if (!(await q("SELECT 1 FROM faqs LIMIT 1")).length) {
    const get = async (k) => (await q("SELECT value FROM settings WHERE key=$1", [k]))[0]?.value ?? "";
    const address = await get("address");
    const hours = await get("hours");
    for (const [i, [question, answer]] of FAQS.entries()) {
      await q("INSERT INTO faqs (question, answer, sort) VALUES ($1,$2,$3)", [question, answer.replace("{address}", address).replace("{hours}", hours), i]);
    }
  }

  // Featured flags and project facts scraped from the original project pages
  await q("UPDATE projects SET featured = (slug = ANY($1))", [FEATURED]);
  if (scrapeFacts) {
    let n = 0;
    for (const [slug, page] of Object.entries(PAGES)) {
      const info = await scrapeProject(page).catch(() => null);
      if (!info) continue;
      await q(
        `UPDATE projects SET client = CASE WHEN client = '' THEN $2 ELSE client END,
           location = CASE WHEN location = '' THEN $3 ELSE location END,
           year = CASE WHEN year = '' THEN $4 ELSE year END,
           size = CASE WHEN size = '' THEN $5 ELSE size END,
           video_url = CASE WHEN video_url = '' THEN $6 ELSE video_url END
         WHERE slug = $1`,
        [slug, info.client, info.location, info.year, info.size, info.video],
      );
      n++;
    }
    console.log(`project facts scraped for ${n} projects`);
  }
  console.log("revamp content applied");
}

export { slugify };
