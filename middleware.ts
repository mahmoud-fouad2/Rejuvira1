import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  buildCanonicalUrl,
  shouldRedirectToCanonicalHost,
} from "@/lib/canonical-host";

/**
 * Edge middleware:
 * 1. Canonical host redirect (legacy domains -> SITE_URL).
 * 2. Auth gate for `/admin/*` (redirect anon -> /login).
 * 3. Role-based gate for protected admin routes.
 * 4. Redirect already-authenticated users away from /login.
 * 5. Forward `x-pathname` / `x-url` for server components.
 * 6. Stamp a unique `x-request-id` for log correlation.
 * 7. For admin and authenticated areas, force `no-store` so sensitive data is
 *    never cached by intermediaries.
 */
function generateRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

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

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const requestHost =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    firstHeaderValue(request.headers.get("host"));

  if (shouldRedirectToCanonicalHost(requestHost)) {
    return NextResponse.redirect(
      buildCanonicalUrl(nextUrl.pathname, nextUrl.search),
      308,
    );
  }

  const requestId = request.headers.get("x-request-id") ?? generateRequestId();
  const currentOrigin = getRequestOrigin(request, nextUrl);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);
  requestHeaders.set(
    "x-url",
    `${currentOrigin}${nextUrl.pathname}${nextUrl.search}`,
  );
  requestHeaders.set("x-request-id", requestId);

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = nextUrl.pathname.startsWith("/login");
  const isApiAdminRoute = nextUrl.pathname.startsWith("/api/admin");
  const hasAuthenticatedUser = Boolean(session?.user?.id);

  if (isAdminRoute && !hasAuthenticatedUser) {
    const url = buildCanonicalUrl("/login");
    url.searchParams.set("redirect", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (
    isAdminRoute &&
    !canAccessAdminRoute(nextUrl.pathname, session?.user?.role)
  ) {
    return NextResponse.redirect(buildCanonicalUrl("/forbidden"));
  }

  if (isLoginRoute && hasAuthenticatedUser) {
    return NextResponse.redirect(buildCanonicalUrl("/admin"));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-request-id", requestId);

  // Sensitive surfaces should never be cached by browsers/CDNs.
  if (isAdminRoute || isApiAdminRoute || isLoginRoute) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
  } else {
    // Public pages: allow short CDN caching and stay crawlable for Googlebot.
    // Overrides the `Cache-Control: private` that NextAuth injects whenever
    // it issues a CSRF cookie — that header made GSC flag the page as
    // un-indexable even though the meta robots tag said "index, follow".
    response.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, must-revalidate",
    );
    response.headers.set("X-Robots-Tag", "all");
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap2.xml|sitemap-index.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|txt|xml|webmanifest)$).*)",
  ],
};
