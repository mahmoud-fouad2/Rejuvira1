export type GoogleTagConfig =
  | {
      kind: "gtag";
      id: string;
      scriptUrl: string;
    }
  | {
      kind: "gtm";
      id: string;
      scriptUrl: string;
      noscriptUrl: string;
    };

const GTM_ID_RE = /^GTM-[A-Z0-9]+$/i;
const GOOGLE_TAG_ID_RE = /^(?:G|GT|AW|DC)-[A-Z0-9-]+$/i;

function canonicalId(value: string) {
  return value.trim().toUpperCase();
}

function configFromId(rawId: string): GoogleTagConfig | null {
  const id = canonicalId(rawId);
  if (GTM_ID_RE.test(id)) {
    return {
      kind: "gtm",
      id,
      scriptUrl: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`,
      noscriptUrl: `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`,
    };
  }
  if (GOOGLE_TAG_ID_RE.test(id)) {
    return {
      kind: "gtag",
      id,
      scriptUrl: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
    };
  }
  return null;
}

function idFromSnippet(value: string) {
  return (
    value.match(/GTM-[A-Z0-9]+/i)?.[0] ??
    value.match(/\b(?:G|GT|AW|DC)-[A-Z0-9-]+\b/i)?.[0] ??
    null
  );
}

export function normalizeGoogleTagConfig(value?: string | null) {
  const input = value?.trim() ?? "";
  if (!input) return null;

  const direct = configFromId(input);
  if (direct) return direct;

  try {
    const url = new URL(input);
    if (
      url.protocol === "https:" &&
      url.hostname === "www.googletagmanager.com"
    ) {
      const id = url.searchParams.get("id");
      if (
        id &&
        (url.pathname === "/gtag/js" ||
          url.pathname === "/gtm.js" ||
          url.pathname === "/ns.html")
      ) {
        return configFromId(id);
      }
    }
  } catch {
    const id = idFromSnippet(input);
    return id ? configFromId(id) : null;
  }

  return null;
}

export function normalizeGoogleTagValue(value?: string | null) {
  const config = normalizeGoogleTagConfig(value);
  return config?.scriptUrl ?? "";
}
