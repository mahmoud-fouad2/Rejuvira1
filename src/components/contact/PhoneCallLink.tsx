"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

declare global {
  interface Window {
    gtag_report_phone_conversion?: (url?: string) => boolean;
  }
}

type PhoneCallLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "onClick"
> & {
  href: string;
};

export function PhoneCallLink({ href, ...props }: PhoneCallLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const reportConversion = window.gtag_report_phone_conversion;
    if (typeof reportConversion !== "function") return;

    if (reportConversion(event.currentTarget.href) === false) {
      event.preventDefault();
    }
  };

  return (
    <a
      {...props}
      href={href}
      data-google-ads-phone-cta="true"
      onClick={handleClick}
    />
  );
}
