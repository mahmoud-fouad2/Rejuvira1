import type { MetadataRoute } from "next";

import { getRuntimeSettings } from "@/lib/content-repository";

function iconType(src: string) {
  const clean = src.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".ico")) return "image/x-icon";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getRuntimeSettings();
  const favicon = settings.media.favicon || "/icon.svg";
  const appleIcon = settings.media.appleIcon || "/apple-icon.png";
  const brandMark = settings.media.brandMark || "/media/brand-logo-main.png";
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
        src: favicon,
        sizes: "any",
        type: iconType(favicon),
      },
      {
        src: appleIcon,
        sizes: "180x180",
        type: iconType(appleIcon),
      },
      {
        src: brandMark,
        sizes: "512x512",
        type: iconType(brandMark),
        purpose: "any",
      },
    ],
  };
}
