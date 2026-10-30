// Usage: npm run seed:blog
// Adds the starter blog articles to a database that has none. Safe to re-run: it never overwrites articles.
import pg from "pg";
import { applyBlogContent } from "./blog-content.mjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = async (t, p = []) => (await pool.query(t, p)).rows;
await applyBlogContent(q);
await pool.end();
