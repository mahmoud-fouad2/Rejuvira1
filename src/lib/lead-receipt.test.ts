import assert from "node:assert/strict";
import test from "node:test";

import { createLeadReceipt, verifyLeadReceipt } from "./lead-receipt.ts";

const secret = "test-secret-that-is-long-enough-for-hmac";
const now = Date.UTC(2026, 9, 4, 12, 0, 0);

test("lead receipt proves a saved request without exposing PII", () => {
  const token = createLeadReceipt("lead_123", "success", { secret, now });
  assert.ok(token);
  assert.equal(token.includes("055"), false);
  assert.deepEqual(verifyLeadReceipt(token, { secret, now }), {
    v: 1,
    requestId: "lead_123",
    state: "success",
    issuedAt: Math.floor(now / 1000),
    expiresAt: Math.floor(now / 1000) + 15 * 60,
  });
});

test("lead receipt rejects tampering and expiry", () => {
  const token = createLeadReceipt("lead_123", "success", {
    secret,
    now,
    ttlSeconds: 30,
  });
  assert.ok(token);
  assert.equal(verifyLeadReceipt(`${token}x`, { secret, now }), null);
  assert.equal(verifyLeadReceipt(token, { secret, now: now + 31_000 }), null);
});
