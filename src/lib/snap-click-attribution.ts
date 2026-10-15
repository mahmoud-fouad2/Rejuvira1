/** Session-only attribution: keep the ad click ID, never the landing page URL. */
export const SNAP_CLICK_COOKIE = "rv_snap_click";

function readCookie(headers: Headers) {
  const value = headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SNAP_CLICK_COOKIE}=`))
    ?.slice(SNAP_CLICK_COOKIE.length + 1);
  return value;
}

export function cleanSnapClickId(value: string | null | undefined) {
  const clean = value?.trim();
  return clean &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      clean,
    )
    ? clean
    : undefined;
}

export function getStoredSnapClickId(headers: Headers) {
  return cleanSnapClickId(readCookie(headers));
}

/** Return a narrowly scoped Set-Cookie only on a real public landing request. */
export function snapClickCookieForRequest(
  request: Request,
): string | undefined {
  const prior = readCookie(request.headers);
  const base = `${SNAP_CLICK_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax`;
  if (
    request.headers.get("sec-gpc") === "1" ||
    request.headers.get("dnt") === "1"
  ) {
    return prior === undefined ? undefined : `${base}; Max-Age=0`;
  }
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    /^\/(?:admin|api|login|patient-login|portal|forbidden|career)(?:\/|$)/.test(
      url.pathname,
    ) ||
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch")
  )
    return;
  const clickId = cleanSnapClickId(url.searchParams.get("ScCid"));
  if (!clickId || clickId === prior) return;
  // No Max-Age/Expires: the attribution lasts for this browser session only.
  return `${SNAP_CLICK_COOKIE}=${clickId}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}
