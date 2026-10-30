import Link from "next/link";
import Image from "next/image";
import { getMedia, getSettings, lines } from "@/lib/content";
import { q } from "@/lib/db";
import {
  ArrowCircleIcon, CaretDown, CheckCircleIcon, ClockIcon, DoubleChevron, InfoIcon, MailIcon, PhoneIcon, PinIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const NAV = [
  ["/", "Home"],
  ["/about", "About us"],
  ["/projects", "Projects"],
  ["/gallery", "Gallery"],
  ["/contact", "Contact"],
] as const;

const PROJECT_LINKS = [
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
  const footerGallery = await q<{ filename: string; alt: string; original_name: string }>(
    "SELECT DISTINCT m.filename, m.alt, m.original_name FROM gallery g JOIN media m ON m.id = g.image_id ORDER BY m.original_name LIMIT 6",
  );

  return (
    <>
      {/* top info bar */}
      <div className="bg-topbar text-white">
        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2 font-poppins text-[13px] font-light">
          {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-gold"><MailIcon className="h-3.5 w-3.5 text-gold" />{s.email}</a>}
          {s.phone && <a href={`tel:${tel(s.phone)}`} className="flex items-center gap-2 hover:text-gold"><PhoneIcon className="h-3.5 w-3.5 text-gold" />{s.phone}</a>}
          {s.hours && <span className="flex items-center gap-2"><InfoIcon className="h-3.5 w-3.5 text-gold" />Opening time: {s.hours.replace(/\s*\/\s*/g, " ")}</span>}
        </div>
      </div>

      {/* header */}
      <header className="relative z-40 bg-black text-white">
        <div className="mx-auto flex h-[66px] max-w-[1240px] items-center justify-between px-5">
          <Link href="/" className="flex shrink-0 items-center">
            {logo ? (
              <Image src={`/media/${logo.filename}`} alt={name} width={144} height={41} priority className="h-[41px] w-auto" />
            ) : (
              <span className="font-cormorant text-2xl font-semibold">{name}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-9 font-poppins text-[13px] font-normal uppercase tracking-wide lg:flex">
            {NAV.map(([href, label]) =>
              href === "/projects" ? (
                <div key={href} className="group relative">
                  <Link href={href} className="flex items-center gap-1 py-6 hover:text-gold">{label}<CaretDown /></Link>
                  <div className="invisible absolute left-0 top-full min-w-[220px] bg-black py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {PROJECT_LINKS.map(([h, l]) => (
                      <Link key={h} href={h} className="block px-5 py-2.5 normal-case hover:text-gold">{l}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={href} href={href} className="hover:text-gold">{label}</Link>
              ),
            )}
          </nav>

          <Link href="/contact" className="hidden items-center gap-2 rounded-full border border-white px-5 py-2.5 font-poppins text-[11px] font-semibold uppercase tracking-wide transition hover:border-gold hover:text-gold lg:inline-flex">
            Schedule appointment <DoubleChevron />
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded border border-white/30" aria-label="Menu">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <div className="absolute right-0 top-12 w-64 bg-black p-3 font-poppins text-[13px] uppercase shadow-xl">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="block px-3 py-2.5 hover:text-gold">{label}</Link>
              ))}
              {PROJECT_LINKS.map(([h, l]) => (
                <Link key={h} href={h} className="block px-3 py-2 pl-7 text-[12px] normal-case text-white/70 hover:text-gold">{l}</Link>
              ))}
              <Link href="/contact" className="mt-2 block rounded-full border border-white px-4 py-2.5 text-center text-[11px] font-semibold">Schedule appointment</Link>
            </div>
          </details>
        </div>
      </header>

      <main>{children}</main>

      {/* footer */}
      <footer className="bg-footer text-white">
        <div className="mx-auto grid max-w-[1140px] gap-10 px-5 py-[70px] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr]">
          <div>
            <FooterTitle>Contact us</FooterTitle>
            <ul className="space-y-4 font-poppins text-[13px] font-light leading-relaxed">
              {s.address && <li className="flex gap-3"><PinIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><span>{s.address}</span></li>}
              {s.phone && <li className="flex gap-3"><PhoneIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><a href={`tel:${tel(s.phone)}`}>{s.phone}</a></li>}
              {s.email && <li className="flex gap-3"><MailIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.hours && <li className="flex gap-3"><ClockIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-white/60" /><span>{s.hours}</span></li>}
            </ul>
          </div>
          <div>
            <FooterTitle>Quick links</FooterTitle>
            <ul className="space-y-4 font-poppins text-[13px] font-light">
              {[["/", "Home"], ["/about", "About us"], ["/projects", "Projects"], ["/contact", "Contact us"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="flex items-center gap-3 hover:text-gold"><ArrowCircleIcon className="h-3.5 w-3.5 text-white/60" />{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <FooterTitle>Our services</FooterTitle>
            <ul className="space-y-4 font-poppins text-[13px] font-light">
              {lines(s.footer_services).map((l) => (
                <li key={l}><Link href="/projects" className="flex items-center gap-3 hover:text-gold"><CheckCircleIcon className="h-3.5 w-3.5 text-white/60" />{l}</Link></li>
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
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.400A10 10 0 1 0 12 2Zm0 1.800a8.200 8.200 0 1 1-4.200 15.200l-.3-.2-2.900.8.8-2.800-.2-.3A8.200 8.200 0 0 1 12 3.800Zm-3 4.300c-.2 0-.5.100-.7.400-.3.300-1 1-1 2.400s1 2.800 1.200 3c.1.200 2 3.100 4.900 4.300 2.400 1 2.900.8 3.400.7.500-.1 1.700-.7 1.900-1.400.2-.7.200-1.200.2-1.400-.1-.1-.3-.2-.6-.4l-1.800-.9c-.2-.1-.4-.1-.6.100l-.8 1c-.2.200-.3.200-.6.100-1-.5-2-1.100-2.900-2.400-.2-.4 0-.4.200-.6l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4Z" />
          </svg>
        </a>
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
