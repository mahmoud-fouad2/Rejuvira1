export const CLINIC_PHONE_DISPLAY = "0114999959";
export const CLINIC_PHONE_TEL = "tel:0114999959";
export const CLINIC_WHATSAPP_NUMBER = "966114999959";
export const CLINIC_WHATSAPP_URL = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}`;
export const LANDING_PAGE_PHONE_DISPLAY = "0553999514";
export const LANDING_PAGE_PHONE_TEL = `tel:${LANDING_PAGE_PHONE_DISPLAY}`;

const LEGACY_CALL_NUMBERS = [
  "0112723402",
  "920017403",
  CLINIC_PHONE_DISPLAY,
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
