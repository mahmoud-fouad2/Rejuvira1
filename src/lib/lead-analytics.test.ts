import assert from "node:assert/strict";
import test from "node:test";

import {
  buildContactClickDataLayerEvent,
  buildLeadDataLayerEvent,
} from "./lead-analytics.ts";

test("public lead analytics contains no patient or medical fields", () => {
  const event = buildLeadDataLayerEvent("request_123", "contact_form");
  assert.deepEqual(event, {
    event: "lead_submit",
    request_id: "request_123",
    form_name: "contact_form",
  });
  assert.equal("phone" in event, false);
  assert.equal("email" in event, false);
  assert.equal("serviceName" in event, false);
});

test("contact click analytics does not include the destination number", () => {
  assert.deepEqual(buildContactClickDataLayerEvent("phone", "click_123"), {
    event: "phone_click",
    event_id: "click_123",
  });
});
