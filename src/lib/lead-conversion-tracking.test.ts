import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { claimConversionId } from "./conversion-dedupe.ts";
import {
  buildContactClickDataLayerEvent,
  buildLeadDataLayerEvent,
} from "./lead-analytics.ts";

function harness() {
  const calls: Array<{ sdk: string; args: unknown[] }> = [];
  const timers: Array<() => void> = [];
  const record =
    (sdk: string) =>
    (...args: unknown[]) => {
      calls.push({ sdk, args });
    };
  const window = {
    gtag: record("google") as ((...args: unknown[]) => void) | undefined,
    fbq: record("meta") as ((...args: unknown[]) => void) | undefined,
    ttq: record("tiktok") as ((...args: unknown[]) => void) | undefined,
    setTimeout: (fn: () => void) => timers.push(fn),
    sessionStorage: { getItem: () => null, setItem: () => {} },
  };
  const exports = {} as {
    trackLeadConversion: (payload: {
      requestId?: string;
      snapDedupId?: string;
    }) => boolean;
  };
  const source = readFileSync(
    new URL("./lead-conversion-tracking.ts", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      window,
      require: (id: string) => {
        if (id === "@/lib/snap-pixel") {
          return { fireSnapSignUp: record("snap") };
        }
        if (id === "@/lib/conversion-dedupe") return { claimConversionId };
        if (id === "@/lib/lead-analytics") {
          return { buildContactClickDataLayerEvent, buildLeadDataLayerEvent };
        }
        throw new Error(`Unexpected module: ${id}`);
      },
    },
  );
  return { window, calls, timers, track: exports.trackLeadConversion };
}

test("one saved booking emits one Snap signal and preserves existing event names", () => {
  const h = harness();
  const payload = { requestId: "saved_1", snapDedupId: "rv_snap_saved_1" };
  assert.equal(h.track(payload), true);
  assert.equal(h.track(payload), false);
  assert.deepEqual(
    h.calls.map(({ sdk }) => sdk),
    ["google", "google", "meta", "tiktok", "snap"],
  );
  assert.deepEqual(h.calls.at(-1), {
    sdk: "snap",
    args: [payload.snapDedupId],
  });
  assert.equal(h.calls[0]?.args[1], "lead_submit");
  assert.equal(h.calls[1]?.args[1], "conversion");
  assert.equal(h.calls[2]?.args[1], "Lead");
  assert.equal(h.calls[3]?.args[1], "Lead");
  assert.equal(h.timers.length, 0);
});

for (const sdk of ["gtag", "fbq", "ttq"] as const) {
  test(`${sdk} failure cannot interrupt booking success or suppress Snap`, () => {
    const h = harness();
    h.window[sdk] = () => {
      throw new Error("SDK failure");
    };
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), true);
    assert.equal(h.calls.filter((call) => call.sdk === "snap").length, 1);
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), false);
    assert.equal(h.timers.length, 0);
  });

  test(`${sdk} failure after deferred loading is contained without replaying Snap`, () => {
    const h = harness();
    h.window[sdk] = undefined;
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), true);
    assert.ok(h.timers.length > 0);
    h.window[sdk] = () => {
      throw new Error("SDK failure after load");
    };
    for (const timer of h.timers.splice(0)) assert.doesNotThrow(timer);
    assert.equal(h.calls.filter((call) => call.sdk === "snap").length, 1);
    assert.equal(h.timers.length, 0);
  });
}

test("missing saved request ID cannot emit a conversion", () => {
  const h = harness();
  assert.equal(h.track({ snapDedupId: "unconfirmed" }), false);
  assert.equal(h.calls.length, 0);
  assert.equal(h.timers.length, 0);
});
