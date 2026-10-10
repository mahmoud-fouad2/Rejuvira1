/** Server-only Snap CAPI v3. Credentials must never be NEXT_PUBLIC variables. */
import { isIP } from "node:net";

export type SnapSignUpPayload = {
  dedupId: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  clickId?: string | undefined;
  cookieId?: string | undefined;
  trackingDisabled?: boolean | undefined;
};

function cleanIdentifier(value: string | undefined) {
  const clean = value?.trim();
  return clean && /^[a-zA-Z0-9_.:-]{1,250}$/.test(clean) ? clean : undefined;
}

/** Read only Snap matching signals; never forward a medical page URL/query. */
export function getSnapRequestSignals(request: Request) {
  let clickId: string | undefined;
  for (const candidate of [
    request.headers.get("x-rejuvera-current-url"),
    request.headers.get("referer"),
    request.url,
  ]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      clickId = cleanIdentifier(url.searchParams.get("ScCid") ?? undefined);
      if (clickId) break;
    } catch {
      /* Ignore malformed URLs without logging their contents. */
    }
  }
  const scid = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("_scid="));
  let cookieId: string | undefined;
  try {
    cookieId = cleanIdentifier(
      scid ? decodeURIComponent(scid.slice(6)) : undefined,
    );
  } catch {
    /* Ignore malformed cookie values. */
  }
  return {
    clickId,
    cookieId,
    userAgent: request.headers.get("user-agent") ?? undefined,
    trackingDisabled:
      request.headers.get("sec-gpc") === "1" ||
      request.headers.get("dnt") === "1",
  };
}

export function buildSnapSignUpEvent(
  payload: SnapSignUpPayload,
  now = Date.now(),
) {
  const userData: Record<string, string> = {};
  if (payload.ip && isIP(payload.ip)) userData.client_ip_address = payload.ip;
  if (payload.userAgent?.trim())
    userData.client_user_agent = payload.userAgent.trim().slice(0, 1000);
  const clickId = cleanIdentifier(payload.clickId);
  const cookieId = cleanIdentifier(payload.cookieId);
  if (clickId) userData.sc_click_id = clickId;
  if (cookieId) userData.sc_cookie1 = cookieId;

  return {
    event_name: "SIGN_UP",
    action_source: "WEB",
    event_time: Math.floor(now / 1000),
    // CAPI v3 requires this at event level, NOT inside custom_data.
    event_id: payload.dedupId,
    event_source_url: "https://rejuvera.sa/",
    user_data: userData,
  };
}

/** Fail open: a tracking outage must never turn a saved lead into a form error. */
export async function sendSnapSignUpCapi(
  payload: SnapSignUpPayload,
): Promise<boolean> {
  const pixelId = process.env.SNAP_PIXEL_ID?.trim();
  const token = process.env.SNAP_CAPI_TOKEN?.trim();
  if (!pixelId || !token || payload.trackingDisabled || !payload.dedupId)
    return false;
  const event = buildSnapSignUpEvent(payload);
  // Snap requires IP + user-agent (or hashed PII). Use technical matching only.
  if (!event.user_data.client_ip_address || !event.user_data.client_user_agent)
    return false;
  const testCode = process.env.SNAP_TEST_EVENT_CODE?.trim();
  const endpoint = new URL(
    `https://tr.snapchat.com/v3/${encodeURIComponent(pixelId)}/events`,
  );
  endpoint.searchParams.set("access_token", token);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          { ...event, ...(testCode ? { test_event_code: testCode } : {}) },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
    const result = (await res.json().catch(() => null)) as {
      status?: string;
    } | null;
    if (!res.ok || result?.status !== "VALID") {
      // Never log the URL/token, response body, or visitor matching data.
      console.warn(`[snap-capi] SIGN_UP rejected (HTTP ${res.status})`);
      return false;
    }
    console.info("[snap-capi] SIGN_UP accepted");
    return true;
  } catch {
    console.warn("[snap-capi] SIGN_UP delivery failed or timed out");
    return false;
  }
}
