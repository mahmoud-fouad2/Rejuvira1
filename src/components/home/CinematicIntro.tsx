"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/**
 * CinematicIntro — premium full‑viewport brand reveal
 * Shows a polished hero sequence with brand logo + texture overlay,
 * then auto‑collapses so the main hero beneath takes over.
 */
type CinematicIntroProps = {
  logoSrc: string;
  logoAlt: string;
  brandName: string;
  skinTextureSrc: string;
  /** Reserved for future intro sequences */
  clientImageSrc?: string;
};

export function CinematicIntro({
  logoSrc,
  logoAlt,
  brandName,
}: CinematicIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "exit">("idle");

  const closeIntro = () => {
    setPhase("exit");
    window.setTimeout(() => setVisible(false), 520);
  };

  useEffect(() => {
    setMounted(true);
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const win = window as Window & { __rejuviraIntroPlayed?: boolean };
      if (win.__rejuviraIntroPlayed) return;
      win.__rejuviraIntroPlayed = true;
    } catch {
      /* continue without persistence */
    }

    setVisible(true);
    const t1 = setTimeout(() => setPhase("exit"), 5200);
    const t2 = setTimeout(() => setVisible(false), 5900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      role="presentation"
      className={`rv-cinematic-intro fixed inset-0 z-[2147483000] flex items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        phase === "exit"
            ? "opacity-0 [--scale:1.04] scale-[var(--scale)] blur-sm"
            : "opacity-100 scale-100"
      }`}
    >
      <button type="button" className="rv-cinematic-skip" onClick={closeIntro}>
        <span className="lang-ar">تخطي</span>
        <span className="lang-en">Skip</span>
      </button>

      {/* Subtle light bloom */}
      <div className="absolute top-1/2 left-1/2 h-[46vh] w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72),transparent_68%)]" />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        {/* Brand logo */}
        <div className="relative h-48 w-80 overflow-visible rounded-none bg-transparent sm:h-56 sm:w-96">
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            className="object-contain"
            priority
            sizes="208px"
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="font-serif text-3xl font-semibold tracking-[-0.04em] text-[#4a2476] sm:text-4xl lg:text-5xl">
            {brandName}
          </p>
          <p className="mt-3 text-[11px] tracking-[0.22em] text-[#4a2476]/68 uppercase">
            <span className="lang-ar">جراحات تجميلية · جلدية · عناية بالبشرة</span>
            <span className="lang-en">Aesthetic Surgery · Dermatology · Skin Care</span>
          </p>
        </div>

        {/* Decorative line */}
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#4a2476] to-transparent opacity-30" />

        {/* Tagline */}
        <p className="max-w-md text-center text-sm leading-relaxed tracking-wide text-[#4a2476]/72">
          حيث تلتقي الخبرة الطبية مع الجمال الطبيعي
        </p>
      </div>
    </div>,
    document.body,
  );
}

