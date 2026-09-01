const HTTP_PROTOCOL = /^https?:$/i;
const EMBEDDED_ABSOLUTE_URL = /https?:\/\//i;
const FILE_LIKE_PATH = /\.[a-z0-9]{2,8}$/i;

/**
 * Repair the exact URL duplication produced by malformed stored media values:
 *   https://cdn/path/image.webphttps://cdn/path/image.webp
 */
export function normalizeMediaUrl(value: string): string {
  let normalized = value.trim();

  while (normalized) {
    const secondHttp = normalized.search(/https?:\/\//i);
    const nextHttp = normalized
      .slice(secondHttp >= 0 ? secondHttp + 8 : 0)
      .search(/https?:\/\//i);

    if (secondHttp !== 0 || nextHttp < 0) break;

    const splitAt = secondHttp + 8 + nextHttp;
    const left = normalized.slice(0, splitAt);
    const right = normalized.slice(splitAt);
    if (left !== right) break;
    normalized = left;
  }

  return normalized;
}

export function normalizePublicMediaBaseUrl(value: string): string {
  const normalized = normalizeMediaUrl(value).replace(/\/+$/, "");
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("R2_PUBLIC_BASE_URL must be a valid absolute URL.");
  }

  if (!HTTP_PROTOCOL.test(parsed.protocol)) {
    throw new Error("R2_PUBLIC_BASE_URL must use http or https.");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(
      "R2_PUBLIC_BASE_URL must not contain credentials, a query, or a hash.",
    );
  }

  const decodedPath = decodeURIComponent(parsed.pathname);
  if (
    EMBEDDED_ABSOLUTE_URL.test(decodedPath) ||
    FILE_LIKE_PATH.test(decodedPath.replace(/\/+$/, ""))
  ) {
    throw new Error(
      "R2_PUBLIC_BASE_URL must be the bucket/CDN base URL, not an image URL.",
    );
  }

  return parsed.toString().replace(/\/+$/, "");
}

export function buildPublicMediaUrl(baseUrl: string, key: string): string {
  const base = normalizePublicMediaBaseUrl(baseUrl);
  const normalizedKey = key.trim().replace(/^\/+/, "");
  if (!normalizedKey) {
    throw new Error("Cannot build a public media URL without an object key.");
  }
  return `${base}/${normalizedKey}`;
}
