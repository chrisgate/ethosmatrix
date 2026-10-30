"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  /** Digits only, with country code. */
  number: string;
  title: string;
  message: string;
  prefill: string;
  button: string;
  /** Seconds before the card opens by itself on a visitor's first page view (0 turns that off). */
  delay: number;
};

const SEEN_KEY = "em_wa_seen";

const WhatsAppIcon = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.400A10 10 0 1 0 12 2Zm0 1.800a8.200 8.200 0 1 1-4.200 15.200l-.3-.2-2.900.8.8-2.800-.2-.3A8.200 8.200 0 0 1 12 3.800Zm-3 4.300c-.2 0-.5.100-.7.400-.3.300-1 1-1 2.400s1 2.800 1.200 3c.1.200 2 3.100 4.900 4.300 2.400 1 2.900.8 3.400.7.500-.1 1.700-.7 1.900-1.400.2-.7.200-1.200.2-1.400-.1-.1-.3-.2-.6-.4l-1.800-.9c-.2-.1-.4-.1-.6.100l-.8 1c-.2.200-.3.200-.6.100-1-.5-2-1.100-2.900-2.400-.2-.4 0-.4.200-.6l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4Z" />
  </svg>
);

/**
 * Floating WhatsApp button that opens a small chat card (greeting + "Open chat"), like a live-chat widget.
 * "Open chat" starts a real WhatsApp conversation with a prefilled message that mentions the current page.
 */
export function WhatsAppChat({ number, title, message, prefill, button, delay }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode: fine */ } };

  const show = useCallback(() => {
    setOpen(true);
    setUnread(false);
    setTyping(true); // the greeting "types" for a moment, like a person
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1100);
  }, []);

  const hide = useCallback(() => { setOpen(false); markSeen(); }, []);

  // Open once, by itself, on a visitor's first page view.
  useEffect(() => {
    if (!delay || delay <= 0) return;
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* ignore */ }
    if (seen) return;
    const t = setTimeout(() => { show(); markSeen(); }, delay * 1000);
    return () => clearTimeout(t);
  }, [delay, show]);

  // Esc closes the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide]);

  useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

  const startChat = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const text = `${prefill}\n\n(From: ${window.location.origin}${pathname})`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    hide();
  };

  return (
    <>
      <div
        role="dialog"
        aria-label={title}
        aria-hidden={!open}
        className={`fixed bottom-24 right-4 z-[60] w-[calc(100vw-2rem)] max-w-[360px] origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,.45)] transition duration-300 sm:right-5 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between bg-[#111] px-5 py-4 text-white">
          <span className="font-quicksand text-[20px] font-semibold">{title}</span>
          <button type="button" onClick={hide} aria-label="Close chat" tabIndex={open ? 0 : -1} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl leading-none transition hover:bg-white/30">×</button>
        </div>

        <div className="min-h-[170px] bg-[#ece5dd] p-4">
          <div className="relative max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-[15px] leading-relaxed text-[#333] shadow-sm">
            {typing ? (
              <span className="flex h-6 items-center gap-1" aria-label="Typing">
                {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#999]" style={{ animationDelay: `${i * 150}ms` }} />)}
              </span>
            ) : (
              <p className="gal-zoom whitespace-pre-line">{message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end bg-white px-4 py-3.5">
          <a
            href={`https://wa.me/${number}`}
            onClick={startChat}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3 font-quicksand text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,.9)] transition hover:bg-[#1ebe5a]"
          >
            {button}
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => (open ? hide() : show())}
        aria-label={open ? "Close WhatsApp chat" : "Chat on WhatsApp"}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-[61] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 sm:right-5"
      >
        {!open && <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366]/50 motion-safe:animate-ping" aria-hidden />}
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <WhatsAppIcon />
        )}
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white ring-2 ring-white">1</span>
        )}
      </button>
    </>
  );
}
