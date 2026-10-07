import assert from "node:assert/strict";
import test from "node:test";
import { buildCsp } from "./csp.ts";

function directives(nonce: string) {
  return new Map(
    buildCsp("frame-ancestors 'self'", nonce)
      .split("; ")
      .map((directive) => {
        const [name, ...sources] = directive.split(" ");
        return [name!, sources] as const;
      }),
  );
}

test("reported tracking resources pass the default fallback without a blanket HTTPS allowance", () => {
  const policy = directives("test-request");
  const fallback = policy.get("default-src")!;
  for (const url of [
    "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=example&lib=ttq",
    "https://tr.snapchat.com/config/sa/example.js?v=3.60.0",
  ]) {
    assert.ok(fallback.includes(new URL(url).origin));
  }
  assert.ok(!fallback.includes("https:"));
  assert.ok(!fallback.includes("https://*.tiktok.com"));
  assert.ok(!fallback.includes("https://*.snapchat.com"));
});

test("request nonces and the existing security boundaries remain enforced", () => {
  const first = directives("first-request");
  const second = directives("second-request");
  assert.ok(first.get("script-src")!.includes("'nonce-first-request'"));
  assert.ok(second.get("script-src")!.includes("'nonce-second-request'"));
  assert.ok(!second.get("script-src")!.includes("'nonce-first-request'"));
  assert.ok(first.get("script-src")!.includes("'strict-dynamic'"));
  assert.ok(!first.get("script-src")!.includes("'unsafe-hashes'"));
  assert.deepEqual(first.get("script-src-attr"), ["'none'"]);
  assert.deepEqual(first.get("object-src"), ["'none'"]);
  assert.deepEqual(first.get("base-uri"), ["'self'"]);
  assert.deepEqual(first.get("form-action"), ["'self'"]);
  assert.deepEqual(first.get("worker-src"), ["'self'", "blob:"]);
});
