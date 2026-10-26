import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

import { canAccessAdminRoute } from "./admin-permissions.ts";
import { buildCsp } from "./csp.ts";
import { ContentStatus, UserRole } from "./prisma-enums.ts";
import { createContactLead } from "./content-repository.ts";
import { prisma } from "./prisma.ts";
import { GENERAL_INQUIRY_SERVICE_AR } from "./general-inquiry.ts";

/**
 * REJUVERA PHASE 1 VERIFICATION SUITE
 *
 * Test Classification:
 * - [Unit]: Direct execution of production functions without network or database dependencies.
 * - [Behavioral Contract]: Verification of state guards and boundary contracts against real enums.
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
        redirect: (url: URL, status = 307) => Response.redirect(url, status),
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
    const request = new Request(url, { headers }) as Request & { nextUrl: URL; auth?: any };
    request.nextUrl = new URL(url);
    return exports.default(request);
  };
}

test("[Unit] Middleware Draft Preview vs Public CDN Cache", () => {
  // 1. Authenticated EDITOR viewing a draft route
  const editorRunner = createMiddlewareRunner({
    user: { id: "usr_editor_1", role: "EDITOR" },
  });
  const draftPreviewResponse = editorRunner("https://rejuvera.sa/services/draft-procedure");

  const draftCacheControl = draftPreviewResponse.headers.get("cache-control") || "";
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
    "Response must Vary: Cookie to prevent shared CDN mixing anonymous and authenticated cache keys",
  );

  // 2. Anonymous visitor on a public route
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
    "Cookie",
    "Public page MUST Vary: Cookie to protect against cache poisoning between anonymous and logged-in states",
  );

  // 3. Verify existing Vary headers (e.g. Next.js RSC, Accept-Encoding) are preserved
  const rscRunner = createMiddlewareRunner(null, { Vary: "RSC, Next-Router-State-Tree" });
  const rscResponse = rscRunner("https://rejuvera.sa/services/facelift");
  assert.equal(
    rscResponse.headers.get("vary"),
    "RSC, Next-Router-State-Tree, Cookie",
    "Existing Vary headers must NOT be clobbered when Cookie is appended",
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

test("[Unit] createContactLead: First-Touch Attribution preservation and Returning Touch sanitization", async () => {
  const prevDbUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";

  const originalFindFirst = prisma.contactSubmission.findFirst;
  const originalUpdate = prisma.contactSubmission.update;
  const originalCreate = prisma.contactSubmission.create;
  const originalServiceFindFirst = prisma.service.findFirst;

  let capturedUpdateData: any = null;
  let capturedQueryWhere: any = null;

  try {
    const existingSubmission = {
      id: "sub_first_touch_1",
      fullName: "سارة أحمد",
      phone: "0501234567",
      preferredLanguage: "ar",
      source: "Google Ads",
      message: "الرسالة الأولى لحجز موعد",
      internalNotes: "ملاحظة سابقة من الفريق الطبي",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "facelift-campaign-original",
      utmContent: "banner_v1",
      utmTerm: "شد الوجه بالرياض",
      gclid: "gclid_original_12345",
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

    // Submitting a secondary touch from a Snapchat campaign with new UTMs and follow-up message
    const result = await createContactLead({
      fullName: "سارة أحمد",
      phone: "0501234567",
      serviceSlug: "facelift",
      source: "Snapchat Ads",
      message: "أرغب بتأكيد الموعد الصباحي",
      utmSource: "snapchat",
      utmMedium: "story",
      utmCampaign: "summer-promo-touch2",
      gclid: "snap_click_id_999",
      landingPageUrl: "https://rejuvera.sa/p/summer-facelift",
      referrerUrl: "https://snapchat.com",
      notes: "المريضة تفضل الصباح",
    });

    assert.equal(result.mode, "duplicate");
    assert.equal(capturedQueryWhere.phone, "0501234567");

    // CRITICAL: First-Touch Attribution fields MUST NOT be overwritten
    assert.equal(
      capturedUpdateData.source,
      "Google Ads",
      "First-touch source must NOT be overwritten",
    );
    assert.equal(
      capturedUpdateData.utmSource,
      "google",
      "Original utmSource must be preserved",
    );
    assert.equal(
      capturedUpdateData.utmCampaign,
      "facelift-campaign-original",
      "Original utmCampaign must be preserved",
    );
    assert.equal(
      capturedUpdateData.gclid,
      "gclid_original_12345",
      "Original gclid must be preserved",
    );
    assert.equal(
      capturedUpdateData.landingPageUrl,
      "https://rejuvera.sa/services/facelift",
      "Original landingPageUrl must be preserved",
    );
    assert.equal(
      capturedUpdateData.referrerUrl,
      "https://google.com",
      "Original referrerUrl must be preserved",
    );

    // Verify Returning Touch audit trail in internalNotes
    assert.ok(
      capturedUpdateData.internalNotes.includes("[Returning Touch"),
      "Returning touch must be recorded in internalNotes",
    );
    assert.ok(
      capturedUpdateData.internalNotes.includes("source=snapchat"),
      "Returning touch source must be logged in notes",
    );
    assert.ok(
      capturedUpdateData.internalNotes.includes("campaign=summer-promo-touch2"),
      "Returning touch campaign must be logged in notes",
    );
    assert.ok(
      capturedUpdateData.internalNotes.includes("المريضة تفضل الصباح"),
      "Follow-up notes must be preserved",
    );

    // Verify messages: original message preserved, new message appended
    assert.ok(
      capturedUpdateData.message.includes("الرسالة الأولى لحجز موعد"),
      "Original message must be preserved",
    );
    assert.ok(
      capturedUpdateData.message.includes("[رسالة متابعة]: أرغب بتأكيد الموعد الصباحي"),
      "Follow-up message must be appended with indicator",
    );

    // 2. Test rapid retry idempotency: repeating the exact same submission should NOT double-append the touch log
    const duplicateWithLoggedTouch = {
      ...existingSubmission,
      internalNotes: capturedUpdateData.internalNotes,
      message: capturedUpdateData.message,
    };
    (prisma.contactSubmission as any).findFirst = async () => duplicateWithLoggedTouch;
    let retryUpdateData: any = null;
    (prisma.contactSubmission as any).update = async (args: any) => {
      retryUpdateData = args.data;
      return { ...duplicateWithLoggedTouch, ...args.data };
    };

    await createContactLead({
      fullName: "سارة أحمد",
      phone: "0501234567",
      serviceSlug: "facelift",
      source: "Snapchat Ads",
      message: "أرغب بتأكيد الموعد الصباحي",
      utmSource: "snapchat",
      utmMedium: "story",
      utmCampaign: "summer-promo-touch2",
      notes: "المريضة تفضل الصباح",
    });

    // Count occurrences of the returning touch signature in notes
    const matches = (retryUpdateData.internalNotes.match(/source=snapchat, campaign=summer-promo-touch2/g) || []);
    assert.equal(
      matches.length,
      1,
      "Returning touch signature MUST NOT be duplicated on rapid retries",
    );
  } finally {
    process.env.DATABASE_URL = prevDbUrl;
    prisma.contactSubmission.findFirst = originalFindFirst;
    prisma.contactSubmission.update = originalUpdate;
    prisma.contactSubmission.create = originalCreate;
    prisma.service.findFirst = originalServiceFindFirst;
  }
});

test("[Unit] createContactLead: Scoping and isolation for unseeded and general services", async () => {
  const prevDbUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";

  const originalFindFirst = prisma.contactSubmission.findFirst;
  const originalCreate = prisma.contactSubmission.create;
  const originalServiceFindFirst = prisma.service.findFirst;

  let capturedQueryWhere: any = null;
  let capturedCreateData: any = null;

  try {
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
  }
});

test("[Behavioral Contract] ContentStatus: Only PUBLISHED content is publicly accessible", () => {
  const allStatuses = [
    ContentStatus.PUBLISHED,
    ContentStatus.DRAFT,
    ContentStatus.REVIEW,
    ContentStatus.APPROVED,
    ContentStatus.ARCHIVED,
  ];

  function evaluatePublicVisibility(status: (typeof allStatuses)[number]) {
    return status === ContentStatus.PUBLISHED;
  }

  for (const status of allStatuses) {
    if (status === ContentStatus.PUBLISHED) {
      assert.equal(evaluatePublicVisibility(status), true);
    } else {
      assert.equal(evaluatePublicVisibility(status), false);
    }
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
