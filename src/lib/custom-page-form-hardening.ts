import {
  LEAD_HONEYPOT_FIELD,
  LEAD_RENDERED_AT_FIELD,
} from "@/lib/lead-intake-guard";
import {
  SAUDI_MOBILE_INPUT_PATTERN,
  SAUDI_MOBILE_INPUT_TITLE,
} from "@/lib/saudi-phone";

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function hasAttr(attrs: string, name: string) {
  return new RegExp(`\\b${name}\\s*=`, "i").test(attrs);
}

function ensureAttr(attrs: string, name: string, value: string) {
  if (hasAttr(attrs, name)) return attrs;
  return `${attrs} ${name}="${escapeAttr(value)}"`;
}

function formGuardFields(renderedAt: number, pageSlug?: string) {
  return [
    `<input type="hidden" name="${LEAD_RENDERED_AT_FIELD}" value="${renderedAt}">`,
    `<input type="hidden" name="pageUrl" value="">`,
    `<input type="hidden" name="referrerUrl" value="">`,
    ...(pageSlug
      ? [
          `<input type="hidden" name="landingPageSlug" value="${escapeAttr(pageSlug)}">`,
        ]
      : []),
    `<div aria-hidden="true" style="position:absolute!important;left:-10000px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important;">`,
    `<label>Company<input type="text" name="${LEAD_HONEYPOT_FIELD}" tabindex="-1" autocomplete="off"></label>`,
    `</div>`,
  ].join("");
}

function hardenPhoneInput(match: string, attrs: string) {
  const isSelfClosing = /\/\s*>$/.test(match);
  let nextAttrs = isSelfClosing ? attrs.replace(/\/\s*$/, "") : attrs;
  nextAttrs = ensureAttr(nextAttrs, "type", "tel");
  nextAttrs = ensureAttr(nextAttrs, "inputmode", "tel");
  nextAttrs = ensureAttr(nextAttrs, "autocomplete", "tel");
  nextAttrs = ensureAttr(nextAttrs, "minlength", "10");
  nextAttrs = ensureAttr(nextAttrs, "maxlength", "13");
  nextAttrs = ensureAttr(nextAttrs, "pattern", SAUDI_MOBILE_INPUT_PATTERN);
  nextAttrs = ensureAttr(nextAttrs, "title", SAUDI_MOBILE_INPUT_TITLE);
  nextAttrs = ensureAttr(nextAttrs, "dir", "ltr");
  const closingSlash = isSelfClosing ? " /" : "";
  return `<input${nextAttrs}${closingSlash}>`;
}

function shouldRewriteUnsafeAction(attrs: string) {
  const action = attrs.match(/\baction\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const value = (action?.[1] ?? action?.[2] ?? action?.[3] ?? "").trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      /(^|\.)make\.com$|(^|\.)integromat\.com$|(^|\.)zapier\.com$|(^|\.)pipedream\.net$|^hook\./i.test(
        url.hostname,
      )
    );
  } catch {
    return false;
  }
}

function ensureSafeLeadAction(attrs: string) {
  let nextAttrs = attrs;
  if (shouldRewriteUnsafeAction(nextAttrs)) {
    nextAttrs = nextAttrs.replace(
      /\saction\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i,
      "",
    );
  }
  nextAttrs = ensureAttr(nextAttrs, "action", "/api/leads");
  nextAttrs = ensureAttr(nextAttrs, "method", "post");
  return nextAttrs;
}

export function hardenCustomPageLeadForms(
  html: string,
  renderedAt = Date.now(),
  pageSlug?: string,
) {
  if (!html || !/<form\b/i.test(html)) return html;

  const withGuardedForms = html.replace(
    /<form\b([^>]*)>/gi,
    (match: string, attrs: string) => {
      if (hasAttr(attrs, "data-rejuvera-guard")) return match;
      const safeAttrs = ensureSafeLeadAction(
        ensureAttr(attrs, "data-rejuvera-guard", "1"),
      );
      return `<form${safeAttrs}>${formGuardFields(renderedAt, pageSlug)}`;
    },
  );

  return withGuardedForms.replace(
    /<input\b([^>]*\bname\s*=\s*(?:"phone"|'phone'|phone)[^>]*)>/gi,
    hardenPhoneInput,
  );
}
