import { NextResponse } from "next/server";

const UPSTREAM_ORIGIN = "https://dralsalmi.com";
const UPSTREAM_PREFIX = "/career";
const LOCAL_PREFIX = "/career";
const UPSTREAM_HOST = "dralsalmi.com";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const REQUEST_HEADERS_TO_FORWARD = [
  "accept",
  "accept-language",
  "content-type",
  "user-agent",
  "x-requested-with",
] as const;

export const careerProxyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "frame-src 'self'",
  "media-src 'self' https: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}

function getRequestOrigin(request: Request, fallbackUrl: URL) {
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    firstHeaderValue(request.headers.get("host")) ||
    fallbackUrl.host;
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
    fallbackUrl.protocol.replace(/:$/, "") ||
    "https";
  return `${proto}://${host}`;
}

function upstreamUrlFor(request: Request) {
  const url = new URL(request.url);
  const suffix = url.pathname.slice(LOCAL_PREFIX.length);
  const upstream = new URL(`${UPSTREAM_PREFIX}${suffix || "/"}`, UPSTREAM_ORIGIN);
  upstream.search = url.search;
  return upstream;
}

function rewriteOutboundLocation(value: string, request: Request) {
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  if (value.startsWith(`${UPSTREAM_ORIGIN}${UPSTREAM_PREFIX}`)) {
    return `${requestOrigin}${value.slice(UPSTREAM_ORIGIN.length)}`;
  }
  if (value.startsWith(UPSTREAM_PREFIX)) {
    return `${requestOrigin}${value}`;
  }
  if (value.startsWith(`${UPSTREAM_ORIGIN}/`)) {
    return `${requestOrigin}${LOCAL_PREFIX}${value.slice(UPSTREAM_ORIGIN.length)}`;
  }
  if (value.startsWith("/")) {
    return `${requestOrigin}${LOCAL_PREFIX}${value}`;
  }
  return value;
}

function rewriteInboundReferer(value: string | null, request: Request) {
  if (!value) return null;
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  return value.replace(`${requestOrigin}${LOCAL_PREFIX}`, `${UPSTREAM_ORIGIN}${UPSTREAM_PREFIX}`);
}

function filteredCookieHeader(value: string | null) {
  if (!value) return undefined;
  const allowed = value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => /^PHPSESSID=/i.test(part));
  return allowed.length ? allowed.join("; ") : undefined;
}

function splitSetCookie(value: string) {
  return value.split(/,(?=\s*[^;,=\s]+=[^;]*)/g).map((part) => part.trim());
}

function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
    raw?: () => Record<string, string[]>;
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    return withGetSetCookie.getSetCookie();
  }

  const rawCookies = withGetSetCookie.raw?.()["set-cookie"];
  if (rawCookies?.length) return rawCookies;

  const combined = headers.get("set-cookie");
  return combined ? splitSetCookie(combined) : [];
}

function rewriteSetCookie(value: string) {
  if (/^(?:__cf_bm|_cfuvid)=/i.test(value)) return null;

  let cookie = value
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Path=[^;]*/i, "; Path=/career");

  if (!/;\s*Path=/i.test(cookie)) {
    cookie += "; Path=/career";
  }

  if (!/;\s*Secure/i.test(cookie)) {
    cookie += "; Secure";
  }

  if (!/;\s*SameSite=/i.test(cookie)) {
    cookie += "; SameSite=Lax";
  }

  return cookie;
}

function responseHeadersFrom(upstream: Response, request: Request) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  const location = upstream.headers.get("location");

  if (contentType) headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);
  if (location) headers.set("location", rewriteOutboundLocation(location, request));

  for (const [key, value] of upstream.headers) {
    const lower = key.toLowerCase();
    if (
      HOP_BY_HOP_HEADERS.has(lower) ||
      lower === "content-type" ||
      lower === "cache-control" ||
      lower === "location" ||
      lower === "set-cookie" ||
      lower === "content-security-policy" ||
      lower === "x-content-security-policy" ||
      lower === "x-webkit-csp"
    ) {
      continue;
    }
    headers.set(key, value);
  }

  for (const cookie of getSetCookieHeaders(upstream.headers)) {
    const rewritten = rewriteSetCookie(cookie);
    if (rewritten) headers.append("set-cookie", rewritten);
  }

  headers.set("content-security-policy", careerProxyCsp);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-career-proxy", UPSTREAM_HOST);

  return headers;
}

function rewriteHtml(html: string, request: Request) {
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  return html
    .replaceAll(`${UPSTREAM_ORIGIN}${UPSTREAM_PREFIX}/`, `${requestOrigin}${LOCAL_PREFIX}/`)
    .replaceAll(`${UPSTREAM_ORIGIN}${UPSTREAM_PREFIX}`, `${requestOrigin}${LOCAL_PREFIX}`)
    .replaceAll(`${UPSTREAM_ORIGIN}/career/`, `${requestOrigin}${LOCAL_PREFIX}/`)
    .replaceAll(`${UPSTREAM_ORIGIN}/career`, `${requestOrigin}${LOCAL_PREFIX}`);
}

async function requestBodyFor(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  return await request.arrayBuffer();
}

function buildUpstreamHeaders(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = getRequestOrigin(request, requestUrl);
  const headers = new Headers();

  for (const key of REQUEST_HEADERS_TO_FORWARD) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }

  const cookie = filteredCookieHeader(request.headers.get("cookie"));
  if (cookie) headers.set("cookie", cookie);

  const referer = rewriteInboundReferer(request.headers.get("referer"), request);
  if (referer) headers.set("referer", referer);

  const origin = request.headers.get("origin");
  if (origin === requestOrigin) {
    headers.set("origin", UPSTREAM_ORIGIN);
  }

  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-prefix", LOCAL_PREFIX);
  headers.set("x-forwarded-proto", "https");

  return headers;
}

export async function proxyCareerRequest(request: Request) {
  const url = new URL(request.url);
  if (url.pathname === LOCAL_PREFIX) {
    return new NextResponse(null, {
      status: 308,
      headers: { location: `${LOCAL_PREFIX}/` },
    });
  }

  const upstreamUrl = upstreamUrlFor(request);
  const upstreamInit: RequestInit = {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };
  const body = await requestBodyFor(request);
  if (body) upstreamInit.body = body;

  const upstream = await fetch(upstreamUrl, upstreamInit);

  const headers = responseHeadersFrom(upstream, request);

  if (request.method === "HEAD") {
    return new Response(null, { status: upstream.status, headers });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    const html = rewriteHtml(await upstream.text(), request);
    return new Response(html, { status: upstream.status, headers });
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
