"use client";

import { useEffect, useState } from "react";

/**
 * Animated Counter — counts from 0 to target when visible
 * Uses Intersection Observer. Duration: 2000ms. Easing: easeOut.
 */
export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 60;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = easeOut(progress);
      const current = Math.round(value * eased * Math.pow(10, decimals)) / Math.pow(10, decimals);
      setCount(current);
      if (progress >= 1) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [visible, value, decimals]);

  return (
    <span ref={setRef as any} className={`counter-digit ${className}`}>
      {count.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
