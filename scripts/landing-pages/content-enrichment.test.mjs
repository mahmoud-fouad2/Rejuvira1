import assert from "node:assert/strict";
import test from "node:test";
import { landingContentProfiles } from "./content-profiles.mjs";
import { buildSahamWhatsappBubble } from "./saham-whatsapp.mjs";
import {
  buildLandingEnrichment,
  makeContentPatch,
  rollbackHtml,
  seedLandingContent,
  rollbackLandingContent,
  LANDING_STATE_PREFIX,
} from "./content-enrichment.mjs";

function database(records, options = {}) {
  let state = { pages: structuredClone(records), settings: [], logs: [] };
  let queue = Promise.resolve();
  const api = (getState) => ({
    customPage: {
      findMany: async ({ where }) =>
        structuredClone(
          getState().pages.filter(
            (page) =>
              where.slug.in.includes(page.slug) &&
              page.status === where.status &&
              page.noindex === where.noindex,
          ),
        ),
      findUnique: async ({ where }) =>
        structuredClone(getState().pages.find((page) => page.id === where.id)),
      updateMany: async ({ where, data }) => {
        assert.deepEqual(Object.keys(data), ["htmlContent"]);
        const page = getState().pages.find(
          (page) =>
            page.id === where.id &&
            page.updatedAt === where.updatedAt &&
            page.htmlContent === where.htmlContent &&
            (!where.status || page.status === where.status) &&
            (where.noindex === undefined || page.noindex === where.noindex),
        );
        if (!page || options.conflict) return { count: 0 };
        page.htmlContent = data.htmlContent;
        page.updatedAt += 1;
        return { count: 1 };
      },
    },
    service: {
      findMany: async () => [
        { slug: "liposuction", nameAr: "شفط الدهون", status: "PUBLISHED" },
      ],
    },
    doctor: {
      findMany: async () => [
        { slug: "loai-alsalmi", nameAr: "د. لؤي السالمي", status: "PUBLISHED" },
      ],
    },
    siteSetting: {
      findMany: async ({ where }) =>
        structuredClone(
          getState().settings.filter((row) =>
            row.key.startsWith(where.key.startsWith),
          ),
        ),
      create: async ({ data }) => {
        assert.ok(data.key.startsWith(LANDING_STATE_PREFIX));
        getState().settings.push(data);
      },
    },
    appLog: {
      create: async ({ data }) => {
        if (options.logFailure) throw new Error("audit failure");
        getState().logs.push(data);
      },
    },
  });
  const prisma = api(() => state);
  prisma.$transaction = (callback) => {
    const operation = queue.then(async () => {
      const draft = structuredClone(state);
      const result = await callback(api(() => draft));
      state = draft;
      return result;
    });
    queue = operation.catch(() => {});
    return operation;
  };
  return { prisma, state: () => state };
}
const original = {
  id: "cms-page",
  slug: "body-contouring-riyadh",
  status: "PUBLISHED",
  noindex: false,
  updatedAt: 1,
  htmlContent:
    '<section data-layout="canvas"><h1>المحتوى الأصلي</h1><form action="/api/leads"><input name="source" value="custom campaign"><input name="phone"><select name="serviceSlug"><option value="old-choice">اختيار قائم</option></select></form><p>السعر الحالي ١٢٠٠</p></section>',
  keywords: ["admin-keyword"],
  formConfig: { id: "keep" },
  leadWebhookEnabled: true,
  leadWebhookUrl: "existing-webhook",
  seoSlug: "current-alias",
};

test("18 distinct profiles add accessible content without forms, images, scripts or unpublished links", () => {
  assert.equal(landingContentProfiles.length, 18);
  assert.equal(
    new Set(landingContentProfiles.map((profile) => profile.slug)).size,
    18,
  );
  const questions = landingContentProfiles.flatMap((profile) =>
    profile.questions.map(([question]) => question),
  );
  assert.equal(new Set(questions).size, questions.length);
  for (const profile of landingContentProfiles) {
    const html = buildLandingEnrichment(profile, {
      services: profile.services.map((slug, index) => ({
        slug,
        nameAr: index ? "مخفية" : "خدمة <script>alert(1)</script>",
        status: index ? "DRAFT" : "PUBLISHED",
      })),
      doctors: profile.doctors.map((slug) => ({
        slug,
        nameAr: "مخفية",
        status: "DRAFT",
      })),
    });
    assert.doesNotMatch(html, /<form\b|<h1\b|<script\b|<img\b|مخفية/);
    assert.equal(
      (html.match(/<summary>/g) || []).length,
      profile.questions.length,
    );
    assert.match(html, /aria-labelledby="landing-guide-/);
    for (const source of profile.sources)
      assert.equal(new URL(source.url).protocol, "https:");
  }
});

test("published CMS prefix and every field outside htmlContent remain byte-for-byte intact", async () => {
  const db = database([
    original,
    { ...original, id: "draft", slug: "body-pro", status: "DRAFT" },
    { ...original, id: "hidden", slug: "eid-offers", noindex: true },
  ]);
  assert.deepEqual(await seedLandingContent(db.prisma), [
    { slug: original.slug, reason: "applied" },
  ]);
  const page = db.state().pages[0];
  assert.equal(
    page.htmlContent.slice(0, original.htmlContent.length),
    original.htmlContent,
  );
  for (const key of Object.keys(original).filter(
    (key) => !["htmlContent", "updatedAt"].includes(key),
  ))
    assert.deepEqual(page[key], original[key]);
  assert.deepEqual(db.state().pages.slice(1), [
    { ...original, id: "draft", slug: "body-pro", status: "DRAFT" },
    { ...original, id: "hidden", slug: "eid-offers", noindex: true },
  ]);
  assert.equal(db.state().settings.length, 1);
  assert.ok(JSON.stringify(db.state().settings).length < 700);
  assert.equal(
    (await seedLandingContent(db.prisma))[0].reason,
    "already-applied",
  );
});

test("later administrator removals are respected, including after log cleanup", async () => {
  const db = database([original]);
  await seedLandingContent(db.prisma);
  db.state().pages[0].htmlContent = "administrator replacement";
  db.state().logs.length = 0;
  assert.equal(
    (await seedLandingContent(db.prisma))[0].reason,
    "already-applied",
  );
  assert.equal(db.state().pages[0].htmlContent, "administrator replacement");
  assert.equal(
    (await rollbackLandingContent(db.prisma))[0].reason,
    "later-edit-preserved",
  );
});

test("concurrent CMS edits cause no writes or misleading release records", async () => {
  const db = database([original], { conflict: true });
  assert.equal(
    (await seedLandingContent(db.prisma))[0].reason,
    "concurrent-edit-preserved",
  );
  assert.deepEqual(db.state().pages[0], original);
  assert.equal(db.state().settings.length, 0);
  assert.equal(db.state().logs.length, 0);
});

test("audit failure rolls back both the append and durable version marker", async () => {
  const db = database([original], { logFailure: true });
  await assert.rejects(seedLandingContent(db.prisma), /audit failure/);
  assert.deepEqual(db.state().pages[0], original);
  assert.equal(db.state().settings.length, 0);
});

test("two overlapping releases append only one copy", async () => {
  const db = database([original]);
  await Promise.all([
    seedLandingContent(db.prisma),
    seedLandingContent(db.prisma),
  ]);
  assert.equal(
    (
      db.state().pages[0].htmlContent.match(/data-landing-content-release=/g) ||
      []
    ).length,
    1,
  );
  assert.equal(db.state().settings.length, 1);
});

test("rollback recovers exact original HTML and remains idempotent across later builds", async () => {
  const db = database([original]);
  await seedLandingContent(db.prisma);
  assert.equal((await rollbackLandingContent(db.prisma))[0].reason, "restored");
  assert.equal(db.state().pages[0].htmlContent, original.htmlContent);
  assert.equal(
    (await seedLandingContent(db.prisma))[0].reason,
    "already-applied",
  );
  const patch = makeContentPatch(original, "<p>زيادة</p>");
  assert.equal(
    rollbackHtml({ ...original, htmlContent: patch.htmlContent }, patch.meta),
    original.htmlContent,
  );
  assert.equal(
    rollbackHtml(
      { ...original, htmlContent: patch.htmlContent + "admin edit" },
      patch.meta,
    ),
    null,
  );
  assert.equal(
    rollbackHtml(
      { ...original, htmlContent: patch.htmlContent },
      { ...patch.meta, beforeHash: "invalid" },
    ),
    null,
  );
});

test("Saham gets exactly one floating bubble without replacing her existing form or content", async () => {
  const db = database([{ ...original, slug: "dr-saham-arfaj" }]);
  await seedLandingContent(db.prisma);
  const html = db.state().pages[0].htmlContent;
  assert.equal(
    html.slice(0, original.htmlContent.length),
    original.htmlContent,
  );
  assert.equal((html.match(/data-saham-whatsapp=/g) || []).length, 1);
  assert.doesNotMatch(html, /rv-landing-guide/);
  const href = buildSahamWhatsappBubble().match(/href="([^"]+)"/)[1];
  assert.equal(new URL(href).pathname, "/966114999959");
  assert.match(new URL(href).searchParams.get("text"), /سهام العرفج/);
  assert.doesNotMatch(href, /Google/);
  const existing = database([
    { ...original, slug: "dr-saham-arfaj", htmlContent: html },
  ]);
  assert.equal(
    (await seedLandingContent(existing.prisma))[0].reason,
    "existing-addition-preserved",
  );
  assert.equal(existing.state().settings.length, 0);
});
