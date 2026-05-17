"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Direction = "ltr" | "rtl";

export type SnapCarouselOptions = {
  /** Auto-rotate interval in ms. 0 disables. */
  autoplayMs?: number;
  /** Whether autoplay should resume after a manual interaction. */
  autoplayResumeAfterMs?: number;
  /** Loop back to the start after reaching the end. */
  loop?: boolean;
  /** Snap behaviour: "start" aligns first edge, "center" centers each slide. */
  snap?: "start" | "center";
  /** Slide-to-slide spacing, only used when computing scroll target. Px. */
  gapPx?: number;
  /** Direction of layout; "rtl" reverses delta logic. */
  direction?: Direction;
};

export type SnapCarousel = {
  ref: React.RefObject<HTMLDivElement | null>;
  index: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
  scrollTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Use to mark slides. Each slide must include `data-snap-slide={index}`. */
  slideProps: (i: number) => {
    "data-snap-slide": number;
    "aria-roledescription": "slide";
    "aria-label": string;
  };
  /** Hook into the viewport: keyboard, hover, visibility. */
  viewportProps: {
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    role: "region";
    "aria-roledescription": "carousel";
    tabIndex: 0;
  };
};

/**
 * useSnapCarousel — minimal embla-style snap carousel hook.
 *
 * - Pure DOM scroll based; uses native scroll-snap CSS in viewport.
 * - Pause-on-hover, pause-on-focus, pause-on-visibility-hidden, prefers-reduced-motion.
 * - Keyboard navigation (Left/Right + Home/End).
 * - Does not move the page; only its own viewport scrolls.
 */
export function useSnapCarousel(
  count: number,
  options: SnapCarouselOptions = {},
): SnapCarousel {
  const {
    autoplayMs = 0,
    autoplayResumeAfterMs = 6500,
    loop = true,
    snap = "center",
    direction = "rtl",
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const interactingRef = useRef(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const pausedUntilRef = useRef(0);

  const scrollToSlide = useCallback(
    (next: number) => {
      const el = ref.current;
      if (!el || count === 0) return;
      const clamped = ((next % count) + count) % count;
      const slide = el.querySelector<HTMLElement>(
        `[data-snap-slide="${clamped}"]`,
      );
      if (!slide) return;
      const vRect = el.getBoundingClientRect();
      const sRect = slide.getBoundingClientRect();
      let delta: number;
      if (snap === "center") {
        delta = sRect.left + sRect.width / 2 - (vRect.left + vRect.width / 2);
      } else {
        delta =
          direction === "rtl"
            ? sRect.right - vRect.right
            : sRect.left - vRect.left;
      }
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
      setIndex(clamped);
    },
    [count, direction, snap],
  );

  const next = useCallback(() => {
    pausedUntilRef.current = Date.now() + autoplayResumeAfterMs;
    if (!loop && index >= count - 1) return;
    scrollToSlide(index + 1);
  }, [autoplayResumeAfterMs, count, index, loop, scrollToSlide]);

  const prev = useCallback(() => {
    pausedUntilRef.current = Date.now() + autoplayResumeAfterMs;
    if (!loop && index <= 0) return;
    scrollToSlide(index - 1);
  }, [autoplayResumeAfterMs, index, loop, scrollToSlide]);

  /* Track active slide via scroll position. */
  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vRect = el.getBoundingClientRect();
        const mid = vRect.left + vRect.width / 2;
        let best = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let i = 0; i < count; i += 1) {
          const slide = el.querySelector<HTMLElement>(
            `[data-snap-slide="${i}"]`,
          );
          if (!slide) continue;
          const s = slide.getBoundingClientRect();
          const c = s.left + s.width / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  /* Pointer interactions on the viewport pause autoplay briefly. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDown = () => {
      interactingRef.current = true;
      pausedUntilRef.current = Date.now() + autoplayResumeAfterMs;
    };
    const onUp = () => {
      interactingRef.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [autoplayResumeAfterMs]);

  /* Autoplay: respects visibility, reduce-motion, hover, focus. */
  useEffect(() => {
    if (!autoplayMs || count <= 1) return;
    if (typeof window === "undefined") return;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let visible = true;
    let inView = true;
    const onVis = () => {
      visible = document.visibilityState !== "hidden";
    };
    document.addEventListener("visibilitychange", onVis);

    let observer: IntersectionObserver | null = null;
    const el = ref.current;
    if (el && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) inView = entry.isIntersecting;
        },
        { threshold: 0.35 },
      );
      observer.observe(el);
    }

    const id = window.setInterval(() => {
      if (!visible || !inView) return;
      if (hoverRef.current || focusRef.current || interactingRef.current)
        return;
      if (Date.now() < pausedUntilRef.current) return;
      scrollToSlide(index + 1);
    }, autoplayMs);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      observer?.disconnect();
    };
  }, [autoplayMs, count, index, scrollToSlide]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (count === 0) return;
      const isRtl = direction === "rtl";
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isRtl) prev();
        else next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRtl) next();
        else prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToSlide(count - 1);
      }
    },
    [count, direction, next, prev, scrollToSlide],
  );

  const slideProps = useCallback(
    (i: number) => ({
      "data-snap-slide": i,
      "aria-roledescription": "slide" as const,
      "aria-label": `${i + 1} / ${count}`,
    }),
    [count],
  );

  const canPrev = loop || index > 0;
  const canNext = loop || index < count - 1;

  const viewportProps = useMemo(
    () => ({
      onKeyDown,
      onPointerEnter: () => {
        hoverRef.current = true;
      },
      onPointerLeave: () => {
        hoverRef.current = false;
      },
      onFocus: () => {
        focusRef.current = true;
      },
      onBlur: () => {
        focusRef.current = false;
      },
      role: "region" as const,
      "aria-roledescription": "carousel" as const,
      tabIndex: 0 as const,
    }),
    [onKeyDown],
  );

  return {
    ref,
    index,
    count,
    canPrev,
    canNext,
    scrollTo: scrollToSlide,
    next,
    prev,
    slideProps,
    viewportProps,
  };
}
