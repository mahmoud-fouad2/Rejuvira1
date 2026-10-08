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
  for (const number of ["0114999959", "+966 11 499 9959", "00966114999959", "966114999959", "114999959"]) {
    assert.equal(clinicWhatsappHref(number, message), expected);
  }
  assert.equal(clinicWhatsappHref(""), null);
  assert.equal(clinicWhatsappHref(CLINIC_WHATSAPP_DISPLAY), CLINIC_WHATSAPP_URL);
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
