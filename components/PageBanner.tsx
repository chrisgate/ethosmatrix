import Image from "next/image";
import Link from "next/link";

/** Inner-page title banner: dark photo, centred title, breadcrumb, curved white bottom. */
export function PageBanner({
  title, crumbs, image, kicker,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
  image?: string | null;
  kicker?: string;
}) {
  return (
    <section className="banner-curve relative isolate overflow-hidden bg-[#222]">
      {image && <Image src={`/media/${image}`} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <div className="mx-auto flex min-h-[300px] max-w-[1140px] flex-col items-center justify-center px-5 pb-16 pt-12 text-center text-white sm:min-h-[360px]">
        {kicker && <div className="mb-2 font-quicksand text-[11px] font-semibold uppercase tracking-[.25em] text-gold">{kicker}</div>}
        <h1 className="font-karla text-[44px] font-bold leading-[1.15] sm:text-[81.2px] sm:tracking-[-4px]">{title}</h1>
        <nav className="mt-3 flex items-center gap-2 font-roboto text-[15px] font-normal sm:text-[18px]" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden className="flex h-[14px] w-[17px] items-center justify-center">
                  {/* Font Awesome "angle-right" at 14px, as on the original */}
                  <svg viewBox="0 0 256 512" className="h-[14px] w-[9px]" fill="currentColor"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" /></svg>
                </span>
              )}
              {c.href ? <Link href={c.href} className="inline-block py-2 hover:text-gold">{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
