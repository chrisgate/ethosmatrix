"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { id: number; value: number; suffix: string; label: string };

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(to); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const run = (now: number) => {
        const p = Math.min(1, (now - start) / 1600);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(run);
      };
      raf = requestAnimationFrame(run);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);

  return <span ref={ref}>{n.toLocaleString("en-US")}{suffix}</span>;
}

/** Row of animated counters (numbers count up when scrolled into view). */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section className="bg-white pb-10 pt-0 sm:pb-14">
      <div
        className="mx-auto flex max-w-[1000px] flex-wrap justify-center gap-x-10 gap-y-10 px-5 text-center sm:gap-x-16"
      >
        {stats.map((st) => (
          <div key={st.id} className="min-w-[120px] flex-1 px-2 sm:flex-none sm:min-w-[170px]">
            <div className="font-quicksand text-[34px] font-semibold leading-none text-gold-title sm:text-[56px]">
              <CountUp to={st.value} suffix={st.suffix} />
            </div>
            <div className="mx-auto mt-3 h-px w-8 bg-black/30" />
            <div className="mt-3 font-quicksand text-[11px] font-medium uppercase tracking-[.16em] text-[#555] sm:text-[13px]">{st.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
