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

function formGuardFields(renderedAt: number) {
  return [
    `<input type="hidden" name="${LEAD_RENDERED_AT_FIELD}" value="${renderedAt}">`,
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

export function hardenCustomPageLeadForms(html: string, renderedAt = Date.now()) {
  if (!html || !/<form\b/i.test(html)) return html;

  const withGuardedForms = html.replace(
    /<form\b([^>]*)>/gi,
    (match: string, attrs: string) => {
      if (hasAttr(attrs, "data-rejuvera-guard")) return match;
      return `<form${ensureAttr(attrs, "data-rejuvera-guard", "1")}>${formGuardFields(renderedAt)}`;
    },
  );

  return withGuardedForms.replace(
    /<input\b([^>]*\bname\s*=\s*(?:"phone"|'phone'|phone)[^>]*)>/gi,
    hardenPhoneInput,
  );
}
