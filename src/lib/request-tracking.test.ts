import assert from "node:assert/strict";
import test from "node:test";

import { mergeRequestTracking } from "./request-tracking.ts";

test("submitted attribution remains one cohort without filling gaps from request URLs", () => {
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
  assert.equal(result.utmCampaign, "");
  assert.equal(result.gclid, "");
  assert.equal(result.gbraid, "app-click");
  assert.equal(result.wbraid, "");
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

test("a submitted Facebook cohort cannot acquire a Google URL click ID", () => {
  const request = new Request("https://rejuvera.sa/api/contact", {
    headers: {
      "x-rejuvera-current-url":
        "https://rejuvera.sa/?utm_source=google&gclid=sample_google",
    },
  });
  const result = mergeRequestTracking(
    { utmSource: "facebook", utmCampaign: "server_campaign" },
    request,
  );
  assert.equal(result.utmSource, "facebook");
  assert.equal(result.utmCampaign, "server_campaign");
  assert.equal(result.gclid, "");
});

test("an empty payload uses the first request URL cohort without adding referer or header fields", () => {
  const request = new Request(
    "https://rejuvera.sa/api/contact?utm_source=google",
    {
      headers: {
        referer: "https://rejuvera.sa/?gclid=referer_click",
        "x-rejuvera-current-url":
          "https://rejuvera.sa/?utm_campaign=header_campaign&wbraid=header_click",
      },
    },
  );
  const result = mergeRequestTracking({}, request);
  assert.equal(result.utmSource, "google");
  assert.equal(result.gclid, "");
  assert.equal(result.utmCampaign, "");
  assert.equal(result.wbraid, "");
});

test("candidate fallback selects the complete referer cohort before the current-page header", () => {
  const request = new Request("https://rejuvera.sa/api/contact?unrelated=1", {
    headers: {
      referer:
        "https://rejuvera.sa/?utm_source=facebook&utm_campaign=referer_campaign",
      "x-rejuvera-current-url":
        "https://rejuvera.sa/?utm_source=google&gclid=header_click",
    },
  });
  const result = mergeRequestTracking({}, request);
  assert.equal(result.utmSource, "facebook");
  assert.equal(result.utmCampaign, "referer_campaign");
  assert.equal(result.gclid, "");
});

test("a partial submitted cohort is preserved even when the URL names the same source", () => {
  const request = new Request(
    "https://rejuvera.sa/api/contact?utm_source=google&gclid=another_touch",
  );
  const result = mergeRequestTracking({ utmSource: "google" }, request);
  assert.equal(result.utmSource, "google");
  assert.equal(result.gclid, "");
});

test("cleaning attribution preserves unrelated payload fields and lets an empty cohort fall back", () => {
  const request = new Request(
    "https://rejuvera.sa/api/contact?utm_source=bing&gclid=sample_click",
  );
  const metadata = { placement: "contact_form" };
  const cleaned = mergeRequestTracking(
    { utmSource: "  facebook  ", utmContent: "x".repeat(300), metadata },
    request,
  );
  assert.equal(cleaned.utmSource, "facebook");
  assert.equal(cleaned.utmContent.length, 250);
  assert.equal(cleaned.gclid, "");
  assert.equal(cleaned.metadata, metadata);
  const fallback = mergeRequestTracking(
    { utmSource: "  ", gclid: "  ", metadata },
    request,
  );
  assert.equal(fallback.utmSource, "bing");
  assert.equal(fallback.gclid, "sample_click");
  assert.equal(fallback.metadata, metadata);
});
