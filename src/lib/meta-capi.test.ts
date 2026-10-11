import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import {
  buildMetaLeadEvent,
  getMetaRequestSignals,
  sendMetaLeadCapi,
} from "./meta-capi.ts";

test("Meta sends only a generic saved Lead and technical matching", () => {
  const signals = getMetaRequestSignals(
    new Request("https://rejuvera.sa/api/contact", {
      headers: {
        cookie:
          "_fbc=fb.1.1700000000000.click_1; _fbp=fb.1.1700000000000.123456; patient=private",
        referer: "https://rejuvera.sa/p/medical-service?phone=0500000000",
        "user-agent": "Test Browser",
      },
    }),
  );
  const event = buildMetaLeadEvent({
    requestId: "saved-1",
    eventTime: 1700000000000,
    ip: "192.0.2.1",
    ...signals,
  });
  assert.deepEqual(event, {
    event_name: "Lead",
    event_id: "rv_lead_saved-1",
    event_time: 1700000000,
    action_source: "website",
    event_source_url: "https://rejuvera.sa/",
    user_data: {
      client_ip_address: "192.0.2.1",
      client_user_agent: "Test Browser",
      fbc: "fb.1.1700000000000.click_1",
      fbp: "fb.1.1700000000000.123456",
    },
  });
  assert.doesNotMatch(
    JSON.stringify(event),
    /medical-service|phone|email|patient|0500000000|custom_data/,
  );
});

test("only actual Meta click IDs and cookies are accepted; visitor opt-outs are respected", () => {
  const signals = getMetaRequestSignals(
    new Request("https://rejuvera.sa/api/contact", {
      headers: {
        referer: "https://rejuvera.sa/p/private?fbclid=click_123",
        cookie: "_fbp=%invalid",
        "sec-gpc": "1",
      },
    }),
  );
  assert.match(signals.fbc!, /^fb\.1\.\d{13}\.click_123$/);
  assert.equal(signals.fbp, undefined);
  assert.equal(signals.trackingDisabled, true);
  const foreign = getMetaRequestSignals(
    new Request("https://rejuvera.sa/api/contact", {
      headers: {
        referer: "https://other.example/?fbclid=untrusted",
        cookie: "_fbc=invalid",
      },
    }),
  );
  assert.equal(foreign.fbc, undefined);
});

test("Meta validates API acceptance, protects credentials and fails open", async (t) => {
  const keys = [
    "META_CAPI_ENABLED",
    "META_CAPI_DATASET_ID",
    "META_CAPI_ACCESS_TOKEN",
    "META_CAPI_TEST_EVENT_CODE",
  ] as const;
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const logs: string[] = [];
  t.mock.method(console, "warn", (value: string) => logs.push(value));
  t.mock.method(console, "info", (value: string) => logs.push(value));
  let result = { events_received: 1 };
  let throws = false;
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (throws) throw new Error("secret-token private-data");
    return Response.json(result);
  });
  try {
    process.env.META_CAPI_ENABLED = "1";
    process.env.META_CAPI_DATASET_ID = "900573465059408";
    process.env.META_CAPI_ACCESS_TOKEN = "secret-token";
    delete process.env.META_CAPI_TEST_EVENT_CODE;
    const payload = {
      requestId: "saved-1",
      ip: "192.0.2.1",
      userAgent: "Test Browser",
    };
    assert.equal(await sendMetaLeadCapi(payload), true);
    assert.equal(
      calls[0]!.url,
      "https://graph.facebook.com/v26.0/900573465059408/events",
    );
    assert.equal(
      (calls[0]!.init.headers as Record<string, string>).Authorization,
      "Bearer secret-token",
    );
    assert.doesNotMatch(
      calls[0]!.init.body as string,
      /secret-token|test_event_code/,
    );
    process.env.META_CAPI_TEST_EVENT_CODE = "TEST123";
    assert.equal(await sendMetaLeadCapi(payload), true);
    assert.equal(
      JSON.parse(calls[1]!.init.body as string).test_event_code,
      "TEST123",
    );
    result = { events_received: 0 };
    assert.equal(
      await sendMetaLeadCapi(payload),
      false,
      "HTTP 200 alone is not acceptance",
    );
    throws = true;
    assert.equal(await sendMetaLeadCapi(payload), false);
    const count = calls.length;
    assert.equal(
      await sendMetaLeadCapi({ ...payload, trackingDisabled: true }),
      false,
    );
    process.env.META_CAPI_ENABLED = "0";
    assert.equal(await sendMetaLeadCapi(payload), false);
    assert.equal(calls.length, count);
    assert.doesNotMatch(
      logs.join("\n"),
      /secret-token|private-data|192\.0\.2\.1/,
    );
  } finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
});

test("browser Lead matches CAPI's ID and does not duplicate Google or Snap events", () => {
  const source = readFileSync(
    new URL("./lead-conversion-tracking.ts", import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const metaCalls: unknown[][] = [];
  const googleCalls: unknown[][] = [];
  const snapCalls: unknown[][] = [];
  const exports: {
    trackLeadConversion?: (payload: Record<string, string>) => boolean;
  } = {};
  const seen = new Set<string>();
  vm.runInNewContext(js, {
    exports,
    require: (name: string) => {
      if (name === "@/lib/snap-pixel")
        return { fireSnapSignUp: (...args: unknown[]) => snapCalls.push(args) };
      if (name === "@/lib/conversion-dedupe")
        return {
          claimConversionId: (id: string) => {
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          },
        };
      if (name === "@/lib/lead-analytics")
        return {
          buildLeadDataLayerEvent: (id: string) => ({
            event: "lead_submit",
            request_id: id,
            form_name: "booking",
          }),
        };
      throw new Error(`Unexpected module ${name}`);
    },
    window: {
      fbq: (...args: unknown[]) => metaCalls.push(args),
      gtag: (...args: unknown[]) => googleCalls.push(args),
      ttq: () => {},
      location: {
        href: "https://rejuvera.sa/p/private",
        pathname: "/p/private",
      },
    },
  });
  const payload = {
    requestId: "saved-1",
    serviceName: "private medical data",
    phone: "0500000000",
    snapDedupId: "snap-1",
  };
  assert.equal(exports.trackLeadConversion!(payload), true);
  assert.equal(exports.trackLeadConversion!(payload), false);
  assert.equal(metaCalls.length, 1);
  assert.equal(
    JSON.stringify(metaCalls[0]),
    JSON.stringify([
      "track",
      "Lead",
      {},
      { eventID: buildMetaLeadEvent({ requestId: "saved-1" }).event_id },
    ]),
  );
  assert.equal(
    googleCalls.length,
    2,
    "one lead_submit and one Google Ads conversion",
  );
  assert.equal(snapCalls.length, 1);
});
