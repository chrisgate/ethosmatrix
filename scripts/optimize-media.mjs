// Usage: npm run optimize
// Downsizes (max 2400px wide) and re-encodes heavy images as WebP. References are by media id,
// so renaming the file on disk is safe. Called automatically at the end of the seed.
import { readFile, unlink, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import sharp from "sharp";

const UPLOADS = path.join(process.cwd(), "uploads");

export async function optimizeAll(pool) {
  const { rows } = await pool.query("SELECT id, filename, mime, size FROM media ORDER BY id");
  let saved = 0, changed = 0;
  for (const m of rows) {
    const file = path.join(UPLOADS, m.filename);
    try {
      const buf = await readFile(file);
      const meta = await sharp(buf).metadata();
      const heavy = m.size > 700 * 1024 || (m.mime === "image/png" && m.size > 150 * 1024) || (meta.width ?? 0) > 2400;
      if (!heavy || m.mime === "image/gif") continue;
      const out = await sharp(buf).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      if (out.length >= buf.length * 0.95 && m.mime === "image/webp") continue;
      const filename = m.filename.replace(/\.[^.]+$/, "") + ".webp";
      await writeFile(path.join(UPLOADS, filename), out);
      await pool.query("UPDATE media SET filename=$1, mime='image/webp', size=$2 WHERE id=$3", [filename, out.length, m.id]);
      if (filename !== m.filename) await unlink(file).catch(() => {});
      saved += buf.length - out.length;
      changed++;
    } catch (e) {
      console.warn("optimize skipped", m.filename, e.message);
    }
  }
  console.log(`optimized ${changed} images, saved ${(saved / 1048576).toFixed(1)} MB`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  await optimizeAll(pool);
  await pool.end();
}
