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

function forceAttr(attrs: string, name: string, value: string) {
  const strippedAttrs = attrs.replace(
    new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "i"),
    "",
  );
  return `${strippedAttrs} ${name}="${escapeAttr(value)}"`;
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

function ensureSafeLeadAction(attrs: string) {
  return forceAttr(forceAttr(attrs, "action", "/api/leads"), "method", "post");
}

function neutralizePrematureLeadSubmitTracking(html: string) {
  return html.replace(
    /\bevent\s*:\s*(["'])lead_submit\1/g,
    'event:$1lead_attempt$1',
  );
}

export function hardenCustomPageLeadForms(
  html: string,
  renderedAt = Date.now(),
  pageSlug?: string,
) {
  if (!html || !/<form\b/i.test(html)) return html;

  const withGuardedForms = neutralizePrematureLeadSubmitTracking(html).replace(
    /<form\b([^>]*)>/gi,
    (match: string, attrs: string) => {
      const safeAttrs = ensureSafeLeadAction(
        ensureAttr(attrs, "data-rejuvera-guard", "1"),
      );
      if (hasAttr(attrs, "data-rejuvera-guard")) return `<form${safeAttrs}>`;
      return `<form${safeAttrs}>${formGuardFields(renderedAt, pageSlug)}`;
    },
  );

  return withGuardedForms.replace(
    /<input\b([^>]*\bname\s*=\s*(?:"phone"|'phone'|phone)[^>]*)>/gi,
    hardenPhoneInput,
  );
}
