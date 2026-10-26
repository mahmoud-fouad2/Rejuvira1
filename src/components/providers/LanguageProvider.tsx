"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import {
  languageNavigationUrl,
  type SeoLanguage,
} from "@/lib/seo-localization";

type LanguageCtx = {
  lang: SeoLanguage;
  hasEnglish: boolean;
  switchLanguage: () => void;
};
const LanguageContext = createContext<LanguageCtx>({
  lang: "ar",
  hasEnglish: true,
  switchLanguage: () => {},
});
export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({
  children,
  initialLang = "ar",
  initialHasEnglish = true,
}: {
  children: React.ReactNode;
  initialLang?: SeoLanguage;
  initialHasEnglish?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<SeoLanguage>(initialLang);
  const [hasEnglish, setHasEnglish] = useState(initialHasEnglish);

  useEffect(() => {
    // Server-rendered medical/custom pages declare their actual content language.
    // This also updates correctly on client navigation and browser Back/Forward.
    const content = document.querySelector<HTMLElement>(
      "main[data-content-language]",
    );
    const available = content
      ? content.dataset.hasEnglish === "true"
      : !pathname.startsWith("/p/") && pathname !== "/journal";
    const selected =
      available && searchParams.get("lang") === "en" ? "en" : "ar";
    setLang(selected);
    setHasEnglish(available);
    const html = document.documentElement;
    html.dataset.lang = selected;
    html.lang = selected;
    html.dir = selected === "ar" ? "rtl" : "ltr";
    // Preferences are retained for compatibility, but never override a URL.
    try {
      localStorage.setItem("rejuvira-lang", selected);
      document.cookie = `rejuvira-lang=${selected}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      /* Storage restrictions must not prevent navigation. */
    }
  }, [pathname, searchParams]);

  const switchLanguage = useCallback(() => {
    if (!hasEnglish && lang === "ar") return;
    router.push(
      languageNavigationUrl(
        window.location.href,
        lang === "ar" ? "en" : "ar",
      ) as Route,
      { scroll: false },
    );
  }, [hasEnglish, lang, router]);

  return (
    <LanguageContext.Provider value={{ lang, hasEnglish, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
