import Link from "next/link";
import Image from "next/image";
import { getMedia, getSettings, lines } from "@/lib/content";
import { q } from "@/lib/db";
import { SiteEffects } from "@/components/SiteEffects";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import {
  ArrowCircleIcon, CaretDown, CheckCircleIcon, ClockIcon, DoubleChevron, InfoIcon, MailIcon, PhoneIcon, PinIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

type NavItem = { href: string; label: string; children?: [string, string][] };

const PROJECT_LINKS: [string, string][] = [
  ["/projects/all", "All projects"],
  ["/projects/conceptual-design", "Conceptual Design"],
  ["/projects/architectural-design", "Architectural Design"],
  ["/projects/construction", "Construction"],
  ["/projects/project-management", "Project Management"],
];

const tel = (s: string) => s.replace(/[^\d+]/g, "");

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const logo = await getMedia(s.logo_id);
  const name = s.site_name || "Ethos Matrix";
  const wa = (s.whatsapp || "").replace(/\D/g, "");
  const services = await q<{ slug: string; title: string }>(
    "SELECT slug, title FROM services WHERE slug IS NOT NULL AND slug <> '' ORDER BY sort, id",
  );
  const [{ n: postCount }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM posts WHERE published");
  const nav: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About us" },
    { href: "/services", label: "Services", children: services.map((x) => [`/services/${x.slug}`, x.title] as [string, string]) },
    { href: "/projects", label: "Projects", children: PROJECT_LINKS },
    ...(postCount > 0 ? [{ href: "/blog", label: "Blog" }] : []),
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];
  const sameAs = (s.same_as || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name,
    url: process.env.SITE_URL ?? "http://localhost:3000",
    description: s.seo_description || undefined,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    address: s.address ? { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "NG" } : undefined,
    openingHours: s.hours || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
  const footerGallery = await q<{ filename: string; alt: string; original_name: string }>(
    "SELECT DISTINCT m.filename, m.alt, m.original_name FROM gallery g JOIN media m ON m.id = g.image_id ORDER BY m.original_name LIMIT 6",
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, "\\u003c") }} />
      <a href="#main" className="sr-only z-[100] rounded bg-gold px-4 py-2 font-quicksand text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      {/* top info bar */}
      <div className="bg-topbar text-white">
        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-x-6 px-5 font-poppins text-[13px] font-light">
          {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-2 py-2 hover:text-gold"><MailIcon className="h-3.5 w-3.5 text-gold" />{s.email}</a>}
          {s.phone && <a href={`tel:${tel(s.phone)}`} className="flex items-center gap-2 py-2 hover:text-gold"><PhoneIcon className="h-3.5 w-3.5 text-gold" />{s.phone}</a>}
          {s.hours && <span className="flex items-center gap-2"><InfoIcon className="h-3.5 w-3.5 text-gold" />Opening time: {s.hours.replace(/\s*\/\s*/g, " ")}</span>}
        </div>
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 bg-black text-white shadow-[0_8px_24px_-14px_rgba(0,0,0,.7)]">
        <div className="mx-auto flex h-[66px] max-w-[1240px] items-center justify-between px-5">
          <Link href="/" className="flex shrink-0 items-center">
            {logo ? (
              <Image src={`/media/${logo.filename}`} alt={name} width={144} height={41} priority className="h-[41px] w-auto" />
            ) : (
              <span className="font-cormorant text-2xl font-semibold">{name}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-8 font-poppins text-[13px] font-normal uppercase tracking-wide lg:flex">
            {nav.map((item) =>
              item.children?.length ? (
                <div key={item.href} className="group relative">
                  <Link href={item.href} className="flex items-center gap-1 py-6 hover:text-gold">{item.label}<CaretDown /></Link>
                  <div className="invisible absolute left-0 top-full min-w-[230px] bg-black py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {item.children.map(([h, l]) => (
                      <Link key={h} href={h} className="block px-5 py-2.5 normal-case hover:text-gold">{l}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="hover:text-gold">{item.label}</Link>
              ),
            )}
          </nav>

          <Link href="/quote" className="hidden items-center gap-2 rounded-full border border-white px-5 py-2.5 font-poppins text-[11px] font-semibold uppercase tracking-wide transition hover:border-gold hover:text-gold lg:inline-flex">
            Schedule appointment <DoubleChevron />
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded border border-white/30" aria-label="Menu">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <div className="absolute right-0 top-12 max-h-[80vh] w-64 overflow-y-auto bg-black p-3 font-poppins text-[13px] uppercase shadow-xl">
              {nav.map((item) => (
                <div key={item.href}>
                  <Link href={item.href} className="block px-3 py-2.5 hover:text-gold">{item.label}</Link>
                  {item.children?.map(([h, l]) => (
                    <Link key={h} href={h} className="block px-3 py-2.5 pl-7 text-[13px] normal-case text-white/70 hover:text-gold">{l}</Link>
                  ))}
                </div>
              ))}
              <Link href="/quote" className="mt-2 block rounded-full border border-white px-4 py-2.5 text-center text-[11px] font-semibold">Schedule appointment</Link>
            </div>
          </details>
        </div>
      </header>

      <main id="main">{children}</main>
      <SiteEffects />

      {/* footer */}
      <footer className="bg-footer text-white">
        <div className="mx-auto grid max-w-[1140px] gap-10 px-5 py-[70px] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr]">
          <div>
            <FooterTitle>Contact us</FooterTitle>
            <ul className="space-y-2 font-poppins text-[13px] font-light leading-relaxed">
              {s.address && <li className="flex gap-3"><PinIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><span>{s.address}</span></li>}
              {s.phone && <li className="flex gap-3"><PhoneIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><a href={`tel:${tel(s.phone)}`} className="inline-block py-2">{s.phone}</a></li>}
              {s.email && <li className="flex gap-3"><MailIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><a href={`mailto:${s.email}`} className="inline-block py-2">{s.email}</a></li>}
              {s.hours && <li className="flex gap-3"><ClockIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><span>{s.hours}</span></li>}
            </ul>
          </div>
          <div>
            <FooterTitle>Quick links</FooterTitle>
            <ul className="space-y-0.5 font-poppins text-[13px] font-light">
              {[["/", "Home"], ["/about", "About us"], ["/projects", "Projects"], ["/contact", "Contact us"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="flex items-center gap-3 py-2 hover:text-gold"><ArrowCircleIcon className="h-3.5 w-3.5 text-white/60" />{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <FooterTitle>Our services</FooterTitle>
            <ul className="space-y-0.5 font-poppins text-[13px] font-light">
              {(services.length ? services.map((x) => [`/services/${x.slug}`, x.title]) : lines(s.footer_services).map((l) => ["/projects", l])).map(([h, l]) => (
                <li key={h + l}><Link href={h} className="flex items-center gap-3 py-2 hover:text-gold"><CheckCircleIcon className="h-3.5 w-3.5 text-white/60" />{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <FooterTitle>Our gallery</FooterTitle>
            <div className="grid max-w-[260px] grid-cols-3 gap-1">
              {footerGallery.map((g) => (
                <Link key={g.filename} href="/gallery" className="relative block aspect-square border border-white/80 bg-black">
                  <Image src={`/media/${g.filename}`} alt={g.alt} fill sizes="90px" className="object-cover" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-black">
          <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-5 py-3">
            {logo ? <Image src={`/media/${logo.filename}`} alt={name} width={144} height={41} className="h-9 w-auto" /> : <span className="font-cormorant text-xl">{name}</span>}
            <span className="font-poppins text-[15px] text-[#a5a5a5]">© {new Date().getFullYear()} | Ethosmatrix</span>
          </div>
        </div>
      </footer>

      {wa && (
        <WhatsAppChat
          number={wa}
          title={s.wa_title || "Hello there"}
          message={s.wa_message || `Welcome to ${name}. We are a Nigerian turnkey real estate company offering design, planning, construction and finishing.

Please tell us your name and how we can help you today.`}
          prefill={s.wa_prefill || `Hello ${name}, I would like to make an enquiry.`}
          button={s.wa_button || "Open chat"}
          delay={s.wa_delay === undefined || s.wa_delay === "" ? 8 : Number(s.wa_delay) || 0}
        />
      )}
    </>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-roboto text-xl font-normal uppercase text-white">{children}</h3>
      <span className="mt-3 block h-px w-9 bg-gold" />
    </div>
  );
}
