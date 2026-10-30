import type { MetadataRoute } from "next";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const [projects, services, posts] = await Promise.all([
    q<{ slug: string }>("SELECT slug FROM projects WHERE published"),
    q<{ slug: string }>("SELECT slug FROM services WHERE slug IS NOT NULL AND slug <> ''"),
    q<{ slug: string; published_at: Date }>("SELECT slug, published_at FROM posts WHERE published AND published_at <= now()"),
  ]);
  const pages = [
    "", "/about", "/services", "/projects", "/projects/all",
    "/projects/conceptual-design", "/projects/architectural-design", "/projects/construction", "/projects/project-management",
    ...(posts.length ? ["/insights"] : []),
    "/gallery", "/contact", "/quote",
  ];
  return [
    ...pages.map((p) => ({ url: `${base}${p}` })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}` })),
    ...projects.map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
    ...posts.map((p) => ({ url: `${base}/insights/${p.slug}`, lastModified: p.published_at })),
  ];
}
