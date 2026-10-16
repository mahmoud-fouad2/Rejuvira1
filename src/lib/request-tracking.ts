export type RequestTrackingFields = {
  utmSource?: string | undefined;
  utmMedium?: string | undefined;
  utmCampaign?: string | undefined;
  utmContent?: string | undefined;
  utmTerm?: string | undefined;
  gclid?: string | undefined;
  gbraid?: string | undefined;
  wbraid?: string | undefined;
};

const trackingParams = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmContent", "utm_content"],
  ["utmTerm", "utm_term"],
  ["gclid", "gclid"],
  ["gbraid", "gbraid"],
  ["wbraid", "wbraid"],
] as const;

function cleanTrackingValue(value: string | null | undefined) {
  const clean = value?.trim();
  return clean ? clean.slice(0, 250) : "";
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
    utmTerm: "",
    gclid: "",
    gbraid: "",
    wbraid: "",
  };
  if (!params) return tracking;

  for (const [fieldName, paramName] of trackingParams) {
    tracking[fieldName] = cleanTrackingValue(params.get(paramName));
  }

  return tracking;
}

function hasTracking(tracking: RequestTrackingFields) {
  return trackingParams.some(([fieldName]) => Boolean(tracking[fieldName]));
}

export function getRequestTracking(request: Request) {
  const baseUrl = request.url;
  const candidates = [
    request.url,
    request.headers.get("referer"),
    request.headers.get("x-rejuvera-current-url"),
  ];
  for (const candidate of candidates) {
    const tracking = readTrackingFromSearchParams(
      getSearchParams(candidate, baseUrl),
    );
    // Each URL represents one context; do not assemble a cohort across URLs.
    if (hasTracking(tracking)) return tracking;
  }

  return readTrackingFromSearchParams(null);
}

export function mergeRequestTracking<T extends RequestTrackingFields>(
  payload: T,
  request: Request,
) {
  const submitted = readTrackingFromSearchParams(null);
  for (const [fieldName] of trackingParams) {
    submitted[fieldName] = cleanTrackingValue(payload[fieldName]);
  }
  // Even a partial submitted context owns its whole cohort. Filling its gaps
  // from the current URL could attach a different campaign's click ID.
  const tracking = hasTracking(submitted)
    ? submitted
    : getRequestTracking(request);
  return {
    ...payload,
    ...tracking,
  };
}
