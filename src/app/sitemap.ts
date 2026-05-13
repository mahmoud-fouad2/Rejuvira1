import type { MetadataRoute } from "next";

import {
  getDoctors,
  getJournalPosts,
  getServices,
} from "@/lib/content-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rejuveracenter.com";
  const [doctors, services, journalPosts] = await Promise.all([
    getDoctors(),
    getServices(),
    getJournalPosts(),
  ]);

  return [
    "",
    "/about",
    "/contact",
    "/devices",
    "/gallery",
    "/journal",
    "/doctors",
    "/services",
    ...doctors.map((doctor) => `/doctors/${doctor.slug}`),
    ...journalPosts.map((post) => `/journal/${post.slug}`),
    ...services.map((service) => `/services/${service.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
