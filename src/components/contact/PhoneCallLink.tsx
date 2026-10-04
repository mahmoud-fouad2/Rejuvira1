"use client";

import type { ComponentPropsWithoutRef } from "react";

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
  const handleClick = () => {
    const reportConversion = window.gtag_report_phone_conversion;
    if (typeof reportConversion !== "function") return;
    reportConversion(href);
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
