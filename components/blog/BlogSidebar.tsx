import Image from "next/image";
import Link from "next/link";
import { blogFacets, type PostRow } from "@/lib/blog";

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h3 className="font-quicksand text-[18px] font-bold text-[#222]">{title}</h3>
      <span className="mb-5 mt-2 block h-[3px] w-10 rounded bg-gold" />
      {children}
    </section>
  );
}

/** Blog sidebar: search, latest posts (numbered), categories, archives and a quote call-to-action. */
export function BlogSidebar({
  posts, active = {}, exclude, showSearch = true,
}: {
  posts: PostRow[];
  active?: { category?: string; month?: string; q?: string };
  exclude?: number;
  showSearch?: boolean;
}) {
  const { categories, months } = blogFacets(posts);
  const latest = posts.filter((p) => p.id !== exclude).slice(0, 4);

  return (
    <aside>
      {showSearch && (
        <Widget title="Search">
          <form action="/blog" method="get" role="search" className="flex">
            <input
              name="q"
              defaultValue={active.q ?? ""}
              placeholder="Search articles"
              aria-label="Search articles"
              className="min-w-0 flex-1 border border-black/15 bg-white px-4 py-2.5 font-quicksand text-sm focus:border-gold focus:outline-none"
            />
            <button type="submit" className="bg-[#161616] px-4 font-montserrat text-[10px] font-bold uppercase tracking-[.14em] text-white hover:bg-gold">Go</button>
          </form>
        </Widget>
      )}

      {latest.length > 0 && (
        <Widget title="Latest Posts">
          <ol className="space-y-5">
            {latest.map((p, i) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="group flex items-center gap-4">
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[#222]">
                    {p.filename && <Image src={`/media/${p.filename}`} alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-110" />}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 font-quicksand text-[34px] font-bold text-white">{i + 1}</span>
                  </span>
                  <span>
                    <span className="block font-quicksand text-[14px] font-bold leading-snug text-[#222] transition group-hover:text-gold-dark">{p.title}</span>
                    <span className="mt-1 block font-quicksand text-[12px] text-[#999]">
                      {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Widget>
      )}

      {categories.length > 0 && (
        <Widget title="Categories">
          <ul className="space-y-1 font-quicksand text-[15px]">
            {categories.map((c) => (
              <li key={c.slug} className="flex items-center justify-between">
                <Link href={`/blog?category=${c.slug}`} className={`inline-block py-1 transition hover:text-gold-dark ${active.category === c.slug ? "font-bold text-gold-dark" : "text-[#444]"}`}>{c.name}</Link>
                <span className="rounded-full bg-[#f3efe8] px-2.5 py-0.5 text-[12px] text-[#777]">{c.count}</span>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {months.length > 0 && (
        <Widget title="Archives">
          <ul className="space-y-1 font-quicksand text-[15px]">
            {months.slice(0, 12).map((m) => (
              <li key={m.key}>
                <Link href={`/blog?month=${m.key}`} className={`inline-block py-1 transition hover:text-gold-dark ${active.month === m.key ? "font-bold text-gold-dark" : "text-[#444]"}`}>
                  {m.label} <span className="text-[#999]">({m.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      <div className="rounded-xl bg-[#111] p-6 text-white">
        <div className="font-cormorant text-[26px] font-semibold leading-tight">Planning a project?</div>
        <p className="mt-2 font-quicksand text-sm font-light leading-relaxed text-white/75">Tell us what you have in mind and we will get back to you.</p>
        <Link href="/quote" className="btn-gold btn-caps mt-5 w-full !px-4 !py-3 !text-[12px]">Schedule appointment</Link>
      </div>
    </aside>
  );
}
