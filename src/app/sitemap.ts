import type { MetadataRoute } from "next";

import {
  getDevices,
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getServices,
} from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [doctors, services, journalPosts, devices, gallery] = await Promise.all([
    getDoctors(),
    getServices(),
    getJournalPosts(),
    getDevices(),
    getGalleryItems(),
  ]);

  const staticPaths = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/doctors", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/devices", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/journal", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
  ];

  const dynamicPaths = [
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
  ];

  return [...staticPaths, ...dynamicPaths].map<SitemapEntry>((entry) => {
    const url = `${baseUrl}${entry.path}`;
    return {
      url,
      lastModified: new Date(),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: {
          ar: url,
          "ar-SA": url,
          en: `${url}?lang=en`,
          "en-US": `${url}?lang=en`,
          "x-default": url,
        },
      },
    };
  });
}
