"use client";

import { useCallback, useEffect, useRef } from "react";

/* Same numbers as the original site's Swiper "coverflow" skin: rotate 50deg, depth 100px, 1200px perspective, 10px gap, 600ms. */
const ROTATE = 50;
const DEPTH = 100;
const GAP = 10;
const PERSPECTIVE = 1200;

const offsetOf = (i: number, pos: number, n: number) => {
  let o = (i - pos) % n;
  if (o > n / 2) o -= n;
  if (o < -n / 2) o += n;
  return o;
};

const place = (o: number) => ({
  transform: `translate3d(calc(${o * 100}% + ${o * GAP}px), 0, ${-DEPTH * Math.abs(o)}px) rotateY(${-ROTATE * o}deg)`,
  zIndex: String(1 - Math.round(Math.abs(o))),
});

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Looping 3D carousel: neighbouring slides swing in and out like turning pages, with a soft shadow on the side that turns away. */
export function CoverflowSlider({
  children, autoplay = 3000, speed = 600, className = "", arrowClass = "",
}: {
  children: React.ReactNode[];
  autoplay?: number;
  speed?: number;
  className?: string;
  arrowClass?: string;
}) {
  const n = children.length;
  const box = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const shadeL = useRef<(HTMLDivElement | null)[]>([]);
  const shadeR = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef(0);
  const raf = useRef(0);
  const hold = useRef(false);

  const layout = useCallback((p: number) => {
    pos.current = p;
    for (let i = 0; i < n; i++) {
      const el = slides.current[i];
      if (!el) continue;
      const o = offsetOf(i, p, n);
      const t = place(o);
      el.style.transform = t.transform;
      el.style.zIndex = t.zIndex;
      const a = Math.min(1, Math.abs(o));
      if (shadeL.current[i]) shadeL.current[i]!.style.opacity = String(o < 0 ? 0 : a); // slides on the right turn their left edge away
      if (shadeR.current[i]) shadeR.current[i]!.style.opacity = String(o > 0 ? 0 : a);
    }
  }, [n]);

  const animateTo = useCallback((target: number) => {
    cancelAnimationFrame(raf.current);
    const from = pos.current;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return layout(target);
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / speed);
      layout(from + (target - from) * ease(k));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [layout, speed]);

  const step = useCallback((dir: 1 | -1) => animateTo(Math.round(pos.current) + dir), [animateTo]);

  useEffect(() => { layout(0); return () => cancelAnimationFrame(raf.current); }, [layout]);

  useEffect(() => {
    if (!autoplay || n < 2) return;
    const t = setInterval(() => { if (!hold.current && !document.hidden) step(1); }, autoplay);
    return () => clearInterval(t);
  }, [autoplay, n, step]);

  // Drag or swipe: the slides follow the finger, then settle on the nearest one.
  const drag = useRef<{ x: number; p: number; id: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (n < 2 || (e.target as HTMLElement).closest("button")) return;
    cancelAnimationFrame(raf.current);
    drag.current = { x: e.clientX, p: pos.current, id: e.pointerId };
    hold.current = true;
    box.current?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !box.current) return;
    layout(d.p - (e.clientX - d.x) / box.current.clientWidth);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dx = e.clientX - d.x;
    const moved = d.p - pos.current;
    animateTo(Math.abs(dx) > 40 ? Math.round(d.p) + (moved > 0 ? 1 : -1) : Math.round(d.p));
  };

  const arrow = `absolute top-1/2 z-20 -translate-y-1/2 p-2.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.6)] ${arrowClass}`;

  return (
    <div
      ref={box}
      className={`relative select-none overflow-hidden ${className}`}
      style={{ perspective: `${PERSPECTIVE}px`, touchAction: "pan-y" }}
      onMouseEnter={() => (hold.current = true)}
      onMouseLeave={() => { if (!drag.current) hold.current = false; }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {children.map((c, i) => {
        const t = place(offsetOf(i, 0, n));
        return (
          <div
            key={i}
            ref={(el) => { slides.current[i] = el; }}
            className="absolute inset-0 overflow-hidden rounded-[36px]"
            style={{ ...t, backfaceVisibility: "hidden", willChange: "transform" }}
          >
            {c}
            <div ref={(el) => { shadeL.current[i] = el; }} className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to left, rgba(0,0,0,.5), transparent)", opacity: i === 0 ? 0 : 1 }} />
            <div ref={(el) => { shadeR.current[i] = el; }} className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5), transparent)", opacity: i === 0 ? 0 : 1 }} />
          </div>
        );
      })}
      {n > 1 && (
        <>
          <button type="button" aria-label="Previous" onClick={() => step(-1)} className={`${arrow} left-2`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3}><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => step(1)} className={`${arrow} right-2`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
