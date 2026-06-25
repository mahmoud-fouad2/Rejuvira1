import type { NextConfig } from "next";

/**
 * Image optimization is ON by default (Render ships sharp).
 * Disable only by setting IMAGE_UNOPTIMIZED=1 explicitly.
 */
const imageUnoptimized = process.env.IMAGE_UNOPTIMIZED === "1";

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
 *   Maps embed, Google reCAPTCHA/Tag, Cloudflare R2 (image hosting).
 */
function buildCsp(frameAncestors: string) {
  const googleScriptOrigins = [
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
  ].join(" ");
  const metaScriptOrigins = "https://connect.facebook.net";
  // TikTok Pixel (events.js) loads from analytics.tiktok.com.
  const tiktokScriptOrigins =
    "https://analytics.tiktok.com https://*.tiktok.com";
  // Faheemly chat/booking widget loader (admin-configured integration).
  const widgetScriptOrigins =
    "https://www.faheemly.com https://*.faheemly.com";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval'"} https://www.chatbase.co https://*.chatbase.co ${googleScriptOrigins} ${metaScriptOrigins} ${tiktokScriptOrigins} ${widgetScriptOrigins}`.trim(),
    `script-src-elem 'self' 'unsafe-inline' https://www.chatbase.co https://*.chatbase.co ${googleScriptOrigins} ${metaScriptOrigins} ${tiktokScriptOrigins} ${widgetScriptOrigins}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.google.com https://www.googletagmanager.com https://www.chatbase.co https://*.chatbase.co https://www.faheemly.com https://*.faheemly.com",
    "media-src 'self' https: data:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
    "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

const publicCsp = buildCsp(
  "frame-ancestors 'self' https://tagassistant.google.com https://*.google.com https://*.googleusercontent.com",
);
const adminCsp = buildCsp("frame-ancestors 'none'");
const careerCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "frame-src 'self'",
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
  { key: "Content-Security-Policy", value: publicCsp },
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
  { key: "Content-Security-Policy", value: adminCsp },
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
      { protocol: "https", hostname: "rejuvera.sa" },
      { protocol: "https", hostname: "www.rejuvera.sa" },
      { protocol: "https", hostname: "cdn.rejuvera.sa" },
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
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
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
