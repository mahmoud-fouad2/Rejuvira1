"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

/**
 * Before/After Slider — full-width with draggable divider
 * Touch support for mobile. Shows comparison.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "قبل",
  afterLabel = "بعد",
  className = "",
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) updatePosition(e.clientX);
    },
    [dragging, updatePosition]
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    document.body.style.cursor = dragging ? "ew-resize" : "";
    return () => { document.body.style.cursor = ""; };
  }, [dragging]);

  return (
    <div
      ref={containerRef}
      className={`ba-container ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ aspectRatio: "4/5" }}
    >
      {/* After image (shown on right, clipped) */}
      <Image src={afterSrc} alt="After" fill sizes="100vw" className="ba-image" style={{ objectPosition: "center" }} priority />

      {/* Before image (shown on left via clip) */}
      <div className="ba-image" style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, overflow: "hidden" }}>
        <Image src={beforeSrc} alt="Before" fill sizes="100vw" className="ba-image" style={{ objectPosition: "center" }} priority />
      </div>

      {/* Divider line + handle */}
      <div className="ba-divider" style={{ left: `${position}%` }} onPointerDown={onPointerDown}>
        <div className="ba-handle" style={{ left: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple-rich)" strokeWidth="2">
            <path d="M8 3l-6 9 6 9M16 3l6 9-6 9" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
        <span className="lang-ar">{beforeLabel}</span>
        <span className="lang-en">{beforeLabel}</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
        <span className="lang-ar">{afterLabel}</span>
        <span className="lang-en">{afterLabel}</span>
      </div>
    </div>
  );
}
