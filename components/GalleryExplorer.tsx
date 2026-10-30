"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type GalleryItem = {
  id: number;
  src: string;
  w: number;
  h: number;
  alt: string;
  title: string;
  href?: string;
  tags: string[];
};

const PAGE = 18;

/** Filterable masonry gallery with hover captions and a full-screen viewer. */
export function GalleryExplorer({ items, filters }: { items: GalleryItem[]; filters: string[] }) {
  const [filter, setFilter] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const list = useMemo(() => (filter === "All" ? items : items.filter((i) => i.tags.includes(filter))), [items, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: items.length };
    for (const f of filters) c[f] = items.filter((i) => i.tags.includes(f)).length;
    return c;
  }, [items, filters]);
  const visible = list.slice(0, shown);

  const pick = (f: string) => { setFilter(f); setShown(PAGE); };
  const move = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  // keyboard + scroll lock while the viewer is open
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, move]);

  // swipe on touch screens
  const touchX = useRef<number | null>(null);

  const current = open !== null ? list[open] : null;
  const neighbours = open !== null && list.length > 1 ? [list[(open + 1) % list.length], list[(open - 1 + list.length) % list.length]] : [];

  return (
    <div>
      {/* filters */}
      <div className="mx-auto flex max-w-[1140px] flex-wrap justify-center gap-2.5 px-5" role="tablist" aria-label="Filter photos">
        {["All", ...filters].map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => pick(f)}
            className={`rounded-full border px-5 py-2 font-quicksand text-[13px] font-semibold tracking-wide transition ${
              filter === f
                ? "border-gold bg-gold text-white shadow-[0_8px_20px_-8px_rgba(206,146,26,.7)]"
                : "border-black/15 bg-white text-[#444] hover:border-gold hover:text-gold-dark"
            }`}
          >
            {f}
            <span className={`ml-2 text-[11px] font-medium ${filter === f ? "text-white/80" : "text-[#999]"}`}>{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* masonry */}
      <div key={filter} className="mx-auto mt-10 max-w-[1240px] columns-1 gap-4 px-5 sm:columns-2 lg:columns-3">
        {visible.map((it, i) => (
          <figure
            key={it.id}
            className="gal-in group relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-[#ece8df] shadow-sm"
            style={{ animationDelay: `${(i % 9) * 60}ms` }}
          >
            <button type="button" onClick={() => setOpen(i)} className="block w-full cursor-zoom-in text-left" aria-label={`Open ${it.title}`}>
              <Image
                src={it.src}
                alt={it.alt}
                width={it.w}
                height={it.h}
                sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
                className="block h-auto w-full transition duration-700 ease-out group-hover:scale-[1.06]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <span className="pointer-events-none absolute right-3 top-3 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block font-montserrat text-[10px] font-bold uppercase tracking-[.2em] text-gold">{it.tags[0]}</span>
                <span className="mt-1 block font-playfair text-[19px] font-semibold leading-snug">{it.title}</span>
              </span>
            </button>
          </figure>
        ))}
      </div>

      {list.length === 0 && <p className="mt-10 text-center text-[#666]">No photos here yet.</p>}

      {shown < list.length && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-gold btn-caps">
            Show more photos <span className="opacity-80">({list.length - shown} left)</span>
          </button>
        </div>
      )}

      {/* viewer */}
      {current && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={() => setOpen(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
          }}
        >
          <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            <Image key={current.id} src={current.src} alt={current.alt} fill sizes="100vw" className="gal-zoom object-contain p-3 sm:p-10" priority />
          </div>

          <div className="flex items-center justify-between gap-4 px-5 pb-5 pt-2 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="min-w-0">
              <div className="font-montserrat text-[10px] font-bold uppercase tracking-[.2em] text-gold">{current.tags.join(" · ")}</div>
              <div className="truncate font-playfair text-lg font-semibold sm:text-2xl">{current.title}</div>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              {current.href && (
                <Link href={current.href} className="hidden rounded-full border border-white/40 px-5 py-2 font-montserrat text-[10px] font-bold uppercase tracking-[.16em] hover:border-gold hover:text-gold sm:inline-block">
                  View project →
                </Link>
              )}
              <span className="font-roboto text-sm text-white/70">{(open ?? 0) + 1} / {list.length}</span>
            </div>
          </div>

          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30">×</button>
          {list.length > 1 && (
            <>
              <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-gold">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-gold">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          {/* warm the cache for the next and previous photos */}
          <div className="hidden" aria-hidden>
            {neighbours.map((n) => <Image key={n.id} src={n.src} alt="" width={n.w} height={n.h} sizes="100vw" />)}
          </div>
        </div>
      )}
    </div>
  );
}
