import Link from "next/link";
import Image from "next/image";
import { Crossfade } from "@/components/Crossfade";
import { Slider } from "@/components/Slider";
import { CoverflowSlider } from "@/components/CoverflowSlider";
import { InfoIcon } from "@/components/Icons";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import { ProjectCard } from "@/components/ProjectCard";
import { StatsStrip } from "@/components/StatsStrip";
import { CeoSection } from "@/components/CeoSection";
import { getMediaByIds, getProjects, getSettings, parseIds } from "@/lib/content";
import { q } from "@/lib/db";

type Slide = { id: number; label: string; title: string; button_text: string; button_link: string; filename: string | null; alt: string | null };
type Service = { id: number; slug: string | null; title: string; subtitle: string; description: string; link: string; filename: string | null; back_filename: string | null };

/** Renders **bold** phrases inside plain text. */
function Rich({ text }: { text: string }) {
  return <>{text.split("**").map((part, i) => (i % 2 ? <b key={i} className="font-bold">{part}</b> : <span key={i}>{part}</span>))}</>;
}
type Client = { id: number; name: string; filename: string };

/**
 * "Construction *Renovation* Remodeling": *word* is outlined. Each word is its own span with a running
 * index, so the hero can bring the title in word by word (soft rise and de-blur) instead of letter by letter.
 */
function SplitTitle({ text }: { text: string }) {
  let index = 0;
  return (
    <>
      {text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, pi) => {
        const outline = part.startsWith("*");
        const words = (outline ? part.slice(1, -1) : part).split(/(\s+)/);
        return (
          <span key={pi} className={outline ? "outline-word" : undefined}>
            {words.map((w, wi) =>
              /^\s+$/.test(w) ? (
                <span key={wi}> </span>
              ) : (
                <span key={wi} className="h-word inline-block" style={{ ["--wi" as string]: index++ }}>{w}</span>
              ),
            )}
          </span>
        );
      })}
    </>
  );
}

export default async function Home() {
  const s = await getSettings();
  const [slides, services, clients, carousel, showcase, stats, steps, faqs, featured] = await Promise.all([
    q<Slide>(`SELECT s.id, s.label, s.title, s.button_text, s.button_link, m.filename, m.alt FROM slides s LEFT JOIN media m ON m.id = s.image_id ORDER BY s.sort, s.id`),
    q<Service>(`SELECT s.id, s.slug, s.title, s.subtitle, s.description, s.link, m.filename, b.filename AS back_filename FROM services s LEFT JOIN media m ON m.id = s.image_id LEFT JOIN media b ON b.id = s.back_image_id ORDER BY s.sort, s.id`),
    q<Client>(`SELECT c.id, c.name, m.filename FROM clients c JOIN media m ON m.id = c.image_id ORDER BY c.sort, c.id`),
    getMediaByIds(parseIds(s.carousel_ids)),
    getMediaByIds(parseIds(s.showcase_ids)),
    q<{ id: number; value: number; suffix: string; label: string }>("SELECT id, value, suffix, label FROM stats ORDER BY sort, id"),
    q<{ id: number; title: string; description: string }>("SELECT id, title, description FROM steps ORDER BY sort, id"),
    q<{ question: string; answer: string }>("SELECT question, answer FROM faqs WHERE service_id IS NULL ORDER BY sort, id"),
    getProjects({ featured: true, limit: 6 }),
  ]);

  const mapSrc = s.map_query
    ? `https://maps.google.com/maps?q=${encodeURIComponent(s.map_query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : "";

  return (
    <>
      {/* Hero slider */}
      <section className="hero-curve relative isolate h-[calc(100svh-125px)] min-h-[520px] max-h-[980px] overflow-hidden bg-black text-white sm:h-[calc(100svh-102px)]">
        <Crossfade
          dots
          dotsBottom="bottom-[calc(var(--hero-curve)+18px)]"
          interval={8000}
          overlay="bg-gradient-to-r from-black/35 via-black/5 to-transparent"
          items={slides.filter((x) => x.filename).map((sl) => ({
            src: `/media/${sl.filename}`,
            alt: sl.alt || sl.title,
            node: (
              <>
                <div className="h-mask pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />
                <div className="absolute inset-0 flex items-center pb-[var(--hero-curve)]">
                  <div className="mx-auto w-full max-w-[1140px] px-5">
                    {sl.label && (
                      <p className="h-sub inline-block bg-orange px-2 font-roboto text-[13px] font-semibold uppercase tracking-[3px] text-white sm:text-[18px]">{sl.label}</p>
                    )}
                    <div className="mt-3 max-w-[820px]">
                      <h3 className="font-roboto text-[38px] font-bold leading-[1.2] sm:text-[58px]">
                        <SplitTitle text={sl.title} />
                      </h3>
                      <span className="h-line mt-5 block h-[3px] w-[72px] rounded bg-gold" aria-hidden />
                    </div>
                    {sl.button_text && (
                      <Link href={sl.button_link || "/projects"} className="h-btn mt-6 inline-flex items-center rounded-full border-2 border-gold px-8 py-3 font-poppins text-[13px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold">
                        {sl.button_text}
                      </Link>
                    )}
                  </div>
                </div>
              </>
            ),
          }))}
        />
      </section>

      {/* Intro + carousel */}
      <section className="bg-white py-14 sm:py-[85px]">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-5 md:grid-cols-2 md:gap-8 min-[1100px]:grid-cols-[1fr_560px] min-[1100px]:gap-10 min-[1100px]:pl-[62px]">
          <div>
            <h1 className="font-cormorant text-[28px] font-semibold leading-[1.35] text-black sm:text-[32px]">{s.intro_heading}</h1>
            <span className="mt-4 block h-px w-full max-w-[340px] bg-black/60" />
            <p className="mt-7 font-quicksand text-[9px] font-medium uppercase tracking-[.35em] text-[#666]">Our story</p>
            <h2 className="mt-1 font-quicksand text-[32px] font-normal text-black">About us</h2>
            <span className="rule mt-3 text-black" />
            <p className="mt-5 max-w-[470px] font-quicksand text-sm font-light leading-[1.9] tracking-wide text-[#555]">{s.about_text}</p>
            <Link href="/about" className="btn-gold mt-6">Read More</Link>
          </div>
          {carousel.length > 0 && (
            <CoverflowSlider autoplay={3000} className="aspect-[560/636] w-full">
              {carousel.map((m, i) => (
                <div key={m.id} className="relative h-full w-full">
                  <Image src={`/media/${m.filename}`} alt={m.alt} fill sizes="(min-width:768px) 560px, 100vw" priority={i === 0} draggable={false} className="object-cover" />
                </div>
              ))}
            </CoverflowSlider>
          )}
        </div>
      </section>

      <StatsStrip stats={stats} />

      {/* Services */}
      {services.length > 0 && (
        <section className="bg-[linear-gradient(180deg,#f6e797_0%,#f1ebd9_55%,#ece8df_100%)] stripes pb-20 pt-16 min-[1100px]:pb-[195px]">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="text-center font-quicksand text-[40px] font-semibold text-gold-title sm:text-[52px]">{s.services_title || "Our Services"}</h2>
            <h3 className="mt-2 text-center font-quicksand text-[18px] font-medium uppercase tracking-[.15em] text-[#624e54] sm:text-2xl">{s.services_subtitle || "Things we do"}</h3>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {services.map((sv) => (
                <div key={sv.id} className="zoom-card relative h-[380px] sm:h-[500px]">
                  {/* front */}
                  <div className="zoom-front absolute inset-0 overflow-hidden rounded-[40px] bg-[#202020]">
                    {sv.filename && <Image src={`/media/${sv.filename}`} alt={sv.title} fill sizes="(min-width:768px) 550px, 100vw" className="object-cover" />}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(32,32,32,.42)] px-7 pb-7 pt-[34px] text-center">
                      <h3 className="font-playfair text-[25.2px] font-semibold text-white">{sv.title}</h3>
                      <p className="mt-2 font-montserrat text-[12.6px] font-semibold uppercase tracking-[2px] text-white/[.99]">{sv.subtitle}</p>
                    </div>
                  </div>
                  {/* back: zooms in over the front on hover */}
                  <div className="zoom-back absolute inset-0 overflow-hidden rounded-[40px] bg-[#2b2b2b]">
                    {(sv.back_filename || sv.filename) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/media/${sv.back_filename || sv.filename}`} alt="" className="absolute inset-0 h-full w-full object-none object-center" />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(32,32,32,.69)] px-7 pb-7 pt-[31px] text-center">
                      <p className="font-roboto text-base leading-[25px] text-white"><Rich text={sv.description} /></p>
                      <Link href={sv.link || (sv.slug ? `/services/${sv.slug}` : "/projects")} className="mt-5 bg-white px-[30px] py-[15px] font-montserrat text-[8.12px] font-semibold uppercase tracking-[1.7px] text-[#202020] transition hover:bg-gold hover:text-white">
                        View our work
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link href="/projects" className="btn-gold btn-caps">View all our work</Link>
            </div>
          </div>
        </section>
      )}

      <CeoSection s={s} />

      {/* Client logos */}
      {clients.length > 0 && (
        <section className="bg-white py-12 md:py-[65px]">
          <div className="mx-auto max-w-[1240px] px-12 sm:px-[100px]">
            <Slider perView={5} perViewMobile={2} autoplay={3200} dots arrowInset={-44} arrowClass="text-black" dotActive="bg-black">
              {clients.map((c) => (
                <div key={c.id} className="px-3">
                  <div className="relative h-[100px] rounded-xl bg-[#fafafa]">
                    <Image src={`/media/${c.filename}`} alt={c.name} fill sizes="230px" className="object-contain p-1.5" />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      <Testimonials />

      {/* Featured projects */}
      {featured.length > 0 && (
        <section className="bg-white py-16 sm:py-[90px]">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="h-accent text-center font-quicksand text-[32px] font-semibold text-[#222] sm:text-[40px]">{s.featured_title || "Featured projects"}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featured.map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
            <div className="mt-12 text-center">
              <Link href="/projects/all" className="btn-gold btn-caps">View all projects</Link>
            </div>
          </div>
        </section>
      )}

      {/* How we work */}
      {steps.length > 0 && (
        <section className="bg-cream py-16 sm:py-[90px]">
          <div className="mx-auto max-w-[1140px] px-5">
            <h2 className="h-accent text-center font-quicksand text-[32px] font-semibold text-[#222] sm:text-[40px]">{s.process_title || "How we work"}</h2>
            {s.process_subtitle && <p className="mt-2 text-center font-quicksand text-sm font-medium uppercase tracking-[.2em] text-[#8b5e3c]">{s.process_subtitle}</p>}
            <ol className={`relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-6 ${{ 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" }[steps.length as 1 | 2 | 3] ?? "lg:grid-cols-4"}`}>
              {steps.map((st, i) => (
                <li key={st.id} className="relative px-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold font-quicksand text-xl font-semibold text-white shadow-md">{i + 1}</div>
                  {i < steps.length - 1 && <span className="absolute left-[calc(50%+40px)] right-[-50%] top-7 hidden h-px bg-gold/40 lg:block" aria-hidden />}
                  <h3 className="mt-5 font-playfair text-[22px] font-semibold text-[#222]">{st.title}</h3>
                  <p className="mt-2 font-quicksand text-sm font-light leading-relaxed text-[#555]">{st.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && <Faq items={faqs} title={s.faq_title || "Frequently asked questions"} className="py-16 sm:py-[90px]" />}

      <CtaBand s={s} />

      {/* Showcase slideshow */}
      {showcase.length > 0 && (
        <section className="relative isolate h-[420px] overflow-hidden bg-black sm:h-[675px]">
          <Crossfade
            interval={6000}
            items={showcase.map((m) => ({ src: `/media/${m.filename}`, alt: m.alt }))}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Link href="/projects" className="btn-gold !px-7 !py-3.5 text-[14px]">
              View Projects <InfoIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Map */}
      {mapSrc && (
        <iframe title="Our location" src={mapSrc} loading="lazy" className="block h-[420px] w-full border-0 sm:h-[600px]" referrerPolicy="no-referrer-when-downgrade" />
      )}
    </>
  );
}
