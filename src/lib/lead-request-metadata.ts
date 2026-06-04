import { extractClientIp } from "@/lib/rate-limit";

export type LeadRequestMetadata = {
  ipAddress?: string | undefined;
  country?: string | undefined;
  referrerUrl?: string | undefined;
  landingPageUrl?: string | undefined;
  userAgent?: string | undefined;
};

function cleanValue(value: string | null | undefined, maxLength: number) {
  const clean = value?.trim();
  return clean ? clean.slice(0, maxLength) : undefined;
}

function cleanCountry(value: string | null | undefined) {
  const clean = cleanValue(value, 80);
  if (!clean || clean === "XX" || clean === "T1") return undefined;
  return clean;
}

function readCountry(headers: Headers) {
  return (
    cleanCountry(headers.get("cf-ipcountry")) ||
    cleanCountry(headers.get("x-vercel-ip-country")) ||
    cleanCountry(headers.get("cloudfront-viewer-country")) ||
    cleanCountry(headers.get("x-country-code")) ||
    cleanCountry(headers.get("x-geo-country"))
  );
}

export function getLeadRequestMetadata(
  request: Request,
  overrides: LeadRequestMetadata = {},
): LeadRequestMetadata {
  const headers = request.headers;
  const referrerUrl = cleanValue(
    overrides.referrerUrl ?? headers.get("referer"),
    1_000,
  );
  const landingPageUrl = cleanValue(
    overrides.landingPageUrl ??
      headers.get("x-rejuvera-current-url") ??
      referrerUrl,
    1_000,
  );
  const ipAddress =
    cleanValue(overrides.ipAddress, 120) ||
    cleanValue(extractClientIp(headers), 120);

  return {
    ...(ipAddress && ipAddress !== "unknown" ? { ipAddress } : {}),
    ...(cleanCountry(overrides.country) || readCountry(headers)
      ? { country: cleanCountry(overrides.country) || readCountry(headers) }
      : {}),
    ...(referrerUrl ? { referrerUrl } : {}),
    ...(landingPageUrl ? { landingPageUrl } : {}),
    ...(cleanValue(overrides.userAgent ?? headers.get("user-agent"), 500)
      ? {
          userAgent: cleanValue(
            overrides.userAgent ?? headers.get("user-agent"),
            500,
          ),
        }
      : {}),
  };
}
