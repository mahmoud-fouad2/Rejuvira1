type IconProps = { className?: string };

const base = "h-full w-full";

/** Shared stroke-icon set for the patient module — replaces raw letter/symbol
 * glyphs ("P", "!", "★"...) that read as placeholder/unfinished UI. */

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUserAlert({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v4" strokeLinecap="round" />
      <circle cx="19" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.2" />
      <path d="M16 2.5v4M8 2.5v4M3 9.5h18" strokeLinecap="round" />
    </svg>
  );
}

export function IconMessage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-4-.9L3 21l1.9-5.5A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="currentColor" stroke="none" aria-hidden>
      <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" />
    </svg>
  );
}

export function IconClockAlert({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInbox({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconKey({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.5 12.5 19 4M17 6l2 2M14 9l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v12m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
