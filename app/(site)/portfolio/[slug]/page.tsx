import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import { CheckCircleIcon } from "@/components/Icons";
import { getMediaByIds, getProject, getProjects, lines, paragraphs } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

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
  const [gallery, others] = await Promise.all([
    getMediaByIds(p.gallery_ids ?? []),
    getProjects({ exclude: p.id, limit: 3 }),
  ]);
  const scope = lines(p.scope);
  const [lead, ...rest] = gallery;

  return (
    <article>
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

      {/* photos */}
      {rest.length > 0 && (
        <section className="bg-white pb-16">
          <div className="mx-auto grid max-w-[1140px] gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((m) => (
              <div key={m.id} className="relative aspect-[4/3] overflow-hidden bg-[#eee]">
                <Image src={`/media/${m.filename}`} alt={m.alt} fill sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* other projects */}
      {others.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="mb-8 text-center font-quicksand text-[32px] font-semibold text-[#222]">Other projects</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {others.map((o) => <ProjectCard key={o.id} p={o} />)}
            </div>
            <div className="mt-12 text-center">
              <Link href="/projects" className="btn-gold btn-caps">View all projects</Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
