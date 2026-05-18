import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";

/**
 * Edge middleware:
 * 1. Auth gate for `/admin/*` (redirect anon -> /login).
 * 2. Role-based gate for protected admin routes.
 * 3. Redirect already-authenticated users away from /login.
 * 4. Forward `x-pathname` / `x-url` for server components.
 * 5. Stamp a unique `x-request-id` for log correlation.
 * 6. For admin and authenticated areas, force `no-store` so sensitive data is
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

function localUrl(request: Request, fallbackUrl: URL, path: string) {
  return new URL(path, getRequestOrigin(request, fallbackUrl));
}

export default auth((request) => {
  const { nextUrl, auth: session } = request;
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
    const url = localUrl(request, nextUrl, "/login");
    url.searchParams.set("redirect", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (
    isAdminRoute &&
    !canAccessAdminRoute(nextUrl.pathname, session?.user?.role)
  ) {
    return NextResponse.redirect(localUrl(request, nextUrl, "/forbidden"));
  }

  if (isLoginRoute && hasAuthenticatedUser) {
    return NextResponse.redirect(localUrl(request, nextUrl, "/admin"));
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
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
