const ADMIN_MEDIA_PROXY_PATH = "/api/admin/media-proxy";
const ADMIN_MEDIA_PROXY_URL =
  /(?:https?:\/\/[^"'<>\s]+)?\/api\/admin\/media-proxy\?[^"'<>\s]+/gi;

const LEGACY_MEDIA_REPLACEMENTS: ReadonlyArray<{
  pattern: RegExp;
  replacement: string;
}> = [
  {
    pattern:
      /https?:\/\/(?:www\.)?rejuveraclinics\.com\/wp-content\/uploads\/2024\/04\/WhatsApp-Image-2024-04-16-at-10\.16\.34-AM\.jpeg(?:\?[^"'<>\s]*)?/gi,
    replacement: "/media/curated/clinic-interior.jpeg",
  },
  {
    pattern:
      /https?:\/\/(?:www\.)?rejuveraclinics\.com\/wp-content\/uploads\/2026\/02\/(?:%D8%B3%D9%8A%D9%8A472|سيي472)-1024x832\.png(?:\?[^"'<>\s]*)?/gi,
    replacement: "/media/curated/clinic-treatment-room.jpeg",
  },
];

const TRUSTED_MEDIA_HOSTS = new Set([
  "rejuvera.sa",
  "www.rejuvera.sa",
  "cdn.rejuvera.sa",
  "media.rejuvera.sa",
  "rejuveracenter.sa",
  "www.rejuveracenter.sa",
  "cdn.rejuveracenter.sa",
  "media.rejuveracenter.sa",
  "rejuvira1.onrender.com",
]);

function isTrustedMediaHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    TRUSTED_MEDIA_HOSTS.has(host) ||
    host.endsWith(".r2.dev") ||
    host.endsWith(".r2.cloudflarestorage.com") ||
    host.endsWith(".cloudflarestorage.com") ||
    host.endsWith(".onrender.com") ||
    host.endsWith(".rejuvera.sa") ||
    host.endsWith(".rejuveracenter.sa")
  );
}

/**
 * Convert an admin-only media preview URL back to its public source URL.
 * URLs using the private `key` parameter remain untouched because they do not
 * contain a public source that can safely be rendered on a visitor page.
 */
export function unwrapAdminMediaProxyUrl(value: string): string {
  const normalized = value.replace(/&amp;/gi, "&").trim();
  if (!normalized) return value;

  let proxyUrl: URL;
  try {
    proxyUrl = new URL(normalized, "https://rejuvera.invalid");
  } catch {
    return value;
  }

  if (proxyUrl.pathname !== ADMIN_MEDIA_PROXY_PATH) return value;

  const source = proxyUrl.searchParams.get("url");
  if (!source) return value;

  try {
    const sourceUrl = new URL(source);
    if (
      !["http:", "https:"].includes(sourceUrl.protocol) ||
      !isTrustedMediaHost(sourceUrl.hostname)
    ) {
      return value;
    }
    return sourceUrl.toString();
  } catch {
    return value;
  }
}

function repairEncodedBuilderState(html: string) {
  return html.replace(
    /data-blocks=("([^"]*)"|'([^']*)')/gi,
    (match, _quoted: string, doubleQuoted: string, singleQuoted: string) => {
      const encoded = doubleQuoted ?? singleQuoted ?? "";
      if (!encoded) return match;

      try {
        const decoded = decodeURIComponent(encoded);
        const repaired = repairKnownLegacyMediaUrls(
          decoded.replace(ADMIN_MEDIA_PROXY_URL, unwrapAdminMediaProxyUrl),
        );
        if (repaired === decoded) return match;

        const quote = match.includes('data-blocks="') ? '"' : "'";
        return `data-blocks=${quote}${encodeURIComponent(repaired)}${quote}`;
      } catch {
        return match;
      }
    },
  );
}

function repairKnownLegacyMediaUrls(html: string) {
  return LEGACY_MEDIA_REPLACEMENTS.reduce(
    (result, item) => result.replace(item.pattern, item.replacement),
    html,
  );
}

/**
 * Repair legacy custom-page HTML that accidentally persisted an authenticated
 * admin preview URL instead of the public R2/CDN image URL.
 */
export function repairCustomPageMediaUrls(html: string): string {
  if (!html) return html;

  const repairedHtml = repairKnownLegacyMediaUrls(
    html.replace(ADMIN_MEDIA_PROXY_URL, unwrapAdminMediaProxyUrl),
  );
  return repairEncodedBuilderState(repairedHtml);
}

/**
 * Add browser-native image loading hints to admin-authored pages. Existing
 * explicit choices are preserved; only missing attributes are supplied.
 */
export function optimizeCustomPageImages(html: string): string {
  let imageIndex = 0;

  return html.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
    const isSelfClosing = /\/\s*>$/.test(match);
    let nextAttrs = isSelfClosing ? attrs.replace(/\/\s*$/, "") : attrs;

    if (!/\balt\s*=/i.test(nextAttrs)) {
      nextAttrs += ' alt=""';
    }
    if (!/\bdecoding\s*=/i.test(nextAttrs)) {
      nextAttrs += ' decoding="async"';
    }
    if (!/\bloading\s*=/i.test(nextAttrs)) {
      nextAttrs += ` loading="${imageIndex === 0 ? "eager" : "lazy"}"`;
    }
    if (
      /\bsrc\s*=\s*(?:"https?:\/\/|'https?:\/\/|https?:\/\/)/i.test(
        nextAttrs,
      ) &&
      !/\breferrerpolicy\s*=/i.test(nextAttrs)
    ) {
      nextAttrs += ' referrerpolicy="strict-origin-when-cross-origin"';
    }

    imageIndex += 1;
    return `<img${nextAttrs}${isSelfClosing ? " /" : ""}>`;
  });
}
