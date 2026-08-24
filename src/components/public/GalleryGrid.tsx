"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { BeforeAfterSlider } from "@/components/ui/new/BeforeAfterSlider";
import type { GalleryRecord } from "@/lib/content-repository";

type Props = {
  items: readonly GalleryRecord[];
};

const ALL_KEY = "__all__";

export function GalleryGrid({ items }: Props) {
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const [activeCategory, setActiveCategory] = useState<string>(ALL_KEY);
  const [activeItem, setActiveItem] = useState<GalleryRecord | null>(null);

  const visible =
    activeCategory === ALL_KEY
      ? items
      : items.filter((i) => i.category === activeCategory);

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeItem]);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Filter tabs ───────────────────────────────── */}
      {categories.length > 1 ? (
        <div
          className="services-tab-strip"
          role="tablist"
          aria-label="تصفية المعرض"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === ALL_KEY}
            className={`services-tab ${activeCategory === ALL_KEY ? "services-tab--active" : ""}`}
            onClick={() => setActiveCategory(ALL_KEY)}
          >
            <span className="lang-ar">الكل</span>
            <span className="lang-en">All</span>
            <span className="services-tab__count">{items.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`services-tab ${activeCategory === cat ? "services-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      {/* ── Grid ─────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="gallery-grid">
          {visible.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onSelect={() => setActiveItem(item)}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink-soft py-16 text-center text-sm">
          <span className="lang-ar">لا توجد نتائج في هذا القسم.</span>
          <span className="lang-en">No results in this category.</span>
        </p>
      )}

      {/* ── Lightbox Modal ────────────────────────────── */}
      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-white/20 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute top-4 end-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              aria-label="إغلاق"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <span className="eyebrow text-xs">
                <span className="lang-ar">{activeItem.category}</span>
                <span className="lang-en">{activeItem.categoryEn ?? activeItem.category}</span>
              </span>
              <h2 className="text-ink mt-1 font-serif text-2xl">
                <span className="lang-ar">{activeItem.title}</span>
                <span className="lang-en">{activeItem.titleEn ?? activeItem.title}</span>
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line">
              <BeforeAfterSlider
                beforeSrc={activeItem.beforeImageUrl}
                afterSrc={activeItem.afterImageUrl}
                beforeLabel="قبل"
                afterLabel="بعد"
                beforeAlt={`${activeItem.title} - قبل`}
                afterAlt={`${activeItem.title} - بعد`}
              />
            </div>

            <p className="text-ink-soft mt-4 text-sm leading-relaxed">
              <span className="lang-ar">{activeItem.description}</span>
              <span className="lang-en">{activeItem.descriptionEn ?? activeItem.description}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Link
                href="/contact"
                className="btn-primary flex-1 sm:flex-initial text-center text-xs py-2.5 px-6"
                onClick={() => setActiveItem(null)}
              >
                <span className="lang-ar">احجزي استشارة مماثلة</span>
                <span className="lang-en">Book similar consultation</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="btn-secondary text-xs py-2.5 px-5"
              >
                <span className="lang-ar">إغلاق المعاينة</span>
                <span className="lang-en">Close</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GalleryCard({
  item,
  onSelect,
}: {
  item: GalleryRecord;
  onSelect: () => void;
}) {
  return (
    <article
      className="gallery-card group cursor-pointer"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`معاينة نتيجة ${item.title}`}
    >
      {/* Before / After images */}
      <div className="gallery-card__images">
        <div className="gallery-card__image-wrap">
          <Image
            src={item.beforeImageUrl}
            alt={`${item.title} — قبل`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="gallery-card__label gallery-card__label--before">
            <span className="lang-ar">قبل</span>
            <span className="lang-en">Before</span>
          </span>
        </div>

        <div className="gallery-card__divider" aria-hidden>
          <span className="gallery-card__divider-icon">⟷</span>
        </div>

        <div className="gallery-card__image-wrap">
          <Image
            src={item.afterImageUrl}
            alt={`${item.title} — بعد`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="gallery-card__label gallery-card__label--after">
            <span className="lang-ar">بعد</span>
            <span className="lang-en">After</span>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="gallery-card__body">
        <div>
          <p className="eyebrow">
            <span className="lang-ar">{item.category}</span>
            <span className="lang-en">{item.categoryEn ?? item.category}</span>
          </p>
          <h3 className="text-ink mt-1.5 font-serif text-xl leading-snug tracking-[-0.015em] group-hover:text-purple-600 transition-colors">
            <span className="lang-ar">{item.title}</span>
            <span className="lang-en">{item.titleEn ?? item.title}</span>
          </h3>
        </div>
        <p className="text-ink-soft mt-2 line-clamp-2 text-sm leading-6">
          <span className="lang-ar">{item.description}</span>
          <span className="lang-en">
            {item.descriptionEn ?? item.description}
          </span>
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300">
          <span>انقري للمعاينة المكبرة</span>
          <span aria-hidden>🔍</span>
        </span>
      </div>
    </article>
  );
}
