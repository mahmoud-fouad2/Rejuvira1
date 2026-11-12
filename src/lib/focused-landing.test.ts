import assert from "node:assert/strict";
import test from "node:test";
import {
  isFocusedLandingHtml,
  landingArticleClass,
} from "./focused-landing.ts";

test("focused landings never receive the CMS prose class", () => {
  for (const uploaded of [true, false]) {
    const className = landingArticleClass({
      focused: true,
      uploaded,
    });
    assert.equal(className, "rv-landing-content");
    assert.doesNotMatch(className, /rv-custom-page__content/);
  }
});

test("every other page keeps its existing article classes", () => {
  assert.equal(
    landingArticleClass({ focused: false, uploaded: false }),
    "rv-custom-page__content",
  );
  assert.equal(
    landingArticleClass({ focused: false, uploaded: true }),
    "rv-custom-page__content rv-custom-page__content--uploaded",
  );
});

test("the focused markers are what switches the wrapper", () => {
  assert.equal(isFocusedLandingHtml('<div data-facelift-optimized="1">'), true);
  assert.equal(
    isFocusedLandingHtml('<div data-focused-landing="tiktok">'),
    true,
  );
  assert.equal(isFocusedLandingHtml("<div>plain CMS page</div>"), false);
});
