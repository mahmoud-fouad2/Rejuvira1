import assert from "node:assert/strict";
import test from "node:test";
import { buildDoctorServiceLanding, doctorServiceLandings, seedDoctorServiceLandings } from "./doctor-service-landings.mjs";

test("existing CMS pages and aliases are never overwritten", async () => {
  const results = await seedDoctorServiceLandings({ customPage: {
    findFirst: async ({ where }) => { assert.equal(where.OR.length, 2); return { id: "draft" }; },
    upsert: async () => assert.fail("must not overwrite"),
  } });
  assert.ok(results.every((result) => result.reason === "existing-page-preserved"));
});
test("Natali requires a published record; Abdullah contains only owner-confirmed scope", async () => {
  const writes = [];
  const results = await seedDoctorServiceLandings({ doctor: { findUnique: async () => ({ status: "DRAFT" }) }, customPage: { findFirst: async () => null, upsert: async (input) => writes.push(input) } });
  assert.equal(results[0].reason, "published-doctor-required");
  assert.equal(writes.length, 1);
  const page = writes[0];
  assert.equal(page.create.slug, "dr-abdullah-alfakhri");
  assert.deepEqual(page.update, {});
  assert.equal(page.create.leadWebhookEnabled, false);
  assert.equal(page.create.status, "PUBLISHED");
  assert.doesNotMatch(page.create.htmlContent, /سنة خبرة|استشاري|البورد|إبر الرغبة|تكبير القضيب|نتائج مضمونة/);
});
test("forms reuse the existing lead pipeline without new tracking or medical intake", () => {
  for (const profile of doctorServiceLandings) {
    const html = buildDoctorServiceLanding(profile);
    assert.match(html, /method="post" action="\/api\/leads"/);
    assert.match(html, /name="serviceSlug" value="general-inquiry"/);
    assert.match(html, /href="tel:0553999514"/);
    assert.match(html, /https:\/\/wa.me\/966114999959/);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(html, /<script|dataLayer|gtag\(|snaptr\(|textarea|type="email"/);
    assert.match(html, /href="\/privacy"/);
    assert.ok(profile.seoTitle.length <= 65);
  }
});
test("published Natali identity is used and HTML-escaped", async () => {
  const writes = [];
  await seedDoctorServiceLandings({ doctor: { findUnique: async () => ({ status: "PUBLISHED", slug: "natali-domloj", nameAr: "ناتالي <", photoUrl: "/photo.webp" }) }, customPage: { findFirst: async () => null, upsert: async (input) => writes.push(input) } });
  assert.equal(writes.length, 2);
  assert.match(writes[0].create.htmlContent, /ناتالي &lt;/);
  assert.match(writes[0].create.htmlContent, /src="\/photo.webp"/);
  assert.deepEqual(writes[0].update, {});
});
