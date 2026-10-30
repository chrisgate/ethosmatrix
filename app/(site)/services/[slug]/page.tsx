import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import { CheckCircleIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { PageBanner } from "@/components/PageBanner";
import { ProjectCard } from "@/components/ProjectCard";
import { categorySlug, getMedia, getProjects, getSettings, lines, paragraphs } from "@/lib/content";
import { q } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };
type Service = {
  id: number; title: string; slug: string; subtitle: string; description: string; intro: string; scope: string;
  related_category: string; image_file: string | null; back_file: string | null; banner_file: string | null;
};

async function getService(slug: string) {
  const [row] = await q<Service>(
    `SELECT s.id, s.title, s.slug, s.subtitle, s.description, s.intro, s.scope, s.related_category,
            m.filename AS image_file, b.filename AS back_file, ban.filename AS banner_file
     FROM services s
     LEFT JOIN media m ON m.id = s.image_id
     LEFT JOIN media b ON b.id = s.back_image_id
     LEFT JOIN media ban ON ban.id = s.banner_id
     WHERE s.slug = $1`,
    [slug],
  );
  return row ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sv = await getService((await params).slug);
  if (!sv) return {};
  const text = (sv.intro || sv.description).replace(/\*\*/g, "");
  return { title: sv.title, description: text.slice(0, 160) };
}

export default async function ServicePage({ params }: Props) {
  const sv = await getService((await params).slug);
  if (!sv) notFound();
  const s = await getSettings();
  const [projects, faqs, others] = await Promise.all([
    sv.related_category ? getProjects({ category: sv.related_category, limit: 3 }) : Promise.resolve([]),
    q<{ question: string; answer: string }>("SELECT question, answer FROM faqs WHERE service_id = $1 ORDER BY sort, id", [sv.id]),
    q<{ title: string; slug: string }>("SELECT title, slug FROM services WHERE id <> $1 AND slug IS NOT NULL AND slug <> '' ORDER BY sort, id", [sv.id]),
  ]);
  const bannerFile = sv.banner_file || sv.back_file || sv.image_file;
  const sideFile = sv.back_file || sv.image_file;
  const included = lines(sv.scope);
  const body = paragraphs(sv.intro || sv.description.replace(/\*\*/g, ""));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: sv.title,
          description: body[0],
          provider: { "@type": "Organization", name: s.site_name || "Ethos Matrix" },
          areaServed: "Nigeria",
        }}
      />
      <PageBanner
        title={sv.title}
        kicker={sv.subtitle}
        image={bannerFile}
        crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: sv.title }]}
      />

      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto grid max-w-[1140px] items-start gap-12 px-5 md:grid-cols-2">
          <div>
            <h2 className="border-l-2 border-orange pl-4 font-quicksand text-[24px] font-medium text-[#222]">What we do</h2>
            <div className="mt-6 space-y-5 font-quicksand text-[15px] font-light leading-[1.9] tracking-wide text-[#555]">
              {body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {included.length > 0 && (
              <>
                <h3 className="mt-8 font-montserrat text-[12px] font-bold uppercase tracking-[.16em] text-[#222]">What&apos;s included</h3>
                <ul className="mt-4 space-y-3 font-quicksand text-[15px] text-[#444]">
                  {included.map((l) => (
                    <li key={l} className="flex items-start gap-3"><CheckCircleIcon className="mt-1 h-4 w-4 text-gold" />{l}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/quote?service=${encodeURIComponent(sv.title)}`} className="btn-gold">Request a quote</Link>
              {sv.related_category && (
                <Link href={`/projects/${categorySlug(sv.related_category)}`} className="rounded-full border border-black/30 px-7 py-3 font-quicksand text-base font-medium text-[#222] transition hover:border-gold hover:text-gold-dark">
                  See our work
                </Link>
              )}
            </div>
          </div>
          {sideFile && (
            <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-[28px]">
              <Image src={`/media/${sideFile}`} alt={sv.title} fill sizes="(min-width:768px) 540px, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="h-accent mb-8 text-center font-quicksand text-[32px] font-semibold text-[#222]">Related projects</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {projects.map((p) => <ProjectCard key={p.id} p={p} label={sv.related_category} />)}
            </div>
            <div className="mt-10 text-center">
              <Link href={`/projects/${categorySlug(sv.related_category)}`} className="btn-gold btn-caps">View all {sv.related_category}</Link>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && <Faq items={faqs} title="Questions about this service" className="py-16 sm:py-20" />}

      {others.length > 0 && (
        <section className="bg-white pb-16">
          <div className="mx-auto max-w-[1140px] px-5 text-center">
            <h2 className="font-quicksand text-[24px] font-semibold text-[#222]">Other services</h2>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className="rounded-full border border-black/20 px-5 py-2 font-quicksand text-sm text-[#333] hover:border-gold hover:text-gold-dark">{o.title}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand s={s} service={sv.title} />
    </>
  );
}
