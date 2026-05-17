"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ShowcaseSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
  meta: string;
};

export function HomeShowcaseDeck({
  slides,
}: {
  slides: readonly ShowcaseSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  if (!activeSlide) {
    return null;
  }

  return (
    <article className="showcase-stage relative overflow-hidden rounded-[2.8rem] p-5 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
        <div className="flex flex-col justify-between gap-8 xl:min-h-[39rem]">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] text-[var(--violet-mid)] uppercase">
              {activeSlide.eyebrow}
            </p>
            <h3 className="text-ink mt-4 max-w-[12ch] font-serif text-4xl leading-[1.02] tracking-[-0.05em] lg:text-5xl">
              {activeSlide.title}
            </h3>
            <p className="text-ink-soft mt-5 max-w-xl text-base leading-8">
              {activeSlide.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={activeSlide.href as Route} className="btn-primary">
              {activeSlide.cta}
            </Link>
            <span className="rounded-full border border-[rgba(30,13,78,0.12)] bg-white/55 px-4 py-2 text-xs font-medium text-[var(--ink-soft)] dark:bg-white/6">
              {activeSlide.meta}
            </span>
          </div>

          <div className="grid gap-3">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`showcase-selector-btn flex items-start justify-between gap-4 rounded-[1.65rem] px-5 py-4 text-right transition-all duration-300 ${
                    isActive ? "showcase-active-bg" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] tracking-[0.26em] text-[var(--ink-faint)] uppercase">
                      {slide.eyebrow}
                    </p>
                    <p className="text-ink mt-2 truncate text-base font-semibold">
                      {slide.title}
                    </p>
                  </div>
                  <span className="font-serif text-lg tracking-[-0.05em] text-[var(--violet-mid)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[25rem] overflow-hidden rounded-[2.2rem] xl:min-h-[39rem]">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            sizes="(max-width: 1280px) 100vw, 52vw"
            className="object-cover transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,16,31,0.08),rgba(21,16,31,0.62))]" />
          <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/16 bg-black/24 p-5 backdrop-blur-xl">
            <p className="text-[9px] tracking-[0.3em] text-[rgba(232,212,176,0.86)] uppercase">
              {activeSlide.eyebrow}
            </p>
            <p className="mt-2 max-w-[22rem] font-serif text-2xl leading-[1.1] tracking-[-0.04em] text-white lg:text-3xl">
              {activeSlide.title}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
