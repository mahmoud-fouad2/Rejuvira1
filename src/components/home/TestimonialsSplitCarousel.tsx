"use client";

import { useMemo } from "react";

export type TestimonialItem = {
  quoteAr: string;
  quoteEn: string;
  authorAr: string;
  authorEn: string;
  /** Optional eyebrow line (e.g. service name). */
  meta?: string;
};

type Props = {
  items: readonly TestimonialItem[];
  /** Number of items per row before duplication for seamless scroll. */
  perRow?: number;
};

/**
 * TestimonialsSplitCarousel — two marquee-style rows drifting opposite directions.
 */
export function TestimonialsSplitCarousel({ items, perRow = 6 }: Props) {
  const { topRow, bottomRow } = useMemo(() => {
    const list = items.length > 0 ? items : [];
    if (list.length === 0) {
      return { topRow: [] as TestimonialItem[], bottomRow: [] as TestimonialItem[] };
    }
    const half = Math.max(1, Math.ceil(list.length / 2));
    const top = list.slice(0, half);
    const bottom = list.slice(half).length > 0 ? list.slice(half) : list.slice().reverse();
    const pad = (arr: TestimonialItem[]) => {
      const out: TestimonialItem[] = [];
      while (out.length < perRow) {
        out.push(...arr);
      }
      return out.slice(0, perRow);
    };
    return { topRow: pad(top), bottomRow: pad(bottom) };
  }, [items, perRow]);

  if (topRow.length === 0) return null;

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
      <ul className="rv-split-rail-row" aria-hidden={false}>
        {[...topRow, ...topRow].map((t, i) => (
          <li key={`top-${i}-${t.authorAr}`} className="rv-split-card">
            <span className="rv-split-card-quote">”</span>
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
      <ul className="rv-split-rail-row is-reverse" aria-hidden>
        {[...bottomRow, ...bottomRow].map((t, i) => (
          <li key={`bot-${i}-${t.authorAr}`} className="rv-split-card">
            <span className="rv-split-card-quote">”</span>
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
