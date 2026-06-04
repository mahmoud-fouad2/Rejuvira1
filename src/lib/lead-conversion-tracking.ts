"use client";

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type LeadConversionPayload = {
  formType?: string | undefined;
  source?: string | undefined;
  serviceSlug?: string | undefined;
  serviceName?: string | undefined;
  preferredLanguage?: string | undefined;
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
  path?: string | undefined;
};

function cleanPayload(payload: LeadConversionPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    ),
  );
}

function cleanEventParams(payload: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    ),
  );
}

export function trackLeadConversion(payload: LeadConversionPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const safePayload = {
    ...cleanPayload(payload),
    pagePath: payload.path ?? window.location.pathname,
    pageUrl: window.location.href,
  };

  const ga4Payload = cleanEventParams({
    form_type: payload.formType,
    lead_source: payload.source,
    service_slug: payload.serviceSlug,
    service_name: payload.serviceName,
    preferred_language: payload.preferredLanguage,
    utm_source: payload.utmSource,
    utm_medium: payload.utmMedium,
    utm_campaign: payload.utmCampaign,
    utm_content: payload.utmContent,
    page_path: safePayload.pagePath,
    page_location: safePayload.pageUrl,
  });

  window.dataLayer.push({
    event: "lead_submit",
    ...safePayload,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", "lead_submit", ga4Payload);
  }

  window.dataLayer.push({
    event: "form_success",
    ...safePayload,
  });
}

export function leadPayloadFromForm(
  form: HTMLFormElement,
  formType: string,
): LeadConversionPayload {
  const formData = new FormData(form);
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return undefined;
  };

  return {
    formType,
    source: get("source"),
    serviceSlug: get("serviceSlug", "service"),
    serviceName: get("serviceName", "serviceLabel", "serviceTypeAr"),
    preferredLanguage: get("preferredLanguage"),
    utmSource: get("utmSource", "utm_source"),
    utmMedium: get("utmMedium", "utm_medium"),
    utmCampaign: get("utmCampaign", "utm_campaign"),
    utmContent: get("utmContent", "utm_content"),
  };
}
