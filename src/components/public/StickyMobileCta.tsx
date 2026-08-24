"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StickyMobileCtaProps = {
  titleAr?: string;
  titleEn?: string;
  whatsappNumber?: string;
  bookingHref?: string;
  whatsappMessage?: string;
};

export function StickyMobileCta({
  titleAr,
  titleEn,
  whatsappNumber = "966500000000",
  bookingHref = "/contact",
  whatsappMessage = "مرحباً، أود الاستفسار عن استشارة وخدمات مركز ريجوفيرا.",
}: StickyMobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (250px)
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const normalizedNumber = cleanNumber.startsWith("966")
    ? cleanNumber
    : cleanNumber.startsWith("0")
      ? `966${cleanNumber.slice(1)}`
      : `966${cleanNumber}`;
  const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-300 md:hidden pointer-events-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto mx-auto max-w-md p-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/95 dark:bg-[#180b2a]/95 p-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-purple-950/10 dark:ring-purple-200/10">
          {titleAr ? (
            <div className="min-w-0 flex-1 px-1">
              <p className="truncate text-xs font-semibold text-[#1f1040] dark:text-[#f3ebfc]">
                <span className="lang-ar">{titleAr}</span>
                <span className="lang-en">{titleEn ?? titleAr}</span>
              </p>
              <p className="text-[10px] text-purple-700/80 dark:text-purple-300/80">
                <span className="lang-ar">استشارة متخصصة</span>
                <span className="lang-en">Specialized Consultation</span>
              </p>
            </div>
          ) : null}

          <Link
            href={bookingHref as any}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4a2476] to-[#6d3494] px-4 py-2 text-center text-xs font-bold text-white shadow-md transition-transform active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="lang-ar">احجزي الآن</span>
            <span className="lang-en">Book Now</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-white shadow-md transition-transform active:scale-95 hover:bg-emerald-500"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
