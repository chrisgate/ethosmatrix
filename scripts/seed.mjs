// Usage:
//   npm run seed          first-time setup (refuses to overwrite existing content)
//   npm run seed:reset    wipes site content and reloads it from the old site
// Creates tables, the admin user, and loads content + images from https://ethosmatrix.com
import { readFileSync } from "node:fs";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { randomBytes, scrypt } from "node:crypto";
import path from "node:path";
import pg from "pg";
import { scrapeProject } from "./scrape.mjs";
import { optimizeAll } from "./optimize-media.mjs";
import { applyRevampContent } from "./revamp-content.mjs";

const FORCE = process.argv.includes("--force");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = async (t, p = []) => (await pool.query(t, p)).rows;
const UPLOADS = path.join(process.cwd(), "uploads");
const BASE = "https://ethosmatrix.com/wp-content/uploads/";

await pool.query(readFileSync(path.join(process.cwd(), "lib", "schema.sql"), "utf8"));

// --- admin user
const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
const pw = process.env.ADMIN_PASSWORD ?? "";
if (!email || !pw) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
const salt = randomBytes(16).toString("hex");
const hash = await new Promise((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k.toString("hex")))));
await q(
  "INSERT INTO users (email, password_hash) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
  [email, `${salt}:${hash}`],
);
console.log("admin user ready:", email);

if ((await q("SELECT 1 FROM settings LIMIT 1")).length) {
  if (!FORCE) {
    console.log("Content already exists. Run `npm run seed:reset` to wipe and reload it.");
    await pool.end();
    process.exit(0);
  }
  await q("TRUNCATE settings, media, slides, services, projects, clients, gallery, testimonials, stats, steps, faqs, posts RESTART IDENTITY CASCADE");
  for (const f of await readdir(UPLOADS)) if (f !== ".gitkeep") await unlink(path.join(UPLOADS, f));
}
await mkdir(UPLOADS, { recursive: true });

// --- images (cached by source path, downloaded 3 at a time)
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const cache = new Map();
async function download(rel) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(BASE + rel, { headers: { "User-Agent": "Mozilla/5.0 (ethosmatrix-seed)" } });
      if (!res.ok) { console.warn("skip", rel, res.status); return null; }
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt === 4) { console.warn("failed", rel, e.cause?.code ?? e.message); return null; }
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}
function img(rel, alt = "") {
  if (!rel) return Promise.resolve(null);
  if (!cache.has(rel)) {
    cache.set(rel, (async () => {
      const buf = await download(rel);
      if (!buf) return null;
      const ext = rel.split(".").pop().toLowerCase();
      const base = path.basename(rel, "." + ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-scaled/, "").slice(0, 60);
      const filename = `${randomBytes(4).toString("hex")}-${base}.${ext}`;
      await writeFile(path.join(UPLOADS, filename), buf);
      const [row] = await q(
        "INSERT INTO media (filename, original_name, mime, size, alt) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        [filename, path.basename(rel), MIME[ext], buf.length, alt || base.replace(/-/g, " ")],
      );
      return row.id;
    })());
  }
  return cache.get(rel);
}
async function pool3(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (i < items.length) { const n = i++; out[n] = await fn(items[n], n); }
  }));
  return out;
}
const ids = async (rels) => (await pool3(rels, (r) => img(r))).filter(Boolean);
const one = async (rel, alt) => (await img(rel, alt)) ?? "";

// --- static design assets (not CMS content)
await mkdir(path.join(process.cwd(), "public", "img"), { recursive: true });
for (const [n, rel] of [[1, "2024/11/ribbon_64px.png"], [2, "2024/11/documents_64px.png"], [3, "2024/11/pencil_64px.png"]]) {
  const buf = await download(rel);
  if (buf) await writeFile(path.join(process.cwd(), "public", "img", `value-${n}.png`), buf);
}

// --- settings
console.log("images for settings...");
const S = {
  site_name: "Ethos Matrix",
  logo_id: await one("2020/06/lgw.png", "Ethos Matrix logo"),
  address: "17th Floor, Elephant House, 214 Broadstreet Marina, Lagos.",
  phone: "+234 8183999000",
  email: "info@ethosmatrix.com",
  hours: "Mon-Fri / 8:00 AM - 5:00 PM",
  whatsapp: "2348183999000",
  map_query: "17th Floor, Elephant House, 214 Broadstreet Marina, Lagos",
  seo_description: "Ethos Matrix Limited is a Nigerian turnkey real estate company offering architectural design, construction and property development.",
  intro_heading: "From revitalizing existing structures to shaping new horizons, we specialize in turning ambitious visions into tangible reality.",
  about_text: "We are a Nigerian-based turnkey real estate company that offers a comprehensive range of services, from design and planning to construction and finishing. We have worked on various projects, including office design, hospitality design, and residential design.",
  carousel_ids: (await ids([
    "2026/02/bedroom.jpg", "2026/02/fluted-panel-installation-2-scaled.jpg", "2024/10/IMG_5117-scaled.jpg",
    "2026/02/dividers-installation-3-scaled.jpg", "2026/02/dividers-installation-4-scaled.jpg", "2026/02/marking-out-scaled.jpg",
    "2026/02/Right-wing-Outcome-1-scaled.jpg", "2026/02/bedroom-Apartment-renovation.jpg", "2026/02/Living-room.jpg",
    "2026/02/Living-room-upstairs.jpg", "2026/02/Pool-restoration.jpg",
  ])).join(","),
  services_title: "Our Services",
  services_subtitle: "Things we do",
  ceo_name: "Peter Makris",
  ceo_title: "CEO EthosMatrix",
  ceo_image_id: await one("2024/07/peter_makris.webp", "Peter Makris"),
  ceo_heading: "We prioritize quality, and diligence is central to our approach.",
  ceo_text: "People often wonder why I decided to enter the real estate market. The answer is straightforward: I have a genuine passion for creating unforgettable experiences for people. This enthusiasm led me to start EthosMatrix and motivates me to continually push boundaries with every project we undertake.",
  showcase_ids: (await ids([
    "2026/02/Enscape_2024-09-19-15-31-28_Living-Room-1-scaled.png", "2026/02/Enscape_2024-09-19-15-31-28_Living-Room-2-scaled.png",
    "2026/02/Enscape_2024-09-19-15-31-28_Living-room-3-scaled.png", "2026/02/Enscape_2024-09-19-15-31-28_Foyer-1-scaled.png",
    "2026/02/Enscape_2024-09-19-15-31-28_Kitchen-1-scaled.png", "2026/02/Enscape_2024-09-19-15-31-28_Bedroom-1-scaled.png",
    "2026/02/Enscape_2024-09-19-15-31-28_Balcony-2-scaled.png",
  ])).join(","),
  about_heading: "We transform your space into a functional and beautiful spot, with our bespoke design solution",
  about_page_text:
    "We are a Nigerian-based turnkey real estate company that offers a comprehensive range of services, from design and planning to construction and finishing. We have worked on various projects, including office design, hospitality design, and residential design.\n\nOur approach blends innovation and tradition to craft spaces that make an enduring impact, encompassing everything from rejuvenating interiors to reimagining exteriors. With a steadfast commitment to excellence, our renovations exceed expectations. Our artisans infuse skill and passion into each project, breathing new life into homes and spaces. Whether it's restoring historical charm or crafting modern marvels, we're your partners in uncovering potential. Experience the art of renovation and redefine your surroundings with us.",
  about_images: (await ids(["2024/09/view-1.jpg", "2024/09/view-3-1.jpg", "2024/09/view-2-1.jpg"])).join(","),
  values_intro: "We believe that diligence is the foundation of brilliance and that integrity will always be rewarded. Furthermore, we hold the view that excellence is not merely a skill but an attitude. These principles guide our work as we strive to elevate Africa’s luxury living to perfection.",
  values: "Deligence | Going the extra mile to Achieve extra ordinary result is the foundation of who we are\nIntegrity | Being a man of our word and doing what we say we will do\nExcellence | Exceeding expectations in the delivery of quality in everything we do",
  brochure_url: "https://ethosmatrix.com/wp-content/uploads/2024/10/ethos-matrix-brochure2.pdf",
  brochure_image_id: await one("2024/10/Perfect_Binding_Brochure_Mockup_6-copy-scaled.jpg", "Corporate brochure"),
  cat_conceptual_id: await one("2025/11/villa-1_3.png"),
  cat_architectural_id: await one("2026/02/Enscape_2024-09-19-15-31-28_Balcony-4-scaled-1.png"),
  cat_construction_id: await one("2026/02/5-2-scaled-1.jpg"),
  cat_management_id: await one("2025/10/6-scaled-1.jpg"),
  banner_about_id: await one("2024/10/3-3.jpg"),
  banner_projects_id: await one("2026/02/Real-D.jpg.jpeg"),
  banner_gallery_id: await one("2024/07/2-1.webp"),
  banner_contact_id: await one("2024/11/Enscape_2024-11-13-14-35-18_4D1.png"),
  footer_services: "Construction Consultant\nArchitecture Design\nReal Estate\nProperty Development",
};
for (const [k, v] of Object.entries(S)) {
  await q("INSERT INTO settings (key, value) VALUES ($1,$2)", [k, String(v ?? "")]);
}

// --- hero slides
const slides = [
  ["Building Beyond Boundaries", "Construction *Renovation* Remodeling", "View more", "/projects/construction", "2024/11/3-1.jpg"],
  ["Building Beyond Boundaries", "Exterior & Interior *Architecture* Conceptual Design", "View more", "/projects/architectural-design", "2024/11/Enscape_2024-11-13-14-35-18_4D1.png"],
];
for (const [i, [label, title, bt, bl, rel]] of slides.entries()) {
  await q("INSERT INTO slides (label,title,button_text,button_link,image_id,sort) VALUES ($1,$2,$3,$4,$5,$6)", [label, title, bt, bl, (await img(rel)) ?? null, i]);
}

// --- services
const services = [
  ["Architectural Design", "Exterior/Facade, Interior Design", "We provide innovative and functional architectural solutions tailored to client needs. Our services include **Exterior / Facade Design,** creating visually striking and climate-responsive building envelopes, and **Interior Design,** delivering well-planned, aesthetic, and comfortable interior spaces that balance beauty with functionality.", "2026/02/Enscape_2024-09-19-15-31-28_Balcony-4-scaled-1.png", null, "/projects/architectural-design"],
  ["Construction Services", "Strategic Planning/Design Coordination", "Our construction services ensure quality, efficiency, and durability at every stage. We handle **Renovation** and **Remodeling** to upgrade and transform existing spaces, alongside comprehensive **Project Management** to oversee planning, coordination, budgeting, and timely delivery.", "2019/06/flow02.webp", null, "/projects/construction"],
  ["Real Estate Services", "Exterior/Facade, Interior Design", "We offer professional **Consultancy services** to guide clients in informed property decisions and strategic investments. Our **Property Development** service covers planning, development, and execution of residential and commercial projects, delivering value-driven and sustainable real estate solutions.", "2026/02/Image_1-2-scaled.png", "2026/02/Image_4-1-scaled.png", "/projects/architectural-design"],
  ["Development", "Consultancy Services/Property Development", "We manage end-to-end development processes from concept creation and feasibility studies to execution and completion. Our development services focus on strategic planning, design coordination, and delivering projects that meet market demands while maintaining quality and long-term value.", "2026/02/5-2-scaled-1.jpg", null, "/projects/construction"],
];
for (const [i, [t, st, d, rel, backRel, link]] of services.entries()) {
  await q("INSERT INTO services (title,subtitle,description,image_id,back_image_id,link,sort) VALUES ($1,$2,$3,$4,$5,$6,$7)", [t, st, d, (await img(rel)) ?? null, backRel ? ((await img(backRel)) ?? null) : null, link, i]);
}

// --- clients (logos)
for (const [i, rel] of ["5", "6", "1", "2", "3", "7", "8", "9", "4"].entries()) {
  const id = await img(`2026/02/${rel}.jpg`, `Client logo ${i + 1}`);
  if (id) await q("INSERT INTO clients (name,image_id,sort) VALUES ($1,$2,$3)", [`Client ${i + 1}`, id, i]);
}

// --- testimonials
const zim = await img("2024/10/1-3.jpg", "ZIM");
const chd = await img("2024/10/chapel_hill_denham_cover-scaled.jpeg", "Chapel Hill Denham");
const testimonials = [
  ["“Thank you for a great Office!”", "Idan Kogan", "Chief Financial Officer", "ZIM", zim],
  ["“I am pleased to commend the services of Ethos Matrix Ltd. The team re-designed and built our new head office space at Chapel Hill Denham. We have worked with them for about two years, and they have consistently delivered excellent/professional service. The team is detailed, punctual and very keen to meet and exceed targets. Despite the peculiarity of our bespoke requirements, they were flexible enough to make things work as needed. I am confident in recommending the Firm’s services and would like to thank them for consistently delivering excellent results.”", "Oyinkan Ogundele", "Corporate Service", "Chapel Hill Denham", chd],
  ["“Ethos Matrix, Fantastic Job, we are very happy.”", "Todd Rives", "Managing Director", "ZIM", zim],
];
for (const [i, [quote, name, role, company, image]] of testimonials.entries()) {
  await q("INSERT INTO testimonials (quote,name,role,company,image_id,sort) VALUES ($1,$2,$3,$4,$5,$6)", [quote, name, role, company, image ?? null, i]);
}

// --- events gallery: three carousels reusing the same five photos in different orders
const G = ["Two-up carousel", "Fade slideshow", "Full-width slideshow"];
const gallerySets = [
  [G[0], ["6", "5", "1-1"]],
  [G[1], ["3-2", "2-1", "1-1"]],
  [G[2], ["4", "5", "3-2", "6", "2-1"]],
];
for (const [section, names] of gallerySets) {
  for (const [i, n] of names.entries()) {
    const id = await img(`2024/07/${n}.webp`, `Event photo ${n}`);
    if (id) await q("INSERT INTO gallery (image_id,caption,section,sort) VALUES ($1,'',$2,$3)", [id, section, i]);
  }
}

// --- projects (details and photos scraped from each project page)
const C = { con: "Conceptual Design", arc: "Architectural Design", bld: "Construction", pm: "Project Management" };
const projects = [
  ["Nigerian Breweries (NB)", [C.con], "2026/02/8-1.jpg", "/portfolio/nigerian-breweries-nb/"],
  ["Lekki Phase 1 Development", [C.con], "2024/11/LEKKI_PHASE_1_LAGOS_NIGERIA_1-scaled.jpg", "/portfolio/bluemarine-estate/"],
  ["Insight Publicis Office Project", [C.con], "2026/02/Scene-3_1-2-scaled.png", "/portfolio/insight/"],
  ["EYO Cultural Center", [C.con, C.arc], "2026/02/Real-C.jpg.jpeg", "/portfolio/erelu/"],
  ["Heineken", [C.con], "2026/02/12.jpg", "/portfolio/heneiken/"],
  ["The Venue", [C.con], "2024/11/main-op1-5-scaled.jpg", "/portfolio/the-venue/"],
  ["Beach Front", [C.con], "2019/06/cover01.webp", "/portfolio/beach-front/"],
  ["Gerrard 3", [C.con, C.arc], "2019/06/cover00-1-1.webp", "/portfolio/restaurant/"],
  ["The Archbishop's Grotto", [C.con], "2025/10/Scene-6-scaled.png", "/portfolio/grotto/"],
  ["TrustFund Pensions", [C.arc, C.pm], "2024/11/Scene-1_9.png", "/portfolio/trust-fund-2/"],
  ["Chapel Hill Denham", [C.arc, C.bld, C.pm], "2019/06/flow02.webp", "/portfolio/retails/"],
  ["Danfodio Residential Development, Apapa", [C.arc], "2026/02/Enscape_2024-11-13-14-35-18_4D.png", "/portfolio/mr-opes-residence-development/"],
  ["Brompton City", [C.arc], "2025/11/villa-1_3.png", "/portfolio/brompton-city/"],
  ["Christ Avenue Residences", [C.arc], "2026/02/CA5-scaled.png", "/portfolio/paragon/"],
  ["Shopping Mall", [C.arc], "2024/09/view-1.jpg", "/portfolio/surulere-shopping-mall/"],
  ["The Tri-Towers", [C.arc], "2024/07/2-2.jpg", "/portfolio/the-tri-towers/"],
  ["Zim-Lansal", [C.bld, C.pm], "2024/10/1-4.jpg", "/portfolio/zim-apapa/"],
  ["VI House Renovation", [C.bld], "2024/11/20230815_100604-scaled.jpg", "/portfolio/vi-apartment-renovation/"],
  ["GRA-Ikeja", [C.bld], "2019/06/20221031_125343-scaled.jpg", "/portfolio/culture-library/"],
  ["Ile Ounje", [C.bld], "2025/10/RENDER-2_2-Photo.jpg", "/portfolio/ile-ounje/"],
  ["University Hostel", [C.bld], "2018/06/20170425_081840-scaled.jpg", "/portfolio/beauty-center/"],
  ["Eric Kayser", [C.bld], "2026/02/Pi7_Tool_Picture17.jpg", "/portfolio/eric-kayser/"],
];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
for (const [i, [title, cats, coverRel, page]] of projects.entries()) {
  const info = (await scrapeProject(page)) ?? { subtitle: "", body: "", scope: "", concept_title: "", concept_text: "", images: [] };
  const coverId = await img(coverRel, title);
  const gal = (await ids(info.images.filter((r) => r !== coverRel).slice(0, 5))).filter((x) => x !== coverId);
  await q(
    `INSERT INTO projects (title,slug,categories,subtitle,body,scope,concept_title,concept_text,cover_id,gallery_ids,sort)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [title, slugify(title), cats, info.subtitle, info.body, info.scope, info.concept_title, info.concept_text, coverId ?? null, gal, i],
  );
  console.log(`project ${i + 1}/${projects.length}: ${title} (${gal.length} photos)`);
}

await applyRevampContent(q);
await optimizeAll(pool);
console.log("Seed complete. media files:", cache.size);
await pool.end();
