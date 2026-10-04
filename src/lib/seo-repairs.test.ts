import assert from "node:assert/strict";
import test from "node:test";
import {
  parseJournalText,
  parseJournalInline,
  hasEnglishJournalContent,
  publicationDateForSave,
  parseJournalPage,
  journalPagePath,
} from "./journal-content.ts";
import { publicServiceSlug } from "./public-service-slug.ts";
import { publicDeviceCertifications } from "./device-certifications.ts";
import { resolveServiceSeo, hasEnglishServiceContent } from "./service-seo.ts";
import { serviceSearchQuestions } from "./service-search-content.ts";
import {
  patientGuides,
  servicePatientGuide,
  serviceContentModifiedAt,
} from "./service-patient-guides.ts";
import { buildPublicDirectory } from "./public-directory.ts";
import {
  localizedSeoValues,
  seoLanguageFromUrl,
  hasEnglishDoctorContent,
} from "./seo-localization.ts";

test("legacy article markup becomes semantic blocks without losing its text", () => {
  assert.deepEqual(
    parseJournalText(
      "# العنوان<br><br>مقدمة **مهمة**<BR />سطر ثان<br><br>## الخيارات<br>- أول<br>- ثاني<br><br>### خطوات<br>1. استشارة<br>2) قرار<br>نهاية",
      "العنوان",
    ),
    [
      { kind: "paragraph", text: "مقدمة **مهمة** سطر ثان" },
      { kind: "heading", level: 2, text: "الخيارات" },
      { kind: "list", ordered: false, items: ["أول", "ثاني"] },
      { kind: "heading", level: 3, text: "خطوات" },
      { kind: "list", ordered: true, items: ["استشارة", "قرار"] },
      { kind: "paragraph", text: "نهاية" },
    ],
  );
  assert.deepEqual(parseJournalInline("قبل **مهم** بعد"), [
    { text: "قبل ", strong: false },
    { text: "مهم", strong: true },
    { text: " بعد", strong: false },
  ]);
});

test("plain journal text is never promoted to arbitrary HTML", () => {
  const text = "<script>alert(1)</script> <img src=x onerror=alert(2)>";
  assert.deepEqual(parseJournalText(text), [{ kind: "paragraph", text }]);
  assert.deepEqual(parseJournalInline("**<script>alert(1)</script>**"), [
    { text: "<script>alert(1)</script>", strong: true },
  ]);
  assert.equal(
    parseJournalInline("unmatched ** text")[0]?.text,
    "unmatched ** text",
  );
});

test("English article alternates require a title, excerpt, and body", () => {
  assert.equal(
    hasEnglishJournalContent({
      titleEn: "Title",
      excerptEn: "Summary",
      bodyEn: ["Body"],
    }),
    true,
  );
  for (const post of [
    { titleEn: "Title", excerptEn: "Summary" },
    { titleEn: "Title", bodyEn: ["Body"] },
    { excerptEn: "Summary", bodyEn: ["Body"] },
    { titleEn: "Title", excerptEn: "Summary", bodyEn: [" "] },
  ])
    assert.equal(hasEnglishJournalContent(post), false);
});

test("editing or republishing preserves the original publication date", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  const original = new Date("2025-01-01T00:00:00Z");
  assert.equal(publicationDateForSave("PUBLISHED", null, now), now);
  assert.equal(publicationDateForSave("PUBLISHED", original, now), undefined);
  assert.equal(publicationDateForSave("DRAFT", null, now), undefined);
  assert.equal(publicationDateForSave("DRAFT", original, now), undefined);
  assert.equal(original.toISOString(), "2025-01-01T00:00:00.000Z");
});

test("pagination rejects invalid and unsafe values and retains page-specific URLs", () => {
  assert.equal(parseJournalPage(undefined), 1);
  assert.equal(parseJournalPage("2"), 2);
  for (const value of ["0", "-1", "1.5", "1x", " 2", "02", "9007199254740992"])
    assert.equal(parseJournalPage(value), null);
  assert.equal(journalPagePath(1), "/journal");
  assert.equal(journalPagePath(2), "/journal?page=2");
});

test("only the verified broken service alias is redirected", () => {
  assert.equal(publicServiceSlug("عملية شد الصدر"), "breast-lift");
  for (const slug of ["breast-lift", "Liposuction", "face-neck", "شد الوجه"])
    assert.equal(publicServiceSlug(slug), slug);
});

test("supplier editorial instructions are omitted without inventing approvals", () => {
  assert.deepEqual(
    publicDeviceCertifications([
      "Existing certificate",
      "FDA clearance may apply. Add SFDA approval if available from the supplier.",
    ]),
    ["Existing certificate"],
  );
});

test("distinct services no longer inherit identical core titles while custom SEO survives", () => {
  const core = {
    slug: "facelift-surgery",
    seoTitleAr: "شد الوجه الجراحي",
    seoTitleEn: "Facelift",
    seoDescriptionAr: "وصف الجراحة",
    seoDescriptionEn: "Surgery description",
  };
  const service = {
    slug: "face-neck",
    name: "شد الوجه والرقبة",
    nameEn: "Face and neck lift",
    excerpt: "وصف الخدمة",
    excerptEn: "Service summary",
    descriptionEn: "Service detail",
    seoTitleAr: core.seoTitleAr,
    seoDescriptionAr: core.seoDescriptionAr,
  };
  const result = resolveServiceSeo(service, core);
  assert.equal(result.titleAr, "شد الوجه والرقبة | ريجوفيرا بالرياض");
  assert.equal(result.descriptionAr, service.excerpt);
  assert.equal(
    resolveServiceSeo({ ...service, slug: core.slug }, core).titleAr,
    core.seoTitleAr,
  );
  assert.equal(
    resolveServiceSeo({ ...service, seoTitleAr: "عنوان خاص" }, core).titleAr,
    "عنوان خاص",
  );
  assert.equal(hasEnglishServiceContent(service), true);
  assert.equal(
    hasEnglishServiceContent({ ...service, descriptionEn: null }),
    false,
  );
});

test("search questions target the published facelift and eyelid page slugs", () => {
  assert.ok(serviceSearchQuestions("face-neck-lift").length >= 5);
  assert.ok(serviceSearchQuestions("facelift-surgery").length >= 5);
  assert.equal(
    serviceSearchQuestions("eyelid-lift-eye-rejuvenation").length,
    4,
  );
  assert.equal(serviceSearchQuestions("unknown-service").length, 0);
});

test("URL language selects a single title and preserves pagination in self canonicals", () => {
  const input = {
    titleAr: "العنوان العربي",
    titleEn: "English title",
    descriptionAr: "الوصف",
    descriptionEn: "Summary",
    url: "https://rejuvera.sa/journal?page=2",
  };
  const ar = localizedSeoValues({ ...input, language: "ar" });
  const en = localizedSeoValues({ ...input, language: "en" });
  assert.equal(ar.title, input.titleAr);
  assert.equal(en.title, input.titleEn);
  assert.equal(ar.canonical, input.url);
  assert.equal(en.canonical, `${input.url}&lang=en`);
  assert.equal(en.languages.en, en.canonical);
  const untranslated = localizedSeoValues({
    ...input,
    language: "en",
    hasEnglish: false,
  });
  assert.equal(untranslated.title, input.titleAr);
  assert.equal(untranslated.canonical, input.url);
  assert.equal("en" in untranslated.languages, false);
  assert.equal(seoLanguageFromUrl("/services?lang=en"), "en");
  assert.equal(seoLanguageFromUrl(null), "ar");
  assert.equal(seoLanguageFromUrl("/services?lang=fr"), "ar");
  assert.equal(
    hasEnglishDoctorContent({ nameEn: "Name", specialtyEn: "Specialty" }),
    false,
  );
  assert.equal(
    hasEnglishDoctorContent({
      nameEn: "Name",
      specialtyEn: "Specialty",
      bioEn: "Bio",
    }),
    true,
  );
});

test("public directory omits drafts, noindex pages and the verified redirect", () => {
  const directory = buildPublicDirectory({
    services: [
      { slug: "facelift-surgery", name: "شد الوجه", status: "PUBLISHED" },
      { slug: "عملية شد الصدر", name: "Old", status: "PUBLISHED" },
      { slug: "draft-service", name: "Draft", status: "DRAFT" },
      { slug: "archived", name: "Archived", status: "ARCHIVED" },
    ],
    doctors: [{ slug: "draft-doctor", name: "Draft", status: "DRAFT" }],
    posts: [
      { slug: "post", title: "Article" },
      { slug: "draft-post", title: "Draft", status: "DRAFT" },
    ],
    pages: [
      {
        slug: "page",
        seoSlug: "public-page",
        titleAr: "صفحة",
        noindex: false,
        status: "PUBLISHED",
      },
      {
        slug: "noindex",
        titleAr: "Hidden",
        noindex: true,
        status: "PUBLISHED",
      },
      { slug: "draft", titleAr: "Draft", noindex: false, status: "DRAFT" },
    ],
  });
  assert.deepEqual(
    directory.services.map((link) => link.href),
    ["/services/facelift-surgery"],
  );
  assert.deepEqual(directory.doctors, []);
  assert.deepEqual(
    directory.posts.map((link) => link.href),
    ["/journal/post"],
  );
  assert.deepEqual(
    directory.pages.map((link) => link.href),
    ["/p/public-page"],
  );
});

test("patient guides provide procedure-specific answers and primary references without invented services", () => {
  const slugs = patientGuides.flatMap((guide) => guide.slugs);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(servicePatientGuide("unknown-service"), undefined);
  assert.equal(serviceContentModifiedAt("2025-01-01"), "2026-10-04");
  assert.equal(serviceContentModifiedAt("2026-11-01"), "2026-11-01");
  for (const guide of patientGuides) {
    assert.ok(guide.sources.length > 0);
    for (const source of guide.sources)
      assert.ok(
        ["www.plasticsurgery.org", "www.aad.org"].includes(
          new URL(source.url).hostname,
        ),
      );
    for (const slug of guide.slugs) {
      const questions = serviceSearchQuestions(slug, "الخدمة", "Service");
      assert.ok(questions.length >= 4);
      assert.equal(
        new Set(questions.map((item) => item.questionAr)).size,
        questions.length,
      );
    }
  }
  assert.ok(
    serviceSearchQuestions("new-service", "الخدمة", "Service").length === 3,
  );
  assert.ok(
    serviceSearchQuestions("liposuction").some(
      (item) => item.questionAr === "شفط الدهون وشد البطن نفس العملية؟",
    ),
  );
  assert.ok(
    serviceSearchQuestions("liposuction", "شفط الدهون", "Liposuction").some(
      (item) =>
        item.questionAr ===
        "كم تكلفة شفط الدهون في الرياض، وما البنود المشمولة؟",
    ),
  );
});
