"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** Single-image slideshow that cross-fades (0.5s) and autoplays; pauses on hover. */
export function FadeShow({
  images, interval = 5000, speed = 500, className = "", sizes = "1090px",
}: {
  images: { src: string; alt: string }[];
  interval?: number;
  speed?: number;
  className?: string;
  sizes?: string;
}) {
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => { if (!paused.current) setI((n) => (n + 1) % images.length); }, interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div
      className={`relative overflow-hidden bg-[#eee] ${className}`}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {images.map((im, n) => (
        <div
          key={im.src + n}
          className="absolute inset-0"
          style={{ opacity: n === i ? 1 : 0, transition: `opacity ${speed}ms ease` }}
          aria-hidden={n !== i}
        >
          <Image src={im.src} alt={im.alt} fill sizes={sizes} className="object-cover" />
        </div>
      ))}
    </div>
  );
}
