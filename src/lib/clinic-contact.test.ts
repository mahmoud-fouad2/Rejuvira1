import assert from "node:assert/strict";
import test from "node:test";

import {
  CLINIC_PHONE_DISPLAY,
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_DISPLAY,
  CLINIC_WHATSAPP_URL,
  LANDING_PAGE_PHONE_DISPLAY,
  LANDING_PAGE_PHONE_TEL,
  normalizeClinicContactHtml,
  clinicWhatsappHref,
  LANDING_PAGE_WHATSAPP_MESSAGE,
  withGoogleWhatsappReferral,
  addLandingPageWhatsappReferralHtml,
} from "./clinic-contact.ts";

test("site and landing pages share the official number for calls and WhatsApp", () => {
  assert.equal(CLINIC_PHONE_DISPLAY, "0114999959");
  assert.equal(CLINIC_PHONE_TEL, "tel:0114999959");
  assert.equal(LANDING_PAGE_PHONE_DISPLAY, CLINIC_PHONE_DISPLAY);
  assert.equal(LANDING_PAGE_PHONE_TEL, CLINIC_PHONE_TEL);
  assert.equal(CLINIC_WHATSAPP_DISPLAY, "0114999959");
  assert.equal(CLINIC_WHATSAPP_URL, "https://wa.me/966114999959");
});

test("doctor WhatsApp CTAs normalize the configured number and preserve the message", () => {
  const message = "أرغب في حجز استشارة";
  const expected = `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  for (const number of [
    "0114999959",
    "+966 11 499 9959",
    "00966114999959",
    "966114999959",
    "114999959",
  ]) {
    assert.equal(clinicWhatsappHref(number, message), expected);
  }
  assert.equal(clinicWhatsappHref(""), null);
  assert.equal(
    clinicWhatsappHref(CLINIC_WHATSAPP_DISPLAY),
    CLINIC_WHATSAPP_URL,
  );
});

test("imported page contact CTAs use the approved clinic number", () => {
  const html = normalizeClinicContactHtml(
    '<a href="tel:0553999514">055 399 9514</a><a href="tel:0112723402">011 272 3402</a><a href="tel:920017403">920 017 403</a><a href="https://wa.me/966920017403?text=hello">WhatsApp</a>',
  );
  assert.equal((html.match(/href="tel:0114999959"/g) ?? []).length, 3);
  assert.equal((html.match(/>0114999959</g) ?? []).length, 3);
  assert.match(html, /href="https:\/\/wa\.me\/966114999959\?text=hello"/);
  assert.doesNotMatch(html, /0553999514|0112723402|920017403/);
});

test("landing-page call normalization does not change WhatsApp labels", () => {
  const html = normalizeClinicContactHtml(
    '<a href="https://wa.me/966114999959">0114999959</a>',
  );
  assert.match(html, /href="https:\/\/wa\.me\/966114999959"/);
  assert.match(html, />0114999959<\/a>/);
});

test("landing WhatsApp prefill preserves the message without claiming a traffic source", () => {
  const href = `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(LANDING_PAGE_WHATSAPP_MESSAGE)}&app_absent=0`;
  const updated = withGoogleWhatsappReferral(href);
  const url = new URL(updated);
  assert.equal(url.pathname, "/966114999959");
  assert.equal(
    url.searchParams.get("text"),
    LANDING_PAGE_WHATSAPP_MESSAGE,
  );
  assert.equal(url.searchParams.get("app_absent"), "0");
  assert.equal(withGoogleWhatsappReferral(updated), updated);
});

test("landing WhatsApp links keep custom messages and support escaped API query parameters", () => {
  const message = "أرغب في حجز استشارة";
  for (const host of ["api.whatsapp.com", "whatsapp.com", "www.whatsapp.com"]) {
    const href = `https://${host}/send/?phone=966114999959&amp;text=${encodeURIComponent(message)}&amp;type=phone_number`;
    const url = new URL(withGoogleWhatsappReferral(href));
    assert.equal(url.searchParams.get("phone"), "966114999959");
    assert.equal(
      url.searchParams.get("text"),
      message,
    );
    assert.equal(url.searchParams.get("type"), "phone_number");
  }
  assert.equal(
    new URL(withGoogleWhatsappReferral(CLINIC_WHATSAPP_URL)).searchParams.get(
      "text",
    ),
    LANDING_PAGE_WHATSAPP_MESSAGE,
  );
});

test("previously generated Google claims are removed without losing page context or custom text", () => {
  const context = {
    pageTitle: "صفحة الاستشارة",
    pageUrl: "https://rejuvera.sa/p/sample-page?utm_source=facebook#booking",
  };
  const message = "مرحبًا، أريد تنسيق استشارة.";
  const legacyMessage = `${message} لقد عثرت عليكم من Google.\nجئت من صفحة: ${context.pageTitle}.\nرابط الصفحة: https://rejuvera.sa/p/sample-page`;
  const original = `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(legacyMessage)}&app_absent=0`;
  const updated = withGoogleWhatsappReferral(original, context);
  const url = new URL(updated);
  const text = url.searchParams.get("text")!;
  assert.ok(text.startsWith(message));
  assert.doesNotMatch(text, /Google|utm_source|facebook|#booking/);
  assert.equal(text.split(`جئت من صفحة: ${context.pageTitle}.`).length, 2);
  assert.equal(text.split("https://rejuvera.sa/p/sample-page").length, 2);
  assert.equal(url.searchParams.get("app_absent"), "0");
  assert.equal(withGoogleWhatsappReferral(updated, context), updated);
  assert.equal(
    new URL(
      withGoogleWhatsappReferral(
        `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent("لقد عثرت عليكم من Google.")}`,
      ),
    ).searchParams.get("text"),
    LANDING_PAGE_WHATSAPP_MESSAGE,
  );
});

test("landing HTML updates every WhatsApp anchor without touching form, call, label or tracking attributes", () => {
  const untouched =
    '<form action="/api/leads" method="post"><input name="name"></form><a href="tel:0553999514" data-track="phone">اتصال</a>';
  const html = `${untouched}<a class="hero" href="${CLINIC_WHATSAPP_URL}" data-track="whatsapp">واتساب</a><a href='${CLINIC_WHATSAPP_URL}?text=hello&amp;app_absent=0' class='sticky'>واتساب</a>`;
  const updated = addLandingPageWhatsappReferralHtml(html);
  assert.ok(updated.startsWith(untouched));
  assert.match(updated, /data-track="whatsapp">واتساب<\/a>/);
  const hrefs = Array.from(
    updated.matchAll(/href=(['"])(https[^'"]*)\1/g),
    (match) => (match[2] ?? "").replace(/&amp;/g, "&"),
  );
  assert.equal(hrefs.length, 2);
  assert.ok(
    hrefs.every((href) =>
      !new URL(href).searchParams.get("text")?.includes("Google"),
    ),
  );
  assert.equal(addLandingPageWhatsappReferralHtml(updated), updated);
});

test("Google WhatsApp prefill does not modify unrelated or invalid URLs", () => {
  for (const href of [
    "tel:0553999514",
    "/contact",
    "https://example.com/send?text=hello",
    "https://wa.me/channel/123",
    "https://wa.me.evil.example/966114999959",
    "javascript:alert(1)",
  ]) {
    assert.equal(withGoogleWhatsappReferral(href), href);
  }
});

test("landing messages identify the public doctor/page, preserve custom copy and do not duplicate source", () => {
  for (const pageTitle of [
    "شد الوجه والرقبة بالرياض | د. لؤي السالمي",
    "د. سهام العرفج — استشارة جراحة التجميل",
    "د. كريمة جمجوم | النساء والولادة",
    "ناتالي دوملوج | هيدرافيشيال وفراكشنال ليزر",
    "نحت الجسم وشفط الدهون في الرياض | ريجوفيرا",
  ]) {
    const context = {
      pageTitle,
      pageUrl: "https://rejuvera.sa/p/sample-page?gclid=private-click#booking",
    };
    const original = `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent("مرحبًا، أريد تنسيق استشارة.")}&app_absent=0`;
    const updated = withGoogleWhatsappReferral(original, context);
    const url = new URL(updated);
    const text = url.searchParams.get("text")!;
    assert.ok(text.startsWith("مرحبًا، أريد تنسيق استشارة."));
    assert.ok(text.includes(`جئت من صفحة: ${pageTitle}.`));
    assert.ok(text.includes("رابط الصفحة: https://rejuvera.sa/p/sample-page"));
    assert.doesNotMatch(text, /Google/);
    assert.doesNotMatch(text, /gclid|private-click|#booking/);
    assert.equal(url.pathname, "/966114999959");
    assert.equal(url.searchParams.get("app_absent"), "0");
    assert.equal(withGoogleWhatsappReferral(updated, context), updated);
  }
});

test("every CMS WhatsApp CTA gets the same page source without changing forms, phone or tracking", () => {
  const context = {
    pageTitle: 'د. لؤي "السالمي"',
    pageUrl: "https://rejuvera.sa/p/facelift-riyadh",
  };
  const untouched =
    '<form action="/api/leads"><input name="phone"></form><a href="tel:0553999514">اتصال</a>';
  const input = `${untouched}<a href="${CLINIC_WHATSAPP_URL}" data-track="whatsapp">واتساب</a><a href='https://api.whatsapp.com/send?phone=966114999959&amp;text=hello' class='sticky'>واتساب</a>`;
  const updated = addLandingPageWhatsappReferralHtml(input, context);
  assert.ok(updated.startsWith(untouched));
  assert.match(updated, /data-track="whatsapp">واتساب/);
  const hrefs = [...updated.matchAll(/href=(['"])(https[^'"]*)\1/g)];
  assert.equal(hrefs.length, 2);
  for (const href of hrefs) {
    const message = new URL(href[2]!.replace(/&amp;/g, "&")).searchParams.get(
      "text",
    )!;
    assert.ok(message.includes(context.pageTitle));
    assert.ok(message.includes(context.pageUrl));
  }
  assert.equal(addLandingPageWhatsappReferralHtml(updated, context), updated);
  assert.equal(
    withGoogleWhatsappReferral("tel:0553999514", context),
    "tel:0553999514",
  );
});
