import { headers } from "next/headers";

import { getSiteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = getSiteUrl();
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
    "User-agent: Googlebot",
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
    `Host: ${baseUrl.replace(/^https?:\/\//, "")}`,
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
