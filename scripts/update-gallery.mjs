// One-off: converts the flat gallery into the original's three carousels and sets the Events banner.
// Usage: node --env-file=.env.local scripts/update-gallery.mjs
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query("SELECT id, original_name FROM media WHERE original_name ~ '^(1-1|2-1|3-2|4|5|6)\.webp$'");
const id = Object.fromEntries(rows.map((r) => [r.original_name.replace(".webp", ""), r.id]));
const sets = [
  ["Two-up carousel", ["6", "5", "1-1"]],
  ["Fade slideshow", ["3-2", "2-1", "1-1"]],
  ["Full-width slideshow", ["4", "5", "3-2", "6", "2-1"]],
];
await pool.query("DELETE FROM gallery");
for (const [section, names] of sets) {
  for (const [i, n] of names.entries()) {
    if (id[n]) await pool.query("INSERT INTO gallery (image_id, caption, section, sort) VALUES ($1,'',$2,$3)", [id[n], section, i]);
  }
}
await pool.query("INSERT INTO settings (key,value) VALUES ('banner_gallery_id',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [String(id["2-1"])]);
console.log("gallery rows:", (await pool.query("SELECT count(*) FROM gallery")).rows[0].count, "images found:", Object.keys(id).join(","));
await pool.end();
