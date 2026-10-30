// Usage: npm run measure
// Records the pixel size of every uploaded photo (used by the gallery layout).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import sharp from "sharp";

export async function measureAll(pool) {
  await pool.query("ALTER TABLE media ADD COLUMN IF NOT EXISTS width INT");
  await pool.query("ALTER TABLE media ADD COLUMN IF NOT EXISTS height INT");
  const { rows } = await pool.query("SELECT id, filename FROM media WHERE width IS NULL OR height IS NULL");
  let n = 0;
  for (const m of rows) {
    try {
      const meta = await sharp(await readFile(path.join(process.cwd(), "uploads", m.filename))).metadata();
      if (meta.width && meta.height) {
        await pool.query("UPDATE media SET width=$1, height=$2 WHERE id=$3", [meta.width, meta.height, m.id]);
        n++;
      }
    } catch (e) {
      console.warn("measure skipped", m.filename, e.message);
    }
  }
  console.log(`measured ${n} photos`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  await measureAll(pool);
  await pool.end();
}
