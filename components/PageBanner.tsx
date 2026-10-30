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
        <h1 className="font-poppins text-4xl font-semibold leading-tight sm:text-[56px]">{title}</h1>
        <nav className="mt-3 flex items-center gap-2 font-poppins text-xs font-medium" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[10px]">›</span>}
              {c.href ? <Link href={c.href} className="inline-block py-2 hover:text-gold">{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
