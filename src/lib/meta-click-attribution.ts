export const META_CLICK_COOKIE = "rv_meta_click";

export function metaClickIdFromUrl(url: URL) {
  if (
    url.protocol !== "https:" ||
    (url.hostname !== "rejuvera.sa" && url.hostname !== "www.rejuvera.sa")
  )
    return;
  const clickId = url.searchParams.get("fbclid");
  return clickId && /^[a-zA-Z0-9_-]{1,250}$/.test(clickId)
    ? clickId
    : undefined;
}

export function hasMetaTrackingOptOut(headers: Headers) {
  return headers.get("sec-gpc") === "1" || headers.get("dnt") === "1";
}

export function makeMetaClickCookie(clickId: string) {
  return `fb.1.${Date.now()}.${clickId}`;
}

/** Keep the click timestamp and ID across pages in this browser session. */
export function metaClickCookieForRequest(request: Request, url: URL) {
  const cookies = (request.headers.get("cookie") ?? "").split(/;\s*/);
  const stored = cookies.find((cookie) =>
    cookie.startsWith(`${META_CLICK_COOKIE}=`),
  );
  const attributes = "Path=/; HttpOnly; Secure; SameSite=Lax";
  if (hasMetaTrackingOptOut(request.headers)) {
    return stored === undefined
      ? undefined
      : `${META_CLICK_COOKIE}=; ${attributes}; Max-Age=0`;
  }
  if (
    request.method !== "GET" ||
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch")
  )
    return;
  const clickId = metaClickIdFromUrl(url);
  if (!clickId || stored?.endsWith(`.${clickId}`)) return;
  return `${META_CLICK_COOKIE}=${makeMetaClickCookie(clickId)}; ${attributes}`;
}
