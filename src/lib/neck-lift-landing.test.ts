import assert from "node:assert/strict";
import test from "node:test";
import { improveFocusedLanding } from "./focused-landing.ts";
import {
  improveNeckLiftLanding,
  NECK_LIFT_GALLERY,
} from "./neck-lift-landing.ts";
import { sanitizeHtml } from "./sanitize-html.ts";
import {
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_NUMBER,
  LANDING_PAGE_WHATSAPP_MESSAGE,
} from "./clinic-contact.ts";

// The live page uses the generic builder form (no rvx-form class), unlike the other landings.
const form = `<form class="rv-builder-lead-form-fields" data-rejuvera-guard="1" action="/api/leads" method="post"><input type="hidden" name="formRenderedAt" value="1793115168160"><input type="hidden" name="landingPageSlug" value="lp-face-neck-lift"><div aria-hidden="true" style="position:absolute!important"><label>Company<input type="text" name="rv_hp_field" tabindex="-1" autocomplete="off"></label></div><input type="hidden" name="source" value="شد الوجه والرقبة - صفحة هبوط"><label><span>الاسم الكامل</span><input name="fullName" autocomplete="name" required placeholder="الاسم الثلاثي"></label><label><span>رقم الجوال</span><input name="phone" type="tel" required minlength="10" maxlength="13"></label><button type="submit">إرسال طلب</button></form>`;
const source = `<div class="rvx-page"><section><h2>شد الوجه والرقبة</h2><img src="/hero-old-illustration.webp" alt="old hero"></section><section><h2>لمحة سريعة</h2><div>1 أطباء مناسبون</div><div>حسب الخطة أجهزة مرتبطة</div></section><section>${form}</section><section id="landing-guide">Repeated content</section></div>`;
const slug = "lp-face-neck-lift";

test("the CMS lead form is preserved byte-for-byte and nothing executable is added", () => {
  const result = improveNeckLiftLanding(source, slug);
  const actual = result.match(/<form\b[\s\S]*?<\/form>/g)!;
  assert.equal(actual.length, 1);
  assert.equal(actual[0], form);
  assert.doesNotMatch(
    result,
    /onclick|onsubmit|<script|dataLayer|gtag\(|fbq\(|snaptr\(|oaiq\(/,
  );
});

test("template leftovers are dropped; the clinic's own neck and double-chin pairs are shown", () => {
  const result = improveNeckLiftLanding(source, slug);
  assert.doesNotMatch(
    result,
    /hero-old-illustration|أطباء مناسبون|أجهزة مرتبطة|لمحة سريعة|Repeated content/,
  );
  assert.equal(NECK_LIFT_GALLERY.length, 4);
  for (const [src] of NECK_LIFT_GALLERY) {
    assert.match(
      src,
      /^https:\/\/pub-[0-9a-f]+\.r2\.dev\/gallery\/[0-9a-f]+-image-\d+\.webp$/,
    );
    assert.ok(result.includes(src), `missing gallery image: ${src}`);
  }
  assert.match(result, /fl-gallery/);
  assert.doesNotMatch(result, /fl-gallery--single/);
  for (const caption of ["شد الرقبة", "شفط اللغلوغ"])
    assert.ok(
      result.includes(`<figcaption>${caption}</figcaption>`),
      `missing caption: ${caption}`,
    );
  assert.match(result, /ولا تمثل ضمانًا لنتيجتك/);
});

test("structure and contact links: one H1, eight sections, three tel and three wa.me", () => {
  const result = improveNeckLiftLanding(source, slug);
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
  assert.equal(improveNeckLiftLanding(source, "facelift-riyadh"), source);
  assert.equal(
    improveNeckLiftLanding("<h1>Different page</h1>", slug),
    "<h1>Different page</h1>",
  );
  assert.equal(improveNeckLiftLanding(source + form, slug), source + form);
  const result = improveNeckLiftLanding(source, slug);
  assert.equal(improveNeckLiftLanding(result, slug), result);
  const routed = improveFocusedLanding(source, slug);
  assert.match(routed, /data-focused-landing="neck-lift"/);
  assert.doesNotMatch(routed, /data-facelift-optimized/);
});

test("Dr. Loai is featured with only sourced facts and the clinic's own service links", () => {
  const clean = sanitizeHtml(improveNeckLiftLanding(source, slug));
  const profile = clean.match(
    /<section[^>]*id="dr-loai"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(profile);
  for (const sourced of [
    "البورد الكندي والزمالة الأمريكية",
    "جامعة بنسلفانيا",
    "UT Southwestern",
    "الأطباء المرتبطين بخدمات شد الرقبة وشفط اللغلوغ وشد الوجه والرقبة",
  ])
    assert.ok(profile.includes(sourced), `missing: ${sourced}`);
  assert.match(clean, /plasticsurgery\.org\/cosmetic-procedures\/neck-lift/);
});

test("high-intent neck and jawline language, honest limits and no invented claims", () => {
  const result = improveNeckLiftLanding(source, slug);
  const text = result.replace(/<[^>]+>/g, " ");
  for (const phrase of [
    "شد الرقبة",
    "تحديد الفك",
    "شفط اللغلوغ",
    "حبال",
    "الندبات",
    "كم سعر شد الرقبة",
    "كم تكلفة شد الرقبة",
    "لا توقف التقدم في العمر",
    "لا يعطي نتيجتها عند الترهل الواضح",
  ])
    assert.ok(text.includes(phrase), `missing phrase: ${phrase}`);
  assert.doesNotMatch(
    text,
    /رئيس قسم|Fox Chase|نتائج مضمونة|أفضل (?:دكتور|جراح|مركز)|\d[\d,.]*\s*(?:ريال|ر\.س|SAR)|خصم\s*\d|بدون ألم|بدون جراحة/,
  );
  for (const href of Array.from(result.matchAll(/href="(\/[^"]+)"/g)).map(
    (m) => m[1]!,
  )) {
    assert.match(
      href,
      /^\/(services\/(neck-lift-surgery|double-chin-liposuction|face-neck-lift)|doctors\/loai-alsalmi|p\/facelift-riyadh|journal\/(skin-tightening-options-guide|face-neck-lift-threads-fillers)|gallery)$/,
    );
  }
});

test("the page hands the facelift keywords to the facelift page", () => {
  const result = improveNeckLiftLanding(source, slug);
  const h1 = result.match(/<h1>([\s\S]*?)<\/h1>/)![1]!;
  assert.match(h1, /شد الرقبة وتحديد الفك/);
  assert.doesNotMatch(h1, /الفيس لفت|ميني فيس لفت|ديب بلين/);
});
