import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
import * as generalInquiry from "./general-inquiry.ts";
import * as intakeGuard from "./lead-intake-guard.ts";
import * as saudiPhone from "./saudi-phone.ts";
import * as requestTracking from "./request-tracking.ts";
import { createContactLead } from "./content-repository.ts";
import { prisma } from "./prisma.ts";
import { canAccessAdminRoute } from "./admin-permissions.ts";
import { ContentStatus, UserRole } from "./prisma-enums.ts";
import * as nodeCrypto from "node:crypto";
import { doctorProfileSections } from "./doctor-profile-content.ts";
import { bookingServiceOptions } from "./public-client-content.ts";
import { isPublicIntegrationAddress, parseIntegrationEndpoint } from "./integration-endpoint.ts";
import * as patientUpload from "./portal/document-upload.ts";

function productionModule(
  relativePath: string,
  modules: Record<string, any>,
  extra = {},
) {
  const exports: Record<string, any> = {};
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(new URL(relativePath, import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText,
    {
      exports,
      require: (id: string) => {
        if (!(id in modules)) throw new Error(`Unexpected import: ${id}`);
        return modules[id];
      },
      console,
      URL,
      Request,
      Response,
      Headers,
      crypto,
      btoa,
      ...extra,
    },
  );
  return exports;
}

test("staff document uploads are authorized, private by default and bounded to the patient", async () => {
  let role: UserRole = UserRole.RECEPTIONIST;
  let configured = false;
  let writes = 0;
  let persisted: Record<string, unknown> | undefined;
  const { POST } = productionModule("../app/api/admin/patients/[id]/documents/route.ts", {
    "node:crypto": nodeCrypto,
    "@prisma/client": {
      DocumentVisibility: { STAFF_ONLY: "STAFF_ONLY", PATIENT_VISIBLE: "PATIENT_VISIBLE" },
      PortalActorType: { STAFF: "STAFF" },
    },
    "@/auth": { auth: async () => ({ user: { id: "staff-1", role } }) },
    "@/lib/portal/audit": { writePortalAudit: async () => {} },
    "@/lib/portal/document-upload": patientUpload,
    "@/lib/portal/permissions": {
      canManagePatientDocuments: (role: UserRole) => role === UserRole.ADMIN,
    },
    "@/lib/prisma": {
      prisma: {
        patient: { findFirst: async ({ where }: any) => {
          assert.equal(where.id, "patient-1");
          assert.equal(where.archivedAt, null);
          return { id: "patient-1" };
        } },
        patientDocument: { create: async ({ data }: any) => { persisted = data; } },
      },
    },
    "@/lib/storage/r2": {
      canUploadPatientDocuments: () => configured,
      writePatientDocumentObject: async (id: string, upload: { body: Buffer; contentType: string }) => {
        assert.equal(upload.contentType, "application/pdf");
        assert.equal(upload.body.toString(), "%PDF-1.4\nsynthetic");
        writes++;
        return `patient-documents/${id}`;
      },
    },
  }, { Buffer, File, RangeError });

  const args = { params: Promise.resolve({ id: "patient-1" }) };
  function submit(content: string, origin = "https://rejuvera.sa") {
    const form = new FormData();
    form.set("title", "Synthetic document");
    form.set("file", new File([content], "fixture.pdf", { type: "application/pdf" }));
    return POST(new Request("https://rejuvera.sa/api/admin/patients/patient-1/documents", {
      method: "POST",
      headers: { origin },
      body: form,
    }), args);
  }

  assert.equal((await submit("%PDF-1.4\nsynthetic")).status, 403);
  role = UserRole.ADMIN;
  assert.equal((await submit("%PDF-1.4\nsynthetic", "https://example.test")).status, 403);
  assert.equal((await submit("%PDF-1.4\nsynthetic")).status, 503);
  configured = true;
  assert.equal((await submit("Plain text")).status, 415);
  assert.equal(writes, 0);
  assert.equal((await submit("%PDF-1.4\nsynthetic")).status, 201);
  assert.equal(writes, 1);
  assert.equal(persisted?.patientId, "patient-1");
  assert.equal(persisted?.visibility, "STAFF_ONLY");
  assert.equal(persisted?.fileName, "document.pdf");
  assert.equal(persisted?.storageKey, `patient-documents/${persisted?.id}`);
});

test("integration egress allows public HTTPS and denies non-public addresses", () => {
  assert.equal(parseIntegrationEndpoint("https://example.com/api").pathname, "/api");
  assert.equal(isPublicIntegrationAddress("8.8.8.8"), true);
  assert.equal(isPublicIntegrationAddress("2606:4700::1111"), true);
  assert.equal(isPublicIntegrationAddress("127.0.0.1"), false);
  assert.equal(isPublicIntegrationAddress("fd00::1"), false);
  assert.throws(() => parseIntegrationEndpoint("http://example.com/api"));
  assert.throws(() => parseIntegrationEndpoint("https://127.0.0.1/api"));
});

test("Render client IP comes from the ingress header", () => {
  const { extractClientIp } = productionModule("./rate-limit.ts", {
    "node:net": { isIP: (value: string) => value === "203.0.113.8" ? 4 : 0 },
  }, { process: { env: { RENDER: "true" } } });
  assert.equal(extractClientIp(new Headers({
    "x-forwarded-for": "203.0.113.8",
    "x-client-ip": "203.0.113.9",
  })), "203.0.113.8");
  assert.equal(extractClientIp(new Headers({
    "x-client-ip": "203.0.113.8",
  })), "unknown");
});

test("Faheemly forwards the body as a stream with a byte limit", async () => {
  let forwarded = 0;
  const { proxyFaheemlyRequest } = productionModule("./faheemly-proxy.ts", {
    "@/lib/rate-limit": { extractClientIp: () => "unknown" },
  }, {
    AbortController,
    TransformStream,
    setTimeout,
    clearTimeout,
    fetch: async (_url: string, init: RequestInit & { duplex?: string }) => {
      assert.equal(init.duplex, "half");
      const reader = (init.body as ReadableStream<Uint8Array>).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        forwarded += value.byteLength;
      }
      return new Response("OK");
    },
  });
  const url = "https://rejuvera.sa/api/chat/upload";
  const normal = new Request(url, { method: "POST", body: "message" });
  assert.equal((await proxyFaheemlyRequest(normal, "/api/chat/upload")).status, 200);
  assert.equal(forwarded, 7);

  forwarded = 0;
  const megabyte = new Uint8Array(1024 * 1024);
  let remaining = 13;
  const body = new ReadableStream({
    pull(stream) {
      if (remaining-- > 0) stream.enqueue(megabyte);
      else stream.close();
    },
  });
  const options = { method: "POST", body, duplex: "half" } as const;
  assert.equal(
    (await proxyFaheemlyRequest(new Request(url, options), "/api/chat/upload")).status,
    413,
  );
  assert.equal(forwarded, 12 * megabyte.byteLength);
});

test("staff sessions check active status and the current role", async () => {
  let account: { isActive: boolean; role: UserRole } | null = {
    isActive: true, role: UserRole.VIEWER,
  };
  let databaseAvailable = true;
  const { auth: jwt } = productionModule("../auth.ts", {
    "@prisma/client": { UserRole },
    "next/headers": {},
    "next-auth": { default: (config: any) => ({ auth: config.callbacks.jwt }) },
    "next-auth/providers/credentials": { default: () => ({}) },
    bcryptjs: {},
    "@/lib/prisma": {
      prisma: { user: { findUnique: async () => {
        if (!databaseAvailable) throw new Error("Database unavailable");
        return account;
      } } },
    },
    "@/lib/app-log": {},
    "@/lib/rate-limit": {},
  }, { process: { env: {} } });
  const token = { id: "staff-1", role: UserRole.SUPER_ADMIN };
  assert.equal((await jwt({ token })).role, UserRole.VIEWER);
  account.isActive = false;
  assert.equal(await jwt({ token }), null);
  account = null;
  assert.equal(await jwt({ token }), null);
  databaseAvailable = false;
  assert.equal(await jwt({ token }), null);
});

test("patient documents require current ownership, visibility and expiry checks", async () => {
  let session: { patientId: string; fullNameAr: string; mustChangePassword: boolean } | null = null;
  let document: { id: string; storageKey: string; fileName: string } | null = null;
  let reads = 0;
  let auditCount = 0;
  const { GET } = productionModule("../app/api/portal/documents/[id]/route.ts", {
    "@prisma/client": { PortalActorType: { PATIENT: "PATIENT" } },
    "@/lib/portal/audit": { writePortalAudit: async () => { auditCount++; } },
    "@/lib/portal/patient-auth": { getPatientSession: async () => session },
    "@/lib/prisma": {
      prisma: { patientDocument: { findFirst: async ({ where }: any) => {
        assert.equal(where.id, "doc-1");
        assert.equal(where.patientId, "patient-1");
        assert.equal(where.visibility, "PATIENT_VISIBLE");
        assert.equal(where.archivedAt, null);
        assert.equal(where.OR.length, 2);
        assert.equal(where.OR[0].expiresAt, null);
        assert.ok(Number.isFinite(where.OR[1].expiresAt.gte.getTime()));
        return document;
      } } },
    },
    "@/lib/storage/r2": { readPatientDocumentObject: async (key: string) => {
      assert.equal(key, "portal/file-1.pdf");
      reads++;
      return new Response("synthetic file");
    } },
  });
  const request = new Request("https://rejuvera.sa/api/portal/documents/doc-1");
  const args = { params: Promise.resolve({ id: "doc-1" }) };
  assert.equal((await GET(request, args)).status, 401);
  session = { patientId: "patient-1", fullNameAr: "Test patient", mustChangePassword: false };
  assert.equal((await GET(request, args)).status, 404);
  assert.equal(reads, 0);
  document = { id: "doc-1", storageKey: "portal/file-1.pdf", fileName: "File.pdf" };
  const response = await GET(request, args);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-disposition")!, /^attachment;/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(await response.text(), "synthetic file");
  assert.equal(reads, 1);
  assert.equal(auditCount, 1);
});

async function withLeadDatabase(run: (tx: any) => Promise<void>) {
  const originalTransaction = prisma.$transaction;
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/isolated";
  const tx = {
    service: { findFirst: async (): Promise<any> => ({ id: "service-a" }) },
    contactSubmission: {} as any,
  };
  (prisma as any).$transaction = async (callback: any, options: any) => {
    assert.equal(options.isolationLevel, "Serializable");
    return callback(tx);
  };
  try {
    await run(tx);
  } finally {
    prisma.$transaction = originalTransaction;
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
  }
}
const firstLead = {
  id: "historical-lead",
  fullName: "Test fixture",
  preferredLanguage: "ar",
  source: "Google Ads",
  message: "Original message with a short phrase",
  internalNotes: "Historical staff notes",
  utmSource: "google",
  utmMedium: null,
  utmCampaign: "original",
  utmContent: null,
  utmTerm: null,
  gclid: "first-click",
  gbraid: null,
  wbraid: null,
  landingPageUrl: "https://example.test/first",
  referrerUrl: null,
};
const input = {
  fullName: "Test fixture",
  phone: "test-phone-a",
  serviceSlug: "service-a",
};

test("[Mocked integration] duplicate preserves missing first-touch fields and substring follow-ups", async () => {
  await withLeadDatabase(async (tx) => {
    tx.contactSubmission.findFirst = async () => ({ ...firstLead });
    tx.contactSubmission.update = async ({ data }: any) => {
      for (const key of [
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmContent",
        "utmTerm",
        "gclid",
        "gbraid",
        "wbraid",
        "landingPageUrl",
        "referrerUrl",
      ])
        assert.equal(key in data, false, key);
      assert.ok(data.message.endsWith("[رسالة متابعة]: short phrase"));
      assert.ok(data.internalNotes.includes('"utmMedium":"paid-social"'));
      assert.ok(data.internalNotes.endsWith("\n\nstaff notes"));
      return { ...firstLead, ...data };
    };
    await createContactLead({
      ...input,
      message: "short phrase",
      utmSource: "meta",
      utmMedium: "paid-social",
      utmCampaign: "returning",
      notes: "staff notes",
    });
  });
});

test("[Mocked integration] full typed click identities, landing-only touches and retries", async () => {
  await withLeadDatabase(async (tx) => {
    let saved = { ...firstLead };
    tx.contactSubmission.findFirst = async () => saved;
    tx.contactSubmission.update = async ({ data }: any) =>
      (saved = { ...saved, ...data });
    const prefix = "x".repeat(130);
    for (const visit of [
      { gclid: `${prefix}a` },
      { gclid: `${prefix}b` },
      { gbraid: `${prefix}a` },
      { wbraid: `${prefix}a` },
      { utmMedium: "social", landingPageUrl: "https://example.test/return-a" },
      { utmMedium: "social", landingPageUrl: "https://example.test/return-b" },
    ]) {
      await createContactLead({ ...input, ...visit });
      const beforeRetry = saved.internalNotes;
      await createContactLead({ ...input, ...visit });
      assert.equal(saved.internalNotes, beforeRetry);
    }
    assert.equal(saved.internalNotes.split("[Returning Touch ").length - 1, 6);
  });
});

test("[Mocked integration] service IDs, unknown services and explicit legacy general tags stay isolated", async () => {
  await withLeadDatabase(async (tx) => {
    let query: any;
    let created: any;
    tx.contactSubmission.findFirst = async ({ where }: any) => {
      query = where;
      return null;
    };
    tx.contactSubmission.create = async ({ data }: any) =>
      (created = { id: "new-lead", ...data });
    await createContactLead(input);
    assert.equal(query.serviceId, "service-a");
    tx.service.findFirst = async () => ({ id: "service-b" });
    await createContactLead({ ...input, serviceSlug: "service-b" });
    assert.equal(query.serviceId, "service-b");
    tx.service.findFirst = async () => null;
    for (const slug of ["unknown-a", "unknown-b"]) {
      await createContactLead({ ...input, serviceSlug: slug });
      assert.equal(query.tags.has, `service:${slug}`);
      assert.ok(created.tags.includes(`service:${slug}`));
    }
    await createContactLead({
      ...input,
      serviceSlug: "",
      landingPageUrl: "https://example.test/contact",
    });
    assert.equal(query.tags.has, "استفسار عام");
    assert.equal(query.landingPageUrl, "https://example.test/contact");
    // Ambiguous untagged legacy records are deliberately not reclassified.
    tx.contactSubmission.findFirst = async ({ where }: any) => {
      assert.equal(where.tags.has, "استفسار عام");
      return { ...firstLead, tags: ["استفسار عام"] };
    };
    tx.contactSubmission.update = async ({ data }: any) => ({
      ...firstLead,
      ...data,
    });
    assert.equal(
      (await createContactLead({ ...input, serviceSlug: "general-inquiry" }))
        .mode,
      "duplicate",
    );
  });
});

test("[Mocked integration] serialization conflict rereads a concurrent follow-up; failures have bounded retries", async () => {
  await withLeadDatabase(async (tx) => {
    const transaction = prisma.$transaction;
    let attempts = 0;
    tx.contactSubmission.findFirst = async () => ({
      ...firstLead,
      message:
        attempts === 1
          ? firstLead.message
          : `${firstLead.message}\n---\n[رسالة متابعة]: concurrent note`,
    });
    tx.contactSubmission.update = async ({ data }: any) => ({
      ...firstLead,
      ...data,
    });
    (prisma as any).$transaction = async (...args: any[]) => {
      attempts += 1;
      const result = await (transaction as any)(...args);
      if (attempts === 1)
        throw Object.assign(new Error("conflict"), { code: "P2034" });
      return result;
    };
    const result = await createContactLead({
      ...input,
      message: "my follow-up",
    });
    if (result.mode !== "duplicate") throw new Error("Expected duplicate");
    assert.ok(result.submission.message?.includes("concurrent note"));
    assert.ok(result.submission.message?.includes("my follow-up"));
    assert.equal(attempts, 2);
    attempts = 0;
    (prisma as any).$transaction = async () => {
      attempts += 1;
      throw Object.assign(new Error("conflict"), { code: "P2034" });
    };
    await assert.rejects(createContactLead(input), /conflict/);
    assert.equal(attempts, 4);
    attempts = 0;
    (prisma as any).$transaction = async () => {
      attempts += 1;
      throw new Error("unavailable");
    };
    await assert.rejects(createContactLead(input), /unavailable/);
    assert.equal(attempts, 1);
  });
});

for (const kind of ["services", "doctors"]) {
  test(`[Mocked integration] ${kind} production metadata/render guards: 5 statuses x 11 roles`, async () => {
    const record: any = {
      slug: "test-content",
      name: "Fixture",
      nameEn: "Fixture",
      specialty: "Fixture",
      summary: "Fixture",
      bio: "Fixture",
      description: "Fixture",
      category: "Fixture",
      benefits: [],
      languages: [],
      education: [],
      achievements: [],
      publications: [],
      serviceSlugs: [],
      doctorSlugs: [],
      deviceSlugs: [],
    };
    let role: string | undefined;
    let hasId = true;
    const modules: Record<string, any> = {
      "next/navigation": {
        notFound: () => {
          throw new Error("NOT_FOUND");
        },
        permanentRedirect: () => {
          throw new Error("REDIRECT");
        },
      },
      "@/auth": {
        auth: async () =>
          role ? { user: { id: hasId ? "test-user" : "", role } } : null,
      },
      "@/lib/admin-permissions": { canAccessAdminRoute },
      "@/lib/prisma-enums": { ContentStatus },
      "@/lib/content-repository": {
        getServiceBySlug: async () => record,
        getDoctorBySlug: async () => record,
        getDoctors: async () => [],
        getServices: async () => [
          {
            slug: "draft",
            status: "DRAFT",
            marker: "SECRET-DRAFT-CONTENT",
            doctorSlugs: [],
          },
        ],
        getDevices: async () => [],
        getJournalPosts: async () => [],
        getRuntimeSettings: async () => ({
          contact: { phone: "", whatsapp: "" },
        }),
      },
      "@/lib/csp-nonce": { getCspNonce: async () => "test-nonce" },
      "@/lib/core-search": {
        getCoreServiceSeo: () => null,
        coreSearchKeywords: [],
      },
      "@/lib/seo": { getSiteUrl: () => "https://example.test" },
      "@/lib/public-service-slug": {
        publicServiceSlug: (slug: string) => slug,
      },
      "@/lib/service-seo": {
        hasEnglishServiceContent: () => true,
        resolveServiceSeo: () => ({ titleAr: "Fixture", titleEn: "Fixture" }),
      },
      "@/lib/seo-localization": {
        hasEnglishDoctorContent: () => true,
        localizedSeoValues: () => ({
          title: "Fixture",
          description: "Fixture",
          languages: {},
        }),
      },
      "@/lib/service-patient-guides": {
        servicePatientGuide: () => undefined,
        serviceContentModifiedAt: () => "2026-10-26",
      },
      "@/lib/clinic-contact": { clinicWhatsappHref: () => "" },
      "@/lib/recaptcha": { getPublicSiteKey: () => "" },
      "@/lib/doctor-profile-content": { doctorProfileSections },
      "@/lib/public-client-content": { bookingServiceOptions },
      "next/image": {},
      "next/link": {},
      "react/jsx-runtime": {
        jsx: (type: any, props: any) => ({ type, props }),
        jsxs: (type: any, props: any) => ({ type, props }),
      },
    };
    for (const name of [
      "layout/SiteFooter",
      "layout/SiteHeader",
      "layout/BookingModal",
      "public/StickyMobileCta",
      "public/ServiceSearchQuestions",
      "public/ServicePatientGuide",
      "contact/PhoneCallLink",
    ])
      modules[`@/components/${name}`] = {};
    const page = productionModule(`../app/${kind}/[slug]/page.tsx`, modules);
    const props = {
      params: Promise.resolve({ slug: record.slug }),
      searchParams: Promise.resolve({}),
    };
    for (const status of Object.values(ContentStatus)) {
      record.status = status;
      for (const candidate of [undefined, ...Object.values(UserRole)]) {
        role = candidate;
        const allowed =
          status === "PUBLISHED" ||
          ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(candidate || "");
        if (allowed) {
          assert.equal(
            (await page.generateMetadata(props)).robots.index,
            status === "PUBLISHED",
          );
          assert.equal(
            JSON.stringify(await page.default(props)).includes(
              "SECRET-DRAFT-CONTENT",
            ),
            false,
          );
        } else {
          await assert.rejects(page.generateMetadata(props), /NOT_FOUND/);
          await assert.rejects(page.default(props), /NOT_FOUND/);
        }
      }
    }
    role = "EDITOR";
    hasId = false;
    record.status = "DRAFT";
    await assert.rejects(page.generateMetadata(props), /NOT_FOUND/);
    await assert.rejects(page.default(props), /NOT_FOUND/);
  });
}

async function runSeed(file: string, existing: boolean, environment = {}) {
  const writes: any[] = [];
  let finish!: () => void;
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const model = (name: string) => ({
    findUnique: async () =>
      existing
        ? {
            id: "existing",
            value: "older-version",
            nameAr: "Reviewed",
            status: "ARCHIVED",
          }
        : null,
    findFirst: async () => (existing ? { id: "existing" } : null),
    findMany: async () => [],
    upsert: async (args: any) => {
      writes.push({ model: name, ...args });
      return args.create;
    },
    create: async (args: any) => {
      writes.push({ model: name, ...args });
      return args.data;
    },
  });
  const fakeProcess = {
    env: { DATABASE_URL: "mock-only", ...environment },
    exitCode: 0,
    exit: (code: number) => {
      fakeProcess.exitCode = code;
    },
  };
  const fakePrisma = {
    serviceCategory: model("category"),
    doctor: model("doctor"),
    service: model("service"),
    siteSetting: model("setting"),
    customPage: model("page"),
    procedureTemplate: model("template"),
    $disconnect: async () => finish(),
  };
  productionModule(
    `../../scripts/${file}`,
    {
      "@prisma/client": {
        ContentStatus,
        TemplateStatus: { DRAFT: "DRAFT" },
        PrismaClient: class {
          constructor() {
            return fakePrisma;
          }
        },
      },
    },
    { process: fakeProcess, console: { log() {}, error() {} } },
  );
  await done;
  return { writes, exitCode: fakeProcess.exitCode };
}

test("[Mocked integration] core seed preserves existing CMS/settings with an old or missing marker", async () => {
  for (const existing of [true, false]) {
    const { writes, exitCode } = await runSeed(
      "seed-core-content.mjs",
      existing,
    );
    assert.equal(exitCode, 0);
    assert.ok(writes.some((write) => write.model === "doctor"));
    assert.ok(
      writes.some((write) => write.model === "service" && write.create.doctors),
    );
    for (const write of writes) {
      if (write.where.key === "system.coreContentSeedVersion") continue;
      assert.equal(
        Object.keys(write.update).length,
        0,
        `Existing ${write.model} must be preserved`,
      );
      assert.ok(write.create);
    }
  }
});
test("[Mocked integration] landing seed preserves existing and concurrently created pages", async () => {
  assert.equal(
    (await runSeed("seed-landing-pages.mjs", true)).writes.length,
    0,
  );
  const { writes } = await runSeed("seed-landing-pages.mjs", false);
  assert.ok(writes.length > 0);
  for (const write of writes) assert.equal(Object.keys(write.update).length, 0);
  const blocked = await runSeed("seed-landing-pages.mjs", false, {
    LANDING_SEED_FORCE: "1",
    RENDER: "true",
  });
  assert.equal(blocked.exitCode, 1);
  assert.equal(blocked.writes.length, 0);
});
test("[Mocked integration] template seed only creates missing drafts", async () => {
  assert.equal(
    (await runSeed("seed-procedure-templates.mjs", true)).writes.length,
    0,
  );
  const { writes } = await runSeed("seed-procedure-templates.mjs", false);
  assert.ok(writes.length > 0);
  for (const write of writes) assert.equal(write.data.status, "DRAFT");
});

for (const routeName of ["contact", "leads"]) {
  test(`[Mocked integration] ${routeName} actual POST retains unknown service and suppresses duplicate webhook/conversions`, async () => {
    let mode = "database";
    let captured: any;
    let webhooks = 0;
    let conversions = 0;
    let webhookFailures = 0;
    const queued: Array<() => Promise<void>> = [];
    const webhook = productionModule(
      "./form-webhook.ts",
      {
        "@/lib/app-log": {
          recordAppLog: async () => {
            webhookFailures += 1;
          },
        },
      },
      {
        AbortController,
        setTimeout,
        clearTimeout,
        fetch: async () => {
          webhooks += 1;
          return new Response(null, { status: 503 });
        },
      },
    );
    const modules: Record<string, any> = {
      zod: { z },
      "next/cache": { revalidatePath() {} },
      "next/server": {
        NextResponse: { json: Response.json },
        after: (callback: any) => queued.push(callback),
      },
      "@/lib/app-log": { recordAppLog: async () => {} },
      "@/lib/content-repository": {
        createContactLead: async (data: any) => {
          captured = data;
          return { mode, submission: { id: "fixture-saved-id" } };
        },
        getRuntimeSettings: async () => ({
          ops: { recaptchaEnabled: false },
          integrations: {
            formWebhookEnabled: true,
            formWebhookUrl: "https://example.test/fixture-webhook",
            formWebhookSecret: "",
          },
        }),
        getServiceByReference: async () => null,
        isBlockedIpAddress: async () => false,
        getCustomPageLeadWebhookBySlug: async () => null,
      },
      "@/lib/form-webhook": webhook,
      "@/lib/general-inquiry": generalInquiry,
      "@/lib/lead-intake-guard": intakeGuard,
      "@/lib/saudi-phone": saudiPhone,
      "@/lib/request-tracking": requestTracking,
      "@/lib/lead-request-metadata": { getLeadRequestMetadata: () => ({}) },
      "@/lib/lead-receipt": { createLeadReceipt: () => "fixture-receipt" },
      "@/lib/rate-limit": {
        extractClientIp: () => "unknown",
        rateLimit: () => ({ ok: true }),
      },
      "@/lib/recaptcha": {},
      "@/lib/snap-capi": {
        getSnapRequestSignals: () => ({}),
        sendSnapSignUpCapi: async () => {
          conversions += 1;
        },
      },
      "@/lib/meta-capi": {
        getMetaRequestSignals: () => ({}),
        sendMetaLeadCapi: async () => {
          conversions += 1;
        },
      },
      "@/lib/openai-ads-capi": {
        getOpenAiRequestSignals: () => ({}),
        sendOpenAiLeadCapi: async () => {
          conversions += 1;
        },
      },
    };
    const route = productionModule(
      `../app/api/${routeName}/route.ts`,
      modules,
      { process: { env: {} } },
    );
    const request = () =>
      new Request(`https://example.test/api/${routeName}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          fullName: "Synthetic fixture",
          phone: "0500000000",
          serviceSlug: "unregistered-service",
        }),
      });
    const saved = await route.POST(request());
    assert.equal(saved.status, routeName === "leads" ? 201 : 200);
    assert.equal(captured.serviceSlug, "unregistered-service");
    assert.equal(webhooks, 1);
    assert.equal(
      webhookFailures,
      1,
      "A failed webhook must not undo the saved lead",
    );
    await Promise.all(queued.splice(0).map((callback) => callback()));
    assert.equal(conversions, 3);
    mode = "duplicate";
    const duplicate = await route.POST(request());
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).duplicate, true);
    assert.equal(webhooks, 1);
    assert.equal(queued.length, 0);
  });
}

test("[Mocked integration] portal PDF denies anonymous and cross-patient requests before generating a file", async () => {
  let session: any = null;
  let own = false;
  let reads = 0;
  let generated = 0;
  const route = productionModule(
    "../app/api/portal/procedures/[id]/pdf/route.ts",
    {
      "next/server": {
        NextResponse: class extends Response {
          static json = Response.json;
        },
      },
      "@prisma/client": { PortalActorType: { PATIENT: "PATIENT" } },
      "@/lib/portal/instructions-pdf": {
        buildInstructionsPdf: async () => {
          generated += 1;
          return { buffer: new Uint8Array([1, 2]), fileName: "fixture.pdf" };
        },
      },
      "@/lib/portal/audit": { writePortalAudit: async () => {} },
      "@/lib/portal/patient-auth": { getPatientSession: async () => session },
      "@/lib/portal/settings": {
        getPortalSettings: async () => ({ defaultPrintLanguage: "ar" }),
      },
      "@/lib/prisma": {
        prisma: {
          procedure: {
            findFirst: async ({ where }: any) => {
              reads += 1;
              assert.equal(where.patientId, "patient-fixture-a");
              assert.equal(where.archivedAt, null);
              assert.deepEqual(
                JSON.parse(JSON.stringify(where.instructionsPublishedAt)),
                { not: null },
              );
              return own ? { id: "procedure-fixture" } : null;
            },
          },
        },
      },
    },
  );
  const request = Object.assign(
    new Request("https://example.test/api/portal/procedures/fixture/pdf"),
    {
      nextUrl: new URL(
        "https://example.test/api/portal/procedures/fixture/pdf",
      ),
    },
  );
  const context = { params: Promise.resolve({ id: "procedure-fixture" }) };
  assert.equal((await route.GET(request, context)).status, 401);
  assert.equal(reads, 0);
  session = { patientId: "patient-fixture-a", fullNameAr: "Synthetic fixture" };
  assert.equal((await route.GET(request, context)).status, 404);
  assert.equal(generated, 0);
  own = true;
  const response = await route.GET(request, context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(generated, 1);
});

test("[Mocked integration] opaque patient session rejects revoked, expired, suspended and archived accounts", async () => {
  let record: any;
  let touches = 0;
  const valid = {
    id: "session-fixture",
    expiresAt: new Date(Date.now() + 60_000),
    lastSeenAt: new Date(),
    revokedAt: null,
    patient: {
      id: "patient-fixture",
      fullNameAr: "Synthetic fixture",
      preferredLanguage: "ar",
      archivedAt: null,
      accountStatus: "ACTIVE",
      account: { mustChangePassword: false },
    },
  };
  const authModule = productionModule(
    "./portal/patient-auth.ts",
    {
      "node:crypto": nodeCrypto,
      "next/headers": {
        cookies: async () => ({
          get: () => ({ value: "synthetic-opaque-session" }),
        }),
      },
      bcryptjs: {},
      "@prisma/client": { PatientAccountStatus: { ACTIVE: "ACTIVE" } },
      "@/lib/prisma": {
        prisma: {
          patientSession: {
            findUnique: async ({ where }: any) => {
              assert.equal(
                where.tokenHash,
                nodeCrypto
                  .createHash("sha256")
                  .update("synthetic-opaque-session")
                  .digest("hex"),
              );
              return record;
            },
            update: async () => {
              touches += 1;
            },
          },
        },
      },
      "@/lib/rate-limit": {},
      "@/lib/saudi-phone": {},
      "@/lib/portal/audit": {},
      "@/lib/portal/settings": {},
    },
    { process: { env: { DATABASE_URL: "mock-only" } } },
  );
  for (const invalid of [
    null,
    { ...valid, revokedAt: new Date() },
    { ...valid, expiresAt: new Date(0) },
    { ...valid, patient: { ...valid.patient, accountStatus: "SUSPENDED" } },
    { ...valid, patient: { ...valid.patient, archivedAt: new Date() } },
  ]) {
    record = invalid;
    assert.equal(await authModule.getPatientSession(), null);
  }
  assert.equal(touches, 0);
  record = valid;
  assert.equal(
    (await authModule.getPatientSession()).patientId,
    "patient-fixture",
  );
});
