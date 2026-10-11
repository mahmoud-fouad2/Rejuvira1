/** Server-only Meta CAPI. Never expose the access token to the browser. */
import { isIP } from "node:net";

export type MetaLeadPayload = {
  requestId: string;
  eventTime?: number | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  fbc?: string | undefined;
  fbp?: string | undefined;
  trackingDisabled?: boolean | undefined;
};

function cleanCookie(value: string | undefined) {
  return value && /^fb\.\d+\.\d{13}\.[a-zA-Z0-9_-]{1,250}$/.test(value)
    ? value
    : undefined;
}

/** Allowlist technical matching only: no form fields, medical URLs or UTMs. */
export function getMetaRequestSignals(request: Request) {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key !== "_fbc" && key !== "_fbp") continue;
    try {
      cookies.set(key, decodeURIComponent(part.slice(index + 1).trim()));
    } catch {
      // Ignore malformed cookies; never log cookie values.
    }
  }
  let fbc = cleanCookie(cookies.get("_fbc"));
  if (!fbc) {
    for (const candidate of [
      request.headers.get("x-rejuvera-current-url"),
      request.headers.get("referer"),
      request.url,
    ]) {
      if (!candidate) continue;
      try {
        const url = new URL(candidate);
        if (
          url.hostname !== "rejuvera.sa" &&
          url.hostname !== "www.rejuvera.sa"
        )
          continue;
        const clickId = url.searchParams.get("fbclid");
        if (clickId && /^[a-zA-Z0-9_-]{1,250}$/.test(clickId)) {
          fbc = `fb.1.${Date.now()}.${clickId}`;
          break;
        }
      } catch {
        // Do not forward or log the referring URL.
      }
    }
  }
  return {
    fbc,
    fbp: cleanCookie(cookies.get("_fbp")),
    userAgent: request.headers.get("user-agent") ?? undefined,
    trackingDisabled:
      request.headers.get("sec-gpc") === "1" ||
      request.headers.get("dnt") === "1",
  };
}

export function buildMetaLeadEvent(payload: MetaLeadPayload) {
  const userData: Record<string, string> = {};
  if (payload.ip && isIP(payload.ip)) userData.client_ip_address = payload.ip;
  if (payload.userAgent?.trim())
    userData.client_user_agent = payload.userAgent.trim().slice(0, 1000);
  const fbc = cleanCookie(payload.fbc);
  const fbp = cleanCookie(payload.fbp);
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;
  return {
    event_name: "Lead",
    // Must match trackLeadConversion's browser eventID exactly.
    event_id: `rv_lead_${payload.requestId}`,
    event_time: Math.floor((payload.eventTime ?? Date.now()) / 1000),
    action_source: "website",
    event_source_url: "https://rejuvera.sa/",
    user_data: userData,
  };
}

/** A Meta outage must never change the saved lead's successful response. */
export async function sendMetaLeadCapi(
  payload: MetaLeadPayload,
): Promise<boolean> {
  const datasetId = process.env.META_CAPI_DATASET_ID?.trim();
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (
    process.env.META_CAPI_ENABLED !== "1" ||
    !datasetId ||
    !/^\d+$/.test(datasetId) ||
    !token ||
    payload.trackingDisabled ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(payload.requestId)
  )
    return false;

  const event = buildMetaLeadEvent(payload);
  if (
    !event.user_data.fbc &&
    !event.user_data.fbp &&
    !(event.user_data.client_ip_address && event.user_data.client_user_agent)
  )
    return false;
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  try {
    const response = await fetch(
      `https://graph.facebook.com/v26.0/${datasetId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: [event],
          ...(testCode ? { test_event_code: testCode } : {}),
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    const result = (await response.json().catch(() => null)) as {
      events_received?: number;
      error?: unknown;
    } | null;
    if (!response.ok || result?.error || result?.events_received !== 1) {
      // No token, visitor matching data or Graph response bodies in logs.
      console.warn(`[meta-capi] Lead rejected (HTTP ${response.status})`);
      return false;
    }
    console.info("[meta-capi] Lead accepted");
    return true;
  } catch {
    console.warn("[meta-capi] Lead delivery failed or timed out");
    return false;
  }
}
