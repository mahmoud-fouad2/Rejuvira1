"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AdminAddModalProps = {
  /** Trigger button label (Arabic). */
  triggerArabic: string;
  /** Trigger button label (English). */
  triggerEnglish: string;
  /** Modal title (Arabic). */
  titleArabic: string;
  /** Modal title (English). */
  titleEnglish: string;
  /** Optional small explainer below the title. */
  subtitleArabic?: string;
  subtitleEnglish?: string;
  /** Modal content (the create form). */
  children: React.ReactNode;
  /** Override trigger className when needed. */
  triggerClassName?: string;
};

/**
 * Generic "Add" button that opens a centered modal containing the supplied
 * form. Locks body scroll, traps Escape, closes on backdrop click, and
 * portals into <body> so it always escapes layout containers.
 */
export function AdminAddModal({
  triggerArabic,
  triggerEnglish,
  titleArabic,
  titleEnglish,
  subtitleArabic,
  subtitleEnglish,
  children,
  triggerClassName,
}: AdminAddModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    // Move focus into the dialog for accessibility.
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? "admin-btn-primary"}
        onClick={() => setOpen(true)}
      >
        <span className="lang-ar">{triggerArabic}</span>
        <span className="lang-en">{triggerEnglish}</span>
      </button>
      {mounted && open
        ? createPortal(
            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="admin-modal__backdrop"
                aria-label="Close"
                tabIndex={-1}
                onClick={() => setOpen(false)}
              />
              <div
                className="admin-modal__panel"
                ref={dialogRef}
                tabIndex={-1}
              >
                <header className="admin-modal__header">
                  <div>
                    <h2 id={titleId} className="admin-modal__title">
                      <span className="lang-ar">{titleArabic}</span>
                      <span className="lang-en">{titleEnglish}</span>
                    </h2>
                    {(subtitleArabic || subtitleEnglish) && (
                      <p className="admin-modal__subtitle">
                        {subtitleArabic ? (
                          <span className="lang-ar">{subtitleArabic}</span>
                        ) : null}
                        {subtitleEnglish ? (
                          <span className="lang-en">{subtitleEnglish}</span>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="admin-modal__close"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </header>
                <div className="admin-modal__body">{children}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
