type P = { className?: string };
const base = "h-4 w-4 shrink-0";

export const MailIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const PhoneIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.100.4 2.300.6 3.600.6.600 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.500c.6 0 1 .4 1 1 0 1.300.2 2.500.6 3.600.1.300 0 .7-.2 1l-2.300 2.200Z" /></svg>
);
export const PinIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.500A2.500 2.500 0 1 1 12 6.500a2.500 2.500 0 0 1 0 5Z" /></svg>
);
export const ClockIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const InfoIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2Zm0-8h-2V7h2Z" /></svg>
);
export const CheckCircleIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.500 14.500L6 12l1.400-1.400 3.100 3.100 6.100-6.100L18 9Z" /></svg>
);
export const ArrowCircleIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.500 14.500-1.400-1.400 3.100-3.100-3.100-3.100 1.400-1.400L15.300 12Z" /></svg>
);
/** Font Awesome "angle-double-right" at the original button's 13px: 11.375 x 13. */
export const DoubleChevron = ({ className = "h-[13px] w-[11.375px]" }: P) => (
  <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.4 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.5-9.2 9.5-24.4.1-33.8z" /></svg>
);
/** Font Awesome "caret-down" at the original menu's 14px: 8.75 x 14. */
export const CaretDown = ({ className = "h-[14px] w-[8.75px]" }: P) => (
  <svg viewBox="0 0 320 512" className={className} fill="currentColor" aria-hidden><path d="M31.3 192h257.4c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" /></svg>
);
export const MapIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" /></svg>
);
