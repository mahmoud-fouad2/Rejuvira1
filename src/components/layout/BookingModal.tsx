"use client";

import { useEffect, useId, useState } from "react";

import { ContactForm } from "@/components/forms/ContactForm";
import type { ServiceRecord } from "@/lib/content-repository";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookingModal({
  services,
  recaptchaSiteKey,
  compactLabel = false,
}: {
  services: readonly ServiceRecord[];
  recaptchaSiteKey?: string | undefined;
  compactLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="rv-v0-book" onClick={() => setOpen(true)}>
        <span className="lang-ar">{compactLabel ? "احجزي" : "احجزي موعدك"}</span>
        <span className="lang-en">{compactLabel ? "Book" : "Book Now"}</span>
        <CalendarIcon />
      </button>
      {open ? (
        <div className="rv-booking-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="rv-booking-backdrop"
            aria-label="Close booking form"
            onClick={() => setOpen(false)}
          />
          <div className="rv-booking-card">
            <div className="rv-booking-head">
              <span className="rv-v0-pill">
                <span className="lang-ar">حجز سريع</span>
                <span className="lang-en">Quick booking</span>
              </span>
              <button
                type="button"
                className="rv-booking-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <h2 id={titleId} className="rv-booking-title">
              <span className="lang-ar">اختاري الخدمة واتركي بياناتك، وسيظهر الطلب فوراً داخل CRM.</span>
              <span className="lang-en">Choose a service and your request will appear directly in the CRM.</span>
            </h2>
            <p className="rv-booking-lead">
              <span className="lang-ar">النموذج مختصر للحجز السريع، ويمكن ربطه بالـ Webhook من لوحة التحكم.</span>
              <span className="lang-en">A short booking form connected to CRM and optional webhook delivery.</span>
            </p>
            <ContactForm
              services={services}
              recaptchaSiteKey={recaptchaSiteKey}
              compact
              source="Header booking modal"
              submitLabelAr="إرسال طلب الحجز"
              submitLabelEn="Send booking request"
              formClassName="rv-booking-form"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
