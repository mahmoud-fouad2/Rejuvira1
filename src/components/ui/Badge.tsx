type BadgeProps = {
  variant?: "default" | "gold" | "violet" | "emerald" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
};

const variantStyles = {
  default:
    "bg-ink-strong text-canvas",
  gold:
    "bg-gold-soft text-gold border border-gold-light",
  violet:
    "bg-violet-soft text-violet-mid",
  emerald:
    "bg-emerald/10 text-emerald border border-emerald/20",
  outline:
    "border border-line text-ink-soft",
};

const sizeStyles = {
  sm: "px-2.5 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
