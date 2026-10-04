import assert from "node:assert/strict";
import test from "node:test";

import { mergeRequestTracking } from "./request-tracking.ts";

test("request tracking keeps submitted attribution and fills missing click IDs", () => {
  const request = new Request(
    "https://rejuvera.sa/api/contact?utm_source=google&gclid=current-click",
    {
      headers: {
        referer:
          "https://rejuvera.sa/p/lift?utm_campaign=current-campaign&wbraid=web-click",
      },
    },
  );
  const result = mergeRequestTracking(
    { utmSource: "submitted-source", gbraid: "app-click" },
    request,
  );

  assert.equal(result.utmSource, "submitted-source");
  assert.equal(result.utmCampaign, "current-campaign");
  assert.equal(result.gclid, "current-click");
  assert.equal(result.gbraid, "app-click");
  assert.equal(result.wbraid, "web-click");
});

test("request tracking reads the current page header", () => {
  const request = new Request("https://rejuvera.sa/api/contact", {
    headers: {
      "x-rejuvera-current-url":
        "https://rejuvera.sa/contact?utm_term=facelift&gbraid=ios-click",
    },
  });
  const result = mergeRequestTracking({}, request);
  assert.equal(result.utmTerm, "facelift");
  assert.equal(result.gbraid, "ios-click");
});
