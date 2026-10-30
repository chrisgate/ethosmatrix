import type { Metadata } from "next";
import Image from "next/image";
import { FadeShow } from "@/components/FadeShow";
import { PageBanner } from "@/components/PageBanner";
import { Slider } from "@/components/Slider";
import { GALLERY_SECTIONS, getMedia, getSettings } from "@/lib/content";
import { q } from "@/lib/db";

export const metadata: Metadata = { title: "Gallery", description: "Events and moments from Ethos Matrix." };

type G = { id: number; section: string; caption: string; filename: string; alt: string };

/** Events page: three carousels (two-up, large fade, full-width strip), as on the original site. */
export default async function GalleryPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_gallery_id);
  const rows = await q<G>(
    `SELECT g.id, g.section, g.caption, m.filename, m.alt FROM gallery g
     JOIN media m ON m.id = g.image_id ORDER BY g.sort, g.id`,
  );
  const [duo, fade, full] = GALLERY_SECTIONS.map((sec) => rows.filter((r) => r.section === sec));

  return (
    <>
      <PageBanner title="Events" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Events" }]} />

      <div className="bg-white pt-[60px] sm:pt-[90px]">
        {duo.length > 0 && (
          <section className="mx-auto max-w-[1130px] px-5 pb-[15px]">
            <Slider perView={2} perViewMobile={1} gap={30} loop arrowClass="text-black" arrowInset={10}>
              {duo.map((g) => (
                <div key={g.id} className="relative h-[260px] sm:h-[400px]">
                  <Image src={`/media/${g.filename}`} alt={g.caption || g.alt} fill sizes="(min-width:768px) 530px, 100vw" className="object-cover" />
                </div>
              ))}
            </Slider>
          </section>
        )}

        {fade.length > 0 && (
          <section className="mx-auto max-w-[1130px] px-5">
            <FadeShow
              className="aspect-[1090/681] w-full"
              images={fade.map((g) => ({ src: `/media/${g.filename}`, alt: g.caption || g.alt }))}
            />
          </section>
        )}

        {full.length > 0 && (
          <section className="mt-[25px] bg-[#111]">
            <Slider perView={3} perViewMobile={1} gap={10} loop autoplay={5000} fraction arrowLayout="corner" arrowClass="text-white" className="pb-[30px]">
              {full.map((g) => (
                <div key={g.id} className="relative h-[420px] sm:h-[530px]">
                  <Image src={`/media/${g.filename}`} alt={g.caption || g.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                </div>
              ))}
            </Slider>
          </section>
        )}

        {!rows.length && <p className="px-5 pb-20 text-center text-[#666]">The gallery is empty.</p>}
      </div>
    </>
  );
}
