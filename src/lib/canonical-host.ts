const DEFAULT_CANONICAL_ORIGIN = "https://rejuvera.sa";

export function getCanonicalOrigin(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_CANONICAL_ORIGIN;
  return raw.replace(/\/+$/, "");
}

export function getCanonicalHost(): string {
  try {
    return new URL(getCanonicalOrigin()).host.toLowerCase();
  } catch {
    return "rejuvera.sa";
  }
}

const LEGACY_HOSTS = new Set([
  "rejuveracenter.sa",
  "www.rejuveracenter.sa",
  "rejuveracenter.com.sa",
  "www.rejuveracenter.com.sa",
]);

export function normalizeHost(host?: string | null): string {
  return host?.split(",")[0]?.trim().toLowerCase().split(":")[0] ?? "";
}

export function isLegacyHost(host?: string | null): boolean {
  return LEGACY_HOSTS.has(normalizeHost(host));
}

export function shouldRedirectToCanonicalHost(host?: string | null): boolean {
  const normalized = normalizeHost(host);
  if (!normalized || normalized === getCanonicalHost()) {
    return false;
  }

  return (
    isLegacyHost(normalized) ||
    normalized === `www.${getCanonicalHost()}`
  );
}

export function buildCanonicalUrl(pathname: string, search = ""): URL {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`${path}${search}`, `${getCanonicalOrigin()}/`);
}
