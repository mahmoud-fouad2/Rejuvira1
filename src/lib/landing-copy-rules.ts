import assert from "node:assert/strict";

/**
 * Copy rules every focused landing keeps: an aspirational, reassuring voice with no
 * paperwork phrases, no guarantees (Saudi MOH advertising rules) and no instructions
 * to the patient. Used by the renderer tests.
 */
export const BANNED_LANDING_COPY =
  /100\s*%|مضمون|ضمان|لن يلحظ|دون أن يلحظ|أفضل (?:دكتور|جراح|مركز|طبيب|عروض)|بدون ألم|مثالي|ثقة مطلقة|نخبة|وفق التوفر|ساعات العمل|أجهزة مرتبطة|أطباء مناسبون|لا يثبت|لا يعني تأكيد|بدل مقارنة|وصف «?أفضل|اكتب كذا/;

/** Visible text of the HTML (tags dropped). */
export const visibleText = (html: string) => html.replace(/<[^>]+>/g, " ");

export function assertLandingCopyRules(html: string) {
  assert.doesNotMatch(visibleText(html), BANNED_LANDING_COPY);
  // No ad leakage: only the clinic's own routes, anchors, tel and WhatsApp links.
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    assert.match(
      match[1]!,
      /^(\/|#|tel:|https:\/\/wa\.me\/)/,
      `external or unexpected link: ${match[1]}`,
    );
  }
}

/** Every tag and attribute of the form, ignoring the text between tags. */
export const formSkeleton = (form: string) => form.replace(/>[^<]*</g, "><");
