"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  animation?: "fade-in-up" | "fade-in" | "scale-in" | "slide-in-right" | "slide-in-left";
  delay?: number;
  threshold?: number;
  className?: string;
  as?: "div" | "section" | "article" | "span";
};

export function ScrollReveal({
  children,
  animation = "fade-in-up",
  delay = 0,
  threshold = 0.15,
  className = "",
  as: Tag = "div",
}: ScrollRevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible
          ? `${animation} 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms forwards`
          : "none",
      }}
    >
      {children}
    </Tag>
  );
}
