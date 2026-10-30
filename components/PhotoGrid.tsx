"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Photo = { src: string; alt: string };

/** Thumbnail grid that opens a full-screen lightbox (arrows, swipe-free keyboard support, Esc to close). */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const move = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

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

  return (
    <>
      <div className="mx-auto grid max-w-[1140px] gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <button key={p.src} type="button" onClick={() => setOpen(i)} className="group relative aspect-[4/3] overflow-hidden bg-[#eee]" aria-label={`Open photo ${i + 1}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="relative h-full w-full max-w-[1200px]" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[open].src} alt={photos[open].alt} fill sizes="100vw" className="object-contain" priority />
          </div>
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25">×</button>
          {photos.length > 1 && (
            <>
              <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-roboto text-sm text-white/80">{open + 1} / {photos.length}</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
