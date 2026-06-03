"use client";

import { useEffect } from "react";

import { trackLeadConversion } from "@/lib/lead-conversion-tracking";

function readParam(url: URL, ...keys: string[]) {
  for (const key of keys) {
    const value = url.searchParams.get(key);
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

export function LeadConversionTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("lead") !== "success") return;

    const eventKey = `rejuvera:lead-submit:${url.pathname}:${url.search}`;
    if (window.sessionStorage.getItem(eventKey) === "1") return;
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
  }, []);

  return null;
}
