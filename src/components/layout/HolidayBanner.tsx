"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function HolidayBanner() {
  const { lang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("mawlid-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("mawlid-banner-dismissed", "true");
  };

  return (
    <div className="relative bg-[var(--rv-primary)] px-4 py-2 sm:px-6 lg:px-8 text-white overflow-hidden isolate">
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M30 5L35.5 24.5L55 30L35.5 35.5L30 55L24.5 35.5L5 30L24.5 24.5L30 5Z\\' fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')",
          backgroundSize: "30px",
        }}
      />
      
      <div className="mx-auto max-w-[var(--max-width)] pe-8 sm:pe-10 flex items-center justify-center gap-x-4 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span>🌙</span>
          <span className="lang-ar text-center leading-tight">
            نهنئكم بحلول ذكرى المولد النبوي الشريف، كل عام وأنتم بخير
          </span>
          <span className="lang-en text-center leading-tight">
            Wishing you a blessed Mawlid al-Nabi. Happy holidays!
          </span>
          <span>✨</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-1/2 -translate-y-1/2 end-2 p-1.5 rounded-md hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={lang === "en" ? "Dismiss" : "إغلاق"}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
