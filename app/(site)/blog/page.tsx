import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { PostRows, type PostCard } from "@/components/blog/PostRows";
import { CtaBand } from "@/components/CtaBand";
import { getMedia, getSettings } from "@/lib/content";
import { getPublishedPosts, monthKey, monthLabel, parseCategories } from "@/lib/blog";

type SP = { q?: string; category?: string; month?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Blog",
    description: "Ideas, news and project stories from Ethos Matrix on design, construction and property development in Nigeria.",
    // filtered views are thin duplicates of the main list
    robots: sp.q || sp.category || sp.month ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const [banner, all] = await Promise.all([getMedia(s.banner_insights_id), getPublishedPosts()]);

  const term = (sp.q ?? "").trim().toLowerCase();
  const list = all.filter((p) =>
    (!sp.category || parseCategories(p.categories).some((c) => c.slug === sp.category)) &&
    (!sp.month || monthKey(p.published_at) === sp.month) &&
    (!term || `${p.title} ${p.excerpt} ${p.body}`.toLowerCase().includes(term)),
  );
  const cards: PostCard[] = list.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
    date: new Date(p.published_at).toISOString(),
    src: p.filename ? `/media/${p.filename}` : null, alt: p.alt ?? "",
    categories: parseCategories(p.categories),
  }));

  const catName = sp.category ? parseCategories(all.map((p) => p.categories).join(",")).find((c) => c.slug === sp.category)?.name : null;
  const filterLabel = term ? `Search: “${sp.q}”` : catName ? `Category: ${catName}` : sp.month ? `Archive: ${monthLabel(sp.month)}` : null;

  return (
    <>
      {/* banner: left-aligned title and intro, like a classic blog home */}
      <section className="relative isolate overflow-hidden bg-[#111] text-white">
        {banner && <Image src={`/media/${banner.filename}`} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-16 sm:pb-28 sm:pt-24">
          <h1 className="font-quicksand text-[44px] font-bold leading-none sm:text-[64px]">Blog</h1>
          <span className="mt-5 block h-[3px] w-14 rounded bg-gold" />
          <p className="mt-6 max-w-[500px] font-quicksand text-[17px] font-light leading-relaxed text-white/85">
            {s.blog_intro || "Ideas, news and project stories from Ethos Matrix. Learn more about design, construction and property development in Nigeria."}
          </p>
        </div>
        <a href="#posts" aria-label="Scroll to articles" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold motion-safe:animate-bounce">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
        </a>
      </section>

      <section id="posts" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {filterLabel && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#faf7f3] px-5 py-3 font-quicksand text-[15px]">
                <span className="font-semibold text-[#222]">{filterLabel} <span className="font-normal text-[#777]">· {list.length} {list.length === 1 ? "article" : "articles"}</span></span>
                <Link href="/blog" className="font-semibold text-gold-dark hover:underline">Clear</Link>
              </div>
            )}
            {cards.length > 0 ? (
              <PostRows key={`${sp.q}-${sp.category}-${sp.month}`} posts={cards} />
            ) : (
              <p className="py-10 font-quicksand text-[16px] text-[#666]">{all.length ? "No articles match that. Try another search or category." : "No articles yet. Check back soon."}</p>
            )}
          </div>
          <BlogSidebar posts={all} active={{ category: sp.category, month: sp.month, q: sp.q }} />
        </div>
      </section>

      <CtaBand s={s} />
    </>
  );
}
