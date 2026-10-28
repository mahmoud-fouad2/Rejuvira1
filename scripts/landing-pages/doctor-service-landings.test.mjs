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
    assert.match(html, /href="tel:0114999959"/);
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
test("booking card speaks to its audience and keeps every lead field", () => {
  const [natali, abdullah] = doctorServiceLandings;
  const nataliHtml = buildDoctorServiceLanding(natali);
  const abdullahHtml = buildDoctorServiceLanding(abdullah);
  assert.match(nataliHtml, />احجزي استشارتك الخاصة<\/button>/);
  assert.match(abdullahHtml, />احجز استشارتك الخاصة<\/button>/);
  assert.doesNotMatch(abdullahHtml, /احجزي|تحدّثي|تتمنين/);
  for (const html of [nataliHtml, abdullahHtml]) {
    assert.match(html, /name="source" value="صفحة [^"]+ - طلب استشارة"/);
    assert.match(html, /name="message" value="طلب موعد مع [^"]+"/);
    assert.match(html, /name="fullName"[^>]*required/);
    assert.match(html, /name="phone"[^>]*required/);
    assert.match(html, /وفق <a href="\/privacy">سياسة الخصوصية<\/a>/);
  }
});
test("public copy is reassuring: no paperwork lines, no reading lists, nothing leads off the clinic's pages", () => {
  for (const profile of doctorServiceLandings) {
    const html = buildDoctorServiceLanding(profile);
    assert.doesNotMatch(html, /لا يعني تأكيد|وصف أفضل|أفضل دكتور|ساعات العمل|مراجع للقراءة|اسأل|ناقش|وفق التوفر/);
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);
    assert.ok(hrefs.every((href) => /^(#|\/|tel:|https:\/\/wa\.me\/)/.test(href)), hrefs.join(" "));
    assert.equal("sources" in profile, false);
  }
});
