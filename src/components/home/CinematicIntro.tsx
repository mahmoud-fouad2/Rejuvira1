"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * CinematicIntro — premium full‑viewport brand reveal
 * Shows a polished hero sequence with brand logo + texture overlay,
 * then auto‑collapses so the main hero beneath takes over.
 */
export function CinematicIntro({
  logoSrc,
  logoAlt,
  brandName,
  skinTextureSrc,
  clientImageSrc,
}: {
  logoSrc: string;
  logoAlt: string;
  brandName: string;
  skinTextureSrc: string;
  clientImageSrc: string;
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Sequence: enter → idle → exit → remove */
    const t1 = setTimeout(() => setPhase("idle"), 2400);
    const t2 = setTimeout(() => setPhase("exit"), 4200);
    const t3 = setTimeout(() => setVisible(false), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        phase === "enter"
          ? "opacity-0 [--scale:0.92] scale-[var(--scale)]"
          : phase === "exit"
            ? "opacity-0 [--scale:1.08] scale-[var(--scale)]"
            : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #1a1511 0%, #0f0c0a 100%)",
      }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={skinTextureSrc}
          alt=""
          fill
          className="object-cover opacity-[0.08]"
          priority
          sizes="100vw"
        />
      </div>

      {/* Subtle light bloom */}
      <div className="absolute top-1/3 left-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(179,155,117,0.12),transparent_70%)]" />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-10 px-6">
        {/* Brand logo */}
        <div className="relative h-20 w-20 overflow-hidden rounded-[1.4rem] shadow-[0_0_60px_rgba(179,155,117,0.2)] sm:h-24 sm:w-24">
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            className="object-cover"
            priority
            sizes="96px"
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="font-serif text-4xl font-light tracking-[-0.04em] text-[#f6f1e9] sm:text-5xl lg:text-6xl">
            {brandName}
          </p>
          <p className="mt-3 text-[10px] tracking-[0.42em] text-[#8d7c68] uppercase">
            Dermatology & Medical Aesthetics
          </p>
        </div>

        {/* Decorative line */}
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#b39b75] to-transparent opacity-50" />

        {/* Tagline */}
        <p className="max-w-md text-center text-sm leading-relaxed tracking-wide text-[#aea69b]">
          حيث تلتقي الدقة الطبية مع الجمال الطبيعي
        </p>
      </div>
    </div>
  );
}
