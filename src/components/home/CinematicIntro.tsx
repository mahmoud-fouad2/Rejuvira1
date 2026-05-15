"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type CinematicIntroProps = {
  logoSrc: string;
  logoAlt: string;
  brandName?: string;
  skinTextureSrc?: string;
};

type Phase = "curtain" | "logo" | "words" | "exit";

const TAGLINE_AR = "اعتني بجمالكِ · نحن هنا لخدمتكِ";
const TAGLINE_EN = "Care for your beauty · We are here for you";

export function CinematicIntro({ logoSrc, logoAlt }: CinematicIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("curtain");

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

    const t1 = window.setTimeout(() => setPhase("logo"), 950);
    const t2 = window.setTimeout(() => setPhase("words"), 1800);
    const t3 = window.setTimeout(() => setPhase("exit"), 3700);
    const t4 = window.setTimeout(() => setVisible(false), 4700);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousHtml = document.documentElement.style.overflow;
    const previousBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtml;
      document.body.style.overflow = previousBody;
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  const wordsAr = TAGLINE_AR.split(" ");
  const wordsEn = TAGLINE_EN.split(" ");

  return createPortal(
    <div
      role="presentation"
      data-phase={phase}
      className="rv-intro"
      onClick={() => setPhase("exit")}
    >
      <div className="rv-intro-canvas" aria-hidden>
        <span className="rv-intro-glow rv-intro-glow-a" />
        <span className="rv-intro-glow rv-intro-glow-b" />
        <span className="rv-intro-grain" />
      </div>

      <div className="rv-intro-curtain rv-intro-curtain-left" aria-hidden />
      <div className="rv-intro-curtain rv-intro-curtain-right" aria-hidden />

      <div className="rv-intro-stage">
        <div className="rv-intro-logo">
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            sizes="(max-width: 768px) 280px, 380px"
            priority
            className="object-contain"
          />
        </div>
        <div className="rv-intro-rule" aria-hidden />
        <p className="rv-intro-line lang-ar">
          {wordsAr.map((word, index) => (
            <span
              key={`ar-${index}`}
              className="rv-intro-word"
              style={{ ["--rv-word-delay" as string]: `${index * 110}ms` }}
            >
              {word}
            </span>
          ))}
        </p>
        <p className="rv-intro-line lang-en">
          {wordsEn.map((word, index) => (
            <span
              key={`en-${index}`}
              className="rv-intro-word"
              style={{ ["--rv-word-delay" as string]: `${index * 90}ms` }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>,
    document.body,
  );
}
