import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { ShareBar } from "@/components/blog/ShareBar";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { getSettings, paragraphs } from "@/lib/content";
import { getPublishedPosts, longDate, parseCategories, readMinutes } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const p = (await getPublishedPosts()).find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: (p.excerpt || paragraphs(p.body)[0] || "").slice(0, 160) || undefined,
    openGraph: p.filename ? { images: [`/media/${p.filename}`], type: "article", publishedTime: new Date(p.published_at).toISOString() } : { type: "article" },
  };
}

export default async function PostPage({ params }: Props) {
  const slug = (await params).slug;
  const posts = await getPublishedPosts(); // newest first
  const idx = posts.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const p = posts[idx];
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx < posts.length - 1 ? posts[idx + 1] : null;
  const s = await getSettings();
  const cats = parseCategories(p.categories);
  const date = new Date(p.published_at);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.excerpt || undefined,
          datePublished: date.toISOString(),
          image: p.filename ? `/media/${p.filename}` : undefined,
          articleSection: cats.map((c) => c.name),
          author: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
          publisher: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
        }}
      />

      {/* hero: cover photo with centred categories, title and date */}
      <header className="banner-curve relative isolate overflow-hidden bg-[#111] text-white">
        {p.filename && <Image src={`/media/${p.filename}`} alt={p.alt || p.title} fill priority sizes="100vw" className="-z-20 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="mx-auto flex min-h-[420px] max-w-[920px] flex-col items-center justify-center px-5 pb-24 pt-14 text-center sm:min-h-[520px]">
          {cats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-2 font-montserrat text-[10px] font-bold uppercase tracking-[.2em] text-gold">
              {cats.map((c, i) => (
                <span key={c.slug}><Link href={`/blog?category=${c.slug}`} className="hover:underline">{c.name}</Link>{i < cats.length - 1 && ","}</span>
              ))}
            </div>
          )}
          <h1 className="mt-5 font-quicksand text-[32px] font-bold leading-[1.15] sm:text-[56px]">{p.title}</h1>
          <p className="mt-6 font-montserrat text-[11px] font-semibold uppercase tracking-[.2em] text-white/80">
            <time dateTime={date.toISOString()}>On {longDate(date)}</time> <span className="mx-2 text-gold">·</span> {readMinutes(p.body)} min read
          </p>
        </div>
      </header>

      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {p.excerpt && <p className="mb-8 border-l-[3px] border-gold pl-5 font-quicksand text-[20px] font-medium leading-relaxed text-[#222]">{p.excerpt}</p>}
            <ArticleBody text={p.body} />

            <div className="mt-12"><ShareBar title={p.title} /></div>

            {(older || newer) && (
              <nav aria-label="More articles" className="mt-10 grid gap-4 sm:grid-cols-2">
                {older ? (
                  <Link href={`/blog/${older.slug}`} className="group rounded-lg border border-black/10 p-5 transition hover:border-gold hover:shadow-md">
                    <span className="font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-gold-dark">← Previous</span>
                    <span className="mt-2 block font-quicksand text-[16px] font-bold leading-snug text-[#222] group-hover:text-gold-dark">{older.title}</span>
                  </Link>
                ) : <span />}
                {newer ? (
                  <Link href={`/blog/${newer.slug}`} className="group rounded-lg border border-black/10 p-5 text-right transition hover:border-gold hover:shadow-md">
                    <span className="font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-gold-dark">Next →</span>
                    <span className="mt-2 block font-quicksand text-[16px] font-bold leading-snug text-[#222] group-hover:text-gold-dark">{newer.title}</span>
                  </Link>
                ) : <span />}
              </nav>
            )}
          </div>

          <BlogSidebar posts={posts} exclude={p.id} />
        </div>
      </div>

      <CtaBand s={s} />
    </article>
  );
}
