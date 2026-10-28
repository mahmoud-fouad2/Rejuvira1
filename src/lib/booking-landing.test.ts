import assert from "node:assert/strict";
import test from "node:test";
import { improveBookingLanding } from "./booking-landing.ts";
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

const form = `<form class="rv-builder-lead-form-fields" data-rejuvera-guard="1" action="/api/leads" method="post"><div aria-hidden="true" style="position:absolute!important;width:1px!important;"><label>Company<input type="text" name="rv_hp_field" tabindex="-1" autocomplete="off"></label></div><label><span>الاسم الكامل</span><input name="fullName" autocomplete="name" required=""></label><label><span>رقم الجوال</span><input name="phone" type="tel" required="" pattern="(?:05[0-9]{8})"></label><label><span>الخدمة المطلوبة</span><select name="serviceSlug" required=""><option value="">اختاري الخدمة</option><option value="general">استفسار عام</option></select></label><input type="hidden" name="landingPageSlug" value="rejuvera-booking"><input type="hidden" name="gclid" value="sample_click"><button type="submit">إرسال الطلب</button><p class="rv-custom-page__privacy-note">بإرسال الطلب، أنت توافق</p></form>`;
const source = `<div class="rv-builder-page"><section>${form}</section><section><h2>اعرفي الخيار الأنسب لحالتك</h2><p>نص قديم مكرر</p></section></div>`;

// Every route the page links to must exist on the live site (verified 200 in the 2026-10 crawl).
const KNOWN_ROUTES = new Set([
  "/",
  "/p/facelift-riyadh",
  "/p/body-contouring-riyadh",
  "/p/dr-maher-alahdab",
  "/p/breast-surgery-riyadh",
  "/p/najwa-batarfi",
  "/p/dr-natali-domloj",
  "/doctors/loai-alsalmi",
  "/doctors/maher-alahdab",
  "/doctors/saham-arfaj",
  "/doctors/najwa-batarfi",
  "/journal/choose-plastic-surgeon-riyadh",
  "/journal/prepare-for-aesthetic-consultation",
  "/privacy",
]);

test("the CMS lead form keeps every field and hidden attribution; only the button words change", () => {
  for (const slug of ["book", "rejuvera-booking"]) {
    const result = improveBookingLanding(source, slug);
    const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
    assert.equal(actual.length, 1);
    assert.equal(formSkeleton(actual[0]!), formSkeleton(form));
    assert.match(
      actual[0]!,
      /<button type="submit">احجز استشارتك الخاصة الآن ←<\/button>/,
    );
    assert.ok(
      actual[0]!.includes(
        '<p class="rv-custom-page__privacy-note">بإرسال الطلب، أنت توافق</p>',
      ),
    );
    assert.ok(actual[0]!.includes('name="gclid" value="sample_click"'));
    assert.doesNotMatch(
      result,
      /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(/,
    );
  }
});

test("only the booking routes are re-rendered; odd layouts fail safely; result is stable", () => {
  assert.equal(improveBookingLanding(source, "facelift-riyadh"), source);
  assert.equal(
    improveBookingLanding("<h1>Different page</h1>", "book"),
    "<h1>Different page</h1>",
  );
  assert.equal(improveBookingLanding(source + form, "book"), source + form);
  const noAction = source.replace('action="/api/leads"', 'action="/elsewhere"');
  assert.equal(improveBookingLanding(noAction, "book"), noAction);
  const result = improveBookingLanding(source, "book");
  assert.equal(improveBookingLanding(result, "book"), result);
  assert.doesNotMatch(result, /نص قديم مكرر/);
});

test("the dispatcher sends the booking slugs to this renderer only", () => {
  const result = improveFocusedLanding(source, "rejuvera-booking");
  assert.match(result, /data-focused-landing="booking"/);
  assert.doesNotMatch(result, /data-facelift-optimized/);
  assert.equal(improveFocusedLanding(source, "dr-maher-alahdab"), source);
});

test("structure: one H1, five sections, contact links use central constants", () => {
  const result = improveBookingLanding(source, "book");
  assert.equal((result.match(/<h1>/g) ?? []).length, 1);
  assert.equal((result.match(/<section\b/g) ?? []).length, 5);
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
  const result = improveBookingLanding(source, "book");
  const hrefs = Array.from(result.matchAll(/href="([^"]+)"/g)).map(
    (m) => m[1]!,
  );
  for (const href of hrefs) {
    if (
      href.startsWith("#") ||
      href.startsWith("tel:") ||
      href.startsWith("https://")
    )
      continue;
    assert.ok(KNOWN_ROUTES.has(href), `unknown internal link: ${href}`);
  }
  for (const known of [
    "/p/facelift-riyadh",
    "/p/body-contouring-riyadh",
    "/p/najwa-batarfi",
  ])
    assert.ok(hrefs.includes(known), `missing link to ${known}`);
});

test("copy is a private concierge voice, message-matched to the ads, with no unverifiable claims", () => {
  const result = improveBookingLanding(source, "book");
  const text = visibleText(result);
  for (const phrase of [
    "استشاريي التجميل في الرياض",
    "الإنصات لأولوياتك الجمالية",
    "احجز استشارتك الخاصة الآن",
    "شد الوجه",
    "تجميل الأنف",
    "شفط الدهون",
    "التجميل النسائي",
    "رسوم الاستشارة",
  ])
    assert.ok(text.includes(phrase), `missing phrase: ${phrase}`);
  assertLandingCopyRules(result);
  assert.doesNotMatch(
    text,
    /رئيس قسم|الأول في|\d[\d,.]*\s*(?:ريال|ر\.س|SAR)|خصم\s*\d|نورة|العتيبي|سعوديون بخبرة عالمية/,
  );
});

test("sanitization keeps the form, the team tiles and the guide after the questions", () => {
  const clean = sanitizeHtml(improveBookingLanding(source, "book"));
  assert.match(clean, /action="\/api\/leads" method="post"/);
  assert.match(clean, /name="rv_hp_field"/);
  assert.equal((clean.match(/class="fl-team-tile"/g) ?? []).length, 4);
  assert.equal((clean.match(/<details>/g) ?? []).length, 7);
  assert.ok(
    clean.indexOf('id="booking-search-guide"') >
      clean.indexOf('id="booking-questions"'),
  );
});
