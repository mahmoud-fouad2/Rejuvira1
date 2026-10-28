import assert from "node:assert/strict";
import test from "node:test";
import { improveBodyContouringLanding } from "./body-contouring-landing.ts";
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

const form = `<form class="rvx-form" data-rejuvera-guard="1" action="/api/leads" method="post"><input name="fullName" required minlength="3"><input name="phone" type="tel" required pattern="(?:\\+?966|0)?5[0-9]{8}"><select name="serviceSlug" required><option value="vaser-liposuction">شفط الدهون بالفيزر</option><option value="body-contouring-360">نحت الجسم 360</option></select><input name="preferredLanguage" type="hidden" value="ar"><input name="source" type="hidden" value="Landing page - Body Contouring"><input name="landingPageSlug" type="hidden" value="body-contouring-riyadh"><div class="rvx-hp" aria-hidden="true"><input type="text" name="rv_hp_field"></div><button class="rvx-submit" type="submit">إرسال طلب الاستشارة</button><p class="rvx-privacy">بإرسال الطلب، أنت توافق على تواصل فريق ريجوفيرا معك</p></form>`;
const gallery = `<section class="rvx-section"><h2>أمثلة توضيحية قبل وبعد</h2>${[1, 2, 3, 4, 5, 6].map((n) => `<img src="https://cdn.example/gallery/body-${n}.webp" alt="body ${n}">`).join("")}</section>`;
const source = `<div class="rvx-page" data-layout="canvas" data-header="false" data-footer="false"><style>.rvx-hero{padding:90px}</style><section class="rvx-hero">${form}</section>${gallery}<section class="rv-landing-guide" id="landing-guide-body-contouring-riyadh">Repeated content</section></div>`;
const slug = "body-contouring-riyadh";

test("the CMS lead form keeps every field and hidden attribution; only the button words change", () => {
  const result = improveBodyContouringLanding(source, slug);
  const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
  assert.equal(actual.length, 1);
  assert.equal(formSkeleton(actual[0]!), formSkeleton(form));
  assert.match(
    actual[0]!,
    /<button class="rvx-submit" type="submit">احجز استشارة نحت القوام الآن ←<\/button>/,
  );
  // The consent line is never rewritten.
  assert.ok(
    actual[0]!.includes(
      '<p class="rvx-privacy">بإرسال الطلب، أنت توافق على تواصل فريق ريجوفيرا معك</p>',
    ),
  );
  assert.doesNotMatch(
    result,
    /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(/,
  );
});

test("existing before/after assets are reused (first four) and never multiplied", () => {
  const result = improveBodyContouringLanding(source, slug);
  for (const n of [1, 2, 3, 4])
    assert.ok(result.includes(`/gallery/body-${n}.webp`));
  assert.doesNotMatch(result, /body-[56]\.webp/);
  assert.match(result, /تختلف النتائج من شخص لآخر/);
  assert.doesNotMatch(result, /Repeated content/);
  assert.equal((result.match(/<section\b/g) ?? []).length, 8);
  assert.equal((result.match(/<h1>/g) ?? []).length, 1);
});

test("contact links come from central constants with the neutral landing message", () => {
  const result = improveBodyContouringLanding(source, slug);
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

test("only this slug is re-rendered; unknown layouts fail safely and the result is stable", () => {
  assert.equal(improveBodyContouringLanding(source, "facelift-riyadh"), source);
  assert.equal(
    improveBodyContouringLanding("<h1>Different page</h1>", slug),
    "<h1>Different page</h1>",
  );
  assert.equal(
    improveBodyContouringLanding(source + form, slug),
    source + form,
  );
  const result = improveBodyContouringLanding(source, slug);
  assert.equal(improveBodyContouringLanding(result, slug), result);
});

test("the dispatcher routes each supported slug to its own renderer only", () => {
  const body = improveFocusedLanding(source, slug);
  assert.match(body, /data-focused-landing="body-contouring"/);
  assert.doesNotMatch(body, /data-facelift-optimized/);
  const face = improveFocusedLanding(source, "facelift-riyadh");
  assert.match(face, /data-facelift-optimized="1"/);
  assert.doesNotMatch(face, /data-focused-landing/);
  assert.equal(improveFocusedLanding(source, "dr-saham-arfaj"), source);
});

test("Dr. Loai is featured with sourced credentials and Dr. Saham keeps her own card", () => {
  const clean = sanitizeHtml(improveBodyContouringLanding(source, slug));
  const profile = clean.match(
    /<section[^>]*id="dr-loai"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(profile);
  assert.match(
    profile,
    /<img src="\/media\/doctors\/loai-alsalmi\.webp"[^>]*width="800" height="800" loading="lazy"/,
  );
  for (const sourced of [
    "البورد الكندي والزمالة الأمريكية",
    "جامعة بنسلفانيا",
    "UT Southwestern",
    "مدينة الملك فهد الطبية",
  ])
    assert.ok(profile.includes(sourced), `missing credential: ${sourced}`);
  assert.match(profile, /href="\/doctors\/saham-arfaj"/);
  assert.match(profile, /\/media\/doctors\/saham-arfaj\.webp/);
  assert.match(profile, /ينسّق لك الفريق الموعد مع الاستشاري الأنسب/);
});

test("high-intent body-contouring language is present in warm, aspirational wording", () => {
  const text = visibleText(improveBodyContouringLanding(source, slug));
  for (const phrase of [
    "الفيزر",
    "شفط الدهون",
    "نحت الجسم 360",
    "شد البطن",
    "للرجال",
    "المشد",
    "كم سعر شفط الدهون ونحت الجسم",
    "بدون جراحة",
    "تجارب الآخرين",
    "ابدأ رحلة التناسق واكتشف الخطة الأنسب لقوامك",
    "احجز استشارة نحت القوام الآن",
    "انسيابية",
  ])
    assert.ok(text.includes(phrase), `missing phrase: ${phrase}`);
});

test("no invented prices, rankings, guarantees, paperwork phrases or external links", () => {
  const result = improveBodyContouringLanding(source, slug);
  assertLandingCopyRules(result);
  assert.doesNotMatch(
    visibleText(result),
    /رئيس قسم|Fox Chase|الأول في|\d[\d,.]*\s*(?:ريال|ر\.س|SAR)|خصم\s*\d/,
  );
});

test("sanitization keeps the form, internal links and the guide placement", () => {
  const clean = sanitizeHtml(improveBodyContouringLanding(source, slug));
  assert.match(clean, /action="\/api\/leads" method="post"/);
  assert.match(clean, /href="#consultation-form"/);
  assert.match(clean, /href="\/services\/tummy-tuck"/);
  assert.match(clean, /href="\/services\/arm-lift"/);
  assert.match(clean, /href="\/doctors\/loai-alsalmi"/);
  assert.equal((clean.match(/<details>/g) ?? []).length, 9);
  assert.ok(
    clean.indexOf('id="body-search-guide"') >
      clean.indexOf('id="body-questions"'),
  );
});
