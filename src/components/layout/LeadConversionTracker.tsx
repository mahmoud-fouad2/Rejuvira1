"use client";

import { useEffect } from "react";

import {
  trackContactLinkConversion,
  trackLeadConversion,
} from "@/lib/lead-conversion-tracking";

function readParam(url: URL, ...keys: string[]) {
  for (const key of keys) {
    const value = url.searchParams.get(key);
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

export function LeadConversionTracker() {
  useEffect(() => {
    const handleContactClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.href;
      const normalizedHref = href.toLowerCase();
      const link = {
        href,
        text: anchor.textContent?.trim(),
      };

      if (normalizedHref.startsWith("tel:")) {
        trackContactLinkConversion("phone", link);
        return;
      }

      if (
        normalizedHref.includes("wa.me/") ||
        normalizedHref.includes("api.whatsapp.com/") ||
        normalizedHref.includes("whatsapp.com/")
      ) {
        trackContactLinkConversion("whatsapp", link);
      }
    };

    document.addEventListener("click", handleContactClick, true);

    const url = new URL(window.location.href);
    if (url.searchParams.get("lead") === "success") {
      const eventKey = `rejuvera:lead-submit:${url.pathname}:${url.search}`;
      if (window.sessionStorage.getItem(eventKey) !== "1") {
        window.sessionStorage.setItem(eventKey, "1");

        trackLeadConversion({
          formType: "redirect_form",
          source: readParam(url, "source") ?? "Lead form redirect",
          serviceSlug: readParam(url, "serviceSlug", "service"),
          serviceName: readParam(url, "serviceName", "serviceLabel"),
          preferredLanguage: readParam(url, "lang", "preferredLanguage"),
          utmSource: readParam(url, "utm_source", "utmSource"),
          utmMedium: readParam(url, "utm_medium", "utmMedium"),
          utmCampaign: readParam(url, "utm_campaign", "utmCampaign"),
          utmContent: readParam(url, "utm_content", "utmContent"),
          path: url.pathname,
        });
      }
    }

    return () => document.removeEventListener("click", handleContactClick, true);
  }, []);

  return null;
}
