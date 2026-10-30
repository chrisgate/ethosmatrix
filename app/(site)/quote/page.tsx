import type { Metadata } from "next";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { PageBanner } from "@/components/PageBanner";
import { getMedia, getSettings, lines } from "@/lib/content";
import { submitQuote } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Schedule an Appointment",
  description: "Share your project brief with Ethos Matrix and book an appointment to discuss design, construction or development.",
};

type SP = { sent?: string; error?: string; service?: string; project?: string };

export default async function QuotePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const banner = await getMedia(s.banner_quote_id);
  const types = lines(s.quote_types);
  const budgets = lines(s.quote_budgets);
  const timelines = lines(s.quote_timelines);
  const wa = (s.whatsapp || "").replace(/\D/g, "");
  const field = "w-full border border-[#e3e3e3] bg-white px-4 py-3 font-quicksand text-[14px] text-[#444] placeholder:text-[#aaa] focus:border-[#c9a98f] focus:outline-none";
  const label = "mb-1.5 block font-quicksand text-[12px] font-semibold uppercase tracking-[.12em] text-[#555]";
  const preselect = types.find((t) => t.toLowerCase() === (sp.service ?? "").toLowerCase()) ?? "";

  return (
    <>
      <PageBanner title="Schedule an Appointment" kicker="Project brief" image={banner?.filename} crumbs={[{ label: "Home", href: "/" }, { label: "Schedule appointment" }]} />

      <section className="bg-white pb-20 pt-6">
        <div className="mx-auto grid max-w-[1140px] gap-12 px-5 lg:grid-cols-[1fr_1.5fr]">
          <aside>
            <h2 className="border-l-2 border-orange pl-4 font-quicksand text-[24px] font-medium text-[#222]">Tell us about your project</h2>
            {s.quote_intro && <p className="mt-5 font-quicksand text-[15px] font-light leading-[1.9] text-[#555]">{s.quote_intro}</p>}

            <ol className="mt-8 space-y-5">
              {[
                ["Send your brief", "Fill in the form with as much detail as you have."],
                ["We get in touch", "We review it and contact you to talk through your needs."],
                ["We meet", "We arrange a meeting to discuss the way forward."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-quicksand text-base font-semibold text-white">{i + 1}</span>
                  <div>
                    <div className="font-quicksand text-[15px] font-semibold text-[#222]">{t}</div>
                    <div className="font-quicksand text-sm font-light text-[#666]">{d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-9 space-y-3 border-t border-black/10 pt-7 font-quicksand text-sm text-[#444]">
              {s.phone && <li className="flex items-center gap-3"><PhoneIcon className="h-4 w-4 text-gold" /><a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a></li>}
              {s.email && <li className="flex items-center gap-3"><MailIcon className="h-4 w-4 text-gold" /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.address && <li className="flex items-start gap-3"><PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{s.address}</li>}
              {s.hours && <li className="flex items-center gap-3"><ClockIcon className="h-4 w-4 text-gold" />{s.hours}</li>}
            </ul>
            {wa && (
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I would like to discuss a project${sp.project ? ` similar to ${sp.project}` : ""}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-quicksand text-sm font-semibold text-white hover:opacity-90"
              >
                Chat on WhatsApp
              </a>
            )}
          </aside>

          <form action={submitQuote} className="space-y-4 bg-[#faf7f3] p-6 sm:p-8">
            {sp.sent && <p className="bg-green-50 p-3 font-quicksand text-sm text-green-800">Thank you. We have your brief and will be in touch shortly.</p>}
            {sp.error === "1" && <p className="bg-red-50 p-3 font-quicksand text-sm text-red-800">Please enter your name and a valid email address.</p>}
            {sp.error === "rate" && <p className="bg-red-50 p-3 font-quicksand text-sm text-red-800">Too many requests. Please try again in a few minutes.</p>}
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <input type="hidden" name="t" value={Date.now()} />
            {sp.project && <input type="hidden" name="project" value={sp.project} />}
            {sp.project && <p className="bg-white p-3 font-quicksand text-sm text-[#555]">Enquiring about a project similar to <b>{sp.project}</b>.</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label} htmlFor="q-name">Name *</label><input id="q-name" name="name" required className={field} /></div>
              <div><label className={label} htmlFor="q-email">Email *</label><input id="q-email" name="email" type="email" required className={field} /></div>
              <div><label className={label} htmlFor="q-phone">Phone</label><input id="q-phone" name="phone" className={field} /></div>
              <div>
                <label className={label} htmlFor="q-type">Project type</label>
                <select id="q-type" name="project_type" defaultValue={preselect} className={field}>
                  <option value="">Select…</option>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={label} htmlFor="q-loc">Project location</label><input id="q-loc" name="location" placeholder="e.g. Lekki, Lagos" className={field} /></div>
              {budgets.length > 0 && (
                <div>
                  <label className={label} htmlFor="q-budget">Budget range</label>
                  <select id="q-budget" name="budget" defaultValue="" className={field}>
                    <option value="">Select…</option>
                    {budgets.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {timelines.length > 0 && (
                <div>
                  <label className={label} htmlFor="q-time">Timeline</label>
                  <select id="q-time" name="timeline" defaultValue="" className={field}>
                    <option value="">Select…</option>
                    {timelines.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div><label className={label} htmlFor="q-date">Preferred meeting date</label><input id="q-date" name="preferred_date" type="date" className={field} /></div>
            </div>
            <div>
              <label className={label} htmlFor="q-msg">About your project</label>
              <textarea id="q-msg" name="message" rows={6} placeholder="Tell us what you have in mind: size, style, site, anything that helps." className={field} />
            </div>
            <button type="submit" className="btn-gold btn-caps w-full">Send my brief</button>
          </form>
        </div>
      </section>
    </>
  );
}
