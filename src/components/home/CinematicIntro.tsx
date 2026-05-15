"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type CinematicIntroProps = {
  logoSrc: string;
  logoAlt: string;
  brandName?: string;
  skinTextureSrc?: string;
};

type Phase = "loading" | "curtain" | "logo" | "words" | "exit";

const TAGLINE_AR = "اعتني بجمالكِ · نحن هنا لخدمتكِ";
const TAGLINE_EN = "Care for your beauty · We are here for you";

export function CinematicIntro({ logoSrc, logoAlt }: CinematicIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const fontReadyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

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

    if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
      (document as Document & { fonts?: FontFaceSet })
        .fonts!.ready.then(() => {
          fontReadyRef.current = true;
        })
        .catch(() => {
          fontReadyRef.current = true;
        });
    } else {
      fontReadyRef.current = true;
    }

    // Safety fallback: if image fails or stalls, proceed after 2.5s.
    const fallback = window.setTimeout(() => setImageReady(true), 2500);
    timersRef.current.push(fallback);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!visible || !imageReady) return;

    const startSequence = () => {
      const t1 = window.setTimeout(() => setPhase("curtain"), 120);
      const t2 = window.setTimeout(() => setPhase("logo"), 2300);
      const t3 = window.setTimeout(() => setPhase("words"), 3600);
      const t4 = window.setTimeout(() => setPhase("exit"), 5900);
      const t5 = window.setTimeout(() => setVisible(false), 7000);
      timersRef.current.push(t1, t2, t3, t4, t5);
    };

    // Wait for fonts as well so taglines render in the correct face.
    const waitForFonts = () =>
      new Promise<void>((resolve) => {
        if (fontReadyRef.current) {
          resolve();
          return;
        }
        const start = Date.now();
        const interval = window.setInterval(() => {
          if (fontReadyRef.current || Date.now() - start > 1200) {
            window.clearInterval(interval);
            resolve();
          }
        }, 60);
      });

    waitForFonts().then(startSequence);
  }, [visible, imageReady]);

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

  const skip = () => {
    if (phase === "loading") return;
    setPhase("exit");
    const id = window.setTimeout(() => setVisible(false), 1000);
    timersRef.current.push(id);
  };

  return createPortal(
    <div
      role="presentation"
      data-phase={phase}
      className="rv-intro"
      onClick={skip}
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
            unoptimized
            className="object-contain"
            onLoadingComplete={() => setImageReady(true)}
            onError={() => setImageReady(true)}
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
