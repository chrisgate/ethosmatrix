"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Item = { src: string; alt: string; node?: React.ReactNode };

const FADE_MS = 1000;

/**
 * Full-bleed crossfading slideshow with a Ken Burns zoom.
 * The active slide (and the outgoing one while it fades) gets `is-active`, which restarts the
 * CSS entrance animations of its caption each time the slide comes back.
 */
export function Crossfade({
  items, interval = 6000, overlay = "", children, sizes = "100vw",
}: {
  items: Item[];
  interval?: number;
  overlay?: string;
  children?: React.ReactNode;
  sizes?: string;
}) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const cur = useRef(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      const next = (cur.current + 1) % items.length;
      setPrev(cur.current);
      cur.current = next;
      setI(next);
    }, interval);
    return () => clearInterval(t);
  }, [items.length, interval]);

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
      {children}
    </>
  );
}
