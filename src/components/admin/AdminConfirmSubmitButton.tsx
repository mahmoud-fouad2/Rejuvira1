"use client";

import { useRef, useState } from "react";

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  function submitClosestForm() {
    const form = buttonRef.current?.closest("form");
    setOpen(false);
    if (form) {
      form.requestSubmit();
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {open ? (
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
                onClick={submitClosestForm}
              >
                <span className="lang-ar">{confirmArabic}</span>
                <span className="lang-en">{confirmEnglish}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
