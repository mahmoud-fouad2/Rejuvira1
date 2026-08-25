"use client";

import { fireSnapSignUp } from "@/lib/snap-pixel";

type DataLayerEvent = Record<string, unknown> & { event: string };
type MetaPixelFunction = (...args: unknown[]) => void;
type TikTokPixelFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    fbq?: MetaPixelFunction;
    gtag?: (...args: unknown[]) => void;
    ttq?: TikTokPixelFunction;
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
  /** Raw phone number captured from the form (for Snap setUserData + SIGN_UP). */
  phone?: string | undefined;
  /** Raw email captured from the form (for Snap setUserData + SIGN_UP). */
  email?: string | undefined;
  /**
   * Shared deduplication ID sent to both the browser Snap Pixel and the
   * server-side Snap CAPI so Snap can de-duplicate the two signals.
   * Generated server-side and returned in the API response.
   */
  snapDedupId?: string | undefined;
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

function createMetaEventId() {
  const randomPart =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `rv_lead_${Date.now()}_${randomPart}`;
}

function dispatchMetaLead(
  payload: Record<string, string | undefined>,
  eventId: string,
  attempt = 0,
) {
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", cleanEventParams(payload), {
      eventID: eventId,
    });
    return;
  }

  // Runtime integration snippets load after React mounts. Give the configured
  // Meta Pixel a short window to become available without delaying the form UI.
  if (attempt < 12) {
    window.setTimeout(
      () => dispatchMetaLead(payload, eventId, attempt + 1),
      250,
    );
  }
}

/**
 * Fire ttq.track('Lead') via the TikTok Pixel already loaded by the admin's
 * customHeadCode snippet.  Retries up to ~3 s in case the snippet loads
 * slightly after React hydration — matches the same pattern as dispatchMetaLead.
 *
 * Called ONLY from trackLeadConversion(), which itself is called only after a
 * confirmed successful server response, so no duplicate-firing risk exists.
 */
function dispatchTikTokLead(attempt = 0) {
  if (typeof window.ttq === "function") {
    window.ttq("track", "Lead");
    return;
  }
  if (attempt < 12) {
    window.setTimeout(() => dispatchTikTokLead(attempt + 1), 250);
  }
}

export function trackLeadConversion(payload: LeadConversionPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const metaEventId = createMetaEventId();
  const safePayload = {
    ...cleanPayload(payload),
    pagePath: payload.path ?? window.location.pathname,
    pageUrl: window.location.href,
    metaEventId,
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
    meta_event_id: metaEventId,
  });

  window.dataLayer.push({
    event: "lead_submit",
    ...safePayload,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", "lead_submit", ga4Payload);
  }

  dispatchMetaLead(
    {
      content_name:
        payload.serviceName || payload.serviceSlug || "Rejuvera lead form",
      content_category: payload.formType || "lead",
      lead_source: payload.source,
      service_slug: payload.serviceSlug,
      service_name: payload.serviceName,
      utm_source: payload.utmSource,
      utm_medium: payload.utmMedium,
      utm_campaign: payload.utmCampaign,
      utm_content: payload.utmContent,
      page_path: safePayload.pagePath,
      event_source_url: safePayload.pageUrl,
    },
    metaEventId,
  );

  window.dataLayer.push({
    event: "form_success",
    ...safePayload,
  });

  // TikTok Pixel — standard Lead event.
  // Fires exactly once per successful submission; dispatchTikTokLead() retries
  // for up to ~3 s in case the ttq snippet loads after React hydration.
  // PAGE_VIEW (ttq.page()) is handled separately by the existing pixel snippet
  // in the admin customHeadCode — we never touch that here.
  dispatchTikTokLead();

  // Snap Pixel — SIGN_UP with hashed PII and deduplication ID.
  // The dedupId is generated server-side and returned in the API response;
  // it is mirrored to the server-side CAPI call so Snap deduplicates both.
  if (payload.phone && payload.snapDedupId) {
    fireSnapSignUp(payload.phone, payload.email, payload.snapDedupId);
  }
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
    // PII for Snap setUserData — never sent to analytics layers, only to Snap.
    phone: get("phone"),
    email: get("email"),
  };
}
