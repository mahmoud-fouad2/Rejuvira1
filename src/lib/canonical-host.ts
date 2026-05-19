const DEFAULT_CANONICAL_ORIGIN = "https://rejuvera.sa";
const CANONICAL_HOST = "rejuvera.sa";

function isLegacyOrigin(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === "rejuveracenter.sa" ||
      host === "www.rejuveracenter.sa" ||
      host === "rejuveracenter.com.sa" ||
      host === "www.rejuveracenter.com.sa"
    );
  } catch {
    return /rejuveracenter/i.test(value);
  }
}

export function getCanonicalOrigin(): string {
  const raw = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_CANONICAL_ORIGIN
  ).replace(/\/+$/, "");

  if (!raw || isLegacyOrigin(raw)) {
    return DEFAULT_CANONICAL_ORIGIN;
  }

  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`) {
      return DEFAULT_CANONICAL_ORIGIN;
    }
  } catch {
    return DEFAULT_CANONICAL_ORIGIN;
  }

  return raw;
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
