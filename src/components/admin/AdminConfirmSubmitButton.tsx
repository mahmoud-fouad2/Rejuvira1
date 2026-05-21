"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AdminConfirmSubmitButtonProps = {
  children: React.ReactNode;
  titleArabic: string;
  titleEnglish: string;
  messageArabic: string;
  messageEnglish: string;
  confirmArabic?: string;
  confirmEnglish?: string;
  cancelArabic?: string;
  cancelEnglish?: string;
  className?: string;
  disabled?: boolean;
};

export function AdminConfirmSubmitButton({
  children,
  titleArabic,
  titleEnglish,
  messageArabic,
  messageEnglish,
  confirmArabic = "تأكيد",
  confirmEnglish = "Confirm",
  cancelArabic = "إلغاء",
  cancelEnglish = "Cancel",
  className = "admin-btn-danger",
  disabled,
}: AdminConfirmSubmitButtonProps) {
  const submitterRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function submitConfirmedForm() {
    setOpen(false);
    submitterRef.current?.click();
  }

  return (
    <>
      <button
        ref={submitterRef}
        type="submit"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <button
        type="button"
        disabled={disabled}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {mounted && open
        ? createPortal(
            <div className="admin-confirm" role="dialog" aria-modal="true">
              <button
                type="button"
                className="admin-confirm__backdrop"
                aria-label="Close"
                onClick={() => setOpen(false)}
              />
              <div className="admin-confirm__panel">
                <h2>
                  <span className="lang-ar">{titleArabic}</span>
                  <span className="lang-en">{titleEnglish}</span>
                </h2>
                <p>
                  <span className="lang-ar">{messageArabic}</span>
                  <span className="lang-en">{messageEnglish}</span>
                </p>
                <div className="admin-confirm__actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setOpen(false)}
                  >
                    <span className="lang-ar">{cancelArabic}</span>
                    <span className="lang-en">{cancelEnglish}</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={submitConfirmedForm}
                  >
                    <span className="lang-ar">{confirmArabic}</span>
                    <span className="lang-en">{confirmEnglish}</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
