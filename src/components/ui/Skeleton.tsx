"use client";

type SkeletonProps = {
  variant?: "text" | "circle" | "rect" | "card";
  width?: string;
  height?: string;
  className?: string;
  count?: number;
};

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-ink-strong/5 animate-pulse rounded-[1rem] ${className}`}
          style={{
            width: width ?? (variant === "circle" ? "3rem" : "100%"),
            height:
              height ??
              (variant === "text"
                ? "1rem"
                : variant === "circle"
                  ? "3rem"
                  : variant === "card"
                    ? "12rem"
                    : "6rem"),
            borderRadius:
              variant === "circle"
                ? "9999px"
                : variant === "rect"
                  ? "1rem"
                  : undefined,
          }}
        />
      ))}
    </>
  );
}
