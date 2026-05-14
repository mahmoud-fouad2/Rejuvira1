"use client";

import { type ElementType, type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "gold" | "ink" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: ElementType;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<"button">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  gold: "btn-gold",
  ink: "btn-ink",
  ghost: "btn-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  as: Tag = "button",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <Tag
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
}
