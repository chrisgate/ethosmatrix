"use client";

import { useEffect, useState } from "react";

/** "Share this" links for an article, plus copy-link. The address is read in the browser so it is always correct. */
export function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href), []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: [string, string][] = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["X", `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: nothing to do */ }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-y border-black/10 py-5">
      <span className="mr-2 font-montserrat text-[11px] font-bold uppercase tracking-[.18em] text-[#222]">Share this</span>
      {links.map(([label, href]) => (
        <a key={label} href={url ? href : "#"} target="_blank" rel="noopener noreferrer" className="rounded-full border border-black/15 px-4 py-1.5 font-quicksand text-[13px] font-semibold text-[#444] transition hover:border-gold hover:text-gold-dark">
          {label}
        </a>
      ))}
      <button type="button" onClick={copy} className="rounded-full bg-[#161616] px-4 py-1.5 font-quicksand text-[13px] font-semibold text-white transition hover:bg-gold">
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
