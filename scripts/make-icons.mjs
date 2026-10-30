// Usage: npm run icons
// Builds the favicon and touch icons from the logo's icon glyph (left part of the logo image):
// app/icon.png, app/apple-icon.png and app/favicon.ico.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query(
  "SELECT m.filename FROM media m JOIN settings s ON s.value = m.id::text WHERE s.key = 'logo_id'",
);
await pool.end();
if (!rows[0]) throw new Error("No logo set. Upload one under Site content first.");

const logo = path.join(process.cwd(), "uploads", rows[0].filename);
const meta = await sharp(logo).metadata();

// The glyph is the first opaque run of columns, before the gap that precedes the lettering.
const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const opaque = Array.from({ length: info.width }, (_, x) => {
  for (let y = 0; y < info.height; y++) if (data[(y * info.width + x) * 4 + 3] > 20) return true;
  return false;
});
let first = opaque.indexOf(true), last = first;
for (let x = first; x < info.width; x++) {
  if (opaque[x]) last = x;
  else if (x - last > 6) break; // gap wider than the glyph's own detail: the glyph has ended
}
const cropped = await sharp(logo)
  .extract({ left: first, top: 0, width: last - first + 1, height: meta.height })
  .toBuffer();
const glyph = await sharp(cropped).trim().toBuffer();

/** The glyph centred on a dark square (70% of its width), as a PNG. */
const square = async (size) =>
  sharp({ create: { width: size, height: size, channels: 4, background: "#0b0b0b" } })
    .composite([{ input: await sharp(glyph).resize({ width: Math.round(size * 0.7), height: Math.round(size * 0.7), fit: "inside" }).toBuffer(), gravity: "centre" }])
    .png()
    .toBuffer();

const out = (f) => path.join(process.cwd(), "app", f);
const png192 = await square(192);
const png180 = await square(180);
const png48 = await square(48);

// favicon.ico: a single 48x48 PNG image wrapped in an ICO container
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6); header.writeUInt8(48, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png48.length, 14); header.writeUInt32LE(22, 18);

// Social-sharing card (1200x630): the first hero image, darkened, with the logo.
const pool2 = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const hero = (await pool2.query("SELECT m.filename FROM slides s JOIN media m ON m.id = s.image_id ORDER BY s.sort, s.id LIMIT 1")).rows[0];
await pool2.end();
if (hero) {
  const shade = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`,
  );
  const logoSmall = await sharp(logo).resize({ width: 330 }).toBuffer();
  const card = await sharp(path.join(process.cwd(), "uploads", hero.filename))
    .resize(1200, 630, { fit: "cover" })
    .composite([{ input: shade }, { input: logoSmall, left: 70, top: 440 }])
    .jpeg({ quality: 86 })
    .toBuffer();
  await writeFile(out("opengraph-image.jpg"), card);
  await writeFile(out("twitter-image.jpg"), card);
}

await writeFile(out("icon.png"), png192);
await writeFile(out("apple-icon.png"), png180);
await writeFile(out("favicon.ico"), Buffer.concat([header, png48]));
console.log("icons written: app/icon.png, app/apple-icon.png, app/favicon.ico");
