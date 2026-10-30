import Link from "next/link";

/** Inline formatting: **bold** and [label](https://… or /path). Everything else is plain text. */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-bold text-[#222]">{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = link[2];
      return href.startsWith("/")
        ? <Link key={i} href={href} className="text-gold-dark underline underline-offset-2 hover:text-gold">{link[1]}</Link>
        : <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-gold-dark underline underline-offset-2 hover:text-gold">{link[1]}</a>;
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Renders article text written in the admin. Supported: blank-line paragraphs, "## " and "### " headings,
 * "- " bullet lists, "1. " numbered lists, **bold** and [links](https://…).
 */
export function ArticleBody({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="font-quicksand text-[17px] leading-[1.95] text-[#444]">
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) return <h3 key={i} className="mb-3 mt-9 text-[24px] font-bold leading-snug text-[#222] sm:text-[28px]">{block.slice(4)}</h3>;
        if (block.startsWith("## ")) return <h2 key={i} className="mb-4 mt-12 text-[28px] font-bold leading-snug text-[#222] first:mt-0 sm:text-[34px]">{block.slice(3)}</h2>;
        const lines = block.split("\n");
        if (lines.every((l) => /^-\s+/.test(l))) {
          return (
            <ul key={i} className="my-5 list-disc space-y-2 pl-6 marker:text-gold">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^-\s+/, ""))}</li>)}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <ol key={i} className="my-5 list-decimal space-y-2 pl-6 marker:font-bold marker:text-gold">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s+/, ""))}</li>)}
            </ol>
          );
        }
        return <p key={i} className="my-5 whitespace-pre-line first:mt-0">{inline(block)}</p>;
      })}
    </div>
  );
}
