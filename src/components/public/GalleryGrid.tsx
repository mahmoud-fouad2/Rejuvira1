"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  category: string;
  categoryEn?: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
};

type Props = {
  items: GalleryItem[];
};

const ALL_KEY = "__all__";

export function GalleryGrid({ items }: Props) {
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const [activeCategory, setActiveCategory] = useState<string>(ALL_KEY);

  const visible =
    activeCategory === ALL_KEY
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Filter tabs ───────────────────────────────── */}
      {categories.length > 1 && (
        <div
          className="services-tab-strip"
          role="tablist"
          aria-label="تصفية المعرض"
        >
          <button
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
      )}

      {/* ── Grid ─────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="gallery-grid">
          {visible.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-ink-soft py-16 text-center text-sm">
          <span className="lang-ar">لا توجد نتائج في هذا القسم.</span>
          <span className="lang-en">No results in this category.</span>
        </p>
      )}
    </div>
  );
}

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="gallery-card group">
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">
              <span className="lang-ar">{item.category}</span>
              <span className="lang-en">{item.categoryEn ?? item.category}</span>
            </p>
            <h3 className="text-ink mt-1.5 font-serif text-xl leading-snug tracking-[-0.015em]">
              <span className="lang-ar">{item.title}</span>
              <span className="lang-en">{item.titleEn ?? item.title}</span>
            </h3>
          </div>
          <Link
            href={`/gallery/${item.slug}`}
            className="gallery-card__link-btn"
            aria-label={`مشاهدة نتيجة ${item.title}`}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
        <p className="text-ink-soft mt-2 line-clamp-2 text-sm leading-6">
          <span className="lang-ar">{item.description}</span>
          <span className="lang-en">
            {item.descriptionEn ?? item.description}
          </span>
        </p>
      </div>
    </article>
  );
}
