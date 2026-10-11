/** Server-only Ads Conversions API; this is not an OpenAI model API key. */
import { isIP } from "node:net";

export type OpenAiLeadPayload = {
  requestId: string;
  eventTime?: number | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  oppref?: string | undefined;
  obref?: string | undefined;
  trackingDisabled?: boolean | undefined;
};

function opaqueId(value: string | undefined) {
  return value && /^[\x21-\x7e]{1,2048}$/.test(value) ? value : undefined;
}

export function getOpenAiRequestSignals(request: Request) {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const index = part.indexOf("=");
    const key = part.slice(0, index).trim();
    if (index < 0 || (key !== "__oppref" && key !== "__obref")) continue;
    try {
      cookies.set(key, decodeURIComponent(part.slice(index + 1).trim()));
    } catch {
      /* Ignore malformed cookies without logging values. */
    }
  }
  let oppref: string | undefined;
  for (const candidate of [
    request.headers.get("x-rejuvera-current-url"),
    request.headers.get("referer"),
    request.url,
  ]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (
        url.hostname === "rejuvera.sa" ||
        url.hostname === "www.rejuvera.sa"
      ) {
        oppref = opaqueId(url.searchParams.get("oppref") ?? undefined);
        if (oppref) break;
      }
    } catch {
      /* Never forward medical page URLs. */
    }
  }
  return {
    oppref: oppref ?? opaqueId(cookies.get("__oppref")),
    obref: opaqueId(cookies.get("__obref")),
    userAgent: request.headers.get("user-agent") ?? undefined,
    trackingDisabled:
      request.headers.get("sec-gpc") === "1" ||
      request.headers.get("dnt") === "1",
  };
}

export function buildOpenAiLeadEvent(payload: OpenAiLeadPayload) {
  const user: Record<string, string> = {};
  if (payload.ip && isIP(payload.ip)) user.ip_address = payload.ip;
  if (payload.userAgent?.trim())
    user.user_agent = payload.userAgent.trim().slice(0, 1000);
  const obref = opaqueId(payload.obref);
  if (obref) user.obref = obref;
  const oppref = opaqueId(payload.oppref);
  return {
    id: `rv_lead_${payload.requestId}`,
    type: "lead_created",
    timestamp_ms: payload.eventTime ?? Date.now(),
    source_url: "https://rejuvera.sa/",
    action_source: "web",
    opt_out: true,
    ...(oppref ? { oppref } : {}),
    user,
    data: { type: "customer_action" },
  };
}

/** Runs after persistence; delivery failure cannot break the form response. */
export async function sendOpenAiLeadCapi(
  payload: OpenAiLeadPayload,
): Promise<boolean> {
  const pixelId = process.env.OPENAI_ADS_PIXEL_ID?.trim();
  const token = process.env.OPENAI_ADS_CAPI_KEY?.trim();
  if (
    process.env.OPENAI_ADS_CAPI_ENABLED !== "1" ||
    !pixelId ||
    !token ||
    payload.trackingDisabled ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(payload.requestId)
  )
    return false;
  try {
    const response = await fetch(
      `https://bzr.openai.com/v1/events?pid=${encodeURIComponent(pixelId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          integration_source: "rejuvera_web",
          events: [buildOpenAiLeadEvent(payload)],
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) {
      console.warn(
        `[openai-ads-capi] Lead request rejected (HTTP ${response.status})`,
      );
      return false;
    }
    console.info("[openai-ads-capi] Lead request accepted");
    return true;
  } catch {
    console.warn("[openai-ads-capi] Lead delivery failed or timed out");
    return false;
  }
}
