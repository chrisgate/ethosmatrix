import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { getSettings, paragraphs } from "@/lib/content";
import { q } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };
type Post = { id: number; title: string; slug: string; excerpt: string; body: string; published_at: Date; filename: string | null; alt: string | null };

async function getPost(slug: string) {
  const [p] = await q<Post>(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.body, p.published_at, m.filename, m.alt FROM posts p
     LEFT JOIN media m ON m.id = p.cover_id WHERE p.slug = $1 AND p.published AND p.published_at <= now()`,
    [slug],
  );
  return p ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: (p.excerpt || paragraphs(p.body)[0] || "").slice(0, 160) || undefined,
    openGraph: p.filename ? { images: [`/media/${p.filename}`], type: "article" } : undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const s = await getSettings();
  const more = await q<{ title: string; slug: string }>(
    "SELECT title, slug FROM posts WHERE published AND published_at <= now() AND id <> $1 ORDER BY published_at DESC LIMIT 3",
    [p.id],
  );
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
          author: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
          publisher: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
        }}
      />
      <header className="bg-dark px-5 py-14 text-center text-white sm:py-20">
        <time dateTime={date.toISOString()} className="font-montserrat text-[10px] font-bold uppercase tracking-[.2em] text-gold">
          {date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </time>
        <h1 className="mx-auto mt-4 max-w-[820px] font-playfair text-[30px] font-semibold leading-tight sm:text-[46px]">{p.title}</h1>
      </header>

      {p.filename && (
        <div className="relative mx-auto -mt-8 aspect-[16/8] w-full max-w-[1000px] overflow-hidden bg-[#eee] shadow-lg">
          <Image src={`/media/${p.filename}`} alt={p.alt || p.title} fill priority sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-[720px] space-y-5 px-5 py-12 font-quicksand text-[17px] font-normal leading-[1.9] text-[#444]">
        {p.excerpt && <p className="text-[19px] font-medium text-[#222]">{p.excerpt}</p>}
        {paragraphs(p.body).map((block, i) =>
          block.startsWith("## ")
            ? <h2 key={i} className="pt-4 font-playfair text-[26px] font-semibold text-[#222]">{block.slice(3)}</h2>
            : <p key={i} className="whitespace-pre-line">{block}</p>,
        )}
      </div>

      {more.length > 0 && (
        <aside className="border-t border-black/10 bg-white py-10">
          <div className="mx-auto max-w-[720px] px-5">
            <h2 className="font-quicksand text-[13px] font-bold uppercase tracking-[.18em] text-gold-dark">More insights</h2>
            <ul className="mt-4 space-y-2 font-quicksand text-[16px]">
              {more.map((m) => <li key={m.slug}><Link href={`/insights/${m.slug}`} className="text-[#222] hover:text-gold-dark">{m.title}</Link></li>)}
            </ul>
          </div>
        </aside>
      )}
      <CtaBand s={s} />
    </article>
  );
}
