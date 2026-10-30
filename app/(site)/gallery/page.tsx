import type { Metadata } from "next";
import Image from "next/image";
import { FadeShow } from "@/components/FadeShow";
import { GalleryExplorer, type GalleryItem } from "@/components/GalleryExplorer";
import { PageBanner } from "@/components/PageBanner";
import { Slider } from "@/components/Slider";
import { CATEGORIES, GALLERY_SECTIONS, getMedia, getMediaByIds, getSettings } from "@/lib/content";
import { q } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Ethos Matrix projects across design, construction and development, and moments from our events.",
};

type G = { id: number; section: string; caption: string; filename: string; alt: string };
type P = { id: number; title: string; slug: string; categories: string[]; cover_id: number | null; gallery_ids: number[] };

export default async function GalleryPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_gallery_id);
  const [events, projects] = await Promise.all([
    q<G>(`SELECT g.id, g.section, g.caption, m.filename, m.alt FROM gallery g JOIN media m ON m.id = g.image_id ORDER BY g.sort, g.id`),
    q<P>(`SELECT id, title, slug, categories, cover_id, gallery_ids FROM projects WHERE published ORDER BY sort, id`),
  ]);
  const [duo, fade, full] = GALLERY_SECTIONS.map((sec) => events.filter((r) => r.section === sec));

  // One list for the explorer: every project photo plus the event photos.
  const eventMedia = await q<{ image_id: number; caption: string }>("SELECT DISTINCT ON (image_id) image_id, caption FROM gallery ORDER BY image_id");
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
      if (it && !seen.has(`${it.id}-${it.tags[0]}-${it.title}`)) { seen.add(`${it.id}-${it.tags[0]}-${it.title}`); items.push(it); }
    }
  }
  const filters = [...CATEGORIES.filter((c) => items.some((i) => i.tags.includes(c))), ...(items.some((i) => i.tags.includes("Events")) ? ["Events"] : [])];

  return (
    <>
      <PageBanner title="Gallery" kicker="Our work & events" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />

      <section className="bg-white pb-16 pt-4">
        <p className="mx-auto mb-9 max-w-[640px] px-5 text-center font-quicksand text-[16px] font-light leading-relaxed text-[#666]">
          {s.gallery_intro || "A look at our projects and the moments behind them. Tap any photo to see it full screen."}
        </p>
        <GalleryExplorer items={items} filters={filters} />
      </section>

      {(duo.length > 0 || fade.length > 0 || full.length > 0) && (
        <section className="bg-cream pb-0 pt-16">
          <div className="mx-auto max-w-[1130px] px-5 text-center">
            <h2 className="font-quicksand text-[32px] font-semibold text-[#222] sm:text-[40px]">Events</h2>
            <span className="mx-auto mt-3 block h-[3px] w-14 rounded bg-gold" />
          </div>

          {duo.length > 0 && (
            <div className="mx-auto mt-10 max-w-[1130px] px-5 pb-[15px]">
              <Slider perView={2} perViewMobile={1} gap={30} loop arrowClass="text-black" arrowInset={10}>
                {duo.map((g) => (
                  <div key={g.id} className="relative h-[260px] overflow-hidden rounded-xl sm:h-[400px]">
                    <Image src={`/media/${g.filename}`} alt={g.caption || g.alt} fill sizes="(min-width:768px) 530px, 100vw" className="object-cover" />
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {fade.length > 0 && (
            <div className="mx-auto max-w-[1130px] px-5 pt-4">
              <FadeShow className="aspect-[1090/681] w-full rounded-xl" images={fade.map((g) => ({ src: `/media/${g.filename}`, alt: g.caption || g.alt }))} />
            </div>
          )}

          {full.length > 0 && (
            <div className="mt-10 bg-[#111]">
              <Slider perView={3} perViewMobile={1} gap={10} loop autoplay={5000} fraction arrowLayout="corner" arrowClass="text-white" className="pb-[30px]">
                {full.map((g) => (
                  <div key={g.id} className="relative h-[420px] sm:h-[530px]">
                    <Image src={`/media/${g.filename}`} alt={g.caption || g.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </section>
      )}
    </>
  );
}
