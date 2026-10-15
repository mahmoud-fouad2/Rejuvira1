import assert from "node:assert/strict";
import test from "node:test";
import { needsFullSiteStyles } from "./route-styles.ts";

test("only a fresh focused facelift route can omit the full site CSS", () => {
  assert.equal(needsFullSiteStyles("/p/facelift-riyadh"), false);
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
});
