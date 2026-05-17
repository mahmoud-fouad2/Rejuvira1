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

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const requestId = request.headers.get("x-request-id") ?? generateRequestId();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);
  requestHeaders.set("x-url", nextUrl.href);
  requestHeaders.set("x-request-id", requestId);

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = nextUrl.pathname.startsWith("/login");
  const isApiAdminRoute = nextUrl.pathname.startsWith("/api/admin");

  if (isAdminRoute && !session) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("redirect", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (
    isAdminRoute &&
    !canAccessAdminRoute(nextUrl.pathname, session?.user?.role)
  ) {
    return NextResponse.redirect(new URL("/forbidden", nextUrl));
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
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
