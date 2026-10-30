import Link from "next/link";
import Image from "next/image";

/** Black-captioned project card used on category pages and "other projects". */
export function ProjectCard({
  p, label,
}: {
  p: { slug: string; title: string; categories: string[]; cover_file: string | null; cover_alt: string | null };
  label?: string;
}) {
  return (
    <Link href={`/portfolio/${p.slug}`} className="group block overflow-hidden rounded-[20px] bg-black">
      <div className="relative aspect-[560/580] overflow-hidden bg-[#222]">
        {p.cover_file && (
          <Image
            src={`/media/${p.cover_file}`}
            alt={p.cover_alt || p.title}
            fill
            sizes="(min-width:768px) 560px, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="px-4 pb-7 pt-5 text-center text-white">
        <h3 className="font-quicksand text-[19px] font-bold leading-snug">{p.title}</h3>
        <p className="mt-2 font-quicksand text-[10px] font-medium uppercase tracking-[.12em] text-white/80">{label ?? p.categories[0]}</p>
        <span className="mt-4 inline-block rounded-full bg-gold px-5 py-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[.15em] text-white group-hover:bg-gold-dark">
          View project
        </span>
      </div>
    </Link>
  );
}
