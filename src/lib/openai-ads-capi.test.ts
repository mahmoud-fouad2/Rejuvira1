import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import {
  buildOpenAiLeadEvent,
  getOpenAiRequestSignals,
  sendOpenAiLeadCapi,
} from "./openai-ads-capi.ts";
import { OPENAI_ADS_ATTRIBUTION_SCRIPT } from "./openai-ads-attribution.ts";

test("OpenAI receives generic lead_created, never form fields or medical URLs", () => {
  const signals = getOpenAiRequestSignals(
    new Request("https://rejuvera.sa/api/leads", {
      headers: {
        referer:
          "https://rejuvera.sa/p/private?oppref=original-click_id&phone=private",
        cookie: "__oppref=older; __obref=browser-id; patient=secret",
        "user-agent": "Test Browser",
      },
    }),
  );
  const event = buildOpenAiLeadEvent({
    requestId: "saved-1",
    eventTime: 1700000000000,
    ip: "192.0.2.1",
    ...signals,
  });
  assert.deepEqual(event, {
    id: "rv_lead_saved-1",
    type: "lead_created",
    timestamp_ms: 1700000000000,
    source_url: "https://rejuvera.sa/",
    action_source: "web",
    opt_out: true,
    oppref: "original-click_id",
    user: {
      ip_address: "192.0.2.1",
      user_agent: "Test Browser",
      obref: "browser-id",
    },
    data: { type: "customer_action" },
  });
  assert.doesNotMatch(
    JSON.stringify(event),
    /private|patient|phone|email|service|doctor/,
  );
});

test("click capture never loads a pixel, reads a form or emits a conversion", () => {
  const document = { cookie: "" };
  vm.runInNewContext(OPENAI_ADS_ATTRIBUTION_SCRIPT, {
    document,
    navigator: {},
    location: { search: "?oppref=original%2Fid" },
    URLSearchParams,
  });
  assert.match(
    document.cookie,
    /^__oppref=original%2Fid;Path=\/;Max-Age=2592000;SameSite=Lax;Secure$/,
  );
  vm.runInNewContext(OPENAI_ADS_ATTRIBUTION_SCRIPT, {
    document,
    navigator: { globalPrivacyControl: true },
    location: { search: "?oppref=never" },
    URLSearchParams,
  });
  assert.match(document.cookie, /Max-Age=0/);
  assert.doesNotMatch(
    OPENAI_ADS_ATTRIBUTION_SCRIPT,
    /fetch\(|oaiq|querySelector|lead_created/,
  );
});

test("OpenAI credentials stay server-side and failures/opt-out fail open", async (t) => {
  const keys = [
    "OPENAI_ADS_CAPI_ENABLED",
    "OPENAI_ADS_PIXEL_ID",
    "OPENAI_ADS_CAPI_KEY",
  ] as const;
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const calls: Array<{ url: string; init: RequestInit }> = [];
  t.mock.method(console, "warn", () => {});
  t.mock.method(console, "info", () => {});
  let fails = false;
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(null, { status: fails ? 400 : 200 });
  });
  try {
    process.env.OPENAI_ADS_CAPI_ENABLED = "1";
    process.env.OPENAI_ADS_PIXEL_ID = "public-pixel";
    process.env.OPENAI_ADS_CAPI_KEY = "private-key";
    const payload = {
      requestId: "saved-1",
      ip: "192.0.2.1",
      userAgent: "Test Browser",
    };
    assert.equal(await sendOpenAiLeadCapi(payload), true);
    assert.equal(
      calls[0]!.url,
      "https://bzr.openai.com/v1/events?pid=public-pixel",
    );
    assert.equal(
      (calls[0]!.init.headers as Record<string, string>).Authorization,
      "Bearer private-key",
    );
    assert.doesNotMatch(
      calls[0]!.init.body as string,
      /private-key|phone|email|doctor|service/,
    );
    fails = true;
    assert.equal(await sendOpenAiLeadCapi(payload), false);
    const count = calls.length;
    assert.equal(
      await sendOpenAiLeadCapi({ ...payload, trackingDisabled: true }),
      false,
    );
    process.env.OPENAI_ADS_CAPI_ENABLED = "0";
    assert.equal(await sendOpenAiLeadCapi(payload), false);
    assert.equal(calls.length, count);
  } finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
});
