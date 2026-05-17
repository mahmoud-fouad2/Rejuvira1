"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageToggle() {
  const { lang, switchLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={
        isAr ? "Switch site language to English" : "التبديل إلى العربية"
      }
      className="relative flex h-10 items-center gap-0.5 rounded-full border px-1 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:active:scale-[0.96]"
      style={{
        borderColor: "rgba(30,13,78,0.15)",
        background: "rgba(30,13,78,0.04)",
      }}
    >
      <span
        aria-hidden="true"
        className={`rv-lang-option relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-all motion-safe:duration-300 motion-reduce:duration-150 ${
          isAr ? "motion-safe:-translate-x-px" : ""
        }`}
        style={{
          background:
            isAr === true
              ? "linear-gradient(135deg, var(--violet), var(--violet-mid))"
              : "transparent",
          color: isAr ? "#fff" : "var(--ink-faint)",
          boxShadow: isAr ? "0 2px 8px rgba(30,13,78,0.35)" : "none",
        }}
      >
        AR
      </span>
      {/* EN */}
      <span
        aria-hidden="true"
        className={`rv-lang-option relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-all motion-safe:duration-300 motion-reduce:duration-150 ${
          !isAr ? "motion-safe:translate-x-px" : ""
        }`}
        style={{
          background:
            isAr === false
              ? "linear-gradient(135deg, var(--violet), var(--violet-mid))"
              : "transparent",
          color: isAr === false ? "#fff" : "var(--ink-faint)",
          boxShadow: isAr === false ? "0 2px 8px rgba(30,13,78,0.35)" : "none",
        }}
      >
        EN
      </span>
      <span className="rv-lang-mobile-label" aria-hidden="true">
        {isAr ? "EN" : "AR"}
      </span>
    </button>
  );
}
