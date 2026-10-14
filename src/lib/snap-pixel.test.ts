import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { REJUVERA_SNAP_PIXEL_ID } from "./snap-integration.ts";
function harness({ ready = true, optOut = false } = {}) {
  const calls: unknown[][] = [];
  const timers: Array<() => void> = [];
  const window: {
    snaptr: ((...args: unknown[]) => void) | undefined;
    setTimeout: (fn: () => void) => number;
  } = {
    snaptr: ready
      ? (...args: unknown[]) => {
          calls.push(args);
        }
      : undefined,
    setTimeout: (fn: () => void) => timers.push(fn),
  };
  const exports = {} as { fireSnapSignUp: (id: string) => void };
  const source = readFileSync(
    new URL("./snap-pixel.ts", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      window,
      navigator: { globalPrivacyControl: optOut },
      require: () => ({ REJUVERA_SNAP_PIXEL_ID }),
    },
  );
  return { calls, timers, window, fire: exports.fireSnapSignUp };
}
test("a saved event targets this pixel once and includes only its shared dedup id", () => {
  const h = harness();
  h.fire("rv_snap_saved");
  h.fire("rv_snap_saved");
  h.fire("rv_snap_other");
  assert.equal(h.calls.length, 2);
  assert.equal(
    JSON.stringify(h.calls[0]),
    JSON.stringify([
      "track",
      REJUVERA_SNAP_PIXEL_ID,
      "SIGN_UP",
      { client_dedup_id: "rv_snap_saved" },
    ]),
  );
});
test("GTM startup retries cannot schedule duplicate lead events", () => {
  const h = harness({ ready: false });
  h.fire("saved");
  h.fire("saved");
  assert.equal(h.timers.length, 1);
  h.window.snaptr = (...args) => h.calls.push(args);
  h.timers.shift()!();
  h.fire("saved");
  assert.equal(h.calls.length, 1);
});
test("opt out and missing IDs never emit conversions", () => {
  const h = harness({ optOut: true });
  h.fire("saved");
  h.fire("");
  assert.equal(h.calls.length, 0);
});
