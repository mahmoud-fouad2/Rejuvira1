"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/new/AnimatedCounter";

interface HeroProps {
  settings: any;
  doctorsCount: number;
}

/**
 * Hero Section — Multi-layer architecture:
 * Layer 1: Gradient mesh background with noise
 * Layer 2: Content scrolling normal
 * Layer 3: Floating glass elements
 */
export function HeroSection({ settings }: HeroProps) {
  const { homepage, media, brand } = settings;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative -mt-[calc(4rem+32px)] flex min-h-dvh items-center overflow-hidden lg:-mt-[calc(5rem+48px)]">
      {/* Layer 1: Background — gradient mesh + noise */}
      <div className="absolute inset-0 bg-mesh-purple noise-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse 80% 60% at 20% 50%,oklch(30% 0.18 290 / 0.3),transparent_70%),radial-gradient(ellipse 60% 80% at 80% 30%,oklch(22% 0.12 295 / 0.2),transparent_60%)]" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[60vh] w-[60vh] rounded-full border border-white/5" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[50vh] w-[50vh] rounded-full border border-purple-light/5" />

      {/* Layer 2: Content */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Text side */}
          <div className="max-w-xl lg:pl-6">
            {/* Brand marker */}
            <div
              className="mb-8 flex items-center gap-4"
              style={{ animation: mounted ? `fadeIn 0.6s both` : "none" }}
            >
              <span className="h-px w-14 bg-gold/70" />
              <span className="text-[10px] tracking-[0.4em] text-gold/60 uppercase">
                {brand.siteName}
              </span>
            </div>

            {/* Hero title — font-weight 200 */}
            <h1
              className="hero-home-title text-[var(--text-hero)] leading-[0.88] tracking-[-0.04em] text-cream"
              style={{ animation: mounted ? `fadeUp 0.8s 0.15s var(--ease-out) both` : "none" }}
            >
              <span className="lang-ar">{homepage.heroTitle}</span>
              <span className="lang-en">{homepage.heroTitle}</span>
            </h1>

            {/* Divider */}
            <div
              className="my-10 h-px w-28 bg-gradient-to-r from-gold/80 to-gold/10"
              style={{ animation: mounted ? `fadeIn 0.6s 0.35s both` : "none" }}
            />

            {/* Description */}
            <p
              className="text-balance text-lg leading-9 text-beige/60 lg:text-xl lg:leading-10"
              style={{ animation: mounted ? `fadeUp 0.8s 0.4s var(--ease-out) both` : "none" }}
            >
              <span className="lang-ar">{homepage.heroDescription}</span>
              <span className="lang-en">{homepage.heroDescription}</span>
            </p>

            {/* CTAs — glass style */}
            <div
              className="mt-12 flex flex-wrap gap-5"
              style={{ animation: mounted ? `fadeUp 0.8s 0.55s var(--ease-out) both` : "none" }}
            >
              <Link href="/contact" className="btn-gold group text-base">
                <span className="lang-ar">احجزي استشارتك المجانية</span>
                <span className="lang-en">Book Free Consultation</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-x-1 rtl-flip">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="#gallery" className="btn-glass">
                <span className="lang-ar">شاهدي النتائج</span>
                <span className="lang-en">View Results</span>
              </Link>
            </div>
          </div>

          {/* Image side — with reveal animation */}
          <div
            className="relative"
            style={{ animation: mounted ? `reveal-wipe 1.2s 0.3s var(--ease-out) both` : "none" }}
          >
            <div className="overflow-hidden rounded-[3.5rem] bg-surface/5 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.8rem]">
                <Image src={media.homeHero} alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="scale-110 object-cover transition-all duration-[2.5s] hover:scale-100" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/70 via-purple-deep/5 to-transparent" />

                {/* Glass stat card floating */}
                <div className="absolute bottom-6 right-6">
                  <div className="glass-card flex items-center gap-4 px-5 py-4" style={{ background: "oklch(100% 0 0 / 0.12)" }}>
                    <div>
                      <span className="hero-stat-counter">
                        {mounted && <AnimatedCounter value={30000} suffix="+" />}
                      </span>
                      <p className="text-[10px] tracking-widest text-white/60 uppercase">
                        <span className="lang-ar">عملية ناجحة</span>
                        <span className="lang-en">Successful Procedures</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Label badge */}
                <div className="absolute top-6 right-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 backdrop-blur-lg">
                    <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_16px_rgba(200,151,58,0.5)]" />
                    <span className="text-[9px] tracking-[0.3em] text-white/60 uppercase">
                      <span className="lang-ar">ثقة · دقة · طبيعة</span>
                      <span className="lang-en">Trust · Precision · Nature</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="text-[7px] tracking-[0.5em] text-white/15 uppercase">
          <span className="lang-ar">التمرير</span>
          <span className="lang-en">Scroll</span>
        </span>
        <svg width="1" height="48" className="overflow-visible">
          <line x1="0.5" y1="0" x2="0.5" y2="48" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="0.5" cy="6" r="1.5" fill="rgba(200,151,58,0.5)" className="animate-pulse" />
        </svg>
      </div>
    </section>
  );
}

