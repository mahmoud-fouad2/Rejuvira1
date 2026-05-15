"use client";

import { useEffect, useState } from "react";

/**
 * Testimonial carousel — auto-rotate, touch-friendly, reduced-motion aware.
 */
const testimonials = [
  {
    quoteAr: "كانت تجربتي مع ريفيورا أكثر من رائعة. الفريق الطبي محترف جداً والنتائج فاقت توقعاتي.",
    quoteEn: "My experience was amazing. The team is highly professional, results exceeded expectations.",
    name: "Sarah",
    initial: "S",
    service: "تجديد البشرة",
  },
  {
    quoteAr: "من أول استشارة شعرت بالثقة والاطمئنان. شرحوا لي كل شيء بوضوح قبل أي إجراء.",
    quoteEn: "From the first consultation, I felt confident. They explained everything clearly.",
    name: "Noura",
    initial: "N",
    service: "نحت القوام",
  },
  {
    quoteAr: "أجمل ما في ريفيورا أنهم لا يبالغون في الوعود. يشرحون الواقع ويتحققونه باحترافية.",
    quoteEn: "They don't overpromise. They explain reality and deliver it professionally.",
    name: "Huda",
    initial: "H",
    service: "ليزر كربون",
  },
  {
    quoteAr: "النتائج طبيعية جداً — بالضبط ما كنت أتمناه. أنصح الجميع بتجربة ريفيورا.",
    quoteEn: "The results are so natural — exactly what I wanted. I recommend Rejuvera to everyone.",
    name: "Layan",
    initial: "L",
    service: "فيلر الشفاه",
  },
  {
    quoteAr: "اهتمامهم بالتفاصيل وراحتي أثناء الجلسة شي لا يُصدق. فريق محترف جداً.",
    quoteEn: "Their attention to detail and my comfort during the session was incredible.",
    name: "Maha",
    initial: "M",
    service: "مورفيوس 8",
  },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const goTo = (i: number) => setActive(i);
  const goNext = () => setActive((prev) => (prev + 1) % testimonials.length);
  const goPrev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[active] ?? testimonials[0];

  if (!t) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-[820px]">
      <div className="surface-panel relative overflow-hidden rounded-[2.25rem] px-7 py-9 shadow-[0_28px_80px_oklch(22%_0.06_285/0.08)] sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-4 -top-8 h-32 w-32 rounded-full bg-purple-mid/[0.07] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-gold/[0.06] blur-2xl" />

        <div
          className="relative min-h-[220px]"
          onTouchStart={(e) => {
            const x = e.touches[0]?.clientX;
            if (x != null) setTouchStart(x);
          }}
          onTouchEnd={(e) => {
            const end = e.changedTouches[0]?.clientX;
            if (end == null) return;
            const diff = end - touchStart;
            if (Math.abs(diff) > 50) {
              if (diff > 0) { goPrev(); } else { goNext(); }
            }
          }}
        >
          <span className="font-display-en pointer-events-none absolute -top-2 end-0 text-7xl leading-none text-purple-mid/[0.12] select-none">
            &ldquo;
          </span>
          <div className="relative space-y-6 pt-2">
            <p className="text-balance text-xl leading-10 text-text-secondary lg:text-2xl lg:leading-[2.75rem]">
              <span className="lang-ar">{t.quoteAr}</span>
              <span className="lang-en">{t.quoteEn}</span>
            </p>
            <div className="flex items-center gap-4 border-t border-line/80 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-ghost text-sm font-semibold text-purple-rich ring-1 ring-purple-mid/10">
                {t.initial}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                <p className="text-xs text-text-tertiary">
                  <span className="lang-ar">{t.service}</span>
                  <span className="lang-en">{t.service}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-center gap-2 sm:justify-start">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-500 focus-visible:ring-2 focus-visible:ring-purple-mid/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
                style={{
                  width: i === active ? 36 : 7,
                  background: i === active ? "var(--purple-mid)" : "var(--line-visible)",
                  opacity: i === active ? 1 : 0.45,
                }}
                aria-label={`الشهادة ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={goPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text-secondary transition-colors hover:border-purple-mid/40 hover:bg-purple-ghost focus-visible:ring-2 focus-visible:ring-purple-mid/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              aria-label="السابق"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="rtl-flip">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="font-display-en min-w-[4.5rem] text-center text-sm tracking-widest text-text-tertiary tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text-secondary transition-colors hover:border-purple-mid/40 hover:bg-purple-ghost focus-visible:ring-2 focus-visible:ring-purple-mid/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              aria-label="التالي"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="rtl-flip">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

