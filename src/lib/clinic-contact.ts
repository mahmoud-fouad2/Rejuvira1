export const CLINIC_PHONE_DISPLAY = "0114999959";
export const CLINIC_PHONE_TEL = `tel:${CLINIC_PHONE_DISPLAY}`;
export const CLINIC_WHATSAPP_DISPLAY = "0114999959";
export const CLINIC_WHATSAPP_NUMBER = `966${CLINIC_WHATSAPP_DISPLAY.slice(1)}`;
export const CLINIC_WHATSAPP_URL = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}`;
export const LANDING_PAGE_PHONE_DISPLAY = CLINIC_PHONE_DISPLAY;
export const LANDING_PAGE_PHONE_TEL = CLINIC_PHONE_TEL;
export const LANDING_PAGE_WHATSAPP_MESSAGE =
  "مرحبًا، أرغب في تنسيق موعد استشارة في مركز ريجوفيرا.";

export type LandingPageWhatsappContext = {
  pageTitle: string;
  pageUrl: string;
};

function parseWhatsappPhoneHref(href: string) {
  try {
    const url = new URL(href.replace(/&(?:amp|#38|#x26);/gi, "&"));
    if (!/^https?:$/.test(url.protocol)) return null;
    const isPhoneLink =
      (url.hostname === "wa.me" && /^\/\+?\d+\/?$/.test(url.pathname)) ||
      (["api.whatsapp.com", "whatsapp.com", "www.whatsapp.com"].includes(
        url.hostname,
      ) &&
        /^\/send\/?$/.test(url.pathname) &&
        /^\+?\d+$/.test(url.searchParams.get("phone") ?? ""));
    return isPhoneLink ? url : null;
  } catch {
    return null;
  }
}

/** Legacy helper name: add page context without claiming a traffic source. */
export function withGoogleWhatsappReferral(
  href: string,
  context?: LandingPageWhatsappContext,
) {
  const url = parseWhatsappPhoneHref(href);
  if (!url) return href;
  try {
    // Remove known source claims baked into older landing-page messages.
    // The public landing-page URL alone cannot establish how a visitor arrived.
    let message =
      url.searchParams
        .get("text")
        ?.replace(
          /(?:^|[ \t]+)لقد عثرت عليكم من Google\.?(?=\r?\n|$)/g,
          "",
        )
        .replace(
          /(?:^|\r?\n)[ \t]*المصدر:[ \t]*Google Ads[.!]?[ \t]*(?=\r?\n|$)/gi,
          "",
        )
        .trim() || LANDING_PAGE_WHATSAPP_MESSAGE;
    // Public page identity only: no query/click IDs, form values or patient data.
    if (context) {
      const page = new URL(context.pageUrl);
      const title = context.pageTitle
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);
      if (
        /^https?:$/.test(page.protocol) &&
        /^\/p\/[^/?#]+\/?$/.test(page.pathname)
      ) {
        const source = `جئت من صفحة: ${title || page.pathname}.`;
        const pageUrl = `${page.origin}${page.pathname}`;
        if (!message.includes(source)) message += `\n${source}`;
        if (!message.includes(pageUrl)) message += `\nرابط الصفحة: ${pageUrl}`;
      }
    }
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return href;
  }
}

/** Applied only by /p/[slug], so existing CMS pages need no content overwrite. */
export function addLandingPageWhatsappReferralHtml(
  html: string,
  context?: LandingPageWhatsappContext,
) {
  return html.replace(
    /(<a\b[^>]*?\s)href=(['"])([^'"]*)\2/gi,
    (match, before: string, quote: string, href: string) => {
      const updated = withGoogleWhatsappReferral(href, context);
      if (updated === href) return match;
      return `${before}href=${quote}${updated.replace(/&/g, "&amp;")}${quote}`;
    },
  );
}

/** Decorate sanitized landing links without changing their markup or destinations. */
export function brandLandingPageWhatsappLinks(html: string) {
  let hasWhatsapp = false;
  const brandedHtml = html.replace(
    /(<a\b[^>]*\shref=(['"])([^'"]*)\2[^>]*)>([\s\S]*?)<\/a>/gi,
    (match, opening: string, _quote: string, href: string, label: string) => {
      if (!parseWhatsappPhoneHref(href)) return match;
      hasWhatsapp = true;
      if (/\sdata-landing-whatsapp-cta=/.test(opening)) return match;
      const hasIcon = /<(?:img|svg)\b/i.test(label);
      const isFloatingButton =
        /\sclass=(['"])[^'"]*\brejuvera-google-whatsapp\b[^'"]*\1/.test(opening);
      // Icon cards and floating icon-only links have their own layout.
      if (hasIcon && !isFloatingButton) return match;
      const variant = hasIcon ? "with-icon" : "button";
      return `${opening} data-landing-whatsapp-cta="${variant}">${label}</a>`;
    },
  );
  return { html: brandedHtml, hasWhatsapp };
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
  "0553999514",
  "0112723402",
  "920017403",
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
      /(<a\b[^>]*href=(['"])tel:[^'"\s>]+\2[^>]*>)([\s\S]*?)(<\/a>)/gi,
      (_match, open: string, _quote: string, label: string, close: string) =>
        `${open}${normalizeCallLabel(label)}${close}`,
    );

  return normalized;
}
