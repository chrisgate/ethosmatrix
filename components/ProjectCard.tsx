import Link from "next/link";
import Image from "next/image";

/** Black-captioned project card used on category pages, the home page and "other projects". */
export function ProjectCard({
  p, label,
}: {
  p: { slug: string; title: string; categories: string[]; cover_file: string | null; cover_alt: string | null };
  label?: string;
}) {
  return (
    <Link
      href={`/portfolio/${p.slug}`}
      className="group block overflow-hidden rounded-[20px] bg-black shadow-md transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-18px_rgba(0,0,0,.55)]"
    >
      <div className="relative aspect-[560/580] overflow-hidden bg-[#222]">
        {p.cover_file && (
          <Image
            src={`/media/${p.cover_file}`}
            alt={p.cover_alt || p.title}
            fill
            sizes="(min-width:768px) 560px, 100vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <span className="pointer-events-none absolute right-4 top-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gold text-white opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7M8 7h9v9" /></svg>
        </span>
      </div>
      <div className="px-4 pb-7 pt-5 text-center text-white">
        <h3 className="font-quicksand text-[19px] font-bold leading-snug">{p.title}</h3>
        <p className="mt-2 font-quicksand text-[10px] font-medium uppercase tracking-[.12em] text-white/80">{label ?? p.categories[0]}</p>
        <span className="mt-4 inline-block rounded-full bg-gold px-5 py-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[.15em] text-white transition group-hover:bg-gold-dark">
          View project
        </span>
      </div>
    </Link>
  );
}
