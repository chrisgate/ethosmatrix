import type { Metadata } from "next";
import { GalleryExplorer, type GalleryItem } from "@/components/GalleryExplorer";
import { PageBanner } from "@/components/PageBanner";
import { CATEGORIES, getMedia, getMediaByIds, getSettings } from "@/lib/content";
import { q } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Ethos Matrix projects across design, construction and development, and moments from our events.",
};

type P = { id: number; title: string; slug: string; categories: string[]; cover_id: number | null; gallery_ids: number[] };

export default async function GalleryPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_gallery_id);
  const [projects, eventMedia] = await Promise.all([
    q<P>(`SELECT id, title, slug, categories, cover_id, gallery_ids FROM projects WHERE published ORDER BY sort, id`),
    q<{ image_id: number; caption: string }>("SELECT DISTINCT ON (image_id) image_id, caption FROM gallery ORDER BY image_id"),
  ]);

  // One list for the explorer: every project photo plus the event photos.
  const mediaIds = [...new Set([...projects.flatMap((p) => [p.cover_id, ...(p.gallery_ids ?? [])]), ...eventMedia.map((e) => e.image_id)].filter(Boolean) as number[])];
  const media = new Map((await getMediaByIds(mediaIds)).map((m) => [m.id, m]));
  const make = (id: number, title: string, tags: string[], href?: string): GalleryItem | null => {
    const m = media.get(id);
    return m ? { id, src: `/media/${m.filename}`, w: m.width ?? 1200, h: m.height ?? 900, alt: m.alt || title, title, href, tags } : null;
  };

  // Round-robin across projects so neighbouring photos differ.
  const groups: GalleryItem[][] = projects.map((p) =>
    [...new Set([p.cover_id, ...(p.gallery_ids ?? [])].filter(Boolean) as number[])]
      .map((id) => make(id, p.title, p.categories.length ? p.categories : ["Projects"], `/portfolio/${p.slug}`))
      .filter(Boolean) as GalleryItem[],
  );
  groups.push(eventMedia.map((e) => make(e.image_id, e.caption || "Ethos Matrix event", ["Events"])).filter(Boolean) as GalleryItem[]);
  const items: GalleryItem[] = [];
  const seen = new Set<string>();
  for (let i = 0; groups.some((g) => i < g.length); i++) {
    for (const g of groups) {
      const it = g[i];
      const key = it ? `${it.id}-${it.tags[0]}-${it.title}` : "";
      if (it && !seen.has(key)) { seen.add(key); items.push(it); }
    }
  }
  // Events comes first after "All".
  const filters = [
    ...(items.some((i) => i.tags.includes("Events")) ? ["Events"] : []),
    ...CATEGORIES.filter((c) => items.some((i) => i.tags.includes(c))),
  ];

  return (
    <>
      <PageBanner title="Gallery" kicker="Our work & events" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />

      <section className="bg-white pb-20 pt-4">
        <p className="mx-auto mb-9 max-w-[640px] px-5 text-center font-quicksand text-[16px] font-light leading-relaxed text-[#666]">
          {s.gallery_intro || "A look at our projects and the moments behind them. Tap any photo to see it full screen."}
        </p>
        <GalleryExplorer items={items} filters={filters} />
      </section>
    </>
  );
}
