"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { ContactForm } from "@/components/forms/ContactForm";
import type { ServiceRecord } from "@/lib/content-repository";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<"closed" | "opening" | "open" | "closing">(
    "closed",
  );
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const startClose = () => {
    setState("closing");
    window.setTimeout(() => {
      setOpen(false);
      setVisible(false);
      setState("closed");
    }, 260);
  };

  const startOpen = () => {
    setOpen(true);
    setVisible(true);
    setState("opening");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setState("open"));
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") startClose();
    };
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <>
      <button type="button" className={buttonClassName} onClick={startOpen}>
        <span className="lang-ar">
          {labelAr ?? (compactLabel ? "احجزي" : "احجزي موعدك")}
        </span>
        <span className="lang-en">
          {labelEn ?? (compactLabel ? "Book" : "Book Now")}
        </span>
        {buttonClassName === "rv-v0-book" ? <CalendarIcon /> : null}
      </button>
      {visible && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="rv-booking-modal"
              data-state={state}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                inset: 0,
                width: "100vw",
                height: "100dvh",
                zIndex: 2147483600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(0.75rem, 3vw, 1.5rem)",
                overflow: "auto",
                overscrollBehavior: "contain",
              }}
            >
              <button
                type="button"
                className="rv-booking-backdrop"
                aria-label="Close booking form"
                onClick={startClose}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  inset: 0,
                  width: "100vw",
                  height: "100dvh",
                  border: 0,
                  cursor: "pointer",
                  background:
                    "radial-gradient(circle at 50% 20%, rgba(128, 70, 168, 0.32), transparent 36%), rgba(12, 7, 19, 0.7)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  zIndex: 0,
                  padding: 0,
                  margin: 0,
                }}
              />
              <div
                className="rv-booking-card"
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "min(100%, 44rem)",
                  maxHeight: "min(88dvh, 46rem)",
                  margin: "auto",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                }}
              >
                <div className="rv-booking-head">
                  <span className="rv-v0-pill">
                    <span className="lang-ar">حجز موعد</span>
                    <span className="lang-en">Appointment booking</span>
                  </span>
                  <button
                    type="button"
                    className="rv-booking-close"
                    onClick={startClose}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <h2 id={titleId} className="rv-booking-title">
                  <span className="lang-ar">
                    احجزي موعدك بخطوات بسيطة، وسيتواصل معك فريق ريجوفيرا لتأكيد
                    التفاصيل.
                  </span>
                  <span className="lang-en">
                    Book in a few simple steps and our team will confirm the
                    details.
                  </span>
                </h2>
                <p className="rv-booking-lead">
                  <span className="lang-ar">
                    اكتبي الاسم ورقم الجوال واختاري الخدمة الأقرب لاحتياجك.
                  </span>
                  <span className="lang-en">
                    Enter your name, phone number, and the service you are
                    interested in.
                  </span>
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
          )
        : null}
    </>
  );
}
