import { ContentStatus } from "@prisma/client";

import {
  getCustomPages,
  getDoctors,
  getJournalPosts,
  getServices,
} from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";

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

function isPublished<T extends { status?: ContentStatus | null }>(
  item: T,
): boolean {
  return (item.status ?? ContentStatus.PUBLISHED) === ContentStatus.PUBLISHED;
}

export async function GET() {
  const baseUrl = getSiteUrl();
  const now = new Date().toISOString();

  try {
    const [doctors, services, journalPosts, customPages] =
      await Promise.all([
        getDoctors(),
        getServices(),
        getJournalPosts(),
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
      ...doctors.filter(isPublished).map((doctor) => ({
        path: `/doctors/${doctor.slug}`,
        priority: 0.7,
        changeFrequency: "monthly" as const,
      })),
      ...services.filter(isPublished).map((service) => ({
        path: `/services/${service.slug}`,
        priority: 0.7,
        changeFrequency: "monthly" as const,
      })),
      ...journalPosts.filter(isPublished).map((post) => ({
        path: `/journal/${post.slug}`,
        priority: 0.6,
        changeFrequency: "monthly" as const,
      })),
      ...customPages
        .filter(
          (page) => page.status === ContentStatus.PUBLISHED && !page.noindex,
        )
        .map((page) => ({
          path: `/p/${page.seoSlug || page.slug}`,
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
        "Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
        "X-Robots-Tag": "all",
      },
    });
  } catch (error) {
    console.error("[sitemap] Failed to build sitemap:", error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(normalizeUrl(baseUrl, ""))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    return new Response(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300, must-revalidate",
        "X-Robots-Tag": "all",
      },
    });
  }
}
