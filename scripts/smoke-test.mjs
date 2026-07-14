const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const checks = [
  { path: "/", type: "text/html" },
  { path: "/services", type: "text/html" },
  { path: "/services/skin-rejuvenation", type: "text/html" },
  { path: "/doctors", type: "text/html" },
  { path: "/doctors/loai-alsalmi", type: "text/html" },
  { path: "/devices", type: "text/html" },
  { path: "/gallery", type: "text/html" },
  { path: "/journal", type: "text/html" },
  { path: "/journal/skin-renewal-timing", type: "text/html" },
  { path: "/about", type: "text/html" },
  { path: "/contact", type: "text/html" },
  { path: "/privacy", type: "text/html" },
  { path: "/terms", type: "text/html" },
  {
    path: "/sitemap.xml",
    type: "application/xml",
    contains: ["<urlset", "https://rejuvera.sa"],
  },
  {
    path: "/robots.txt",
    type: "text/plain",
    contains: ["Sitemap: https://rejuvera.sa/sitemap.xml"],
  },
  { path: "/api/health", type: "application/json" },
  {
    path: "/api/leads",
    type: "application/json",
    contains: ["serviceTypeAr"],
  },
  // Patient portal public surfaces.
  { path: "/patient-login", type: "text/html", contains: ["بوابة المرضى"] },
  { path: "/patient-login/recover", type: "text/html" },
  { path: "/patient-login/activate", type: "text/html" },
  { path: "/patient-login/privacy", type: "text/html", contains: ["الخصوصية"] },
];

const failures = [];

async function checkRoute({ path, type, contains = [] }) {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    headers: { "user-agent": "rejuvera-smoke-test/1.0" },
  });
  const elapsedMs = Math.round(performance.now() - startedAt);
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const okStatus = response.status >= 200 && response.status < 400;
  const okType = contentType.toLowerCase().includes(type);
  const missingText = contains.filter((expected) => !body.includes(expected));
  const hasRuntimeError =
    /Unhandled Runtime Error|Application error|خطأ غير متوقع|حدث خطأ/i.test(
      body,
    );

  if (!okStatus || !okType || missingText.length || hasRuntimeError) {
    failures.push({
      path,
      status: response.status,
      contentType,
      elapsedMs,
      reason: [
        okStatus ? "" : "bad-status",
        okType ? "" : "bad-content-type",
        missingText.length ? `missing:${missingText.join("|")}` : "",
        hasRuntimeError ? "runtime-error-text" : "",
      ]
        .filter(Boolean)
        .join(","),
    });
  }

  console.log(
    `${okStatus && okType && !hasRuntimeError ? "PASS" : "FAIL"} ${response.status} ${path} ${elapsedMs}ms ${contentType}`,
  );
}

for (const check of checks) {
  await checkRoute(check);
}

const invalidLeadResponse = await fetch(`${baseUrl}/api/leads`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ fullName: "Smoke Test" }),
});
const invalidLeadRejected =
  invalidLeadResponse.status >= 400 && invalidLeadResponse.status < 500;
if (!invalidLeadRejected) {
  failures.push({
    path: "/api/leads",
    status: invalidLeadResponse.status,
    contentType: invalidLeadResponse.headers.get("content-type") || "",
    elapsedMs: 0,
    reason: "lead-validation-did-not-reject-missing-phone",
  });
}
console.log(
  `${invalidLeadRejected ? "PASS" : "FAIL"} ${invalidLeadResponse.status} /api/leads validation`,
);

const missingWebhookResponse = await fetch(
  `${baseUrl}/api/webhooks/smoke-test-token`,
  {
    headers: { accept: "application/json" },
  },
);
const missingWebhookRejected = missingWebhookResponse.status === 404;
if (!missingWebhookRejected) {
  failures.push({
    path: "/api/webhooks/smoke-test-token",
    status: missingWebhookResponse.status,
    contentType: missingWebhookResponse.headers.get("content-type") || "",
    elapsedMs: 0,
    reason: "missing-webhook-token-did-not-404",
  });
}
console.log(
  `${missingWebhookRejected ? "PASS" : "FAIL"} ${missingWebhookResponse.status} /api/webhooks missing token`,
);

// --- Patient portal auth boundaries -------------------------------------
// Unauthenticated access to the portal must never leak data: pages redirect
// to /patient-login and the PDF/document APIs return 401.
async function expectAuthGate(path, { allow = [301, 302, 307, 308, 401, 403] } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    headers: { "user-agent": "rejuvera-smoke-test/1.0" },
  });
  const gated = allow.includes(response.status);
  if (!gated) {
    failures.push({
      path,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      elapsedMs: 0,
      reason: `portal-auth-gate-not-enforced (got ${response.status})`,
    });
  }
  console.log(
    `${gated ? "PASS" : "FAIL"} ${response.status} ${path} (portal auth gate)`,
  );
}

await expectAuthGate("/portal");
await expectAuthGate("/portal/messages");
await expectAuthGate("/portal/documents");
await expectAuthGate("/portal/account");
await expectAuthGate("/api/portal/procedures/00000000-0000-0000-0000-000000000000/pdf");
await expectAuthGate("/api/portal/documents/00000000-0000-0000-0000-000000000000");
// Admin patient area must reject anonymous users (redirect to /login).
await expectAuthGate("/admin/patients");
await expectAuthGate("/api/admin/patients/procedures/00000000-0000-0000-0000-000000000000/pdf");

if (failures.length) {
  console.error("\nSmoke test failures:");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`\nSmoke test passed for ${baseUrl}`);
