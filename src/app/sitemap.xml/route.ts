import { ContentStatus } from "@prisma/client";
import { headers } from "next/headers";

import {
  getCustomPages,
  getDevices,
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getServices,
} from "@/lib/content-repository";
import { getSiteUrlForHost } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SitemapItem = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeUrl(baseUrl: string, path: string) {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "/";
  return `${baseUrl}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

async function getSitemapBaseUrl() {
  const headerStore = await headers();
  return getSiteUrlForHost(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
  );
}

export async function GET() {
  const baseUrl = await getSitemapBaseUrl();
  const now = new Date().toISOString();
  const [doctors, services, journalPosts, devices, gallery, customPages] =
    await Promise.all([
      getDoctors(),
      getServices(),
      getJournalPosts(),
      getDevices(),
      getGalleryItems(),
      getCustomPages(),
    ]);

  const staticPaths: SitemapItem[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/doctors", priority: 0.9, changeFrequency: "weekly" },
    { path: "/devices", priority: 0.7, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" },
    { path: "/journal", priority: 0.8, changeFrequency: "weekly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  ];

  const dynamicPaths: SitemapItem[] = [
    ...doctors.map((doctor) => ({
      path: `/doctors/${doctor.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    ...services.map((service) => ({
      path: `/services/${service.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    ...devices.map((device) => ({
      path: `/devices/${device.slug}`,
      priority: 0.5,
      changeFrequency: "monthly" as const,
    })),
    ...gallery.map((item) => ({
      path: `/gallery/${item.slug}`,
      priority: 0.5,
      changeFrequency: "monthly" as const,
    })),
    ...journalPosts.map((post) => ({
      path: `/journal/${post.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
    ...customPages
      .filter(
        (page) => page.status === ContentStatus.PUBLISHED && !page.noindex,
      )
      .map((page) => ({
        path: `/p/${page.slug}`,
        priority: 0.5,
        changeFrequency: "monthly" as const,
      })),
  ];

  const urls = new Map<string, SitemapItem>();
  for (const item of [...staticPaths, ...dynamicPaths]) {
    urls.set(normalizeUrl(baseUrl, item.path), item);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls.entries())
  .map(
    ([url, item]) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
