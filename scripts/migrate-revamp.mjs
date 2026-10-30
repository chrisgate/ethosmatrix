// Usage: npm run migrate:revamp
// Adds the revamp starter content (service pages, stats, steps, FAQs, project facts) to a database
// that was seeded before the revamp. Safe to re-run: it never overwrites edits.
import pg from "pg";
import { applyRevampContent } from "./revamp-content.mjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = async (t, p = []) => (await pool.query(t, p)).rows;
await applyRevampContent(q);
await pool.end();
