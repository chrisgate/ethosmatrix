import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Shown for unknown addresses and for missing projects, services and articles (inside the normal header and footer). */
export default function NotFound() {
  const links: [string, string][] = [
    ["/projects", "Our projects"],
    ["/services", "Our services"],
    ["/gallery", "Gallery"],
    ["/contact", "Contact us"],
  ];
  return (
    <section className="bg-white px-5 py-20 text-center sm:py-28">
      <p className="font-cormorant text-[120px] font-semibold leading-none text-gold sm:text-[180px]">404</p>
      <h1 className="mt-2 font-quicksand text-[28px] font-semibold text-[#222] sm:text-[36px]">This page could not be found</h1>
      <span className="mx-auto mt-4 block h-[3px] w-14 rounded bg-gold" />
      <p className="mx-auto mt-5 max-w-[480px] font-quicksand text-base font-light leading-relaxed text-[#666]">
        The page may have moved or the address may be mistyped. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-gold">Back to home</Link>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-black/20 px-6 py-3 font-quicksand text-base font-medium text-[#333] transition hover:border-gold hover:text-gold-dark">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
