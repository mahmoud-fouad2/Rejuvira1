import assert from "node:assert/strict";
import test from "node:test";
import { improveTiktokLanding } from "./tiktok-landing.ts";
import { improveFocusedLanding } from "./focused-landing.ts";
import {
  assertLandingCopyRules,
  formSkeleton,
  visibleText,
} from "./landing-copy-rules.ts";
import { sanitizeHtml } from "./sanitize-html.ts";
import {
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_NUMBER,
  LANDING_PAGE_WHATSAPP_MESSAGE,
} from "./clinic-contact.ts";

const form = `<form class="rv-builder-lead-form-fields" data-rejuvera-guard="1" action="/api/leads" method="post"><div aria-hidden="true" style="position:absolute!important;width:1px!important;"><label>Company<input type="text" name="rv_hp_field" tabindex="-1" autocomplete="off"></label></div><label><span>الاسم الكامل</span><input name="fullName" autocomplete="name" required=""></label><label><span>رقم الجوال</span><input name="phone" type="tel" required="" pattern="(?:05[0-9]{8})"></label><label><span>الخدمة المطلوبة</span><select name="serviceSlug" required=""><option value="">اختاري الخدمة</option><option value="face">شد الجسم الكامل</option></select></label><input type="hidden" name="landingPageSlug" value="tiktok-customer"><input type="hidden" name="gclid" value="sample_click"><button type="submit">إرسال الطلب</button></form>`;
const source = `<div class="rv-builder-page"><section>${form}</section><section><h2>بعض النتائج الحقيقيه</h2><img src="/old/result.webp" alt="نتيجة علاجية"></section><section><h2>اراء عملاؤنا</h2><p>تجربتي مع ريجوفيرا كانت ممتازة نورة السبيعي</p><p>هل يمكن تعديل الصفحة لاحقًا؟ نعم، يمكن تعديل البلوكات من لوحة التحكم.</p><p>12+ سنوات خبرة 100% متابعة منظمة</p></section></div>`;

const KNOWN_ROUTES = new Set([
  "/",
  "/p/facelift-riyadh",
  "/p/body-contouring-riyadh",
  "/p/dr-maher-alahdab",
  "/p/breast-surgery-riyadh",
  "/p/najwa-batarfi",
  "/p/dr-natali-domloj",
  "/doctors/loai-alsalmi",
  "/doctors/natali-domloj",
  "/doctors/saham-arfaj",
  "/journal/choose-plastic-surgeon-riyadh",
  "/journal/prepare-for-aesthetic-consultation",
]);

test("the CMS lead form keeps every field and hidden attribution; only the button words change", () => {
  for (const slug of ["tk", "tiktok-customer"]) {
    const result = improveTiktokLanding(source, slug);
    const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
    assert.equal(actual.length, 1);
    assert.equal(formSkeleton(actual[0]!), formSkeleton(form));
    assert.match(
      actual[0]!,
      /<button type="submit">لنكتشف الخطة الأنسب لك ←<\/button>/,
    );
    assert.ok(actual[0]!.includes('name="gclid" value="sample_click"'));
    assert.doesNotMatch(
      result,
      /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(|ttq\(/,
    );
  }
});

test("only the TikTok routes are re-rendered; odd layouts fail safely; result is stable", () => {
  assert.equal(improveTiktokLanding(source, "book"), source);
  assert.equal(
    improveTiktokLanding("<h1>Different page</h1>", "tk"),
    "<h1>Different page</h1>",
  );
  assert.equal(improveTiktokLanding(source + form, "tk"), source + form);
  const result = improveTiktokLanding(source, "tk");
  assert.equal(improveTiktokLanding(result, "tk"), result);
  const routed = improveFocusedLanding(source, "tiktok-customer");
  assert.match(routed, /data-focused-landing="tiktok"/);
});

test("admin leftovers, the unverified testimonial and invented statistics are not carried over", () => {
  const result = improveTiktokLanding(source, "tk");
  assert.doesNotMatch(
    result,
    /تعديل البلوكات|لوحة التحكم|نورة السبيعي|ممتازة|12\+|100%|\/old\/result\.webp|بعض النتائج الحقيقيه/,
  );
});

test("structure: one H1, six sections, central contact links", () => {
  const result = improveTiktokLanding(source, "tk");
  assert.equal((result.match(/<h1>/g) ?? []).length, 1);
  assert.equal((result.match(/<section\b/g) ?? []).length, 6);
  assert.equal((result.match(/href="tel:/g) ?? []).length, 3);
  assert.equal(
    (result.match(new RegExp(CLINIC_PHONE_TEL, "g")) ?? []).length,
    3,
  );
  const links = Array.from(
    result.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g),
  );
  assert.equal(links.length, 3);
  for (const link of links) {
    const url = new URL(link[1]!.replace(/&amp;/g, "&"));
    assert.equal(url.pathname, `/${CLINIC_WHATSAPP_NUMBER}`);
    assert.equal(url.searchParams.get("text"), LANDING_PAGE_WHATSAPP_MESSAGE);
  }
});

test("every internal link points at a known live route", () => {
  const result = improveTiktokLanding(source, "tk");
  for (const href of Array.from(result.matchAll(/href="([^"]+)"/g)).map(
    (m) => m[1]!,
  )) {
    if (
      href.startsWith("#") ||
      href.startsWith("tel:") ||
      href.startsWith("https://")
    )
      continue;
    assert.ok(KNOWN_ROUTES.has(href), `unknown internal link: ${href}`);
  }
});

test("copy turns the TikTok visitor's inspiration into a private consultation, without discouraging lines", () => {
  const result = improveTiktokLanding(source, "tk");
  const text = visibleText(result);
  for (const phrase of [
    "ألهمتك نتيجة على تيك توك؟ لنكتشف معًا ما يناسب ملامحك وقوامك",
    "شاركنا ما لفت انتباهك",
    "استشارة مخصصة لملامحك",
    "خطة واضحة ومريحة",
    "لنكتشف الخطة الأنسب لك",
    "السعر الحالي",
  ])
    assert.ok(text.includes(phrase), `missing phrase: ${phrase}`);
  // The discouraging "this result is not about you" framing is gone.
  assert.doesNotMatch(
    text,
    /لا تعنيك|لا تفترض|حالة واحدة|لا يحدد بنفسه|ما يناسبك قد يختلف/,
  );
  assertLandingCopyRules(result);
  assert.doesNotMatch(
    text,
    /رئيس قسم|الأول في|\d[\d,.]*\s*(?:ريال|ر\.س|SAR)|خصم\s*\d/,
  );
});

test("sanitization keeps the form, three team tiles and the guide after the questions", () => {
  const clean = sanitizeHtml(improveTiktokLanding(source, "tk"));
  assert.match(clean, /action="\/api\/leads" method="post"/);
  assert.equal((clean.match(/class="fl-team-tile"/g) ?? []).length, 3);
  assert.equal((clean.match(/<details>/g) ?? []).length, 6);
  assert.ok(
    clean.indexOf('id="tiktok-search-guide"') >
      clean.indexOf('id="tiktok-questions"'),
  );
});
