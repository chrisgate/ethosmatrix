import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { getMedia, getSettings } from "@/lib/content";
import { q } from "@/lib/db";

export const metadata: Metadata = {
  title: "Insights",
  description: "News, ideas and project stories from Ethos Matrix.",
};

type Post = { id: number; title: string; slug: string; excerpt: string; published_at: Date; filename: string | null; alt: string | null };

export default async function InsightsPage() {
  const s = await getSettings();
  const banner = await getMedia(s.banner_insights_id);
  const posts = await q<Post>(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.published_at, m.filename, m.alt FROM posts p
     LEFT JOIN media m ON m.id = p.cover_id WHERE p.published AND p.published_at <= now()
     ORDER BY p.published_at DESC, p.id DESC`,
  );
  return (
    <>
      <PageBanner title="Insights" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
      <section className="bg-white pb-20 pt-6">
        <div className="mx-auto grid max-w-[1140px] gap-8 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/insights/${p.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eee]">
                {p.filename && <Image src={`/media/${p.filename}`} alt={p.alt || p.title} fill sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
              </div>
              <time dateTime={new Date(p.published_at).toISOString()} className="mt-4 block font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-gold-dark">
                {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <h2 className="mt-2 font-playfair text-[22px] font-semibold leading-snug text-[#222] group-hover:text-gold-dark">{p.title}</h2>
              {p.excerpt && <p className="mt-2 line-clamp-3 font-quicksand text-sm font-light leading-relaxed text-[#666]">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
        {!posts.length && <p className="px-5 text-center text-[#666]">No articles yet. Check back soon.</p>}
      </section>
    </>
  );
}
