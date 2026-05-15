"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

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
  buttonClassName = "rv-v0-book",
  labelAr,
  labelEn,
  source = "Header booking modal",
}: {
  services: readonly ServiceRecord[];
  recaptchaSiteKey?: string | undefined;
  compactLabel?: boolean;
  buttonClassName?: string;
  labelAr?: string;
  labelEn?: string;
  source?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
        <span className="lang-ar">{labelAr ?? (compactLabel ? "احجزي" : "احجزي موعدك")}</span>
        <span className="lang-en">{labelEn ?? (compactLabel ? "Book" : "Book Now")}</span>
        {buttonClassName === "rv-v0-book" ? <CalendarIcon /> : null}
      </button>
      {open && mounted ? createPortal(
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
                <span className="lang-ar">حجز موعد</span>
                <span className="lang-en">Appointment booking</span>
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
              <span className="lang-ar">احجزي موعدك بخطوات بسيطة، وسيتواصل معك فريق ريجوفيرا لتأكيد التفاصيل.</span>
              <span className="lang-en">Book in a few simple steps and our team will confirm the details.</span>
            </h2>
            <p className="rv-booking-lead">
              <span className="lang-ar">اكتبي الاسم ورقم الجوال واختاري الخدمة الأقرب لاحتياجك.</span>
              <span className="lang-en">Enter your name, phone number, and the service you are interested in.</span>
            </p>
            <ContactForm
              services={services}
              recaptchaSiteKey={recaptchaSiteKey}
              compact
              source={source}
              submitLabelAr="إرسال طلب الحجز"
              submitLabelEn="Send booking request"
              formClassName="rv-booking-form"
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
