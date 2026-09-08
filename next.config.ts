import type { NextConfig } from "next";

/**
 * Image optimization is ON by default (Render ships sharp).
 * Disable only by setting IMAGE_UNOPTIMIZED=1 explicitly.
 */
const imageUnoptimized = process.env.IMAGE_UNOPTIMIZED === "1";

/**
 * The public/admin Content-Security-Policy is built and set per-request by
 * middleware.ts (src/lib/csp.ts's `buildCsp`), because it carries a fresh
 * nonce on every request. next.config.ts can only emit a static header, so
 * it no longer sets Content-Security-Policy for the routes middleware
 * covers — see `securityHeaders` / `adminFrameProtectionHeaders` below.
 * `/career/*` is a deliberate exception (middleware's matcher excludes it)
 * and keeps its own static, `unsafe-inline`-based policy here.
 */
const careerCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm",
  "connect-src 'self' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com blob:",
  "child-src 'self' https://challenges.cloudflare.com blob:",
  "media-src 'self' https: data:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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

const adminFrameProtectionHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
  compress: true,
  experimental: {
    cpus: Number(process.env.NEXT_BUILD_WORKERS ?? 4),
    optimizePackageImports: [
      "zod",
      "@prisma/client",
      "next-auth",
      "lucide-react",
      "date-fns",
    ],
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
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "rejuvera.sa" },
      { protocol: "https", hostname: "www.rejuvera.sa" },
      { protocol: "https", hostname: "cdn.rejuvera.sa" },
      { protocol: "https", hostname: "rejuveracenter.sa" },
      { protocol: "https", hostname: "www.rejuveracenter.sa" },
      { protocol: "https", hostname: "cdn.rejuveracenter.sa" },
      { protocol: "https", hostname: "rejuvira1.onrender.com" },
      { protocol: "https", hostname: "ma-fo.info" },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: "https://rejuvera.sa",
  },
  async headers() {
    return [
      {
        source: "/((?!career(?:/|$)).*)",
        headers: securityHeaders,
      },
      {
        source: "/career/:path*",
        headers: [
          { key: "Content-Security-Policy", value: careerCsp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Career-Proxy", value: "dralsalmi.com" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: adminFrameProtectionHeaders,
      },
      {
        source: "/login",
        headers: adminFrameProtectionHeaders,
      },
      {
        source: "/forbidden",
        headers: adminFrameProtectionHeaders,
      },
      // Explicit allow-indexing signal for every public page.
      // This is a defensive double-down on the homepage <meta name="robots">
      // and catches cases where Cloudflare/Render might strip the meta tag.
      {
        source: "/",
        headers: [{ key: "X-Robots-Tag", value: "all" }],
      },
      {
        source: "/((?!admin|api/admin|api/auth|forbidden|login)(?:.*))",
        headers: [{ key: "X-Robots-Tag", value: "all" }],
      },
      // robots.txt + sitemap files: short cache, plus permissive indexing.
      // These file routes are excluded from middleware.ts's matcher (by
      // extension), so they no longer get a CSP from there either — they
      // never render HTML/script, so a locked-down static policy is enough.
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/sitemap2.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/sitemap-pages.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/sitemap-images.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/sitemap-index.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "X-Robots-Tag", value: "all" },
          { key: "Content-Security-Policy", value: "default-src 'none'" },
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
