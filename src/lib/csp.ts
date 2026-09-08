const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Notes:
 * - `script-src` carries a per-request nonce (passed in by middleware.ts,
 *   which also mirrors the resulting policy onto the request headers so
 *   Next's own renderer can nonce its own internal scripts) plus
 *   `'strict-dynamic'`, so a nonced script may itself load further scripts
 *   (e.g. the GTM bootstrap pulling in gtm.js, or the Faheemly/Chatbase
 *   loader appending admin-configured snippets) without each of those needing
 *   its own nonce. `'unsafe-inline'` is kept alongside them purely as an
 *   inert fallback: browsers that understand nonce/strict-dynamic ignore
 *   `'unsafe-inline'` in the same directive per the CSP3 spec, while browsers
 *   that don't recognize those tokens fall back to it — same behavior as
 *   before this migration, not a new hole.
 * - In dev we relax `script-src` to allow `'unsafe-eval'` for HMR.
 * - We allow third-party origins we actively integrate with: Chatbase, Google
 *   Maps embed, Google reCAPTCHA/Tag, Cloudflare R2 (image hosting).
 */
export function buildCsp(frameAncestors: string, nonce: string) {
  const googleScriptOrigins = [
    "https://www.google.com",
    "https://*.google.com",
    "https://www.gstatic.com",
    "https://*.gstatic.com",
    "https://www.googletagmanager.com",
    "https://*.googletagmanager.com",
    "https://www.googleadservices.com",
    // Google Ads/Analytics conversion tracking uses several doubleclick.net
    // subdomains beyond googleads.g. (e.g. ad.doubleclick.net for the
    // cross-domain conversion "ccm/s/collect" beacon) — wildcard the whole
    // Google-owned domain rather than allowlisting each one piecemeal.
    "https://*.doubleclick.net",
    "https://*.recaptcha.net",
    "https://www.recaptcha.net",
  ].join(" ");
  const metaScriptOrigins = "https://connect.facebook.net";
  // TikTok Pixel (events.js) loads from analytics.tiktok.com.
  const tiktokScriptOrigins =
    "https://analytics.tiktok.com https://*.tiktok.com";
  // Snap Pixel loader plus the account-specific runtime configuration it loads.
  const snapchatScriptOrigins =
    "https://sc-static.net https://tr.snapchat.com";
  // Faheemly chat/booking widget loader (admin-configured integration).
  const widgetScriptOrigins =
    "https://www.faheemly.com https://*.faheemly.com";

  return [
    `default-src 'self' ${googleScriptOrigins} data: blob:`,
    [
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
      !isProd && "'unsafe-eval'",
      "https://www.chatbase.co",
      "https://*.chatbase.co",
      googleScriptOrigins,
      metaScriptOrigins,
      tiktokScriptOrigins,
      snapchatScriptOrigins,
      widgetScriptOrigins,
    ]
      .filter(Boolean)
      .join(" "),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    // Narrowed from a blanket `https:` to the origins actually observed via
    // live network capture (analytics/pixel beacons + the Faheemly widget's
    // API calls). The Faheemly widget calls its own AWS-hosted backend
    // directly (not just faheemly.com), hence the ecs.us-west-2 wildcard.
    [
      "connect-src 'self'",
      googleScriptOrigins,
      "https://analytics.google.com",
      "https://*.google-analytics.com",
      metaScriptOrigins,
      "https://www.facebook.com",
      tiktokScriptOrigins,
      // TikTok Pixel's IP-enrichment beacon calls a separate registered
      // domain (tiktokw.us), not a tiktok.com subdomain.
      "https://*.tiktokw.us",
      snapchatScriptOrigins,
      "https://*.snapchat.com",
      widgetScriptOrigins,
      "https://*.ecs.us-west-2.on.aws",
      "wss:",
      "data:",
      "blob:",
    ].join(" "),
    "frame-src 'self' https://www.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com https://*.recaptcha.net https://www.recaptcha.net https://www.googletagmanager.com https://*.googletagmanager.com https://www.chatbase.co https://*.chatbase.co https://tr.snapchat.com https://www.faheemly.com https://*.faheemly.com",
    "child-src 'self' https://www.google.com https://*.google.com https://www.gstatic.com https://*.recaptcha.net blob:",
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
