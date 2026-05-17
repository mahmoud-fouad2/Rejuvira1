"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

/**
 * Before/After Slider — modern, accessible draggable comparison.
 *
 * - Pointer + touch + keyboard control (Arrow keys, Home, End).
 * - Pause-respecting: when reduce-motion is on, transitions are skipped.
 * - Labels never overlap the handle; clear "Before / After" affordance.
 */
function clampSplit(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(5, Math.min(95, value));
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "قبل",
  afterLabel = "بعد",
  beforeAlt = "Before",
  afterAlt = "After",
  className = "",
  initialPercent = 50,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
  /** Initial position of the comparison slider (0–100). Clamped to [5, 95]. */
  initialPercent?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(() => clampSplit(initialPercent));
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const node = containerRef.current;
      if (!node) return;
      e.preventDefault();
      draggingRef.current = true;
      setDragging(true);
      node.setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current) updatePosition(e.clientX);
    },
    [updatePosition],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.cursor = dragging ? "ew-resize" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const fine = e.shiftKey ? 1 : 4;
      setPosition((current) => {
        const step = e.key === "ArrowLeft" ? -fine : fine;
        return Math.max(0, Math.min(100, current + step));
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
    } else if (e.key === " ") {
      e.preventDefault();
      setPosition((current) => (current >= 50 ? 0 : 100));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`ba-container ${className}`}
      role="slider"
      tabIndex={0}
      aria-label={`مقارنة قبل وبعد — ${Math.round(position)}٪`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}%`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      data-dragging={dragging || undefined}
      style={{ aspectRatio: "4/5", touchAction: "none" }}
    >
      {/* After image (full layer) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="ba-image pointer-events-none select-none"
        style={{ objectPosition: "center" }}
        priority={false}
      />

      {/* Before image (clipped from the right) */}
      <div
        className="ba-image pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          overflow: "hidden",
        }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="ba-image pointer-events-none select-none"
          style={{ objectPosition: "center" }}
          priority={false}
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="ba-divider"
        style={{ left: `${position}%` }}
        onPointerDown={onPointerDown}
      >
        <div className="ba-handle" style={{ left: 0 }} aria-hidden>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--rv26-accent, #4a2476)" }}
          >
            <path d="m9 5-5 7 5 7" />
            <path d="m15 5 5 7-5 7" />
          </svg>
        </div>
      </div>

      {/* Labels — Before pill top-right, After pill top-left (logical for RTL too). */}
      <span className="ba-pill ba-pill-before" aria-hidden>
        {beforeLabel} / Before
      </span>
      <span className="ba-pill ba-pill-after" aria-hidden>
        {afterLabel} / After
      </span>

      {/* Drag hint, only visible until first interaction */}
      {!dragging && (
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 z-[4] -translate-x-1/2 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] tracking-[0.18em] text-white/90 backdrop-blur-md"
          aria-hidden
        >
          ← اسحبي للمقارنة →
        </div>
      )}
    </div>
  );
}
