import { stripDuplicateSnapBootstrap } from "./snap-integration.ts";

/** Retire only the standalone October card, preserving adjacent integrations. */
export function stripRetiredAwarenessCampaign(html: string): string {
  return html.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi,
    (element, code: string) => {
      const standaloneCampaign =
        /^\s*\(function\s*\(\)\s*\{\s*function\s+addRejuveraBreastCancerCard\b/.test(
          code,
        ) &&
        /\}\)\(\);?\s*$/.test(code) &&
        code.includes("rejuvera-breast-awareness");
      const hasMeasurement =
        /\b(?:gtag|fbq|snaptr|oaiq|ttq|dataLayer)\b|googletagmanager|google-analytics/i.test(
          code,
        );
      return standaloneCampaign && !hasMeasurement ? "" : element;
    },
  );
}

/** No executable text is evaluated or compiled during normalization. */
export function normalizeIntegrationHtml(html: string): string {
  return stripDuplicateSnapBootstrap(
    stripRetiredAwarenessCampaign(html),
  ).replace(/https?:\/\/faheemly\.com/g, "https://www.faheemly.com");
}

/** Only the facelift route opts out of the two known promotional widgets. */
export function isFaceliftDistraction(content: string): boolean {
  // Never discard a combined custom snippet containing measurement code.
  if (
    /\b(?:gtag|fbq|snaptr|oaiq|ttq)\b|googletagmanager|google-analytics/i.test(
      content,
    )
  )
    return false;
  return /rejuvera-breast-awareness|https?:\/\/(?:www\.)?faheemly\.com\/api\/widget\/loader\.js/i.test(
    content,
  );
}
