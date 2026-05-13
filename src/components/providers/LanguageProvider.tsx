"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Lang } from "@/lib/translations";

/* ── Context ────────────────────────────────────────────── */
type LanguageCtx = {
  lang: Lang;
  switchLanguage: () => void;
};

const LanguageContext = createContext<LanguageCtx>({
  lang: "ar",
  switchLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ── Helpers ─────────────────────────────────────────────── */
const STORAGE_KEY = "rejuvira-lang";
const TRANSITION_DURATION = 380; // ms — fade out
const SWITCH_DELAY = 420; // ms — moment overlay is fully opaque

function applyLang(lang: Lang) {
  const html = document.documentElement;
  html.dataset.lang = lang;
  html.lang = lang === "ar" ? "ar" : "en";
  html.dir = lang === "ar" ? "rtl" : "ltr";
}

/* ── Provider ────────────────────────────────────────────── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const overlayRef = useRef<HTMLDivElement>(null);
  const switching = useRef(false);

  /* Initialize from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    const initial: Lang = stored === "en" ? "en" : "ar";
    setLang(initial);
    applyLang(initial);
  }, []);

  const switchLanguage = useCallback(async () => {
    if (switching.current) return;
    switching.current = true;

    const overlay = overlayRef.current;
    const newLang: Lang = lang === "ar" ? "en" : "ar";

    /* 1 — Fade overlay IN */
    if (overlay) {
      overlay.classList.add("lang-transitioning");
    }

    /* 2 — Wait for overlay to be fully opaque */
    await new Promise<void>((r) => setTimeout(r, SWITCH_DELAY));

    /* 3 — Switch language */
    setLang(newLang);
    applyLang(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);

    /* 4 — Short pause so React commits before fade-out */
    await new Promise<void>((r) => setTimeout(r, 80));

    /* 5 — Fade overlay OUT */
    if (overlay) {
      overlay.classList.remove("lang-transitioning");
    }

    /* 6 — Re-enable after transition completes */
    await new Promise<void>((r) => setTimeout(r, TRANSITION_DURATION + 100));
    switching.current = false;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage }}>
      {/* Full-page language transition overlay */}
      <div
        id="lang-transition-overlay"
        ref={overlayRef}
        aria-hidden="true"
      />
      {children}
    </LanguageContext.Provider>
  );
}
