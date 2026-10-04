import assert from "node:assert/strict";
import test from "node:test";

import { isConfirmedSavedLead } from "./lead-success.ts";

test("only a persisted non-duplicate server success is conversion eligible", () => {
  const success = {
    ok: true,
    status: "success",
    duplicate: false,
    saved: true,
    requestId: "request_1",
  };
  assert.equal(isConfirmedSavedLead(true, success), true);
  assert.equal(isConfirmedSavedLead(false, success), false);
  assert.equal(isConfirmedSavedLead(true, { ...success, ok: false }), false);
  assert.equal(isConfirmedSavedLead(true, { ...success, status: "error" }), false);
  assert.equal(isConfirmedSavedLead(true, { ...success, duplicate: true }), false);
  assert.equal(isConfirmedSavedLead(true, { ...success, saved: false }), false);
  assert.equal(isConfirmedSavedLead(true, { ...success, requestId: "" }), false);
  assert.equal(isConfirmedSavedLead(true, null), false);
});
