import assert from "node:assert/strict";
import test from "node:test";
import { improveFaceliftLanding } from "./facelift-landing.ts";
import { sanitizeHtml } from "./sanitize-html.ts";
import {
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_NUMBER,
  LANDING_PAGE_WHATSAPP_MESSAGE,
} from "./clinic-contact.ts";

const form = `<form class="rvx-form" data-rejuvera-guard="1" action="/api/leads" method="post"><input name="fullName" required minlength="3"><input name="phone" type="tel" required pattern="(?:\\+?966|0)?5[0-9]{8}"><select name="serviceSlug" required><option value="face-neck-lift">شد الوجه والرقبة</option></select><input name="source" type="hidden" value="Landing page - Face Lift"><input name="landingPageSlug" type="hidden" value="face-lift-riyadh"><input name="rv_hp_field" type="text"><input name="rv_rendered_at" type="hidden" value="1791700000000"><input name="gclid" type="hidden" value="sample_click"><button type="submit">إرسال طلب الاستشارة مع د. لؤي</button><p>إرسال الطلب لا يثبت الموعد تلقائيًا</p></form>`;
const gallery = `<section><h2>أمثلة توضيحية قبل وبعد</h2>${[1, 2, 3, 4, 5, 6].map((n) => `<img src="/gallery/case-${n}.webp" alt="case ${n}">`).join("")}</section>`;
const source = `<div id="rvx-page"><style>.rvx-hero{padding:90px}</style>${form}${gallery}<section id="landing-guide-facelift-riyadh">Repeated content</section></div>`;

test("the original three-field form and hidden attribution are unchanged", () => {
  const result = improveFaceliftLanding(source, "facelift-riyadh");
  const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
  assert.equal(actual.length, 1);
  assert.equal(actual[0], form);
  assert.doesNotMatch(actual[0]!, /facelift-timing|name="message"|اختر الوقت/);
  assert.doesNotMatch(
    result,
    /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(/,
  );
});
test("existing medical gallery assets are reused, not fabricated or attributed to new cases", () => {
  const result = improveFaceliftLanding(source, "facelift-riyadh");
  for (const n of [1, 2, 3, 4])
    assert.ok(result.includes(`/gallery/case-${n}.webp`));
  assert.doesNotMatch(result, /case-[56]\.webp/);
  assert.match(result, /لا تمثل ضمانًا/);
  assert.doesNotMatch(result, /Repeated content/);
  assert.equal((result.match(/<section\b/g) ?? []).length, 6);
  assert.equal((result.match(/<h1>/g) ?? []).length, 1);
});
test("all contact links use central numbers and a neutral booking message", () => {
  const result = improveFaceliftLanding(source, "facelift-riyadh");
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
test("only the known facelift page is enhanced; unknown CMS layouts fail safely", () => {
  assert.equal(
    improveFaceliftLanding(source, "body-contouring-riyadh"),
    source,
  );
  assert.equal(
    improveFaceliftLanding("<h1>Different page</h1>", "facelift-riyadh"),
    "<h1>Different page</h1>",
  );
  assert.equal(
    improveFaceliftLanding(source + form, "facelift-riyadh"),
    source + form,
  );
  const result = improveFaceliftLanding(source, "facelift-riyadh");
  assert.equal(improveFaceliftLanding(result, "facelift-riyadh"), result);
});
test("an existing message field is never replaced or duplicated", () => {
  const existing = source.replace(
    "</form>",
    '<textarea name="message">existing</textarea></form>',
  );
  const result = improveFaceliftLanding(existing, "facelift-riyadh");
  assert.equal((result.match(/name="message"/g) ?? []).length, 1);
  assert.doesNotMatch(result, /facelift-timing/);
});
test("sanitization preserves the original form and plain contact links", () => {
  const clean = sanitizeHtml(improveFaceliftLanding(source, "facelift-riyadh"));
  assert.match(clean, /action="\/api\/leads" method="post"/);
  assert.match(clean, /pattern="\(\?:\\\+\?966\|0\)\?5\[0-9\]\{8\}"/);
  assert.doesNotMatch(clean, /facelift-timing|name="message"/);
  assert.match(clean, /href="#consultation-form"/);
});

test("the supplied logo and visible natural search guide are scoped to this page", () => {
  const clean = sanitizeHtml(improveFaceliftLanding(source, "facelift-riyadh"));
  assert.match(clean, /src="\/media\/brand\/facelift-logo-02.png"/);
  assert.match(clean, /id="facelift-search-guide"/);
  assert.match(clean, /عملية شد الوجه في الرياض/);
  assert.match(clean, /ديب بلين/);
  assert.match(clean, /ميني فيس لفت/);
  assert.match(clean, /href="\/services\/face-neck-lift"/);
  assert.match(clean, /href="\/services\/neck-lift-surgery"/);
  assert.ok(
    clean.indexOf('id="facelift-search-guide"') >
      clean.indexOf('id="facelift-questions"'),
  );
});

test("the above-fold doctor image is not lazy-loaded and form bytes are preserved", () => {
  const result = improveFaceliftLanding(source, "facelift-riyadh");
  const clean = sanitizeHtml(result);
  assert.match(
    result,
    /<img[^>]*src="\/media\/doctors\/loai-alsalmi\.webp"[^>]*loading="eager"[^>]*fetchpriority="high"/,
  );
  assert.equal(result.match(/<form\b[\s\S]*?<\/form>/)?.[0], form);
  assert.match(clean, /loading="eager"[^>]*fetchpriority="high"/);
});

test("the measured LCP logo retains eager/high priority through sanitization", () => {
  const result = improveFaceliftLanding(source, "facelift-riyadh");
  const clean = sanitizeHtml(result);
  const logo = clean.match(
    /<img[^>]*src="\/media\/brand\/facelift-logo-02\.png"[^>]*>/,
  )?.[0];
  assert.ok(logo);
  assert.match(logo, /loading="eager"/);
  assert.match(logo, /fetchpriority="high"/);
  assert.match(logo, /width="562" height="563"/);
  assert.equal(result.match(/<form\b[\s\S]*?<\/form>/)?.[0], form);
});
