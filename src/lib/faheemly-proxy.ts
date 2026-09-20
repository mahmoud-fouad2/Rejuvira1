import { extractClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const FAHEEMLY_UPSTREAM_ORIGIN = "https://www.faheemly.com";
const FAHEEMLY_ALLOWED_ORIGIN = "https://www.rejuvera.sa";

// Loose on purpose: ~8 proxied calls per page view, and carriers share IPs.
const RATE_LIMIT_PER_MINUTE = 300;
// The widget lets visitors upload 5 MB files; leave room for multipart/base64.
const MAX_REQUEST_BODY_BYTES = 12 * 1024 * 1024;

// Bounds time-to-headers only, so long streamed chat replies aren't cut off.
const DEFAULT_TIMEOUT_MS = 15_000;
const CHAT_TIMEOUT_MS = 90_000;

// Only static widget assets (css/js) are cached; upstream marks config no-store.
const CACHE_TTL_MS = 5 * 60_000;
const CACHE_MAX_ENTRIES = 32;
const CACHE_MAX_BODY_BYTES = 512 * 1024;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

type CachedResponse = {
  contentType: string | null;
  body: ArrayBuffer;
  expiresAt: number;
};

const responseCache = new Map<string, CachedResponse>();

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function responseHeaders(contentType: string | null, cacheStatus?: string) {
  const headers = new Headers(CORS_HEADERS);
  if (contentType) headers.set("content-type", contentType);
  if (cacheStatus) headers.set("x-proxy-cache", cacheStatus);
  return headers;
}

function cacheKeyFor(request: Request, pathname: string, targetUrl: string) {
  if (request.method !== "GET") return null;
  if (!pathname.startsWith("/api/widget/") || !/\.(?:css|js)$/.test(pathname)) {
    return null;
  }

  const language =
    /^\s*([a-z]{2,8})/i
      .exec(request.headers.get("accept-language") ?? "")?.[1]
      ?.toLowerCase() ?? "";
  return `${targetUrl}|${language}`;
}

function readCache(key: string) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return entry;
}

function storeInCache(key: string, entry: CachedResponse) {
  if (responseCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest !== undefined) responseCache.delete(oldest);
  }
  responseCache.set(key, entry);
}

export async function proxyFaheemlyRequest(
  request: Request,
  pathname: string,
) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" },
    });
  }

  if (/(?:^|\/)\.\.(?:\/|$)/.test(pathname)) {
    return jsonResponse(400, { error: "Bad request" });
  }

  const clientIp = extractClientIp(request.headers);
  if (clientIp !== "unknown") {
    const limit = rateLimit({
      key: `faheemly-proxy:${clientIp}`,
      limit: RATE_LIMIT_PER_MINUTE,
      windowSeconds: 60,
    });
    if (!limit.ok) {
      return jsonResponse(
        429,
        { error: "Too many requests" },
        { "Retry-After": String(limit.retryAfter) },
      );
    }
  }

  if (
    Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST_BODY_BYTES
  ) {
    return jsonResponse(413, { error: "Payload too large" });
  }

  const url = new URL(request.url);
  const targetUrl = `${FAHEEMLY_UPSTREAM_ORIGIN}${pathname}${url.search}`;

  const cacheKey = cacheKeyFor(request, pathname, targetUrl);
  const cached = cacheKey ? readCache(cacheKey) : null;
  if (cached) {
    return new Response(cached.body, {
      status: 200,
      headers: responseHeaders(cached.contentType, "HIT"),
    });
  }

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length" ||
      // Never forward the visitor's own rejuvera.sa cookies (which may
      // include an authenticated admin session token) or auth headers to
      // this third-party upstream — the widget backend has no legitimate
      // use for them.
      lower === "cookie" ||
      lower === "authorization"
    ) {
      continue;
    }
    headers.set(key, value);
  }

  headers.set("origin", FAHEEMLY_ALLOWED_ORIGIN);
  headers.set("referer", `${FAHEEMLY_ALLOWED_ORIGIN}/`);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_REQUEST_BODY_BYTES) {
      return jsonResponse(413, { error: "Payload too large" });
    }
    init.body = body;
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    pathname.startsWith("/api/chat") ? CHAT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS,
  );

  try {
    const upstream = await fetch(targetUrl, {
      ...init,
      signal: controller.signal,
    });
    const contentType = upstream.headers.get("content-type");

    if (
      cacheKey &&
      upstream.status === 200 &&
      !upstream.headers.has("set-cookie") &&
      !/no-store|private/i.test(upstream.headers.get("cache-control") ?? "")
    ) {
      const body = await upstream.arrayBuffer();
      if (body.byteLength <= CACHE_MAX_BODY_BYTES) {
        storeInCache(cacheKey, {
          contentType,
          body,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }
      return new Response(body, {
        status: 200,
        headers: responseHeaders(contentType, "MISS"),
      });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders(contentType),
    });
  } catch (err) {
    return jsonResponse(controller.signal.aborted ? 504 : 502, {
      error: "Faheemly proxy failed",
      details: String(err),
    });
  } finally {
    clearTimeout(timer);
  }
}
