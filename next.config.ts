import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["zod"],
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
      { protocol: "https", hostname: "rejuveracenter.sa" },
      { protocol: "https", hostname: "cdn.rejuveracenter.sa" },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.SITE_URL || "https://rejuveracenter.sa",
  },
};

export default nextConfig;
