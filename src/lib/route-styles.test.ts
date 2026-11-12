import assert from "node:assert/strict";
import test from "node:test";
import { needsFullSiteStyles } from "./route-styles.ts";

test("only supported focused routes can omit the full site CSS", () => {
  assert.equal(needsFullSiteStyles("/p/facelift-riyadh"), false);
  assert.equal(needsFullSiteStyles("/p/rejuvera-booking"), false);
  for (const path of [
    null,
    "/",
    "/login",
    "/admin/pages",
    "/portal",
    "/p/dr-saham-arfaj",
    "/p/facelift-riyadh/",
    "/p/unknown",
  ]) {
    assert.equal(
      needsFullSiteStyles(path),
      true,
      `${path} must keep full styles`,
    );
  }
});

test("maintenance or a non-focused CMS layout always retains full styles", () => {
  assert.equal(needsFullSiteStyles("/p/facelift-riyadh", true), true);
  assert.equal(needsFullSiteStyles("/p/rejuvera-booking", true), true);
});
