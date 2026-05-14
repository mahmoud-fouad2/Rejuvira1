import type { MetadataRoute } from "next";

import { getRuntimeSettings } from "@/lib/content-repository";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getRuntimeSettings();
  return {
    name: settings.brand.siteName,
    short_name: settings.brand.shortName,
    description: settings.brand.seoDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#1e0d4e",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: settings.media.favicon || "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: settings.media.appleIcon || "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: settings.media.brandMark || "/media/curated/service-prp.jpg",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
