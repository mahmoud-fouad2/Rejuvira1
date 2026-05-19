import { headers } from "next/headers";

import { getSiteUrlForHost } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getRobotsBaseUrl() {
  const headerStore = await headers();
  return getSiteUrlForHost(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
  );
}

export async function GET() {
  const baseUrl = await getRobotsBaseUrl();
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/admin",
    "Disallow: /api/admin/",
    "Disallow: /api/auth",
    "Disallow: /api/auth/",
    "Disallow: /forbidden",
    "Disallow: /login",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
