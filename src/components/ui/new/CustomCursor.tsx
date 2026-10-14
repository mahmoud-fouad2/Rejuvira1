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
    // The decorations are hidden on touch/mobile: don't animate hidden nodes.
    if (
      !window.matchMedia(
        "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
      ).matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let mx = 0,
      my = 0;
    let ringX = 0,
      ringY = 0;
    let raf: number | null = null;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
      if (raf === null) raf = requestAnimationFrame(animate);
    };

    const animate = () => {
      ringX += (mx - ringX) * 0.12;
      ringY += (my - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      raf =
        Math.abs(mx - ringX) + Math.abs(my - ringY) > 0.2
          ? requestAnimationFrame(animate)
          : null;
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

    const hoverables = document.querySelectorAll("a, button, [data-hoverable]");
    hoverables.forEach((el) => {
      (el as HTMLElement).addEventListener("pointerenter", onHoverableEnter);
      (el as HTMLElement).addEventListener("pointerleave", onHoverableLeave);
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf !== null) cancelAnimationFrame(raf);
      hoverables.forEach((el) => {
        el.removeEventListener("pointerenter", onHoverableEnter);
        el.removeEventListener("pointerleave", onHoverableLeave);
      });
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
