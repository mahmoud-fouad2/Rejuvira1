import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { getSiteUrlForHost } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const baseUrl = getSiteUrlForHost(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
  );
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/auth", "/forbidden", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
