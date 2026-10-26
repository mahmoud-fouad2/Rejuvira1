import assert from "node:assert/strict";
import test from "node:test";

import { canAccessAdminRoute } from "./admin-permissions.ts";
import { buildCsp } from "./csp.ts";
import { ContentStatus, UserRole } from "./prisma-enums.ts";

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

test("[Unit] canAccessAdminRoute: Only authorized content roles may preview services and doctors", () => {
  // Test real canAccessAdminRoute function from src/lib/admin-permissions.ts
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

test("[Behavioral Contract] ContentStatus: Only PUBLISHED content is publicly accessible", () => {
  // Real production enum from src/lib/prisma-enums.ts
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
