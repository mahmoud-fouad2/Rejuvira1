import assert from "node:assert/strict";
import test from "node:test";

import { claimConversionId } from "./conversion-dedupe.ts";

test("a saved request can claim conversion tracking only once", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const claimedIds = new Set<string>();

  assert.equal(claimConversionId("request_1", claimedIds, storage), true);
  assert.equal(claimConversionId("request_1", claimedIds, storage), false);
  assert.equal(claimConversionId("request_2", claimedIds, storage), true);
});

test("deduplication survives a remount through session storage", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  assert.equal(claimConversionId("request_1", new Set(), storage), true);
  assert.equal(claimConversionId("request_1", new Set(), storage), false);
});
