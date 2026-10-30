import { q } from "./db";

export type Settings = Record<string, string>;
export type Media = { id: number; filename: string; alt: string; original_name: string };

export const CATEGORIES = [
  "Conceptual Design",
  "Architectural Design",
  "Construction",
  "Project Management",
] as const;

/** The three carousels on the Events (gallery) page. */
export const GALLERY_SECTIONS = ["Two-up carousel", "Fade slideshow", "Full-width slideshow"] as const;

export const categorySlug = (c: string) => c.toLowerCase().replace(/\s+/g, "-");

/** Maps a category to the settings key that holds its card image. */
export const CATEGORY_IMAGE_KEY: Record<string, string> = {
  "Conceptual Design": "cat_conceptual_id",
  "Architectural Design": "cat_architectural_id",
  "Construction": "cat_construction_id",
  "Project Management": "cat_management_id",
};

export async function getSettings(): Promise<Settings> {
  const rows = await q<{ key: string; value: string }>("SELECT key, value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const parseIds = (s?: string | null) =>
  (s ?? "").split(",").map((x) => Number(x.trim())).filter(Boolean);

export const lines = (s?: string | null) =>
  (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

export const paragraphs = (s?: string | null) =>
  (s ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export async function getMediaByIds(ids: number[]): Promise<Media[]> {
  if (!ids.length) return [];
  const rows = await q<Media>(
    "SELECT id, filename, alt, original_name FROM media WHERE id = ANY($1::int[])",
    [ids],
  );
  const map = new Map(rows.map((r) => [r.id, r]));
  return ids.map((i) => map.get(i)).filter(Boolean) as Media[];
}

export async function getMedia(id?: number | string | null): Promise<Media | null> {
  const n = Number(id);
  if (!n) return null;
  return (await getMediaByIds([n]))[0] ?? null;
}

export type Project = {
  id: number; title: string; slug: string; categories: string[]; subtitle: string; summary: string;
  body: string; scope: string; concept_title: string; concept_text: string; location: string; year: string;
  cover_id: number | null; gallery_ids: number[]; featured: boolean; published: boolean;
  cover_file: string | null; cover_alt: string | null;
};

const PROJECT_SELECT = `SELECT p.*, m.filename AS cover_file, m.alt AS cover_alt FROM projects p
  LEFT JOIN media m ON m.id = p.cover_id`;

export async function getProjects(opts: { category?: string; featured?: boolean; limit?: number; exclude?: number } = {}) {
  const where = ["p.published"];
  const params: unknown[] = [];
  if (opts.category) { params.push(opts.category); where.push(`$${params.length} = ANY(p.categories)`); }
  if (opts.featured) where.push("p.featured");
  if (opts.exclude) { params.push(opts.exclude); where.push(`p.id <> $${params.length}`); }
  const limit = opts.limit ? `LIMIT ${Number(opts.limit)}` : "";
  return q<Project>(`${PROJECT_SELECT} WHERE ${where.join(" AND ")} ORDER BY p.sort, p.id ${limit}`, params);
}

export async function getProject(slug: string) {
  const [p] = await q<Project>(`${PROJECT_SELECT} WHERE p.slug = $1 AND p.published`, [slug]);
  return p ?? null;
}
