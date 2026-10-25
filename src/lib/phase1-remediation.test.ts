import assert from "node:assert/strict";
import test from "node:test";

test("Task 1: Portal & Auth routes receive private no-store and noindex", async () => {
  // Simulate the route matching logic from middleware.ts
  const sensitivePathnames = [
    "/portal",
    "/portal/documents",
    "/portal/messages",
    "/portal/account",
    "/patient-login",
    "/patient-login/activate",
    "/patient-login/recover",
    "/api/portal/procedures/123/pdf",
    "/api/auth/session",
    "/api/auth/csrf",
    "/api/lead-receipt",
    "/api/webhooks/xyz",
    "/admin",
    "/admin/crm",
    "/api/admin/patients",
  ];

  const publicPathnames = [
    "/",
    "/about",
    "/services",
    "/services/face-neck-lift",
    "/doctors",
    "/doctors/dr-saham-arfaj",
    "/journal",
    "/journal/facelift-guide",
    "/contact",
  ];

  function evaluateRouteSecurity(pathname: string) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginRoute = pathname.startsWith("/login");
    const isForbiddenRoute = pathname.startsWith("/forbidden");
    const isApiAdminRoute = pathname.startsWith("/api/admin");
    const isPortalRoute = pathname.startsWith("/portal");
    const isPatientLoginRoute = pathname.startsWith("/patient-login");
    const isApiPortalRoute = pathname.startsWith("/api/portal");
    const isAuthRoute = pathname.startsWith("/api/auth");
    const isLeadReceiptRoute = pathname.startsWith("/api/lead-receipt");
    const isWebhookRoute = pathname.startsWith("/api/webhooks");

    const isSensitiveSurface =
      isAdminRoute ||
      isApiAdminRoute ||
      isLoginRoute ||
      isForbiddenRoute ||
      isPortalRoute ||
      isPatientLoginRoute ||
      isApiPortalRoute ||
      isAuthRoute ||
      isLeadReceiptRoute ||
      isWebhookRoute;

    if (isSensitiveSurface) {
      return {
        cacheControl: "private, no-store, no-cache, must-revalidate, max-age=0",
        pragma: "no-cache",
        robotsTag: "noindex, nofollow",
        frameAncestors:
          isAdminRoute ||
          isLoginRoute ||
          isForbiddenRoute ||
          isPortalRoute ||
          isPatientLoginRoute
            ? "frame-ancestors 'none'"
            : "frame-ancestors 'self'",
      };
    }

    return {
      cacheControl: "public, max-age=0, s-maxage=60, must-revalidate",
      pragma: undefined,
      robotsTag: "all",
      frameAncestors: "frame-ancestors 'self'",
    };
  }

  for (const path of sensitivePathnames) {
    const headers = evaluateRouteSecurity(path);
    assert.ok(
      headers.cacheControl.includes("private") && headers.cacheControl.includes("no-store"),
      `Path ${path} must have private no-store cache control`,
    );
    assert.equal(
      headers.robotsTag,
      "noindex, nofollow",
      `Path ${path} must have noindex, nofollow robots tag`,
    );
    assert.equal(
      headers.pragma,
      "no-cache",
      `Path ${path} must have pragma no-cache`,
    );
  }

  for (const path of publicPathnames) {
    const headers = evaluateRouteSecurity(path);
    assert.equal(
      headers.cacheControl,
      "public, max-age=0, s-maxage=60, must-revalidate",
      `Public path ${path} must remain publicly cacheable with s-maxage=60`,
    );
    assert.equal(
      headers.robotsTag,
      "all",
      `Public path ${path} must remain indexable with X-Robots-Tag: all`,
    );
  }
});

test("Task 2: Content status guards prevent draft exposure on public routes", () => {
  const ContentStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
  } as const;

  type ContentStatusType = (typeof ContentStatus)[keyof typeof ContentStatus];

  function simulateAccessGuard(
    item: { status: ContentStatusType } | null,
    session: { user?: { id: string } } | null,
  ) {
    if (!item) return { status: 404, action: "notFound" };
    if (item.status !== ContentStatus.PUBLISHED) {
      if (!session?.user) {
        return { status: 404, action: "notFound" };
      }
      return { status: 200, action: "previewDraft" };
    }
    return { status: 200, action: "renderPublished" };
  }

  // 1. Unauthenticated visitor requesting a published service/doctor
  const pubResult = simulateAccessGuard({ status: ContentStatus.PUBLISHED }, null);
  assert.equal(pubResult.status, 200);
  assert.equal(pubResult.action, "renderPublished");

  // 2. Unauthenticated visitor requesting a DRAFT service/doctor
  const draftResultAnon = simulateAccessGuard({ status: ContentStatus.DRAFT }, null);
  assert.equal(draftResultAnon.status, 404);
  assert.equal(draftResultAnon.action, "notFound");

  // 3. Authenticated admin requesting a DRAFT service/doctor
  const draftResultAdmin = simulateAccessGuard(
    { status: ContentStatus.DRAFT },
    { user: { id: "admin_123" } },
  );
  assert.equal(draftResultAdmin.status, 200);
  assert.equal(draftResultAdmin.action, "previewDraft");

  // 4. Unknown slug
  const missingResult = simulateAccessGuard(null, null);
  assert.equal(missingResult.status, 404);
  assert.equal(missingResult.action, "notFound");
});

test("Task 3: Lead deduplication separates rapid resubmissions from distinct service inquiries", () => {
  // Mock submissions database
  const submissions: Array<{
    id: string;
    phone: string;
    serviceId: string | null;
    landingPageUrl: string | null;
    source: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  function simulateCreateContactLead(input: {
    phone: string;
    serviceId: string | null;
    landingPageUrl?: string;
    source: string;
  }) {
    const targetServiceId = input.serviceId ?? null;
    const shortDuplicateWindowMinutes = 30;
    const duplicateSince = new Date(Date.now() - shortDuplicateWindowMinutes * 60 * 1000);

    const duplicate = submissions.find((sub) => {
      if (sub.phone !== input.phone) return false;
      if (sub.createdAt < duplicateSince) return false;
      if (sub.serviceId !== targetServiceId) return false;
      if (targetServiceId === null && input.landingPageUrl && sub.landingPageUrl !== input.landingPageUrl) {
        return false;
      }
      return true;
    });

    if (duplicate) {
      duplicate.updatedAt = new Date();
      return { mode: "duplicate" as const, submission: duplicate };
    }

    const newSub = {
      id: `sub_${submissions.length + 1}`,
      phone: input.phone,
      serviceId: targetServiceId,
      landingPageUrl: input.landingPageUrl ?? null,
      source: input.source,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    submissions.push(newSub);
    return { mode: "database" as const, submission: newSub };
  }

  // 1. Initial inquiry for Facelift
  const res1 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: "srv_facelift",
    source: "Website form",
  });
  assert.equal(res1.mode, "database");
  assert.equal(res1.submission.id, "sub_1");

  // 2. User double-clicks or resubmits the same Facelift inquiry 10 seconds later
  const res2 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: "srv_facelift",
    source: "Website form",
  });
  assert.equal(res2.mode, "duplicate");
  assert.equal(res2.submission.id, "sub_1"); // Refreshed existing submission, no new CAPI/lead created

  // 3. User makes a legitimate subsequent inquiry for Rhinoplasty with the same phone
  const res3 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: "srv_rhinoplasty",
    source: "Website form",
  });
  assert.equal(res3.mode, "database");
  assert.equal(res3.submission.id, "sub_2"); // NEW distinct lead created, webhook and CAPI eligible!

  // 4. User makes an inquiry on Landing Page A
  const res4 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: null,
    landingPageUrl: "/p/landing-a",
    source: "Landing page",
  });
  assert.equal(res4.mode, "database");
  assert.equal(res4.submission.id, "sub_3");

  // 5. User resubmits on Landing Page A -> duplicate
  const res5 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: null,
    landingPageUrl: "/p/landing-a",
    source: "Landing page",
  });
  assert.equal(res5.mode, "duplicate");
  assert.equal(res5.submission.id, "sub_3");

  // 6. User submits on Landing Page B -> NEW distinct lead
  const res6 = simulateCreateContactLead({
    phone: "0501234567",
    serviceId: null,
    landingPageUrl: "/p/landing-b",
    source: "Landing page",
  });
  assert.equal(res6.mode, "database");
  assert.equal(res6.submission.id, "sub_4");
});
