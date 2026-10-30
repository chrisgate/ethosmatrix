"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode[];
  perView?: number;
  perViewMobile?: number;
  autoplay?: number;
  arrows?: boolean;
  dots?: boolean;
  arrowClass?: string;
  dotActive?: string;
  className?: string;
  trackClass?: string;
  /** Distance of the arrows from the edge in px; negative pushes them outside. */
  arrowInset?: number;
  /** "sides" = centred left/right; "corner" = both arrows bottom-left, as on the Events gallery. */
  arrowLayout?: "sides" | "corner";
  /** Show a "3 / 5" counter under the slides. */
  fraction?: boolean;
  /** Space between slides in px. */
  gap?: number;
  /** Endless loop (slides are repeated and the scroll position is silently re-centred). */
  loop?: boolean;
};

const unit = (el: HTMLElement) => {
  const [a, b] = [el.children[0] as HTMLElement | undefined, el.children[1] as HTMLElement | undefined];
  if (!a) return 0;
  return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
};

/** Dependency-free scroll-snap carousel with arrows, dots, counter, gap, autoplay and optional endless loop. */
export function Slider({
  children, perView = 1, perViewMobile = 1, autoplay = 0, arrows = true, dots = false,
  arrowClass = "", dotActive = "bg-black", className = "", trackClass = "", arrowInset = 8,
  arrowLayout = "sides", fraction = false, gap = 0, loop = false,
}: Props) {
  const track = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);
  const real = children.length;
  const canLoop = loop && real > perView;
  const items = canLoop ? [...children, ...children, ...children] : children;

  // Start on the middle copy so there is room to scroll both ways.
  useEffect(() => {
    const el = track.current;
    if (!el || !canLoop) return;
    el.scrollLeft = unit(el) * real;
  }, [canLoop, real]);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const u = unit(el);
    if (!canLoop) {
      const max = el.scrollWidth - el.clientWidth - 4;
      if (dir === 1 && el.scrollLeft >= max) return void el.scrollTo({ left: 0, behavior: "smooth" });
      if (dir === -1 && el.scrollLeft <= 4) return void el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
    el.scrollBy({ left: dir * u, behavior: "smooth" });
  }, [canLoop]);

  useEffect(() => {
    if (!autoplay || real < 2) return;
    const t = setInterval(() => { if (!hover.current) step(1); }, autoplay);
    return () => clearInterval(t);
  }, [autoplay, real, step]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const u = unit(el) || 1;
    const idx = Math.round(el.scrollLeft / u);
    setActive(((idx % real) + real) % real);
    if (!canLoop) return;
    // Once scrolling settles, jump (invisibly) back to the middle copy.
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      const set = u * real;
      let d = 0;
      if (el.scrollLeft < set * 0.5) d = set;
      else if (el.scrollLeft > set * 1.5) d = -set;
      if (!d) return;
      el.style.scrollSnapType = "none";
      el.scrollLeft += d;
      requestAnimationFrame(() => { el.style.scrollSnapType = ""; });
    }, 120);
  };

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const u = unit(el);
    const set = u * real;
    const base = canLoop ? Math.floor(el.scrollLeft / set) * set : 0;
    el.scrollTo({ left: base + i * u, behavior: "smooth" });
  };

  const corner = arrowLayout === "corner";
  const prevStyle = corner ? { left: 10 } : { left: arrowInset };
  const nextStyle = corner ? { left: 30 } : { right: arrowInset };
  const pos = corner ? "bottom-[92px]" : "top-1/2 -translate-y-1/2";

  return (
    <div
      className={`slider relative ${className}`}
      style={{ ["--pv-sm" as string]: perViewMobile, ["--pv-md" as string]: perView, ["--gap" as string]: `${gap}px` }}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
    >
      <div ref={track} onScroll={onScroll} className={`slider-track flex overflow-x-auto ${trackClass}`}>
        {items.map((c, i) => <div key={i} className="slider-item">{c}</div>)}
      </div>
      {arrows && real > 1 && (
        <>
          <button type="button" aria-label="Previous" onClick={() => step(-1)} style={prevStyle} className={`absolute z-10 p-2.5 ${pos} ${arrowClass}`}>
            <svg viewBox="0 0 24 24" className={corner ? "h-5 w-5" : "h-6 w-6"} fill="none" stroke="currentColor" strokeWidth={corner ? 2.5 : 3}><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => step(1)} style={nextStyle} className={`absolute z-10 p-2.5 ${pos} ${arrowClass}`}>
            <svg viewBox="0 0 24 24" className={corner ? "h-5 w-5" : "h-6 w-6"} fill="none" stroke="currentColor" strokeWidth={corner ? 2.5 : 3}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      {fraction && real > 1 && (
        <div className="absolute inset-x-0 bottom-[5px] text-center font-roboto text-sm text-white" aria-live="polite">
          {active + 1} / {real}
        </div>
      )}
      {dots && real > 1 && (
        <div className="mt-3 flex flex-wrap justify-center">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="flex h-9 w-8 items-center justify-center"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${i === active ? dotActive : "bg-gray-300"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
