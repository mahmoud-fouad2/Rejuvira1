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
const TRANSITION_DURATION = 380;
const SWITCH_DELAY = 420;

function applyLang(lang: Lang) {
  const html = document.documentElement;
  html.dataset.lang = lang;
  html.lang = lang === "ar" ? "ar" : "en";
  html.dir = lang === "ar" ? "rtl" : "ltr";
  try {
    document.cookie = `rejuvira-lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    const m = document.cookie.match(/(?:^|;\s*)rejuvira-lang=(en|ar)\b/);
    if (m?.[1] === "en" || m?.[1] === "ar") return m[1];
  } catch {
    /* ignore */
  }
  const local = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (local === "en" || local === "ar") return local;
  return "ar";
}

/* ── Provider ────────────────────────────────────────────── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const overlayRef = useRef<HTMLDivElement>(null);
  const switching = useRef(false);

  useEffect(() => {
    const initial = readStoredLang();
    setLang(initial);
    applyLang(initial);
    try {
      localStorage.setItem(STORAGE_KEY, initial);
    } catch {
      /* ignore */
    }
  }, []);

  const switchLanguage = useCallback(async () => {
    if (switching.current) return;
    switching.current = true;

    const overlay = overlayRef.current;
    const newLang: Lang = lang === "ar" ? "en" : "ar";
    const html = document.documentElement;
    const motion =
      typeof window.matchMedia === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (overlay && motion) {
      overlay.classList.add("lang-transitioning");
    } else if (motion) {
      html.classList.add("rv-lang-html-shift");
      window.setTimeout(() => html.classList.remove("rv-lang-html-shift"), 420);
    }

    await new Promise<void>((r) => setTimeout(r, motion ? SWITCH_DELAY : 0));

    setLang(newLang);
    applyLang(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      /* ignore */
    }

    await new Promise<void>((r) => setTimeout(r, motion ? 80 : 0));

    if (overlay && motion) {
      overlay.classList.remove("lang-transitioning");
    }

    await new Promise<void>((r) => setTimeout(r, motion ? TRANSITION_DURATION + 40 : 40));
    switching.current = false;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage }}>
      <div id="lang-transition-overlay" ref={overlayRef} aria-hidden="true" />
      {children}
    </LanguageContext.Provider>
  );
}
