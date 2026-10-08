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
  LANDING_PAGE_GOOGLE_REFERRAL,
  withGoogleWhatsappReferral,
  addLandingPageWhatsappReferralHtml,
} from "./clinic-contact.ts";

test("site and landing pages share the approved call number without changing WhatsApp", () => {
  assert.equal(CLINIC_PHONE_DISPLAY, "0553999514");
  assert.equal(CLINIC_PHONE_TEL, "tel:0553999514");
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
    '<a href="tel:0114999959">011 499 9959</a><a href="https://wa.me/966920017403?text=hello">WhatsApp</a>',
  );
  assert.match(html, /href="tel:0553999514"/);
  assert.match(html, />0553999514</);
  assert.match(html, /href="https:\/\/wa\.me\/966114999959\?text=hello"/);
  assert.doesNotMatch(html, /tel:0114999959|966920017403/);
});

test("landing-page call normalization does not change WhatsApp labels", () => {
  const html = normalizeClinicContactHtml(
    '<a href="https://wa.me/966114999959">0114999959</a>',
  );
  assert.match(html, /href="https:\/\/wa\.me\/966114999959"/);
  assert.match(html, />0114999959<\/a>/);
});

test("landing WhatsApp prefill appends Google once and keeps the existing phone and text", () => {
  const href = `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(LANDING_PAGE_WHATSAPP_MESSAGE)}&app_absent=0`;
  const updated = withGoogleWhatsappReferral(href);
  const url = new URL(updated);
  assert.equal(url.pathname, "/966114999959");
  assert.equal(
    url.searchParams.get("text"),
    `${LANDING_PAGE_WHATSAPP_MESSAGE} ${LANDING_PAGE_GOOGLE_REFERRAL}.`,
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
      `${message} ${LANDING_PAGE_GOOGLE_REFERRAL}.`,
    );
    assert.equal(url.searchParams.get("type"), "phone_number");
  }
  assert.equal(
    new URL(withGoogleWhatsappReferral(CLINIC_WHATSAPP_URL)).searchParams.get(
      "text",
    ),
    `${LANDING_PAGE_WHATSAPP_MESSAGE} ${LANDING_PAGE_GOOGLE_REFERRAL}.`,
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
      new URL(href).searchParams
        .get("text")
        ?.includes(LANDING_PAGE_GOOGLE_REFERRAL),
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
