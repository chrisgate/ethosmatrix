// One-off: the original pages put the first letter of some paragraphs in its own element, so the
// scraper stored "A\n\nvisionary ..." instead of "A visionary ...". This rejoins them.
// Usage: node --env-file=.env.local scripts/fix-dropcaps.mjs
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const fix = (s) => (s ?? "").replace(/^(\S)[\s ]*\n[\s ]*\n[\s ]*(?=\S)/, (_, c, off, whole) => {
  // "A" + "visionary" -> "A visionary"; "T" + "he Archbishop" -> "The Archbishop"
  const next = whole.slice(_.length);
  return /^[a-z]/.test(next) && /^(T|A|W|O|I|S|P|C)$/.test(c) && /^(he|n|e|ur|t|s)\b/.test(next) ? c : c + " ";
});
const { rows } = await pool.query("SELECT id, slug, body, concept_text FROM projects");
let n = 0;
for (const r of rows) {
  const body = fix(r.body), concept = fix(r.concept_text);
  if (body !== r.body || concept !== r.concept_text) {
    await pool.query("UPDATE projects SET body=$1, concept_text=$2 WHERE id=$3", [body, concept, r.id]);
    console.log("fixed", r.slug, "->", JSON.stringify(body.slice(0, 50)));
    n++;
  }
}
console.log(`${n} projects fixed`);
await pool.end();
