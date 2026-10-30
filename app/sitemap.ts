import type { MetadataRoute } from "next";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const projects = await q<{ slug: string }>("SELECT slug FROM projects WHERE published");
  return [
    ...["", "/about", "/projects", "/projects/conceptual-design", "/projects/architectural-design", "/projects/construction", "/projects/project-management", "/gallery", "/contact"].map((p) => ({ url: `${base}${p}` })),
    ...projects.map((p) => ({ url: `${base}/portfolio/${p.slug}` })),
  ];
}
