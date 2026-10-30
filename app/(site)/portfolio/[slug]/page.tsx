import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/BeforeAfter";
import { CheckCircleIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { PhotoGrid } from "@/components/PhotoGrid";
import { ProjectCard } from "@/components/ProjectCard";
import { getMedia, getMediaByIds, getProject, getProjects, getSettings, lines, paragraphs, videoEmbed } from "@/lib/content";
import { q } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };
type Neighbour = { slug: string; title: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: paragraphs(p.body)[0]?.slice(0, 160) || undefined,
    openGraph: p.cover_file ? { images: [`/media/${p.cover_file}`] } : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  const s = await getSettings();
  const [gallery, others, before, after, [{ sort }]] = await Promise.all([
    getMediaByIds(p.gallery_ids ?? []),
    getProjects({ exclude: p.id, limit: 3 }),
    getMedia(p.before_id),
    getMedia(p.after_id),
    q<{ sort: number }>("SELECT sort FROM projects WHERE id = $1", [p.id]),
  ]);
  const [prev] = await q<Neighbour>(
    "SELECT slug, title FROM projects WHERE published AND (sort, id) < ($1, $2) ORDER BY sort DESC, id DESC LIMIT 1",
    [sort, p.id],
  );
  const [next] = await q<Neighbour>(
    "SELECT slug, title FROM projects WHERE published AND (sort, id) > ($1, $2) ORDER BY sort, id LIMIT 1",
    [sort, p.id],
  );

  const scope = lines(p.scope);
  const [lead, ...rest] = gallery;
  const embed = videoEmbed(p.video_url);
  const facts: [string, string][] = ([
    ["Client", p.client], ["Location", p.location], ["Year", p.year], ["Size", p.size], ["Status", p.status],
  ] as [string, string][]).filter(([, v]) => v);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          description: paragraphs(p.body)[0],
          image: p.cover_file ? `/media/${p.cover_file}` : undefined,
          locationCreated: p.location || undefined,
          dateCreated: p.year || undefined,
          creator: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
        }}
      />

      {/* hero */}
      <section className="relative isolate flex h-[420px] items-end overflow-hidden bg-[#222] sm:h-[600px]">
        {p.cover_file && <Image src={`/media/${p.cover_file}`} alt={p.cover_alt || p.title} fill priority sizes="100vw" className="-z-20 object-cover" />}
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="mx-auto w-full max-w-[1140px] px-5 pb-14 text-white sm:pb-20">
          <div className="font-poppins text-[10px] font-medium uppercase tracking-[.2em]">{p.categories[0]}</div>
          <h1 className="mt-3 max-w-[560px] font-poppins text-[34px] font-semibold leading-[1.1] sm:text-[54px]">{p.title}</h1>
          {p.subtitle && <p className="mt-2 font-poppins text-xl font-semibold sm:text-2xl">{p.subtitle}</p>}
        </div>
      </section>

      {/* key facts */}
      {facts.length > 0 && (
        <section className="border-b border-black/10 bg-white">
          <dl className="mx-auto flex max-w-[1000px] flex-wrap justify-center gap-x-12 gap-y-5 px-5 py-7 text-center">
            {facts.map(([k, v]) => (
              <div key={k} className="min-w-[110px]">
                <dt className="font-montserrat text-[10px] font-bold uppercase tracking-[.2em] text-gold-dark">{k}</dt>
                <dd className="mt-1 font-poppins text-[13px] font-medium text-[#222] sm:text-[15px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* information */}
      {(p.body || scope.length > 0) && (
        <section className="bg-[#f6f0e0] py-14 sm:py-20">
          <div className="mx-auto grid max-w-[1000px] items-start gap-10 px-5 md:grid-cols-2">
            <div>
              <h2 className="border-l-[3px] border-orange pl-3 font-poppins text-2xl font-semibold text-[#222]">Project information</h2>
              <div className="mt-4 space-y-4 text-justify font-poppins text-[13px] leading-[1.8] text-[#333]">
                {paragraphs(p.body).map((t, i) => <p key={i}>{t}</p>)}
              </div>
              {scope.length > 0 && (
                <>
                  <h3 className="mt-8 font-poppins text-[13px] font-bold uppercase text-[#222]">Project scope</h3>
                  <ul className="mt-3 space-y-2 font-poppins text-[13px] text-[#333]">
                    {scope.map((l) => <li key={l} className="flex items-start gap-2"><CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 text-gold" />{l}</li>)}
                  </ul>
                </>
              )}
            </div>
            {lead && (
              <div className="relative aspect-[4/3.3] w-full">
                <Image src={`/media/${lead.filename}`} alt={lead.alt} fill sizes="(min-width:768px) 500px, 100vw" className="object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* video */}
      {embed && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-[900px] px-5">
            <h2 className="mb-6 text-center font-quicksand text-[28px] font-semibold text-[#222]">Watch the project</h2>
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <iframe src={embed} title={`${p.title} video`} className="absolute inset-0 h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
            </div>
          </div>
        </section>
      )}

      {/* concept */}
      {p.concept_text && (
        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[900px] px-5">
            <h2 className="border-l-[3px] border-orange pl-3 font-poppins text-2xl font-semibold text-[#222]">
              Design concept{p.concept_title && p.concept_title !== "Concept" ? `: ${p.concept_title}` : ""}
            </h2>
            <div className="mt-5 space-y-4 text-justify font-poppins text-[13px] leading-[1.8] text-[#333]">
              {paragraphs(p.concept_text).map((t, i) => <p key={i}>{t}</p>)}
            </div>
          </div>
        </section>
      )}

      {/* before / after */}
      {before && after && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-[1000px] px-5">
            <h2 className="mb-6 text-center font-quicksand text-[28px] font-semibold text-[#222]">Before &amp; after</h2>
            <BeforeAfter before={`/media/${before.filename}`} after={`/media/${after.filename}`} beforeAlt={`${p.title} before`} afterAlt={`${p.title} after`} />
          </div>
        </section>
      )}

      {/* photos */}
      {rest.length > 0 && (
        <section className="bg-white pb-16">
          <PhotoGrid photos={rest.map((m) => ({ src: `/media/${m.filename}`, alt: m.alt }))} />
        </section>
      )}

      {/* enquire + previous / next */}
      <section className="bg-dark px-5 py-14 text-center text-white">
        <h2 className="font-cormorant text-[30px] font-semibold sm:text-[40px]">Planning something similar?</h2>
        <p className="mx-auto mt-3 max-w-[560px] font-quicksand text-base font-light text-white/75">Tell us about your project and mention {p.title} for a similar approach.</p>
        <Link href={`/quote?project=${encodeURIComponent(p.title)}`} className="btn-gold btn-caps mt-7">Enquire about a similar project</Link>
      </section>
      {(prev || next) && (
        <nav className="border-b border-black/10 bg-white" aria-label="Project navigation">
          <div className="mx-auto flex max-w-[1140px] items-stretch justify-between gap-4 px-5 py-6 font-quicksand">
            {prev ? (
              <Link href={`/portfolio/${prev.slug}`} className="group max-w-[45%] text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-[.18em] text-gold-dark">← Previous</span>
                <span className="mt-1 block text-[15px] font-semibold text-[#222] group-hover:text-gold-dark">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/portfolio/${next.slug}`} className="group max-w-[45%] text-right">
                <span className="block text-[11px] font-semibold uppercase tracking-[.18em] text-gold-dark">Next →</span>
                <span className="mt-1 block text-[15px] font-semibold text-[#222] group-hover:text-gold-dark">{next.title}</span>
              </Link>
            ) : <span />}
          </div>
        </nav>
      )}

      {/* other projects */}
      {others.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="h-accent mb-8 text-center font-quicksand text-[32px] font-semibold text-[#222]">Other projects</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {others.map((o) => <ProjectCard key={o.id} p={o} />)}
            </div>
            <div className="mt-12 text-center">
              <Link href="/projects/all" className="btn-gold btn-caps">View all projects</Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
