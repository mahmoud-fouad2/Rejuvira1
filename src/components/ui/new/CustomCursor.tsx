"use client";

import { useEffect, useRef } from "react";

/**
 * Custom Cursor — Gold ring + dot, mix-blend-mode: difference
 * "على hover فوق CTA: الـ cursor يكبر ويتحول"
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = 0,
      my = 0;
    let ringX = 0,
      ringY = 0;
    let raf: number;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
    };

    const animate = () => {
      ringX += (mx - ringX) * 0.12;
      ringY += (my - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      raf = requestAnimationFrame(animate);
    };

    const onHoverableEnter = () => {
      ring.style.width = "64px";
      ring.style.height = "64px";
      ring.style.borderColor = "var(--gold)";
      ring.style.background = "oklch(100% 0 0 / 0.08)";
    };
    const onHoverableLeave = () => {
      ring.style.width = "40px";
      ring.style.height = "40px";
      ring.style.borderColor = "var(--gold)";
      ring.style.background = "transparent";
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(animate);

    document.querySelectorAll("a, button, [data-hoverable]").forEach((el) => {
      (el as HTMLElement).addEventListener("pointerenter", onHoverableEnter);
      (el as HTMLElement).addEventListener("pointerleave", onHoverableLeave);
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] hidden lg:block"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--gold)",
          transform: "translate(0, 0)",
          mixBlendMode: "difference",
          transition: "width 0.3s, height 0.3s, background 0.3s",
        }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[99998] hidden rounded-full lg:block"
        style={{
          width: 40,
          height: 40,
          border: "1px solid var(--gold)",
          transform: "translate(0, 0)",
          transition:
            "width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s",
          marginLeft: -20,
          marginTop: -20,
        }}
      />
    </>
  );
}
