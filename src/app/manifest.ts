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
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
