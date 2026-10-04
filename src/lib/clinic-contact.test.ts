import assert from "node:assert/strict";
import test from "node:test";

import { normalizeClinicContactHtml } from "./clinic-contact.ts";

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
