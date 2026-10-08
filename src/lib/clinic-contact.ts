export const CLINIC_PHONE_DISPLAY = "0553999514";
export const CLINIC_PHONE_TEL = `tel:${CLINIC_PHONE_DISPLAY}`;
export const CLINIC_WHATSAPP_DISPLAY = "0114999959";
export const CLINIC_WHATSAPP_NUMBER = `966${CLINIC_WHATSAPP_DISPLAY.slice(1)}`;
export const CLINIC_WHATSAPP_URL = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}`;
export const LANDING_PAGE_PHONE_DISPLAY = CLINIC_PHONE_DISPLAY;
export const LANDING_PAGE_PHONE_TEL = CLINIC_PHONE_TEL;
export const LANDING_PAGE_WHATSAPP_MESSAGE =
  "مرحبًا، أرغب في تنسيق موعد استشارة في مركز ريجوفيرا.";
export const LANDING_PAGE_GOOGLE_REFERRAL = "لقد عثرت عليكم من Google";

/** Add the requested landing-page prefill, not an analytics attribution signal. */
export function withGoogleWhatsappReferral(href: string) {
  try {
    const url = new URL(href.replace(/&(?:amp|#38|#x26);/gi, "&"));
    if (!/^https?:$/.test(url.protocol)) return href;
    const isPhoneLink =
      (url.hostname === "wa.me" && /^\/\+?\d+\/?$/.test(url.pathname)) ||
      (["api.whatsapp.com", "whatsapp.com", "www.whatsapp.com"].includes(
        url.hostname,
      ) &&
        /^\/send\/?$/.test(url.pathname));
    if (!isPhoneLink) return href;
    const message =
      url.searchParams.get("text")?.trim() || LANDING_PAGE_WHATSAPP_MESSAGE;
    if (!message.includes(LANDING_PAGE_GOOGLE_REFERRAL)) {
      url.searchParams.set(
        "text",
        `${message} ${LANDING_PAGE_GOOGLE_REFERRAL}.`,
      );
    }
    return url.toString();
  } catch {
    return href;
  }
}

/** Applied only by /p/[slug], so existing CMS pages need no content overwrite. */
export function addLandingPageWhatsappReferralHtml(html: string) {
  return html.replace(
    /(<a\b[^>]*?\s)href=(['"])([^'"]*)\2/gi,
    (match, before: string, quote: string, href: string) => {
      const updated = withGoogleWhatsappReferral(href);
      if (updated === href) return match;
      return `${before}href=${quote}${updated.replace(/&/g, "&amp;")}${quote}`;
    },
  );
}

/** WhatsApp requires international digits, not a Saudi local trunk prefix. */
export function clinicWhatsappHref(number: string, message?: string) {
  const digits = number.replace(/\D/g, "").replace(/^00/, "");
  if (!digits) return null;
  const international = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;
  return `https://wa.me/${international}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

const LEGACY_CALL_NUMBERS = [
  "0112723402",
  "920017403",
  CLINIC_WHATSAPP_DISPLAY,
] as const;

function formattedPhonePattern(value: string) {
  return value.split("").join("[\\s().+-]*");
}

function normalizeCallLabel(value: string) {
  let normalized = value;
  for (const number of LEGACY_CALL_NUMBERS) {
    normalized = normalized.replace(
      new RegExp(formattedPhonePattern(number), "g"),
      LANDING_PAGE_PHONE_DISPLAY,
    );
  }
  return normalized;
}

/**
 * Imported landing pages may contain historical clinic contact links. Keep
 * their copy and WhatsApp message, but route every public clinic CTA to the
 * currently approved number.
 */
export function normalizeClinicContactHtml(html: string) {
  if (!html) return html;

  const normalized = html
    .replace(
      /href=(['"])tel:[^'"\s>]+\1/gi,
      (_match, quote: string) =>
        `href=${quote}${LANDING_PAGE_PHONE_TEL}${quote}`,
    )
    .replace(
      /href=(['"])(https?:\/\/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|(?:www\.)?whatsapp\.com\/send\?phone=))\+?\d+([^'"]*)\1/gi,
      (_match, quote: string, prefix: string, suffix: string) => {
        const separator = suffix.startsWith("?")
          ? "?"
          : suffix.startsWith("&")
            ? "?"
            : "";
        const cleanSuffix = suffix.replace(/^[?&]/, "");
        const query = cleanSuffix ? `${separator}${cleanSuffix}` : "";
        return `href=${quote}${CLINIC_WHATSAPP_URL}${query}${quote}`;
      },
    )
    .replace(
      /(<a\b[^>]*href=(['"])tel:0553999514\2[^>]*>)([\s\S]*?)(<\/a>)/gi,
      (_match, open: string, _quote: string, label: string, close: string) =>
        `${open}${normalizeCallLabel(label)}${close}`,
    );

  return normalized;
}
