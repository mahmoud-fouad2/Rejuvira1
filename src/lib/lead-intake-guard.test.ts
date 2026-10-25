import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateLeadIntakeGuard,
  LEAD_HONEYPOT_FIELD,
  LEAD_RENDERED_AT_FIELD,
} from "./lead-intake-guard.ts";

test("lead intake guard: honeypot blocks automated submissions", () => {
  const result = evaluateLeadIntakeGuard({
    fullName: "Spam Bot",
    phone: "0501234567",
    [LEAD_HONEYPOT_FIELD]: "https://spam.example.com",
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "honeypot");
  }
});

test("lead intake guard: invalid timestamp is rejected", () => {
  const result = evaluateLeadIntakeGuard({
    fullName: "Corrupted Form",
    phone: "0501234567",
    [LEAD_RENDERED_AT_FIELD]: "not-a-number",
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_timestamp");
  }
});

test("lead intake guard: future timestamp beyond clock skew is rejected", () => {
  const now = Date.now();
  const result = evaluateLeadIntakeGuard(
    {
      fullName: "Clock Manipulator",
      phone: "0501234567",
      [LEAD_RENDERED_AT_FIELD]: String(now + 120_000), // 2 minutes in future
    },
    now,
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "future_timestamp");
  }
});

test("lead intake guard: autofill submission (< 2500ms) is accepted without rejection", () => {
  const now = Date.now();
  const fastElapsedMs = 350; // User completed via browser autofill in 350ms
  const result = evaluateLeadIntakeGuard(
    {
      fullName: "سارة العتيبي",
      phone: "0501234567",
      [LEAD_RENDERED_AT_FIELD]: String(now - fastElapsedMs),
    },
    now,
  );
  assert.equal(result.ok, true);
});

test("lead intake guard: normal human submission (5000ms) is accepted", () => {
  const now = Date.now();
  const normalElapsedMs = 5000;
  const result = evaluateLeadIntakeGuard(
    {
      fullName: "محمد القحطاني",
      phone: "0501234567",
      [LEAD_RENDERED_AT_FIELD]: String(now - normalElapsedMs),
    },
    now,
  );
  assert.equal(result.ok, true);
});

test("lead intake guard: submission without renderedAt timestamp is accepted", () => {
  const result = evaluateLeadIntakeGuard({
    fullName: "فهد الدوسري",
    phone: "0501234567",
  });
  assert.equal(result.ok, true);
});
