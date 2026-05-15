"use client";

import { useMemo } from "react";
import Image from "next/image";

export type TestimonialItem = {
  quoteAr: string;
  quoteEn: string;
  authorAr: string;
  authorEn: string;
  avatarUrl?: string;
  /** Optional eyebrow line (e.g. service name). */
  meta?: string;
};

type Props = {
  items: readonly TestimonialItem[];
  /** Maximum number of visible cards in the static grid. */
  perRow?: number;
};

/**
 * TestimonialsSplitCarousel — kept as the public API, rendered as a calm static grid.
 */

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[parts.length - 1]?.[0];
    if (a && b) return (a + b).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "—";
}

export function TestimonialsSplitCarousel({ items, perRow = 6 }: Props) {
  const visibleItems = useMemo(() => {
    const list = items.length > 0 ? items : [];
    return list.slice(0, Math.max(1, perRow));
  }, [items, perRow]);

  if (visibleItems.length === 0) return null;

  return (
    <div
      className="rv-split-rail"
      role="region"
      aria-labelledby="split-testimonials-label"
      tabIndex={0}
    >
      <p id="split-testimonials-label" className="sr-only">
        <span className="lang-ar">آراء المراجعين</span>
        <span className="lang-en">Patient testimonials</span>
      </p>
      <ul className="rv-split-grid" aria-hidden={false}>
        {visibleItems.map((t) => (
          <li key={`${t.authorAr}-${t.quoteAr}`} className="rv-split-card">
            <span className="rv-split-card-top">
              <span className="rv-split-card-avatar" aria-hidden>
                {t.avatarUrl ? (
                  <Image
                    src={t.avatarUrl}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <span className="lang-ar">{initialsFromName(t.authorAr)}</span>
                    <span className="lang-en">{initialsFromName(t.authorEn)}</span>
                  </>
                )}
              </span>
              <span className="rv-split-card-quote">”</span>
            </span>
            <span className="rv-split-card-stars" aria-hidden>
              ★★★★★
            </span>
            <p className="rv-split-card-body">
              <span className="lang-ar">{t.quoteAr}</span>
              <span className="lang-en">{t.quoteEn}</span>
            </p>
            <span className="rv-split-card-author">
              <span className="lang-ar">{t.authorAr}</span>
              <span className="lang-en">{t.authorEn}</span>
              {t.meta ? <span aria-hidden> · {t.meta}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
