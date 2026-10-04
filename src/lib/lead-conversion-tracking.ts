"use client";

import { fireSnapSignUp } from "@/lib/snap-pixel";
import { claimConversionId } from "@/lib/conversion-dedupe";
import {
  buildContactClickDataLayerEvent,
  buildLeadDataLayerEvent,
} from "@/lib/lead-analytics";

type DataLayerEvent = Record<string, unknown> & { event: string };
type MetaPixelFunction = (...args: unknown[]) => void;
type TikTokPixelFunction = (...args: unknown[]) => void;

const GOOGLE_ADS_CONVERSIONS = {
  leadSubmit: "AW-16511038360/FNSTCK7k4uocEJjnicE9",
  phoneClick: "AW-16511038360/VzZpCLHk4uocEJjnicE9",
  whatsappClick: "AW-16511038360/qfJzCKvk4uocEJjnicE9",
} as const;

type GoogleAdsConversion = keyof typeof GOOGLE_ADS_CONVERSIONS;
const claimedLeadConversions = new Set<string>();

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    fbq?: MetaPixelFunction;
    gtag?: (...args: unknown[]) => void;
    ttq?: TikTokPixelFunction;
  }
}

export type LeadConversionPayload = {
  /** Stable, non-PII ID returned only after the lead is saved by the server. */
  requestId?: string | undefined;
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

function dispatchGoogleAdsConversion(
  conversion: GoogleAdsConversion,
  params: {
    transactionId?: string | undefined;
    pageLocation?: string | undefined;
  } = {},
  attempt = 0,
) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_CONVERSIONS[conversion],
      value: 1,
      currency: "SAR",
      ...(params.transactionId ? { transaction_id: params.transactionId } : {}),
      ...(params.pageLocation ? { page_location: params.pageLocation } : {}),
    });
    return;
  }

  // The Google tag is loaded after hydration. Retry briefly so a successful
  // lead or a fast contact-link click is not lost during initial page load.
  if (attempt < 20) {
    window.setTimeout(
      () => dispatchGoogleAdsConversion(conversion, params, attempt + 1),
      250,
    );
  }
}

export function trackContactLinkConversion(kind: "phone" | "whatsapp") {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];

  const eventId = createMetaEventId().replace("rv_lead_", `rv_${kind}_`);
  window.dataLayer.push(buildContactClickDataLayerEvent(kind, eventId));
  dispatchGoogleAdsConversion(
    kind === "phone" ? "phoneClick" : "whatsappClick",
    { transactionId: eventId },
  );
}

export function trackLeadConversion(payload: LeadConversionPayload = {}) {
  if (typeof window === "undefined") return false;
  const requestId = payload.requestId?.trim();
  if (!requestId) return false;
  let storage: Storage | undefined;
  try {
    storage = window.sessionStorage;
  } catch {
    storage = undefined;
  }
  if (!claimConversionId(requestId, claimedLeadConversions, storage)) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  const metaEventId = `rv_lead_${requestId}`;
  const pageUrl = window.location.href;

  // GTM receives exactly one generic event. Patient details and service names
  // intentionally stay out of the public analytics layer.
  window.dataLayer.push(buildLeadDataLayerEvent(requestId, payload.formType));

  dispatchGoogleAdsConversion("leadSubmit", {
    transactionId: requestId,
  });

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
      page_path: payload.path ?? window.location.pathname,
      event_source_url: pageUrl,
    },
    metaEventId,
  );

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

  return true;
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
