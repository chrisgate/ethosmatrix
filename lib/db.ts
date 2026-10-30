import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const g = globalThis as unknown as { pool?: Pool; ready?: Promise<void> };

export const pool =
  g.pool ?? (g.pool = new Pool({ connectionString: process.env.DATABASE_URL }));

export function ready(): Promise<void> {
  return (g.ready ??= pool
    .query(readFileSync(path.join(process.cwd(), "lib", "schema.sql"), "utf8"))
    .then(() => undefined));
}

export async function q<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ready();
  return (await pool.query(text, params)).rows as T[];
}
