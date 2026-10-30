import Image from "next/image";
import { getMedia, type Settings } from "@/lib/content";

/**
 * Dark leadership-message block, shared by the home and About pages.
 * On desktop the photo pokes up into the section above, as on the original site.
 */
export async function CeoSection({ s }: { s: Settings }) {
  if (!s.ceo_text) return null;
  const ceo = await getMedia(s.ceo_image_id);
  return (
    <section className="relative z-10 bg-dark text-white md:h-[486px]">
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 md:block md:h-full md:p-0">
        {ceo && (
          <div className="relative mx-auto aspect-[396/472] w-full max-w-[396px] md:absolute md:left-[147px] md:top-[-85px] md:mx-0 md:w-[396px]">
            <Image src={`/media/${ceo.filename}`} alt={s.ceo_name || ceo.alt} fill sizes="396px" className="object-cover" />
          </div>
        )}
        <div className="md:absolute md:left-[683px] md:right-0 md:top-1/2 md:-translate-y-1/2">
          <h2 className="font-quicksand text-[26px] font-normal leading-[1.4] sm:text-[32px]">{s.ceo_heading}</h2>
          <span className="rule mt-5 text-white" />
          <p className="mt-6 font-quicksand text-base font-light leading-[1.8] tracking-[.06em] text-[#e0e0e0]">{s.ceo_text}</p>
          <h2 className="mt-4 inline-block border-b border-white/70 font-quicksand text-[21px] font-normal">{s.ceo_name}</h2>
          <p className="mt-2 flex items-center gap-2 font-quicksand text-[9px] font-medium uppercase tracking-[.2em] text-white/80">
            {s.ceo_title}<span className="text-[7px]">▶</span>
          </p>
        </div>
      </div>
    </section>
  );
}
