import { JsonLd } from "./JsonLd";

export type FaqItem = { question: string; answer: string };

/** Accordion of questions (native <details>, no JS) plus FAQPage structured data. */
export function Faq({ items, title, className = "" }: { items: FaqItem[]; title?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section className={`mx-auto max-w-[900px] px-5 ${className}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      {title && <h2 className="text-center font-quicksand text-[32px] font-semibold text-[#222] sm:text-[40px]">{title}</h2>}
      <div className={`${title ? "mt-10" : ""} divide-y divide-black/10 border-y border-black/10`}>
        {items.map((f) => (
          <details key={f.question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-quicksand text-[17px] font-semibold text-[#222] hover:text-gold-dark">
              {f.question}
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="pb-5 pr-10 font-quicksand text-[15px] leading-[1.8] text-[#555]">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
