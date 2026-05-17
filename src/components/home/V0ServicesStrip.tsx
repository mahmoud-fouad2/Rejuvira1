"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import type { ServiceRecord } from "@/lib/content-repository";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSnapCarousel } from "@/lib/use-snap-carousel";

type Props = {
  services: readonly ServiceRecord[];
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

function ArrowIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  if (dir === "left") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * V0ServicesStrip — calm snap carousel replacing the marquee; keyboard + dots,
 * paused on hover/focus/hidden-tab, prefers-reduced-motion aware.
 */
export function V0ServicesStrip({
  services,
  eyebrow,
  title,
  description,
}: Props) {
  const { lang } = useLanguage();
  const slides = services;
  const {
    ref,
    index,
    canPrev,
    canNext,
    next,
    prev,
    scrollTo,
    slideProps,
    viewportProps,
  } = useSnapCarousel(slides.length, {
    autoplayMs: 6000,
    autoplayResumeAfterMs: 8000,
    loop: true,
    snap: "start",
    direction: "rtl",
  });

  if (slides.length === 0) return null;

  const prevLabel = lang === "en" ? "Previous services" : "الخدمات السابقة";
  const nextLabel = lang === "en" ? "Next services" : "الخدمات التالية";

  return (
    <section className="rv-strip-section" aria-labelledby="rv-strip-heading">
      {eyebrow || title || description ? (
        <header className="rv-strip-head">
          {eyebrow ? <span className="rv-v0-pill">{eyebrow}</span> : null}
          {title ? <h2 id="rv-strip-heading">{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </header>
      ) : null}

      <div className="rv-strip-shell">
        <button
          type="button"
          className="rv-strip-nav rv-strip-nav-prev focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={prevLabel}
          onClick={prev}
          disabled={!canPrev}
        >
          <ArrowIcon dir={lang === "ar" ? "right" : "left"} />
        </button>

        <div
          ref={ref}
          className="rv-strip-viewport"
          aria-labelledby={title ? "rv-strip-heading" : undefined}
          {...viewportProps}
        >
          <ul className="rv-strip-track">
            {slides.map((service, i) => (
              <li
                key={`${service.id}-${i}`}
                className="rv-strip-slide"
                {...slideProps(i)}
              >
                <Link
                  href={`/services/${service.slug}` as Route}
                  className="rv-strip-card"
                >
                  <span className="rv-strip-image">
                    <Image
                      src={service.coverImageUrl}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 88vw, 320px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="rv-strip-body">
                    <span className="rv-strip-chip">{service.category}</span>
                    <strong>{service.name}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="rv-strip-nav rv-strip-nav-next focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={nextLabel}
          onClick={next}
          disabled={!canNext}
        >
          <ArrowIcon dir={lang === "ar" ? "left" : "right"} />
        </button>
      </div>

      <div
        className="rv-strip-dots"
        role="tablist"
        aria-label={lang === "en" ? "Choose service card" : "اختيار البطاقة"}
      >
        {slides.map((service, i) => (
          <button
            key={`${service.id}-dot`}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? "is-active" : ""}
            aria-label={
              lang === "en" ? `${service.name} card` : `بطاقة ${service.name}`
            }
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
