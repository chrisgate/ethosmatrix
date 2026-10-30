"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type PostCard = {
  id: number; title: string; slug: string; excerpt: string; date: string; src: string | null; alt: string;
  categories: { name: string; slug: string }[];
};

const PAGE = 6;

/** Article rows (image left, text right) with a "Load more" button, like a classic blog index. */
export function PostRows({ posts }: { posts: PostCard[] }) {
  const [shown, setShown] = useState(PAGE);
  return (
    <div>
      <div className="divide-y divide-black/10">
        {posts.slice(0, shown).map((p) => (
          <article key={p.id} className="grid gap-6 py-9 first:pt-0 sm:grid-cols-[minmax(0,300px)_1fr] sm:gap-9">
            <Link href={`/blog/${p.slug}`} className="group relative block aspect-[760/700] overflow-hidden rounded-lg bg-[#eee]" aria-label={p.title}>
              {p.src && <Image src={p.src} alt={p.alt || p.title} fill sizes="(min-width:640px) 300px, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.07]" />}
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/30" />
              <span className="pointer-events-none absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <svg viewBox="0 0 30 18" className="h-3.5 w-5" fill="currentColor" aria-hidden><path d="M20.3 16.2a1 1 0 0 0 0 1.5 1.1 1.1 0 0 0 1.5 0l7.9-8a1 1 0 0 0 0-1.5L21.8.3a1.1 1.1 0 0 0-1.5 1.5l7.2 7.2ZM1 8h28a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2Z" /></svg>
              </span>
            </Link>

            <div className="flex flex-col justify-center">
              {p.categories.length > 0 && (
                <div className="flex flex-wrap gap-x-2 font-montserrat text-[10px] font-bold uppercase tracking-[.16em] text-gold-dark">
                  {p.categories.map((c, i) => (
                    <span key={c.slug}>
                      <Link href={`/blog?category=${c.slug}`} className="hover:underline">{c.name}</Link>{i < p.categories.length - 1 && ","}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="mt-3 font-quicksand text-[24px] font-bold leading-snug text-[#222] sm:text-[28px]">
                <Link href={`/blog/${p.slug}`} className="transition hover:text-gold-dark">{p.title}</Link>
              </h2>
              {p.excerpt && <p className="mt-4 line-clamp-3 font-quicksand text-[15px] leading-relaxed text-[#666]">{p.excerpt}</p>}
              <time dateTime={p.date} className="mt-4 font-quicksand text-[13px] text-[#999]">
                {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <Link href={`/blog/${p.slug}`} className="mt-5 inline-flex w-fit items-center gap-2 font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-[#222] transition hover:text-gold-dark">
                Read article <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {shown < posts.length && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-gold btn-caps">Load more</button>
        </div>
      )}
    </div>
  );
}
