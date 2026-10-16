"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackContactLinkConversion } from "@/lib/lead-conversion-tracking";

type PhoneCallLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "onClick"
> & {
  href: string;
};

export function PhoneCallLink({ href, ...props }: PhoneCallLinkProps) {
  const handleClick = () => {
    trackContactLinkConversion("phone");
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
