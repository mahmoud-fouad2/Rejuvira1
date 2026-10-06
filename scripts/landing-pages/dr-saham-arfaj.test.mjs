import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSahamLandingPage,
  sahamLandingServices,
  seedSahamLandingPage,
  SAHAM_LANDING_SLUG,
} from "./dr-saham-arfaj.mjs";

const doctor = {
  slug: "saham-arfaj",
  nameAr: "د. سهام العرفج",
  titleAr: "استشارية جراحة التجميل والترميم",
  status: "PUBLISHED",
  photoUrl: "/media/doctors/saham-arfaj.webp",
  services: [
    { slug: "tummy-tuck", nameAr: "عملية شد البطن", status: "PUBLISHED" },
    { slug: "neck-lift-surgery", nameAr: "شد الرقبة", status: "DRAFT" },
    { slug: "unrelated-service", nameAr: "خدمة أخرى", status: "PUBLISHED" },
  ],
};

test("an existing CMS page or alias is preserved, including unpublished pages", async () => {
  let doctorReads = 0;
  let writes = 0;
  const prisma = {
    customPage: {
      findFirst: async ({ where }) => {
        assert.deepEqual(where.OR, [
          { slug: SAHAM_LANDING_SLUG },
          { seoSlug: SAHAM_LANDING_SLUG },
        ]);
        return { id: "existing-draft" };
      },
      upsert: async () => {
        writes += 1;
      },
    },
    doctor: {
      findUnique: async () => {
        doctorReads += 1;
        return doctor;
      },
    },
  };
  assert.equal(
    (await seedSahamLandingPage(prisma)).reason,
    "existing-page-preserved",
  );
  assert.equal(doctorReads, 0);
  assert.equal(writes, 0);
});

test("no physician landing page is created for a missing or unpublished physician", async () => {
  for (const record of [null, { ...doctor, status: "DRAFT" }]) {
    let writes = 0;
    const prisma = {
      customPage: {
        findFirst: async () => null,
        upsert: async () => {
          writes += 1;
        },
      },
      doctor: { findUnique: async () => record },
    };
    assert.equal(
      (await seedSahamLandingPage(prisma)).reason,
      "published-doctor-required",
    );
    assert.equal(writes, 0);
  }
});

test("new page creation is idempotent without updating a concurrently created page", async () => {
  let data;
  const prisma = {
    customPage: {
      findFirst: async () => null,
      upsert: async (input) => {
        data = input;
      },
    },
    doctor: {
      findUnique: async (input) => {
        assert.equal(input.where.slug, doctor.slug);
        assert.deepEqual(input.include.services.where, { status: "PUBLISHED" });
        return doctor;
      },
    },
  };
  assert.equal((await seedSahamLandingPage(prisma)).created, true);
  assert.deepEqual(data.update, {});
  assert.equal(data.create.status, "PUBLISHED");
  assert.equal(data.create.noindex, false);
  assert.equal(data.create.leadWebhookEnabled, false);
  assert.match(
    data.create.htmlContent,
    /name="source" value="صفحة الدكتورة سهام العرفج/,
  );
});

test("service links, form choices and specific questions follow published physician relationships", () => {
  assert.deepEqual(
    sahamLandingServices(doctor).map((service) => service.slug),
    ["tummy-tuck"],
  );
  const html = buildSahamLandingPage(doctor);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.match(html, /action="\/api\/leads"/);
  assert.match(html, /<option value="tummy-tuck">/);
  assert.match(html, /href="\/services\/tummy-tuck"/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /أفضل دكتورة شد بطن/);
  assert.doesNotMatch(
    html,
    /<option value="neck-lift-surgery">|\/services\/neck-lift-surgery|ما أفضل حل لشد الوجه/,
  );
  assert.doesNotMatch(html, /unrelated-service/);
});

test("CMS strings cannot introduce HTML or executable attributes", () => {
  const html = buildSahamLandingPage({
    ...doctor,
    nameAr: '<script>alert("name")</script>',
    photoUrl: 'image.webp" onerror="alert(1)',
    services: [],
  });
  assert.doesNotMatch(html, /<script\b| onerror="/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /id="saham-services"/);
  assert.match(html, /value="general-inquiry"/);
});
