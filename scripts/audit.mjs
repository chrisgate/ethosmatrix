// Crawls the local site and reports basic SEO / accessibility / link problems.
// Usage: node --env-file=.env.local audit.mjs  (run from the project folder)
import pg from "pg";

const BASE = "http://localhost:3000";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = async (t) => (await pool.query(t)).rows;

const [services, projects, posts] = await Promise.all([
  q("SELECT slug FROM services WHERE slug IS NOT NULL AND slug <> ''"),
  q("SELECT slug FROM projects WHERE published"),
  q("SELECT slug FROM posts WHERE published"),
]);
await pool.end();

const routes = [
  "/", "/about", "/services", ...services.map((s) => `/services/${s.slug}`),
  "/projects", "/projects/all", "/projects/conceptual-design", "/projects/architectural-design",
  "/projects/construction", "/projects/project-management",
  ...projects.map((p) => `/portfolio/${p.slug}`),
  "/gallery", "/contact", "/quote", "/blog", ...posts.map((p) => `/blog/${p.slug}`),
];

const get = async (path) => {
  const r = await fetch(BASE + path, { redirect: "manual" });
  return { status: r.status, html: r.status === 200 ? await r.text() : "", type: r.headers.get("content-type") };
};

const problems = [];
const links = new Set();
const rows = [];
for (const route of routes) {
  const { status, html } = await get(route);
  if (status !== 200) { problems.push(`${route}: HTTP ${status}`); continue; }
  const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? "";
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/\balt=/.test(i)).length;
  const emptyAlt = imgs.filter((i) => /\balt=""/.test(i)).length;
  const ld = (html.match(/application\/ld\+json/g) ?? []).length;
  const og = /property="og:title"/.test(html);
  rows.push({ route, title: title.slice(0, 48), desc: desc.length, h1, imgs: imgs.length, noAlt, emptyAlt, ld, og });
  if (!title) problems.push(`${route}: missing <title>`);
  if (desc.length < 50) problems.push(`${route}: meta description ${desc.length ? "short (" + desc.length + ")" : "missing"}`);
  if (h1 !== 1) problems.push(`${route}: ${h1} <h1> elements`);
  if (noAlt) problems.push(`${route}: ${noAlt} images without alt attribute`);
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) links.add(m[1]);
}

const unchecked = [...links].filter((l) => !routes.includes(l) && !l.startsWith("/_next") && !l.startsWith("/media/"));
for (const l of unchecked) {
  const { status } = await get(l);
  if (status >= 400 || status === 0) problems.push(`broken link target ${l}: HTTP ${status}`);
}

console.table(rows);
console.log("\nunique internal links checked:", links.size);
console.log(problems.length ? "\nPROBLEMS:\n" + problems.map((p) => " - " + p).join("\n") : "\nNo problems found.");

const nf = await get("/this-page-does-not-exist");
console.log("\n404 status:", nf.status);
const fav = await get("/favicon.ico");
console.log("favicon.ico status:", fav.status, fav.type);
