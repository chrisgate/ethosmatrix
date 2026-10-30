import { q } from "./db";

export type PostRow = {
  id: number; title: string; slug: string; excerpt: string; body: string; categories: string;
  published_at: Date; filename: string | null; alt: string | null;
};

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** "Article, Construction" -> [{ name: "Article", slug: "article" }, ...] */
export const parseCategories = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean).map((name) => ({ name, slug: slugify(name) }));

export const readMinutes = (body: string) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));

export const longDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const monthKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

/** All published posts, newest first. */
export async function getPublishedPosts() {
  return q<PostRow>(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.body, p.categories, p.published_at, m.filename, m.alt
     FROM posts p LEFT JOIN media m ON m.id = p.cover_id
     WHERE p.published AND p.published_at <= now()
     ORDER BY p.published_at DESC, p.id DESC`,
  );
}

/** Category and month counts for the sidebar. */
export function blogFacets(posts: Pick<PostRow, "categories" | "published_at">[]) {
  const cats = new Map<string, { name: string; slug: string; count: number }>();
  const months = new Map<string, number>();
  for (const p of posts) {
    for (const c of parseCategories(p.categories)) {
      const cur = cats.get(c.slug);
      cats.set(c.slug, { name: cur?.name ?? c.name, slug: c.slug, count: (cur?.count ?? 0) + 1 });
    }
    const k = monthKey(p.published_at);
    months.set(k, (months.get(k) ?? 0) + 1);
  }
  return {
    categories: [...cats.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    months: [...months.entries()].map(([key, count]) => ({ key, label: monthLabel(key), count })),
  };
}
