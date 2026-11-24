// Creates the admin login, or resets its password if the email already exists.
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment (set in Coolify, or `node --env-file=.env.local scripts/create-admin.mjs`).
// Only needs `pg`, so it also runs inside the production container: `npm run admin`.
import { readFileSync } from "node:fs";
import { randomBytes, scrypt } from "node:crypto";
import path from "node:path";
import pg from "pg";

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const pw = process.env.ADMIN_PASSWORD ?? "";
if (!email || pw.length < 10) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 10 characters.");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(readFileSync(path.join(process.cwd(), "lib", "schema.sql"), "utf8"));

const salt = randomBytes(16).toString("hex");
const hash = await new Promise((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k.toString("hex")))));
await pool.query(
  "INSERT INTO users (email, password_hash) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
  [email, `${salt}:${hash}`],
);
console.log("admin ready:", email);
await pool.end();
