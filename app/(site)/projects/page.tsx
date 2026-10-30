import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { CATEGORIES, CATEGORY_IMAGE_KEY, categorySlug, getMedia, getMediaByIds, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Conceptual design, architectural design, construction and project management work by Ethos Matrix.",
};

export default async function ProjectsPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_projects_id);
  const imgs = await getMediaByIds(CATEGORIES.map((c) => Number(s[CATEGORY_IMAGE_KEY[c]]) || 0).filter(Boolean));
  const byId = new Map(imgs.map((m) => [m.id, m]));

  return (
    <>
      <PageBanner title="Our Projects" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
      <section className="bg-white pb-20 pt-6">
        <div className="mx-auto grid max-w-[1140px] gap-6 px-5 md:grid-cols-2">
          {CATEGORIES.map((c) => {
            const m = byId.get(Number(s[CATEGORY_IMAGE_KEY[c]]));
            return (
              <Link key={c} href={`/projects/${categorySlug(c)}`} className="group relative block h-[320px] overflow-hidden rounded-[24px] bg-[#222] sm:h-[400px]">
                {m && <Image src={`/media/${m.filename}`} alt={c} fill sizes="(min-width:768px) 560px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="font-quicksand text-[26px] font-medium">{c}</h2>
                  <span className="mt-3 translate-y-2 font-montserrat text-[10px] font-semibold uppercase tracking-[.2em] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">Project overview</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/projects/all" className="btn-gold btn-caps">Browse all projects</Link>
        </div>
      </section>
    </>
  );
}
