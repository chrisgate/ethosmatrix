import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { MapIcon } from "@/components/Icons";
import { getMedia, getSettings } from "@/lib/content";
import { submitAppointment } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Schedule an appointment or get in touch with Ethos Matrix in Lagos.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  const s = await getSettings();
  const banner = await getMedia(s.banner_contact_id);
  const field = "w-full border border-[#e3e3e3] bg-white px-4 py-3 font-quicksand text-[13px] text-[#444] placeholder:text-[#aaa] focus:border-[#c9a98f] focus:outline-none";
  const phone = s.phone?.replace(/[^\d+]/g, "");
  const mapSrc = s.map_query
    ? `https://maps.google.com/maps?q=${encodeURIComponent(s.map_query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : "";
  const directions = s.map_query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.map_query)}` : "#";

  return (
    <>
      <PageBanner title="Get In Touch" kicker="Contact us" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Contact us" }]} />

      <section className="bg-white pb-16 pt-6">
        <form id="appointment" action={submitAppointment} className="mx-auto max-w-[780px] scroll-mt-24 space-y-3 px-5">
          {sent && <p className="bg-green-50 p-3 text-center font-quicksand text-sm text-green-800">Thank you. We have your message and will be in touch shortly.</p>}
          {error && <p className="bg-red-50 p-3 text-center font-quicksand text-sm text-red-800">Please enter your name and a valid email address.</p>}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="First Name" className={field} />
            <input name="email" type="email" required placeholder="Email Address" className={field} />
          </div>
          <input name="service" placeholder="Subject" className={field} />
          <textarea name="message" rows={5} placeholder="Message" className={field} />
          <button type="submit" className="w-full bg-[#d4b09a] py-3.5 font-montserrat text-[9px] font-bold uppercase tracking-[.25em] text-white transition hover:bg-[#c49d86]">
            Send message
          </button>
        </form>
      </section>

      <section className="bg-mist py-10">
        <div className="mx-auto grid max-w-[900px] gap-8 px-5 text-center font-quicksand text-sm text-[#555] sm:grid-cols-3">
          <div><div className="font-semibold uppercase tracking-wide text-[#222]">Address</div><p className="mt-1">{s.address}</p></div>
          <div><div className="font-semibold uppercase tracking-wide text-[#222]">Email</div><p className="mt-1"><a href={`mailto:${s.email}`}>{s.email}</a></p></div>
          <div><div className="font-semibold uppercase tracking-wide text-[#222]">Phone</div><p className="mt-1"><a href={`tel:${phone}`}>{phone}</a></p></div>
        </div>
        <div className="mt-8 text-center">
          <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#161616] px-7 py-3.5 font-playfair text-[13px] text-white hover:bg-black">
            Get Directions <MapIcon />
          </a>
        </div>
      </section>

      {mapSrc && <iframe title="Our location" src={mapSrc} loading="lazy" className="block h-[420px] w-full border-0 sm:h-[480px]" referrerPolicy="no-referrer-when-downgrade" />}
    </>
  );
}
