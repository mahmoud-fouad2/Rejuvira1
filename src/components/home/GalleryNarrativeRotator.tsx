"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { HomeGalleryItem } from "@/lib/content-repository";

export function GalleryNarrativeRotator({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly HomeGalleryItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const activeItem = items[activeIndex];

  if (!activeItem) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
      <article className="surface-panel overflow-hidden rounded-[2.6rem] p-4 shadow-[0_24px_70px_rgba(30,13,78,0.08)]">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[2.1rem]">
          <Image
            src={activeItem.image}
            alt={activeItem.title}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,10,50,0.08),rgba(26,10,50,0.78))]" />
          <div className="absolute inset-x-5 bottom-5 rounded-[1.8rem] border border-white/16 bg-white/10 p-5 backdrop-blur-xl">
            <p
              className="text-[10px] tracking-[0.24em] uppercase"
              style={{ color: "rgba(232,212,176,0.85)" }}
            >
              {eyebrow}
            </p>
            <h3 className="mt-2 font-serif text-3xl leading-[1.08] tracking-[-0.03em] text-white lg:text-4xl">
              {activeItem.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/75 lg:text-base">
              {activeItem.description}
            </p>
          </div>
        </div>
      </article>
      <article className="surface-panel flex flex-col justify-between rounded-[2.6rem] p-8 lg:p-10">
        <div>
          <p className="eyebrow" style={{ color: "var(--violet-mid)" }}>
            {eyebrow}
          </p>
          <h2 className="text-ink mt-4 font-serif text-5xl leading-[1.05] tracking-[-0.04em]">
            {title}
          </h2>
          <p className="text-ink-soft mt-5 max-w-2xl text-base leading-8">
            {description}
          </p>
        </div>
        <div className="mt-8 grid gap-3">
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-[1.7rem] border px-5 py-5 text-right transition-all ${
                  isActive
                    ? "showcase-active-bg"
                    : "border-line bg-surface hover:bg-surface-strong"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-all"
                    style={{
                      background: isActive ? "var(--violet)" : "var(--line)",
                      boxShadow: isActive
                        ? "0 0 8px rgba(30,13,78,0.5)"
                        : "none",
                    }}
                  />
                  <div>
                    <p className="text-ink font-semibold">{item.title}</p>
                    <p className="text-ink-soft mt-2 text-sm leading-7">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/gallery" className="btn-primary">
            <span className="lang-ar">استعرضي المعرض الكامل</span>
            <span className="lang-en">Open the Full Gallery</span>
          </Link>
          <Link href="/contact" className="btn-secondary">
            <span className="lang-ar">اطلبي استشارة مرتبطة بهذه الحالة</span>
            <span className="lang-en">Request a Consultation for This Case</span>
          </Link>
        </div>
      </article>
    </section>
  );
}
