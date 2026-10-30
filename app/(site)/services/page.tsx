import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageBanner } from "@/components/PageBanner";
import { getMedia, getSettings } from "@/lib/content";
import { q } from "@/lib/db";

export const metadata: Metadata = {
  title: "Services",
  description: "Architectural design, construction, real estate consultancy and property development from Ethos Matrix.",
};

type Service = { id: number; title: string; slug: string; subtitle: string; description: string; filename: string | null };

export default async function ServicesPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_projects_id);
  const services = await q<Service>(
    `SELECT s.id, s.title, s.slug, s.subtitle, s.description, m.filename FROM services s
     LEFT JOIN media m ON m.id = s.image_id WHERE s.slug IS NOT NULL AND s.slug <> '' ORDER BY s.sort, s.id`,
  );
  return (
    <>
      <PageBanner title="Our Services" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      <section className="bg-white pb-20 pt-6">
        <div className="mx-auto grid max-w-[1140px] gap-6 px-5 md:grid-cols-2">
          {services.map((sv) => (
            <Link key={sv.id} href={`/services/${sv.slug}`} className="group overflow-hidden rounded-[24px] bg-black">
              <div className="relative aspect-[16/10] overflow-hidden">
                {sv.filename && <Image src={`/media/${sv.filename}`} alt={sv.title} fill sizes="(min-width:768px) 560px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
              </div>
              <div className="px-7 pb-8 pt-6 text-white">
                <h2 className="font-playfair text-2xl font-semibold">{sv.title}</h2>
                <p className="mt-1 font-montserrat text-[11px] font-semibold uppercase tracking-[.16em] text-gold">{sv.subtitle}</p>
                <p className="mt-3 line-clamp-3 font-quicksand text-sm font-light leading-relaxed text-white/75">{sv.description.replace(/\*\*/g, "")}</p>
                <span className="mt-5 inline-block font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-gold group-hover:underline">Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand s={s} />
    </>
  );
}
