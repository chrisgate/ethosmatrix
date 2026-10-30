import type { Metadata } from "next";
import Image from "next/image";
import { CeoSection } from "@/components/CeoSection";
import { CtaBand } from "@/components/CtaBand";
import { PageBanner } from "@/components/PageBanner";
import { Slider } from "@/components/Slider";
import { Testimonials } from "@/components/Testimonials";
import { getMedia, getMediaByIds, getSettings, lines, paragraphs, parseIds } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Ethos Matrix Limited, a Nigerian turnkey real estate company built on diligence, integrity and excellence.",
};

export default async function AboutPage() {
  const s = await getSettings();
  const [banner, photos, brochure] = await Promise.all([
    getMedia(s.banner_about_id),
    getMediaByIds(parseIds(s.about_images)),
    getMedia(s.brochure_image_id),
  ]);
  const values = lines(s.values).map((l) => l.split("|").map((x) => x.trim()));

  return (
    <>
      <PageBanner title="Who We Are" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "About us" }]} />

      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto grid max-w-[1140px] items-start gap-12 px-5 md:grid-cols-2">
          <div>
            <h2 className="border-l-2 border-orange pl-4 font-quicksand text-[22px] font-medium leading-snug text-[#222] sm:text-2xl">{s.about_heading}</h2>
            <div className="mt-8 space-y-5 font-quicksand text-sm font-light leading-[1.9] tracking-wide text-[#666]">
              {paragraphs(s.about_page_text).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          {photos.length > 0 && (
            <Slider autoplay={4500} arrowClass="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.6)]">
              {photos.map((m) => (
                <div key={m.id} className="relative aspect-[4/3.4] w-full">
                  <Image src={`/media/${m.filename}`} alt={m.alt} fill sizes="(min-width:768px) 560px, 100vw" className="object-cover" />
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>

      <section className="bg-cream pb-24 pt-16 sm:pt-24 md:pb-[170px]">
        <div className="mx-auto max-w-[1140px] px-5">
          <h2 className="text-center font-cormorant text-[40px] font-medium text-[#8b5e3c] sm:text-[56px]">Core Values</h2>
          <p className="mx-auto mt-5 max-w-[780px] text-center font-quicksand text-xs font-light leading-relaxed text-[#555]">{s.values_intro}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map(([title, text], i) => (
              <div key={title} className="bg-white p-8 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/img/value-${(i % 3) + 1}.png`} alt="" width={48} height={48} className="mb-5 h-12 w-12" />
                <h3 className="font-quicksand text-[22px] font-light text-[#333]">{title}</h3>
                <p className="mt-2 font-quicksand text-[13px] font-light leading-relaxed text-[#555]">{text}</p>
              </div>
            ))}
          </div>

          {brochure && s.brochure_url && (
            <div className="mx-auto mt-20 grid max-w-[900px] items-center gap-10 md:grid-cols-[1fr_1fr]">
              <div className="relative aspect-[4/3] bg-white p-3 shadow-lg">
                <div className="relative h-full w-full">
                  <Image src={`/media/${brochure.filename}`} alt={brochure.alt} fill sizes="440px" className="object-cover" />
                </div>
              </div>
              <div className="border-y border-black/30 py-6">
                <h3 className="font-poppins text-xl font-bold text-[#222]">Download Our Brochure</h3>
                <p className="mt-1 border-t border-black/20 pt-2 font-poppins text-[9px] font-bold uppercase tracking-[.2em] text-[#222]">Or read our corporate brochure</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={s.brochure_url} download className="rounded-full bg-[#b8a58f] px-6 py-2.5 font-poppins text-[11px] font-semibold text-white hover:opacity-90">Download ⤓</a>
                  <a href={s.brochure_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#6b7280] px-6 py-2.5 font-poppins text-[11px] font-semibold text-white hover:opacity-90">Content Preview</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <CeoSection s={s} />
      <Testimonials />
      <CtaBand s={s} />
    </>
  );
}
