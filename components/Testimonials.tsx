import Image from "next/image";
import { Slider } from "./Slider";
import { q } from "@/lib/db";

type T = { id: number; quote: string; name: string; role: string; company: string; filename: string | null };

/** "Satisfied Customers" block, shared by the home and About pages. */
export async function Testimonials() {
  const items = await q<T>(
    `SELECT t.id, t.quote, t.name, t.role, t.company, m.filename FROM testimonials t
     LEFT JOIN media m ON m.id = t.image_id ORDER BY t.sort, t.id`,
  );
  if (!items.length) return null;
  return (
    <section className="bg-mist py-16 sm:py-[110px]">
      <div className="mx-auto max-w-[1000px] px-5">
        <h2 className="h-accent text-center font-inter text-[32px] font-bold text-navy sm:text-[40px] sm:tracking-[-2.2px]">Satisfied Customers</h2>
        <Slider perView={2} perViewMobile={1} autoplay={6000} dots dotActive="bg-orange" className="mt-14" arrows={false}>
          {items.map((t) => (
            <div key={t.id} className="px-3 pb-6">
              <div className="relative bg-white px-8 py-7 shadow-[0_6px_20px_-12px_rgba(0,0,0,.25)]">
                <span aria-hidden className="pointer-events-none absolute right-5 top-1 select-none font-playfair text-[64px] leading-none text-gold/25">”</span>
                <p className="font-inter text-[14px] italic leading-[1.8] text-[#808291]">{t.quote}</p>
                <span className="absolute -bottom-2 left-12 h-4 w-4 rotate-45 bg-white" />
              </div>
              <div className="mt-6 flex items-center gap-4 pl-8">
                <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full bg-white">
                  {t.filename && <Image src={`/media/${t.filename}`} alt={t.company || t.name} fill sizes="50px" className="object-cover" />}
                </div>
                <div>
                  <div className="font-karla text-[15.4px] font-semibold tracking-[-0.8px] text-black">{t.name}</div>
                  <div className="font-lora text-[14px] italic text-[#808291]">{[t.role, t.company].filter(Boolean).join(" - ")}</div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
