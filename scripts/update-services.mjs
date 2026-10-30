// One-off: loads the original hover texts and the Real Estate hover image into the existing database.
// Usage: node --env-file=.env.local scripts/update-services.mjs
import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const texts = {
  "Architectural Design": "We provide innovative and functional architectural solutions tailored to client needs. Our services include **Exterior / Facade Design,** creating visually striking and climate-responsive building envelopes, and **Interior Design,** delivering well-planned, aesthetic, and comfortable interior spaces that balance beauty with functionality.",
  "Construction Services": "Our construction services ensure quality, efficiency, and durability at every stage. We handle **Renovation** and **Remodeling** to upgrade and transform existing spaces, alongside comprehensive **Project Management** to oversee planning, coordination, budgeting, and timely delivery.",
  "Real Estate Services": "We offer professional **Consultancy services** to guide clients in informed property decisions and strategic investments. Our **Property Development** service covers planning, development, and execution of residential and commercial projects, delivering value-driven and sustainable real estate solutions.",
  "Development": "We manage end-to-end development processes from concept creation and feasibility studies to execution and completion. Our development services focus on strategic planning, design coordination, and delivering projects that meet market demands while maintaining quality and long-term value.",
};
for (const [title, d] of Object.entries(texts)) {
  await pool.query("UPDATE services SET description=$1 WHERE title=$2", [d, title]);
}

const res = await fetch("https://ethosmatrix.com/wp-content/uploads/2026/02/Image_4-1-scaled.png", { headers: { "User-Agent": "Mozilla/5.0 (ethosmatrix-seed)" } });
const buf = await sharp(Buffer.from(await res.arrayBuffer())).resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
const filename = `${randomBytes(4).toString("hex")}-image-4-1.webp`;
await writeFile(path.join(process.cwd(), "uploads", filename), buf);
const { rows } = await pool.query(
  "INSERT INTO media (filename, original_name, mime, size, alt) VALUES ($1,'Image_4-1-scaled.png','image/webp',$2,'Real estate') RETURNING id",
  [filename, buf.length],
);
await pool.query("UPDATE services SET back_image_id=$1 WHERE title='Real Estate Services'", [rows[0].id]);
console.log("services updated");
await pool.end();
