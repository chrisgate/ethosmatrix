import Link from "next/link";
import type { Settings } from "@/lib/content";

/** Dark call-to-action band that leads to the quote page. */
export function CtaBand({ s, service }: { s: Settings; service?: string }) {
  const href = service ? `/quote?service=${encodeURIComponent(service)}` : "/quote";
  return (
    <section className="bg-dark px-5 py-16 text-center text-white sm:py-20">
      <h2 className="mx-auto max-w-[760px] font-cormorant text-[34px] font-semibold leading-tight sm:text-[48px]">
        {s.cta_title || "Let's build something exceptional."}
      </h2>
      {s.cta_text && <p className="mx-auto mt-4 max-w-[620px] font-quicksand text-base font-light leading-relaxed text-white/75">{s.cta_text}</p>}
      <Link href={href} className="btn-gold btn-caps mt-8">{s.cta_button || "Start your project"}</Link>
    </section>
  );
}
