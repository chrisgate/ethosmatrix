"use client";

import Link from "next/link";

/** Friendly fallback if a page fails to load (for example, the database is briefly unavailable). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-white px-5 py-24 text-center sm:py-32">
      <h1 className="font-quicksand text-[30px] font-semibold text-[#222] sm:text-[40px]">Something went wrong</h1>
      <span className="mx-auto mt-4 block h-[3px] w-14 rounded bg-gold" />
      <p className="mx-auto mt-5 max-w-[480px] font-quicksand text-base font-light leading-relaxed text-[#666]">
        We could not load this page. Please try again, or come back in a moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-gold">Try again</button>
        <Link href="/" className="rounded-full border border-black/20 px-6 py-3 font-quicksand text-base font-medium text-[#333] transition hover:border-gold hover:text-gold-dark">Back to home</Link>
      </div>
    </section>
  );
}
