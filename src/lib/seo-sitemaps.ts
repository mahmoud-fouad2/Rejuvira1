import { ContentStatus } from "@prisma/client";

import {
  getCustomPages,
  getDevices,
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";

export const SITEMAP_PATHS = {
  index: "/sitemap.xml",
  legacyIndex: "/sitemap-index.xml",
  pages: "/sitemap-pages.xml",
  legacyPages: "/sitemap2.xml",
  images: "/sitemap-images.xml",
  llms: "/llms.txt",
} as const;

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  path: string;
  title: string;
  description?: string | null;
  priority: number;
  changeFrequency: ChangeFrequency;
  lastModified?: string | null;
  images?: ReadonlyArray<{
    url: string;
    title?: string | null;
    caption?: string | null;
  }>;
};

type SitemapImage = NonNullable<SitemapEntry["images"]>[number];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+/, "")}`;
}

function isCleanSitemapPath(path: string) {
  if (!path || path === "/") return true;
  if (!path.startsWith("/")) return false;
  if (path === "/career" || path === "/career/") return false;
  if (path.endsWith("/")) return false;
  if (/\s/.test(path)) return false;
  if (/[A-Z]/.test(path)) return false;
  if (/[^\x00-\x7F]/.test(path)) return false;
  return true;
}

export function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = normalizePath(pathOrUrl);
  return `${getSiteUrl()}${path === "/" ? "/" : path}`;
}

function withEnglishVariant(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=en`;
}

function isPublished<T extends { status?: ContentStatus | null }>(
  item: T,
): boolean {
  return (item.status ?? ContentStatus.PUBLISHED) === ContentStatus.PUBLISHED;
}

function compactImages(
  images: Array<SitemapImage | null | undefined>,
) {
  const seen = new Set<string>();
  return images.filter((image): image is SitemapImage => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [
    runtimeSettings,
    doctors,
    services,
    devices,
    galleryItems,
    journalPosts,
    customPages,
  ] = await Promise.all([
    getRuntimeSettings(),
    getDoctors(),
    getServices(),
    getDevices(),
    getGalleryItems(),
    getJournalPosts(),
    getCustomPages(),
  ]);

  const now = new Date().toISOString();
  const staticEntries: SitemapEntry[] = [
    {
      path: "/",
      title: runtimeSettings.brand.siteName,
      description: runtimeSettings.brand.seoDescription,
      priority: 1,
      changeFrequency: "weekly",
      lastModified: now,
      images: compactImages([
        {
          url: runtimeSettings.media.ogImage,
          title: runtimeSettings.brand.siteName,
          caption: runtimeSettings.brand.seoDescription,
        },
        {
          url: runtimeSettings.media.brandLogo,
          title: runtimeSettings.brand.logoAlt,
        },
      ]),
    },
    {
      path: "/about",
      title: "عن Rejuvera Center",
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      path: "/contact",
      title: "تواصل معنا",
      priority: 0.9,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      path: "/services",
      title: "الخدمات الطبية والتجميلية",
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: now,
    },
    {
      path: "/doctors",
      title: "الأطباء",
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: now,
    },
    {
      path: "/devices",
      title: "الأجهزة الطبية",
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: now,
      images: compactImages(
        devices.filter(isPublished).map((device) => ({
          url: device.imageUrl,
          title: device.name,
          caption: device.excerpt,
        })),
      ),
    },
    {
      path: "/gallery",
      title: "معرض النتائج",
      priority: 0.7,
      changeFrequency: "weekly",
      lastModified: now,
      images: compactImages(
        galleryItems.filter(isPublished).flatMap((item) => [
          {
            url: item.beforeImageUrl,
            title: item.beforeImageAlt || item.title,
            caption: item.description || item.title,
          },
          {
            url: item.afterImageUrl,
            title: item.afterImageAlt || item.title,
            caption: item.description || item.title,
          },
        ]),
      ),
    },
    {
      path: "/journal",
      title: "المجلة الطبية",
      priority: 0.8,
      changeFrequency: "weekly",
      lastModified: now,
    },
    {
      path: "/career",
      title: "التوظيف في Rejuvera Center",
      priority: 0.5,
      changeFrequency: "monthly",
      lastModified: now,
    },
    {
      path: "/privacy",
      title: "سياسة الخصوصية",
      priority: 0.4,
      changeFrequency: "yearly",
      lastModified: now,
    },
    {
      path: "/terms",
      title: "الشروط والأحكام",
      priority: 0.4,
      changeFrequency: "yearly",
      lastModified: now,
    },
  ];

  const dynamicEntries: SitemapEntry[] = [
    ...doctors.filter(isPublished).map((doctor) => ({
      path: `/doctors/${doctor.slug}`,
      title: doctor.name,
      description: doctor.summary,
      priority: 0.7,
      changeFrequency: "monthly" as const,
      lastModified: now,
      images: compactImages([
        {
          url: doctor.coverImageUrl || doctor.photoUrl,
          title: doctor.name,
          caption: doctor.specialty,
        },
      ]),
    })),
    ...services.filter(isPublished).map((service) => ({
      path: `/services/${service.slug}`,
      title: service.name,
      description: service.excerpt,
      priority: 0.75,
      changeFrequency: "monthly" as const,
      lastModified: now,
      images: compactImages([
        {
          url: service.coverImageUrl,
          title: service.name,
          caption: service.excerpt,
        },
      ]),
    })),
    ...journalPosts.filter(isPublished).map((post) => ({
      path: `/journal/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      priority: 0.65,
      changeFrequency: "monthly" as const,
      lastModified: post.publishedAt,
      images: compactImages([
        {
          url: post.coverImageUrl,
          title: post.title,
          caption: post.excerpt,
        },
      ]),
    })),
    ...customPages
      .filter((page) => page.status === ContentStatus.PUBLISHED && !page.noindex)
      .map((page) => ({
        path: `/p/${page.seoSlug || page.slug}`,
        title: page.metaTitle || page.seoTitle || page.titleAr,
        description: page.metaDescription || page.seoDescription || null,
        priority: 0.55,
        changeFrequency: "monthly" as const,
        lastModified: page.updatedAt,
        images: compactImages([
          page.ogImage
            ? {
                url: page.ogImage,
                title: page.ogTitle || page.titleAr,
                caption: page.ogDescription || page.seoDescription || null,
              }
            : null,
        ]),
      })),
  ];

  const entries = new Map<string, SitemapEntry>();
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    if (!isCleanSitemapPath(entry.path)) continue;
    entries.set(absoluteUrl(entry.path), entry);
  }

  return Array.from(entries.values()).sort((left, right) => {
    if (left.path === "/") return -1;
    if (right.path === "/") return 1;
    return left.path.localeCompare(right.path);
  });
}

export function renderSitemapIndexXml(lastModified = new Date().toISOString()) {
  const sitemapUrls = [SITEMAP_PATHS.pages, SITEMAP_PATHS.images];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (path) => `  <sitemap>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
    <lastmod>${escapeXml(lastModified)}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;
}

export function renderPagesSitemapXml(entries: readonly SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((entry) => {
    const url = absoluteUrl(entry.path);
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${escapeXml(entry.lastModified || new Date().toISOString())}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(url)}" />
    <xhtml:link rel="alternate" hreflang="ar-SA" href="${escapeXml(url)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(withEnglishVariant(url))}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(withEnglishVariant(url))}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(url)}" />
  </url>`;
  })
  .join("\n")}
</urlset>
`;
}

export function renderImageSitemapXml(entries: readonly SitemapEntry[]) {
  const imageEntries = entries.filter((entry) => entry.images?.length);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries
  .map((entry) => {
    const url = absoluteUrl(entry.path);
    return `  <url>
    <loc>${escapeXml(url)}</loc>
${(entry.images ?? [])
  .map(
    (image) => `    <image:image>
      <image:loc>${escapeXml(absoluteUrl(image.url))}</image:loc>
      ${
        image.title
          ? `<image:title>${escapeXml(image.title)}</image:title>`
          : ""
      }
      ${
        image.caption
          ? `<image:caption>${escapeXml(image.caption)}</image:caption>`
          : ""
      }
    </image:image>`,
  )
  .join("\n")}
  </url>`;
  })
  .join("\n")}
</urlset>
`;
}

export async function renderLlmsTxt() {
  const [settings, entries] = await Promise.all([
    getRuntimeSettings(),
    getSitemapEntries(),
  ]);
  const importantEntries = entries
    .filter((entry) =>
      ["/", "/services", "/doctors", "/devices", "/gallery", "/journal", "/contact"].includes(
        entry.path,
      ),
    )
    .concat(
      entries
        .filter((entry) => entry.path.startsWith("/services/"))
        .slice(0, 12),
      entries.filter((entry) => entry.path.startsWith("/journal/")).slice(0, 8),
    );

  return `# ${settings.brand.siteName}

> ${settings.brand.seoDescription}

Official website: ${getSiteUrl()}
Primary language: Arabic (Saudi Arabia)
Secondary language: English
Location: Riyadh, Saudi Arabia
Contact email: ${settings.contact.email}
Phone: ${settings.contact.phone}

## Purpose

Rejuvera Center is a medical and aesthetic center in Riyadh. The site contains public information about services, doctors, devices, before/after gallery items, journal articles, contact options, and campaign landing pages.

## Important URLs

${importantEntries
  .map((entry) => `- ${entry.title}: ${absoluteUrl(entry.path)}`)
  .join("\n")}

## Machine-readable indexes

- Sitemap index: ${absoluteUrl(SITEMAP_PATHS.index)}
- Pages sitemap: ${absoluteUrl(SITEMAP_PATHS.pages)}
- Image sitemap: ${absoluteUrl(SITEMAP_PATHS.images)}
- Robots policy: ${absoluteUrl("/robots.txt")}

## Crawling guidance

Public informational pages may be indexed. Admin, authentication, and private API routes must not be crawled. Prefer the canonical host ${getSiteUrl()} for citation and indexing.
`;
}

export const xmlHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
  "X-Robots-Tag": "all",
} as const;

export const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
  "X-Robots-Tag": "all",
} as const;
