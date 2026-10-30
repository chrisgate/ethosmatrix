"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Elements that fade up as they scroll into view (below the fold only, so nothing flashes on load). */
const SELECTOR = [
  "main section h2",
  "main section > div > p",
  "main .grid > *",
  "main ol > li",
  "main dl > div",
  "main article h2",
].join(",");

/** Scroll-reveal animations and a back-to-top button for the public site. */
export function SiteEffects() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  // Runs before paint on every page change, so below-the-fold elements are hidden before they can flash.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      if (el.closest(".slider, [data-no-reveal]")) return;
      if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen: leave alone
      const sibling = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--rd", `${Math.min(sibling, 6) * 80}ms`);
      el.setAttribute("data-reveal", "");
      io.observe(el);
    });
    root.classList.add("reveal-on");
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-[0_10px_24px_-8px_rgba(206,146,26,.8)] transition duration-300 hover:bg-gold-dark ${
        showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 15 6-6 6 6" /></svg>
    </button>
  );
}
