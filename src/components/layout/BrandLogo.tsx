"use client";

import Image, { type ImageProps } from "next/image";

type BrandLogoProps = {
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  /** When true, use the larger "wordmark" sizing (header). */
  variant?: "header" | "footer";
  sizes?: string;
} & Omit<ImageProps, "src" | "alt" | "width" | "height">;

/**
 * BrandLogo — renders both light and dark logos and toggles via CSS so the
 * server-rendered markup is identical in both themes. The actual visibility
 * swap is handled by `html[data-theme="dark"]` rules in globals.css.
 */
export function BrandLogo({
  alt,
  width,
  height,
  className,
  priority = false,
  variant = "header",
  sizes,
  ...rest
}: BrandLogoProps) {
  const baseClass = `rv-brand-logo rv-brand-logo-${variant}`;

  return (
    <span className={`${baseClass} ${className ?? ""}`.trim()} aria-hidden={false}>
      <Image
        src="/media/brand/logo-light.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="rv-brand-logo-img rv-brand-logo-light h-full w-full object-contain"
        {...rest}
      />
      <Image
        src="/media/brand/logo-dark.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="rv-brand-logo-img rv-brand-logo-dark h-full w-full object-contain"
        {...rest}
      />
    </span>
  );
}
