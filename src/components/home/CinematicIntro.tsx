"use client";

import { useEffect, useState } from "react";
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
  skinTextureSrc,
}: CinematicIntroProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");

  const closeIntro = () => {
    setPhase("exit");
    window.setTimeout(() => setVisible(false), 520);
  };

  useEffect(() => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const win = window as Window & { __rejuviraIntroPlayed?: boolean };
      if (win.__rejuviraIntroPlayed) return;
      win.__rejuviraIntroPlayed = true;
    } catch {
      /* continue without persistence */
    }

    setVisible(true);
    const t0 = setTimeout(() => setPhase("idle"), 80);
    const t1 = setTimeout(() => setPhase("exit"), 5600);
    const t2 = setTimeout(() => setVisible(false), 6500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      className={`rv-cinematic-intro fixed inset-0 z-[90] flex items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        phase === "enter"
          ? "opacity-0 [--scale:0.98] scale-[var(--scale)]"
          : phase === "exit"
            ? "opacity-0 [--scale:1.04] scale-[var(--scale)] blur-sm"
            : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(126,64,166,0.35), transparent 55%), linear-gradient(145deg, #130a1f 0%, #2b1146 48%, #0d0714 100%)",
      }}
    >
      <button type="button" className="rv-cinematic-skip" onClick={closeIntro}>
        <span className="lang-ar">تخطي</span>
        <span className="lang-en">Skip</span>
      </button>

      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={skinTextureSrc}
          alt=""
          fill
          className="object-cover opacity-[0.16] mix-blend-screen"
          priority
          sizes="100vw"
        />
      </div>

      {/* Subtle light bloom */}
      <div className="absolute top-1/3 left-1/2 h-[44vh] w-[66vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_70%)]" />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        {/* Brand logo */}
        <div className="relative h-32 w-52 overflow-hidden rounded-none shadow-[0_0_90px_rgba(255,255,255,0.2)] sm:h-36 sm:w-60">
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
          <p className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[#fff8f0] sm:text-5xl lg:text-6xl">
            {brandName}
          </p>
          <p className="mt-3 text-[11px] tracking-[0.22em] text-white/68 uppercase">
            <span className="lang-ar">جراحات تجميلية · جلدية · عناية بالبشرة</span>
            <span className="lang-en">Aesthetic Surgery · Dermatology · Skin Care</span>
          </p>
        </div>

        {/* Decorative line */}
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-45" />

        {/* Tagline */}
        <p className="max-w-md text-center text-sm leading-relaxed tracking-wide text-white/70">
          حيث تلتقي الخبرة الطبية مع الجمال الطبيعي
        </p>
      </div>
    </div>
  );
}

