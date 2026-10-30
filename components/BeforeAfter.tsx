"use client";

import { useState } from "react";
import Image from "next/image";

/** Drag-to-compare slider. The "after" photo is revealed from the left as the handle moves right. */
export function BeforeAfter({
  before, after, beforeAlt, afterAlt,
}: { before: string; after: string; beforeAlt: string; afterAlt: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-[1000px] select-none overflow-hidden bg-[#222]">
      <Image src={before} alt={beforeAlt} fill sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={after} alt={afterAlt} fill sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
      </div>
      <span className="absolute left-3 top-3 bg-black/60 px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-white">After</span>
      <span className="absolute right-3 top-3 bg-black/60 px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-[.18em] text-white">Before</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
