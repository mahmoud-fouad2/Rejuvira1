import assert from "node:assert/strict";
import test from "node:test";
import { improveBreastSurgeryLanding } from "./breast-surgery-landing.ts";
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

const form = `<form class="rvx-form" data-rejuvera-guard="1" action="/api/leads" method="post"><input name="fullName" required minlength="3"><input name="phone" type="tel" required pattern="(?:\\+?966|0)?5[0-9]{8}"><select name="serviceSlug" required><option value="breast-augmentation-reshaping">تكبير الصدر</option><option value="breast-lift">شد الصدر</option></select><input name="source" type="hidden" value="Landing page - Breast Surgery"><input name="landingPageSlug" type="hidden" value="breast-surgery-riyadh"><div class="rvx-hp" aria-hidden="true"><input type="text" name="rv_hp_field"></div><button class="rvx-submit" type="submit">إرسال طلب الاستشارة</button></form>`;
const gallery = (n: number) =>
  `<section><h2>أمثلة توضيحية قبل وبعد</h2>${Array.from({ length: n }, (_, i) => `<img src="https://cdn.example/breast-${i + 1}.webp" alt="breast ${i + 1}">`).join("")}</section>`;
const source = (n = 2) =>
  `<div class="rvx-page"><section class="rvx-hero">${form}<img src="/hero-wrong-facelift.webp" alt="wrong hero image"></section>${gallery(n)}<section id="landing-guide">Repeated content</section></div>`;
const slug = "breast-surgery-riyadh";

test("the CMS lead form keeps every field and hidden attribution; only the button words change", () => {
  const result = improveBreastSurgeryLanding(source(), slug);
  const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
  assert.equal(actual.length, 1);
  assert.equal(formSkeleton(actual[0]!), formSkeleton(form));
  assert.match(
    actual[0]!,
    /<button class="rvx-submit" type="submit">تنسيق استشارتك الخاصة ←<\/button>/,
  );
  assert.doesNotMatch(
    result,
    /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(/,
  );
});

test("only the before/after section images are reused: one pair for two images, two for four", () => {
  const one = improveBreastSurgeryLanding(source(2), slug);
  assert.ok(one.includes("breast-1.webp") && one.includes("breast-2.webp"));
  assert.match(one, /fl-gallery fl-gallery--single/);
  // The CMS hero slot held an unrelated facelift photo: it must not be carried over.
  assert.doesNotMatch(one, /hero-wrong-facelift|Repeated content/);
  const two = improveBreastSurgeryLanding(source(6), slug);
  for (const n of [1, 2, 3, 4]) assert.ok(two.includes(`breast-${n}.webp`));
  assert.doesNotMatch(two, /breast-[56]\.webp/);
  assert.doesNotMatch(two, /fl-gallery--single/);
  const none = improveBreastSurgeryLanding(source(0), slug);
  assert.match(none, /نعرض لك أمثلة تناسب حالتك خلال جلستك الاستشارية/);
});

test("structure and contact links: one H1, eight sections, three tel and three wa.me", () => {
  const result = improveBreastSurgeryLanding(source(), slug);
  assert.equal((result.match(/<h1>/g) ?? []).length, 1);
  assert.equal((result.match(/<section\b/g) ?? []).length, 8);
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

test("only this slug is re-rendered; odd layouts fail safely; result is stable", () => {
  assert.equal(
    improveBreastSurgeryLanding(source(), "body-contouring-riyadh"),
    source(),
  );
  assert.equal(
    improveBreastSurgeryLanding("<h1>Different page</h1>", slug),
    "<h1>Different page</h1>",
  );
  assert.equal(
    improveBreastSurgeryLanding(source() + form, slug),
    source() + form,
  );
  const result = improveBreastSurgeryLanding(source(), slug);
  assert.equal(improveBreastSurgeryLanding(result, slug), result);
  const routed = improveFocusedLanding(source(), slug);
  assert.match(routed, /data-focused-landing="breast-surgery"/);
});

test("Dr. Loai and Dr. Saham are featured with only sourced facts; breast services come from the clinic's own list", () => {
  const clean = sanitizeHtml(improveBreastSurgeryLanding(source(), slug));
  const profile = clean.match(
    /<section[^>]*id="dr-loai"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(profile);
  for (const sourced of [
    "البورد الكندي والزمالة الأمريكية",
    "جامعة بنسلفانيا",
    "UT Southwestern",
    "تكبير وتنسيق الصدر وشد الصدر وتصغير الصدر وتغيير حشوات الصدر",
  ])
    assert.ok(profile.includes(sourced), `missing: ${sourced}`);
  assert.match(profile, /href="\/doctors\/saham-arfaj"/);
  assert.match(profile, /ينسّق لك الفريق الموعد مع الجرّاح الأنسب/);
});

test("elegant, private and reassuring breast-surgery language; no invented claims or leaks", () => {
  const result = improveBreastSurgeryLanding(source(), slug);
  const text = visibleText(result);
  for (const phrase of [
    "شد الصدر",
    "تصغير الصدر",
    "تكبير الصدر",
    "تغيير الحشوات",
    "الحمل والرضاعة",
    "الندبات",
    "التثدي",
    "كم تكلفة جراحات الصدر",
    "تناسق أنثوي راقٍ",
    "خصوصية وسرية تامة",
    "تنسيق استشارتك الخاصة",
  ])
    assert.ok(text.includes(phrase), `missing phrase: ${phrase}`);
  assertLandingCopyRules(result);
  assert.doesNotMatch(
    text,
    /رئيس قسم|Fox Chase|الأول في|\d[\d,.]*\s*(?:ريال|ر\.س|SAR)|خصم\s*\d/,
  );
  for (const href of Array.from(result.matchAll(/href="(\/[^"]+)"/g)).map(
    (m) => m[1]!,
  )) {
    assert.match(
      href,
      /^\/(services\/(breast-augmentation-reshaping|breast-implant-replacement|breast-reduction|breast-lift|gynecomastia-surgery)|doctors\/(loai-alsalmi|saham-arfaj))$/,
    );
  }
});
