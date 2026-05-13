import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = nextUrl.pathname.startsWith("/login");

  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
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

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
