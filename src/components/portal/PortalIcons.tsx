type IconProps = { className?: string };

const base = "h-full w-full";

/** Shared stroke-icon set for the patient-facing portal — replaces raw
 * letter glyphs ("R", "M", "D", "F", "I") that read as placeholder UI. */

export function IconSparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="currentColor" stroke="none" aria-hidden>
      <path d="M12 2c.6 3.4 2 5.9 5.4 6.6-3.4.7-4.8 3.2-5.4 6.6-.6-3.4-2-5.9-5.4-6.6C10 7.9 11.4 5.4 12 2Z" />
      <path d="M19 15c.3 1.7 1 2.7 2.6 3-1.6.3-2.3 1.3-2.6 3-.3-1.7-1-2.7-2.6-3 1.6-.3 2.3-1.3 2.6-3Z" opacity=".8" />
    </svg>
  );
}

export function IconMessageDots({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-4-.9L3 21l1.9-5.5A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDocumentText({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCalendarCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.2" />
      <path d="M16 2.5v4M8 2.5v4M3 9.5h18" strokeLinecap="round" />
      <path d="m9 14 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClipboardCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? base} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="m9.5 13 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
