/**
 * Canonical domain for rejuvera.sa — hardcoded so it never
 * drifts regardless of which SITE_URL / NEXTAUTH_URL env var
 * is set on Render or any other platform.
 */
const CANONICAL_ORIGIN = "https://rejuvera.sa" as const;
const CANONICAL_HOST = "rejuvera.sa" as const;

const LEGACY_HOSTS = new Set([
  "rejuveracenter.sa",
  "www.rejuveracenter.sa",
  "rejuveracenter.com.sa",
  "www.rejuveracenter.com.sa",
]);

/** Always returns https://rejuvera.sa */
export function getCanonicalOrigin(): string {
  return CANONICAL_ORIGIN;
}

function normalizeHost(host?: string | null): string {
  return host?.split(",")[0]?.trim().toLowerCase().split(":")[0] ?? "";
}

function isLegacyHost(host?: string | null): boolean {
  return LEGACY_HOSTS.has(normalizeHost(host));
}

export function shouldRedirectToCanonicalHost(host?: string | null): boolean {
  const normalized = normalizeHost(host);
  if (!normalized || normalized === CANONICAL_HOST) {
    return false;
  }
  return isLegacyHost(normalized) || normalized === `www.${CANONICAL_HOST}`;
}

export function buildCanonicalUrl(pathname: string, search = ""): URL {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`${path}${search}`, `${CANONICAL_ORIGIN}/`);
}
