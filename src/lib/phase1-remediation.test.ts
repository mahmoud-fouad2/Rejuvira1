import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

import { canAccessAdminRoute } from "./admin-permissions.ts";
import { buildCsp } from "./csp.ts";
import { UserRole } from "./prisma-enums.ts";
import { createContactLead } from "./content-repository.ts";
import { prisma } from "./prisma.ts";
import { GENERAL_INQUIRY_SERVICE_AR } from "./general-inquiry.ts";

/**
 * REJUVERA PHASE 1 VERIFICATION SUITE
 *
 * Test Classification:
 * - [Unit]: Direct execution of production functions without network or database dependencies.
 * - [Behavioral Contract]: Verification of state guards and boundary contracts against real enums.
 * - [Mocked Integration]: Execution of production repository functions with mocked database boundaries.
 * - [Scope Notice]: Live Edge HTTP headers and live PostgreSQL multi-transaction concurrency
 *   require a live staging environment with database connections, and are categorized
 *   accordingly as NOT TESTED locally to prevent unverified production claims.
 */

// Helper to run production middleware in isolation with custom auth session
function createMiddlewareRunner(
  session: { user?: { id: string; role: string } } | null,
  initialHeaders: Record<string, string> = {},
) {
  const exports = {} as {
    default: (request: Request & { nextUrl: URL; auth?: any }) => Response;
  };
  const modules: Record<string, unknown> = {
    "next/server": {
      NextResponse: {
        next: () => new Response(null, { headers: initialHeaders }),
        redirect: (url: URL, status = 307) =>
          new Response(null, {
            status,
            headers: { Location: url.href },
          }),
      },
    },
    "@/auth": {
      auth: (callback: any) => (req: any) => {
        req.auth = session;
        return callback(req);
      },
    },
    "@/lib/admin-permissions": {
      canAccessAdminRoute: () => true,
      getAdminHomePath: () => "/admin",
    },
    "@/lib/canonical-host": {
      shouldRedirectToCanonicalHost: () => false,
      buildCanonicalUrl: (path: string) => new URL(path, "https://rejuvera.sa"),
    },
    "@/lib/csp": { buildCsp: () => "default-src 'self'" },
    "@/lib/public-service-slug": { publicServiceSlug: (slug: string) => slug },
    "@/lib/snap-click-attribution": { snapClickCookieForRequest: () => null },
  };

  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(new URL("../../middleware.ts", import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports,
      require: (id: string) => {
        if (!(id in modules)) throw new Error(`Unexpected module: ${id}`);
        return modules[id];
      },
      crypto,
      btoa,
      Headers,
      URL,
      Response,
    },
  );

  return (url: string, headers: HeadersInit = {}) => {
    if (session)
      headers = { ...headers, Cookie: "authjs.session-token=mock-session" };
    const request = new Request(url, { headers }) as Request & {
      nextUrl: URL;
      auth?: any;
    };
    request.nextUrl = new URL(url);
    return exports.default(request);
  };
}

test("[Unit] Middleware Draft Preview vs Public CDN Cache", () => {
  // 1. Authenticated EDITOR viewing a draft route
  const editorRunner = createMiddlewareRunner({
    user: { id: "usr_editor_1", role: "EDITOR" },
  });
  const draftPreviewResponse = editorRunner(
    "https://rejuvera.sa/services/draft-procedure",
  );

  const draftCacheControl =
    draftPreviewResponse.headers.get("cache-control") || "";
  assert.ok(
    draftCacheControl.includes("private, no-store"),
    "Draft preview for authenticated editor MUST be private, no-store",
  );
  assert.equal(
    draftCacheControl.includes("public"),
    false,
    "Draft preview MUST NOT carry public cache-control",
  );
  assert.equal(
    draftCacheControl.includes("s-maxage"),
    false,
    "Draft preview MUST NOT carry s-maxage (no shared CDN caching allowed)",
  );
  assert.equal(
    draftPreviewResponse.headers.get("x-robots-tag"),
    "noindex, nofollow",
    "Draft preview for editor MUST enforce x-robots-tag: noindex, nofollow",
  );
  assert.equal(
    draftPreviewResponse.headers.get("vary"),
    "Cookie",
    "Authenticated response must Vary: Cookie",
  );

  // 2. Anonymous visitor on a public route: MUST NOT have Vary: Cookie (prevents CDN cache fragmentation from tracking cookies)
  const anonRunner = createMiddlewareRunner(null);
  const publicResponse = anonRunner("https://rejuvera.sa/services/facelift");

  const publicCacheControl = publicResponse.headers.get("cache-control") || "";
  assert.ok(
    publicCacheControl.includes("public"),
    "Anonymous visitor public route MUST allow public cache",
  );
  assert.ok(
    publicCacheControl.includes("s-maxage=60"),
    "Anonymous visitor public route MUST carry s-maxage=60 for fast edge caching",
  );
  assert.equal(
    publicResponse.headers.get("x-robots-tag"),
    "all",
    "Anonymous visitor public route MUST carry x-robots-tag: all for Googlebot",
  );
  assert.equal(
    publicResponse.headers.get("vary"),
    null,
    "Public page MUST NOT set Vary: Cookie to avoid cache fragmentation from third-party tracking cookies",
  );

  // 3. Verify existing Vary headers (e.g. Next.js RSC) are preserved on authenticated routes
  const rscRunner = createMiddlewareRunner(
    { user: { id: "usr_editor_1", role: "EDITOR" } },
    { Vary: "RSC, Next-Router-State-Tree" },
  );
  const rscResponse = rscRunner("https://rejuvera.sa/services/draft-procedure");
  assert.equal(
    rscResponse.headers.get("vary"),
    "RSC, Next-Router-State-Tree, Cookie",
    "Existing Vary headers must NOT be clobbered when Cookie is appended on authenticated routes",
  );
});

test("[Unit] canAccessAdminRoute: Only authorized content roles may preview services and doctors", () => {
  const authorizedRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
  ];

  const unauthorizedRoles = [
    UserRole.VIEWER, // Call center - leads only
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
    UserRole.RECEPTIONIST,
    UserRole.AUDITOR,
  ];

  // 1. Services Management Route (/admin/services)
  for (const role of authorizedRoles) {
    assert.equal(
      canAccessAdminRoute("/admin/services", role as any),
      true,
      `Role ${role} MUST be authorized to manage/preview services`,
    );
  }

  for (const role of unauthorizedRoles) {
    assert.equal(
      canAccessAdminRoute("/admin/services", role as any),
      false,
      `Role ${role} MUST NOT be authorized to manage/preview services`,
    );
  }

  assert.equal(
    canAccessAdminRoute("/admin/services", undefined),
    false,
    "Unauthenticated/anonymous user MUST NOT access services",
  );

  // 2. Doctors Management Route (/admin/doctors)
  for (const role of authorizedRoles) {
    assert.equal(
      canAccessAdminRoute("/admin/doctors", role as any),
      true,
      `Role ${role} MUST be authorized to manage/preview doctors`,
    );
  }

  for (const role of unauthorizedRoles) {
    assert.equal(
      canAccessAdminRoute("/admin/doctors", role as any),
      false,
      `Role ${role} MUST NOT be authorized to manage/preview doctors`,
    );
  }

  assert.equal(
    canAccessAdminRoute("/admin/doctors", undefined),
    false,
    "Unauthenticated/anonymous user MUST NOT access doctors",
  );
});

test("[Mocked Integration] createContactLead: First-Touch Attribution, Multi-Touch Click IDs, and Non-destructive Storage", async () => {
  const prevDbUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";

  const originalFindFirst = prisma.contactSubmission.findFirst;
  const originalUpdate = prisma.contactSubmission.update;
  const originalCreate = prisma.contactSubmission.create;
  const originalServiceFindFirst = prisma.service.findFirst;
  const originalTransaction = prisma.$transaction;

  let capturedUpdateData: any = null;
  let capturedQueryWhere: any = null;

  try {
    (prisma as any).$transaction = async (callback: any) => callback(prisma);
    // 1. Existing lead with long message and initial notes
    const longOriginalMessage = "أ".repeat(5800);
    const existingSubmission = {
      id: "sub_first_touch_1",
      fullName: "سارة أحمد",
      phone: "0501234567",
      preferredLanguage: "ar",
      source: "Google Ads",
      message: longOriginalMessage,
      internalNotes: "ملاحظة أولى من الفريق الطبي للمتابعة",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "facelift-campaign-original",
      utmContent: "banner_v1",
      utmTerm: "شد الوجه بالرياض",
      gclid: "gclid_click_111",
      gbraid: null,
      wbraid: null,
      landingPageUrl: "https://rejuvera.sa/services/facelift",
      referrerUrl: "https://google.com",
    };

    (prisma.service as any).findFirst = async () => ({ id: "srv_facelift" });
    (prisma.contactSubmission as any).findFirst = async (args: any) => {
      capturedQueryWhere = args.where;
      return existingSubmission;
    };
    (prisma.contactSubmission as any).update = async (args: any) => {
      capturedUpdateData = args.data;
      return { ...existingSubmission, ...args.data };
    };

    // Submitting a secondary touch with a NEW click ID from the SAME campaign + a 1,000-char message
    const followUpMessage = "ب".repeat(1000);
    const result = await createContactLead({
      fullName: "سارة أحمد",
      phone: "0501234567",
      serviceSlug: "facelift",
      source: "Google Ads",
      message: followUpMessage,
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "facelift-campaign-original",
      gclid: "gclid_click_222", // NEW Click ID for same campaign!
      landingPageUrl: "https://rejuvera.sa/p/summer-facelift",
      referrerUrl: "https://google.com",
      notes: "المريضة تفضل موعد صباح الأحد",
    });

    assert.equal(result.mode, "duplicate");
    assert.equal(capturedQueryWhere.phone, "0501234567");

    // CRITICAL: First-Touch Attribution fields MUST NOT be overwritten
    assert.equal(capturedUpdateData.source, "Google Ads");
    assert.equal(result.submission.utmSource, "google");
    assert.equal(result.submission.utmCampaign, "facelift-campaign-original");
    assert.equal(
      result.submission.gclid,
      "gclid_click_111",
      "Original First-Touch gclid must be preserved",
    );
    assert.equal(
      result.submission.landingPageUrl,
      "https://rejuvera.sa/services/facelift",
    );

    // TASK 3: Verify that a new Click ID for the same campaign is identified and logged as a new touch event
    assert.ok(
      capturedUpdateData.internalNotes.includes('"gclid":"gclid_click_222"'),
      "New click ID must be identified and logged in internalNotes",
    );
    assert.ok(
      capturedUpdateData.internalNotes.includes("المريضة تفضل موعد صباح الأحد"),
      "Follow-up notes must be preserved",
    );

    // BLOCKER 1: Verify ZERO silent message loss (5,800 chars + 1,000 chars preserved in full)
    assert.ok(
      capturedUpdateData.message.startsWith(longOriginalMessage),
      "Original 5,800-character message must be preserved in full without truncation",
    );
    assert.ok(
      capturedUpdateData.message.includes(followUpMessage),
      "New 1,000-character follow-up message must be preserved in full without loss",
    );
    assert.ok(
      capturedUpdateData.message.length >= 6800,
      `Merged message length must be >= 6800 chars, got ${capturedUpdateData.message.length}`,
    );

    // 2. TASK 3 Retry verification: repeating the exact same submission with gclid_click_222 must be idempotent
    const duplicateWithLoggedTouch = {
      ...existingSubmission,
      internalNotes: capturedUpdateData.internalNotes,
      message: capturedUpdateData.message,
    };
    (prisma.contactSubmission as any).findFirst = async () =>
      duplicateWithLoggedTouch;
    let retryUpdateData: any = null;
    (prisma.contactSubmission as any).update = async (args: any) => {
      retryUpdateData = args.data;
      return { ...duplicateWithLoggedTouch, ...args.data };
    };

    await createContactLead({
      fullName: "سارة أحمد",
      phone: "0501234567",
      serviceSlug: "facelift",
      source: "Google Ads",
      message: followUpMessage,
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "facelift-campaign-original",
      gclid: "gclid_click_222", // Identical Click ID resubmitted (network retry)
      notes: "المريضة تفضل موعد صباح الأحد",
    });

    // Count occurrences of the click signature in notes
    const matches =
      retryUpdateData.internalNotes.match(/"gclid":"gclid_click_222"/g) || [];
    assert.equal(
      matches.length,
      1,
      "Retry of the identical click event MUST NOT duplicate the touch log",
    );

    // BLOCKER 2: Verify non-destructive notes handling when total notes length is very large
    const largeHistoricalNotes = "ج".repeat(9000);
    const submissionWithLargeNotes = {
      ...existingSubmission,
      internalNotes: largeHistoricalNotes,
    };
    (prisma.contactSubmission as any).findFirst = async () =>
      submissionWithLargeNotes;
    let largeNoteUpdateData: any = null;
    (prisma.contactSubmission as any).update = async (args: any) => {
      largeNoteUpdateData = args.data;
      return { ...submissionWithLargeNotes, ...args.data };
    };

    await createContactLead({
      fullName: "سارة أحمد",
      phone: "0501234567",
      serviceSlug: "facelift",
      notes: "ملاحظة جديدة إضافية للمريض",
    });

    assert.ok(
      largeNoteUpdateData.internalNotes.startsWith(largeHistoricalNotes),
      "Existing historical notes over 8000 chars must NOT be truncated",
    );
    assert.ok(
      largeNoteUpdateData.internalNotes.includes("ملاحظة جديدة إضافية للمريض"),
      "New note must be preserved without data loss",
    );
    assert.equal(
      largeNoteUpdateData.internalNotes.includes("ملاحظات سابقة مقطوعة"),
      false,
      "Must not contain destructive truncation marker",
    );
  } finally {
    process.env.DATABASE_URL = prevDbUrl;
    prisma.contactSubmission.findFirst = originalFindFirst;
    prisma.contactSubmission.update = originalUpdate;
    prisma.contactSubmission.create = originalCreate;
    prisma.service.findFirst = originalServiceFindFirst;
    prisma.$transaction = originalTransaction;
  }
});

test("[Mocked Integration] createContactLead: Scoping and isolation for unseeded and general services", async () => {
  const prevDbUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";

  const originalFindFirst = prisma.contactSubmission.findFirst;
  const originalCreate = prisma.contactSubmission.create;
  const originalServiceFindFirst = prisma.service.findFirst;
  const originalTransaction = prisma.$transaction;

  let capturedQueryWhere: any = null;
  let capturedCreateData: any = null;

  try {
    (prisma as any).$transaction = async (callback: any) => callback(prisma);
    (prisma.service as any).findFirst = async () => null; // Unseeded service
    (prisma.contactSubmission as any).findFirst = async (args: any) => {
      capturedQueryWhere = args.where;
      return null; // Simulate new submission
    };
    (prisma.contactSubmission as any).create = async (args: any) => {
      capturedCreateData = args.data;
      return { id: "sub_new_1", ...args.data };
    };

    // 1. Unseeded specific service inquiry (e.g. custom laser)
    await createContactLead({
      fullName: "نورة خالد",
      phone: "0559876543",
      serviceSlug: "laser-contouring-custom",
    });

    assert.equal(capturedQueryWhere.serviceId, null);
    assert.deepEqual(
      capturedQueryWhere.tags,
      { has: "service:laser-contouring-custom" },
      "Unseeded service query MUST filter specifically for service:<slug> tag",
    );
    assert.ok(
      capturedCreateData.tags.includes("service:laser-contouring-custom"),
      "Created submission MUST carry service:<slug> tag",
    );

    // 2. General inquiry (no service slug)
    await createContactLead({
      fullName: "نورة خالد",
      phone: "0559876543",
      landingPageUrl: "https://rejuvera.sa/contact",
    });

    assert.equal(capturedQueryWhere.serviceId, null);
    assert.deepEqual(
      capturedQueryWhere.tags,
      { has: GENERAL_INQUIRY_SERVICE_AR },
      "General inquiry query MUST filter specifically for general inquiry tag",
    );
    assert.equal(
      capturedQueryWhere.landingPageUrl,
      "https://rejuvera.sa/contact",
      "General inquiry query MUST scope by landing page URL",
    );
    assert.ok(
      capturedCreateData.tags.includes(GENERAL_INQUIRY_SERVICE_AR),
      "Created general inquiry MUST carry GENERAL_INQUIRY_SERVICE_AR tag",
    );
  } finally {
    process.env.DATABASE_URL = prevDbUrl;
    prisma.contactSubmission.findFirst = originalFindFirst;
    prisma.contactSubmission.create = originalCreate;
    prisma.service.findFirst = originalServiceFindFirst;
    prisma.$transaction = originalTransaction;
  }
});

test("[Unit] buildCsp: Sensitive routes receive strict frame-ancestors none", () => {
  const nonce = "test-nonce-12345";

  // Strict CSP for sensitive surfaces (admin, portal, login)
  const sensitiveCsp = buildCsp("frame-ancestors 'none'", nonce);
  assert.ok(
    sensitiveCsp.includes("frame-ancestors 'none'"),
    "Sensitive CSP must strictly enforce frame-ancestors 'none'",
  );
  assert.ok(
    sensitiveCsp.includes(`'nonce-${nonce}'`),
    "CSP must bind the request nonce",
  );

  // Public CSP allowing required Google framing
  const publicCsp = buildCsp(
    "frame-ancestors 'self' https://tagassistant.google.com https://*.google.com https://*.googleusercontent.com",
    nonce,
  );
  assert.ok(
    publicCsp.includes("https://tagassistant.google.com"),
    "Public CSP must permit tag assistant while maintaining self boundaries",
  );
});
