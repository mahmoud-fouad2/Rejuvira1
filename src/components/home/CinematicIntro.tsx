"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type CinematicIntroProps = {
  logoSrc: string;
  logoAlt: string;
  /** Kept for backwards compatibility — not rendered. */
  brandName?: string;
  /** Kept for backwards compatibility — not rendered. */
  skinTextureSrc?: string;
};

const PHRASES_AR = ["اعتني بجمالكِ", "نحن هنا لخدمتكِ"];
const PHRASES_EN = ["Care for your beauty", "We are here for you"];

export function CinematicIntro({ logoSrc, logoAlt }: CinematicIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");

  useEffect(() => {
    setMounted(true);
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const win = window as Window & { __rejuviraIntroPlayed?: boolean };
      if (win.__rejuviraIntroPlayed) return;
      win.__rejuviraIntroPlayed = true;
    } catch {
      /* continue */
    }

    setVisible(true);
    const enterTimer = window.setTimeout(() => setPhase("idle"), 120);
    const exitTimer = window.setTimeout(() => setPhase("exit"), 2600);
    const hideTimer = window.setTimeout(() => setVisible(false), 3300);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      role="presentation"
      data-phase={phase}
      className="rv-intro"
      onClick={() => setPhase("exit")}
    >
      <div className="rv-intro-stage">
        <div className="rv-intro-logo">
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            sizes="(max-width: 768px) 240px, 320px"
            priority
            className="object-contain"
          />
        </div>
        <div className="rv-intro-rule" aria-hidden />
        <div className="rv-intro-words">
          <span className="lang-ar">{PHRASES_AR[0]}</span>
          <span className="lang-en">{PHRASES_EN[0]}</span>
          <span className="rv-intro-dot" aria-hidden>·</span>
          <span className="lang-ar">{PHRASES_AR[1]}</span>
          <span className="lang-en">{PHRASES_EN[1]}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
