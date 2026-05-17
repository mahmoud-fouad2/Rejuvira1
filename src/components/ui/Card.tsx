import type { ReactNode } from "react";

type CardProps = {
  variant?: "surface" | "glass" | "glass-strong";
  padding?: "sm" | "md" | "lg";
  hoverEffect?: boolean;
  children: ReactNode;
  className?: string;
};

const variantStyles = {
  surface: "surface-panel",
  glass: "glass-panel",
  "glass-strong": "glass-panel-strong",
};

const paddingStyles = {
  sm: "p-4 lg:p-5",
  md: "p-6 lg:p-8",
  lg: "p-8 lg:p-10",
};

export function Card({
  variant = "surface",
  padding = "md",
  hoverEffect = false,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={` ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverEffect ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]" : ""} ${className} `}
    >
      {children}
    </div>
  );
}
