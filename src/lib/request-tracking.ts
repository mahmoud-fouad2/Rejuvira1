export type RequestTrackingFields = {
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
};

const trackingParams = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmContent", "utm_content"],
] as const;

function cleanTrackingValue(value: string | null | undefined) {
  const clean = value?.trim();
  return clean ? clean.slice(0, 120) : "";
}

function getSearchParams(value: string | null, baseUrl: string) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).searchParams;
  } catch {
    return null;
  }
}

function readTrackingFromSearchParams(params: URLSearchParams | null) {
  const tracking: Required<RequestTrackingFields> = {
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
  };
  if (!params) return tracking;

  for (const [fieldName, paramName] of trackingParams) {
    tracking[fieldName] = cleanTrackingValue(params.get(paramName));
  }

  return tracking;
}

export function getRequestTracking(request: Request) {
  const baseUrl = request.url;
  const candidates = [
    request.url,
    request.headers.get("referer"),
    request.headers.get("x-rejuvera-current-url"),
  ];
  const merged: Required<RequestTrackingFields> = {
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
  };

  for (const candidate of candidates) {
    const tracking = readTrackingFromSearchParams(
      getSearchParams(candidate, baseUrl),
    );
    for (const [fieldName] of trackingParams) {
      if (!merged[fieldName] && tracking[fieldName]) {
        merged[fieldName] = tracking[fieldName];
      }
    }
  }

  return merged;
}

export function mergeRequestTracking<T extends RequestTrackingFields>(
  payload: T,
  request: Request,
) {
  const tracking = getRequestTracking(request);
  return {
    ...payload,
    utmSource: cleanTrackingValue(payload.utmSource) || tracking.utmSource,
    utmMedium: cleanTrackingValue(payload.utmMedium) || tracking.utmMedium,
    utmCampaign:
      cleanTrackingValue(payload.utmCampaign) || tracking.utmCampaign,
    utmContent: cleanTrackingValue(payload.utmContent) || tracking.utmContent,
  };
}
