import {
  stripDuplicateSnapBootstrap,
  stripDuplicateSnapBootstraps,
} from "./snap-integration.ts";
import type { GoogleTagConfig } from "./google-tag.ts";

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

/** Head and body share the same verified Snap/GTM bootstrap owner. */
export function normalizeIntegrationSnippets(
  head: string,
  body: string,
  googleTagConfig?: GoogleTagConfig | null,
) {
  const [customHeadCode, customBodyCode] = stripDuplicateSnapBootstraps(
    [head, body].map(stripRetiredAwarenessCampaign),
  ).map((html) =>
    html.replace(/https?:\/\/faheemly\.com/g, "https://www.faheemly.com"),
  ).map((html) =>
    // The root Google tag already loads this Ads destination from its config.
    // Retain the inline config and conversion calls, plus every GTM snippet.
    googleTagConfig?.kind === "gtag"
      ? html.replace(
          /<script\s+async(?:=["'](?:async)?["'])?\s+src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-16511038360["']\s*>\s*<\/script\s*>/gi,
          "",
        )
      : html,
  );
  return { customHeadCode: customHeadCode!, customBodyCode: customBodyCode! };
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
