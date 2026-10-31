import Image from "next/image";
import { getMedia, type Settings } from "@/lib/content";

/**
 * Dark leadership-message block, shared by the home and About pages.
 * Phones: stacked. Tablets: photo and text side by side. From 1100px: the photo pokes up into the
 * section above, as on the original site.
 */
export async function CeoSection({ s }: { s: Settings }) {
  if (!s.ceo_text) return null;
  const ceo = await getMedia(s.ceo_image_id);
  return (
    <section className="relative z-10 bg-dark text-white min-[1100px]:h-[486px]">
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 md:grid-cols-[300px_1fr] md:gap-12 min-[1100px]:block min-[1100px]:h-full min-[1100px]:p-0">
        {ceo && (
          <div className="relative mx-auto aspect-[396/472] w-full max-w-[396px] md:mx-0 md:w-[300px] min-[1100px]:absolute min-[1100px]:left-[147px] min-[1100px]:top-[-85px] min-[1100px]:w-[396px]">
            <Image src={`/media/${ceo.filename}`} alt={s.ceo_name || ceo.alt} fill sizes="(min-width:1100px) 396px, (min-width:768px) 300px, 90vw" className="object-cover" />
          </div>
        )}
        <div className="min-[1100px]:absolute min-[1100px]:left-[683px] min-[1100px]:right-0 min-[1100px]:top-1/2 min-[1100px]:-translate-y-1/2">
          <h2 className="font-quicksand text-[26px] font-normal leading-[1.4] tracking-[1px] sm:text-[32px]">{s.ceo_heading}</h2>
          <span className="rule mt-5 text-white" />
          <p className="mt-6 font-quicksand text-base font-light leading-[1.8] tracking-[.06em] text-[#e0e0e0]">{s.ceo_text}</p>
          <h2 className="mt-4 inline-block border-b border-white/70 font-quicksand text-[21px] font-normal tracking-[1px]">{s.ceo_name}</h2>
          <p className="mt-2 flex items-center gap-2 font-quicksand text-[8px] font-normal uppercase tracking-[1.6px] text-white/80">
            {s.ceo_title}<span className="text-[8px]">▶</span>
          </p>
        </div>
      </div>
    </section>
  );
}
