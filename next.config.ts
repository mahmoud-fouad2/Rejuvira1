import type { NextConfig } from "next";

/**
 * Security & performance configuration.
 *
 * Image optimization can be force-disabled by setting `IMAGE_UNOPTIMIZED=1`
 * in environments where the platform doesn't ship `sharp` reliably (e.g. some
 * minimal containers). Default is to optimize, which gives a large LCP/FCP win.
 */
const imageUnoptimized = process.env.NEXT_IMAGE_OPTIMIZATION !== "1";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Notes:
 * - We use `'unsafe-inline'` for scripts because the root layout ships small
 *   bootstrap snippets (theme/lang) and JSON-LD via `next/script` inline.
 *   Adding nonces would require threading them through each Script and the
 *   server response — out of scope here. Lighthouse will still flag this audit
 *   as "could be stronger", but the policy still mitigates many XSS vectors.
 * - In dev we relax `script-src` to allow `'unsafe-eval'` for HMR.
 * - We allow third-party origins we actively integrate with: Chatbase, Google
 *   Maps embed, Google reCAPTCHA, Cloudflare R2 (image hosting).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval'"} https://www.chatbase.co https://*.chatbase.co https://www.google.com https://www.gstatic.com`.trim(),
  "script-src-elem 'self' 'unsafe-inline' https://www.chatbase.co https://*.chatbase.co https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://www.google.com https://www.chatbase.co https://*.chatbase.co",
  "media-src 'self' https: data:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
      "browsing-topics=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
  compress: true,
  experimental: {
    optimizePackageImports: ["zod", "@prisma/client", "next-auth"],
  },
  images: {
    unoptimized: imageUnoptimized,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
