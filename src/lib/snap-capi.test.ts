import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

import {
  buildSnapSignUpEvent,
  getSnapRequestSignals,
  sendSnapSignUpCapi,
} from "./snap-capi.ts";

test("v3 event is generic, has top-level dedup ID, and allowlists matching signals", () => {
  const request = new Request("https://rejuvera.sa/api/leads", {
    headers: {
      referer:
        "https://rejuvera.sa/p/private-medical-service?phone=0550000000&ScCid=snap-click-1",
      cookie: "auth=do-not-forward; _scid=snap-cookie-1; patient=private",
      "user-agent": "Test Browser",
    },
  });
  const event = buildSnapSignUpEvent(
    {
      dedupId: "rv_snap_saved-1",
      ip: "192.0.2.1",
      ...getSnapRequestSignals(request),
    },
    1_700_000_000_000,
  );
  assert.deepEqual(event, {
    event_name: "SIGN_UP",
    action_source: "WEB",
    event_time: 1_700_000_000,
    event_id: "rv_snap_saved-1",
    event_source_url: "https://rejuvera.sa/",
    user_data: {
      client_ip_address: "192.0.2.1",
      client_user_agent: "Test Browser",
      sc_click_id: "snap-click-1",
      sc_cookie1: "snap-cookie-1",
    },
  });
  assert.doesNotMatch(
    JSON.stringify(event),
    /0550000000|private-medical|auth|patient|custom_data|phone|email/,
  );
});

test("malformed identifiers and cookies are ignored and visitor opt-outs respected", () => {
  const signals = getSnapRequestSignals(
    new Request("https://rejuvera.sa/api/contact", {
      headers: {
        referer: "invalid",
        cookie: "_scid=%invalid",
        "sec-gpc": "1",
      },
    }),
  );
  assert.equal(signals.trackingDisabled, true);
  assert.equal(signals.cookieId, undefined);
  assert.equal(signals.clickId, undefined);
  const event = buildSnapSignUpEvent({
    dedupId: "saved",
    ip: "unknown",
    clickId: "medical service",
  });
  assert.deepEqual(event.user_data, {});
});

test("delivery uses v3, checks Snap JSON status, fails open, and never logs secrets", async (t) => {
  t.mock.method(console, "warn", () => {});
  t.mock.method(console, "info", () => {});
  const before = {
    pixel: process.env.SNAP_PIXEL_ID,
    token: process.env.SNAP_CAPI_TOKEN,
    test: process.env.SNAP_TEST_EVENT_CODE,
  };
  try {
    process.env.SNAP_PIXEL_ID = "pixel-test";
    process.env.SNAP_CAPI_TOKEN = "secret-test-token";
    delete process.env.SNAP_TEST_EVENT_CODE;
    const calls: Array<{ url: string; body: string }> = [];
    let status = "VALID";
    let throws = false;
    t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
      calls.push({ url: String(url), body: String(init.body) });
      if (throws) throw new Error("secret-test-token must never be logged");
      return Response.json({ status });
    });
    const payload = {
      dedupId: "saved-1",
      ip: "192.0.2.1",
      userAgent: "Test Browser",
    };
    assert.equal(await sendSnapSignUpCapi(payload), true);
    assert.match(calls[0]!.url, /\/v3\/pixel-test\/events\?access_token=/);
    assert.equal(JSON.parse(calls[0]!.body).data[0].event_id, "saved-1");
    assert.doesNotMatch(calls[0]!.body, /secret-test-token|test_event_code/);
    status = "INVALID";
    assert.equal(await sendSnapSignUpCapi(payload), false);
    throws = true;
    assert.equal(await sendSnapSignUpCapi(payload), false);
    const count = calls.length;
    assert.equal(
      await sendSnapSignUpCapi({ ...payload, trackingDisabled: true }),
      false,
    );
    assert.equal(
      await sendSnapSignUpCapi({ ...payload, ip: "unknown" }),
      false,
    );
    delete process.env.SNAP_CAPI_TOKEN;
    assert.equal(await sendSnapSignUpCapi(payload), false);
    assert.equal(calls.length, count);
  } finally {
    for (const [key, value] of [
      ["SNAP_PIXEL_ID", before.pixel],
      ["SNAP_CAPI_TOKEN", before.token],
      ["SNAP_TEST_EVENT_CODE", before.test],
    ]) {
      if (value === undefined) delete process.env[key!];
      else process.env[key!] = value;
    }
  }
});

const require = createRequire(import.meta.url);

test("native browser SIGN_UP fires once with the same server event ID and no patient fields", () => {
  const source = readFileSync(
    new URL("./snap-pixel.ts", import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const calls: unknown[][] = [];
  const exports: {
    fireSnapSignUp?: (phone: undefined, email: undefined, id: string) => void;
  } = {};
  vm.runInNewContext(js, {
    exports,
    window: { snaptr: (...args: unknown[]) => calls.push(args) },
  });
  exports.fireSnapSignUp!(undefined, undefined, "rv_snap_saved-1");
  assert.equal(calls.length, 1);
  assert.equal(
    JSON.stringify(calls[0]),
    JSON.stringify([
      "track",
      "SIGN_UP",
      { client_dedup_id: "rv_snap_saved-1" },
    ]),
  );
  assert.equal(
    (calls[0]![2] as { client_dedup_id: string }).client_dedup_id,
    buildSnapSignUpEvent({ dedupId: "rv_snap_saved-1" }).event_id,
  );
});

function routeHarness(
  route: "contact" | "leads",
  mode: "database" | "duplicate" | "preview" | "failure",
) {
  const afterTasks: Array<() => Promise<void>> = [];
  const capiCalls: unknown[] = [];
  const webhookCalls: unknown[] = [];
  const modules: Record<string, unknown> = {
    "next/cache": { revalidatePath: () => {} },
    "next/server": {
      after: (task: () => Promise<void>) => afterTasks.push(task),
      NextResponse: {
        json: Response.json,
        redirect: (url: URL, init: ResponseInit) =>
          new Response(null, { ...init, headers: { location: String(url) } }),
      },
    },
    "@/lib/app-log": { recordAppLog: async () => {} },
    "@/lib/content-repository": {
      getRuntimeSettings: async () => ({ ops: { recaptchaEnabled: false } }),
      getServiceByReference: async () => null,
      getCustomPageLeadWebhookBySlug: async () => null,
      isBlockedIpAddress: async () => false,
      createContactLead: async () => {
        if (mode === "failure") throw new Error("DB failed");
        return { mode, submission: { id: "saved-1" } };
      },
    },
    "@/lib/form-webhook": {
      dispatchFormWebhook: async (value: unknown) => webhookCalls.push(value),
      dispatchJsonWebhook: async () => {},
    },
    "@/lib/general-inquiry": {
      GENERAL_INQUIRY_SERVICE_AR: "general",
      GENERAL_INQUIRY_SERVICE_VALUE: "general-inquiry",
      isGeneralInquiryService: () => true,
    },
    "@/lib/lead-request-metadata": { getLeadRequestMetadata: () => ({}) },
    "@/lib/lead-receipt": { createLeadReceipt: () => "signed-receipt" },
    "@/lib/lead-intake-guard": {
      evaluateLeadIntakeGuard: () => ({ ok: true }),
      LEAD_DUPLICATE_MESSAGE: "duplicate",
      LEAD_SPAM_GUARD_MESSAGE: "spam",
      LEAD_HONEYPOT_FIELD: "website",
      LEAD_RENDERED_AT_FIELD: "renderedAt",
    },
    "@/lib/rate-limit": {
      extractClientIp: () => "192.0.2.1",
      rateLimit: () => ({ ok: true }),
    },
    "@/lib/recaptcha": {
      verifyRecaptchaToken: async () => ({ success: true, score: 1 }),
    },
    "@/lib/request-tracking": {
      mergeRequestTracking: (value: unknown) => value,
    },
    "@/lib/saudi-phone": {
      normalizeSaudiMobileNumber: (value: string) => value,
      SAUDI_MOBILE_REGEX: /^05\d{8}$/,
      SAUDI_MOBILE_ERROR_MESSAGE: "invalid phone",
    },
    "@/lib/snap-capi": {
      getSnapRequestSignals,
      sendSnapSignUpCapi: async (value: unknown) => {
        capiCalls.push(value);
        return false;
      },
    },
  };
  const source = readFileSync(
    new URL(`../app/api/${route}/route.ts`, import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports: { POST?: (request: Request) => Promise<Response> } = {};
  vm.runInNewContext(js, {
    exports,
    require: (name: string) => modules[name] ?? require(name),
    Request,
    Response,
    URL,
    FormData,
    console,
    process,
  });
  return { post: exports.POST!, afterTasks, capiCalls, webhookCalls };
}

for (const route of ["contact", "leads"] as const) {
  for (const mode of ["database", "duplicate", "preview", "failure"] as const) {
    test(`${route}: CAPI scheduled once only for a new persisted lead (${mode})`, async () => {
      const harness = routeHarness(route, mode);
      const form = new FormData();
      form.set("fullName", "Test Request");
      form.set("phone", "0500000000");
      const response = await harness.post(
        new Request(`https://rejuvera.sa/api/${route}`, {
          method: "POST",
          body: form,
          headers: { accept: "application/json", "user-agent": "Test Browser" },
        }),
      );
      const json = await response.json();
      assert.equal(harness.afterTasks.length, mode === "database" ? 1 : 0);
      assert.equal(
        harness.capiCalls.length,
        0,
        "tracking must not delay the response",
      );
      if (mode === "database") {
        assert.equal(json.ok, true);
        assert.equal(json.saved, true);
        assert.equal(json.snapDedupId, "rv_snap_saved-1");
        assert.equal(harness.webhookCalls.length, 1);
        await harness.afterTasks[0]!();
        assert.equal(harness.capiCalls.length, 1);
        assert.doesNotMatch(
          JSON.stringify(harness.capiCalls),
          /0500000000|Test Request|service|email|phone/,
        );
      } else if (mode === "duplicate") {
        assert.equal(json.duplicate, true);
        assert.equal(harness.webhookCalls.length, 0);
      } else {
        assert.equal(json.ok, false);
      }
    });
  }
  test(`${route}: validation failure never schedules Snap`, async () => {
    const harness = routeHarness(route, "database");
    const response = await harness.post(
      new Request(`https://rejuvera.sa/api/${route}`, {
        method: "POST",
        body: new FormData(),
        headers: { accept: "application/json" },
      }),
    );
    assert.equal(response.status, 400);
    assert.equal(harness.afterTasks.length, 0);
  });
  test(`${route}: native submission preserves redirect and queues one deduplicated event`, async () => {
    const harness = routeHarness(route, "database");
    const form = new FormData();
    form.set("fullName", "Test Request");
    form.set("phone", "0500000000");
    const response = await harness.post(
      new Request(`https://rejuvera.sa/api/${route}`, {
        method: "POST",
        body: form,
        headers: {
          referer: "https://rejuvera.sa/p/test-page",
          "user-agent": "Test Browser",
        },
      }),
    );
    assert.equal(response.status, 303);
    assert.match(
      response.headers.get("location")!,
      /lead=success&lead_receipt=signed-receipt/,
    );
    assert.equal(harness.afterTasks.length, 1);
  });
}
