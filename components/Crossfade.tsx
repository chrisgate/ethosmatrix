"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Item = { src: string; alt: string; node?: React.ReactNode };

const FADE_MS = 1000;

/**
 * Full-bleed crossfading slideshow with a Ken Burns zoom.
 * The active slide (and the outgoing one while it fades) gets `is-active`, which restarts the
 * CSS entrance animations of its caption each time the slide comes back.
 * With `dots`, clickable progress bars sit at the bottom; the active one fills over `interval`.
 */
export function Crossfade({
  items, interval = 6000, overlay = "", children, sizes = "100vw", dots = false, dotsBottom = "bottom-5",
}: {
  items: Item[];
  interval?: number;
  overlay?: string;
  children?: React.ReactNode;
  sizes?: string;
  dots?: boolean;
  /** Tailwind bottom offset for the progress bars (raise it when a curved edge sits at the bottom). */
  dotsBottom?: string;
}) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [tick, setTick] = useState(0); // bumped on manual changes so the autoplay timer restarts
  const cur = useRef(0);

  const goTo = useCallback((n: number) => {
    if (n === cur.current) return;
    setPrev(cur.current);
    cur.current = n;
    setI(n);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => goTo((cur.current + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items.length, interval, tick, goTo]);

  // Keep the outgoing slide "active" until its fade-out has finished so its text doesn't vanish early.
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FADE_MS + 100);
    return () => clearTimeout(t);
  }, [prev]);

  return (
    <>
      {items.map((it, n) => {
        const on = n === i;
        const live = on || n === prev;
        return (
          <div
            key={it.src + n}
            className={`slide-fade absolute inset-0 ${on ? "opacity-100" : "opacity-0"} ${live ? "is-active" : ""}`}
            aria-hidden={!on}
          >
            <div className={`absolute inset-0 ${live ? "kb" : ""}`}>
              <Image src={it.src} alt={it.alt} fill sizes={sizes} priority={n === 0} className="object-cover" />
            </div>
            {overlay && <div className={`absolute inset-0 ${overlay}`} />}
            {it.node}
          </div>
        );
      })}

      {dots && items.length > 1 && (
        <div className={`absolute left-1/2 z-20 flex -translate-x-1/2 gap-3 ${dotsBottom}`} role="tablist" aria-label="Slides">
          {items.map((_, n) => (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={`Go to slide ${n + 1}`}
              onClick={() => goTo(n)}
              className="relative flex h-9 w-12 items-center sm:w-16"
            >
              <span className="absolute inset-x-0 h-[3px] rounded bg-white/35 transition group-hover:bg-white/60" />
              {n === i && (
                <span
                  key={`${i}-${tick}`}
                  className="hero-bar absolute left-0 h-[3px] w-full origin-left rounded bg-white"
                  style={{ animationDuration: `${interval}ms` }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {children}
    </>
  );
}
