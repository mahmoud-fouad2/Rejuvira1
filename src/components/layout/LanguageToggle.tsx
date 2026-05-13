"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageToggle() {
  const { lang, switchLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="relative flex h-10 items-center gap-0.5 rounded-full border px-1 transition-all duration-300"
      style={{
        borderColor: "rgba(30,13,78,0.15)",
        background: "rgba(30,13,78,0.04)",
      }}
    >
      {/* AR pill */}
      <span
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300"
        style={{
          background:
            lang === "ar"
              ? "linear-gradient(135deg, var(--violet), var(--violet-mid))"
              : "transparent",
          color: lang === "ar" ? "#fff" : "var(--ink-faint)",
          boxShadow:
            lang === "ar" ? "0 2px 8px rgba(30,13,78,0.35)" : "none",
        }}
      >
        AR
      </span>

      {/* EN pill */}
      <span
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300"
        style={{
          background:
            lang === "en"
              ? "linear-gradient(135deg, var(--violet), var(--violet-mid))"
              : "transparent",
          color: lang === "en" ? "#fff" : "var(--ink-faint)",
          boxShadow:
            lang === "en" ? "0 2px 8px rgba(30,13,78,0.35)" : "none",
        }}
      >
        EN
      </span>
    </button>
  );
}
