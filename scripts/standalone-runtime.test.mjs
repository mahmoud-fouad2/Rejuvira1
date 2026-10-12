import assert from "node:assert/strict";
import test from "node:test";
import { standaloneHeapFlags } from "./standalone-runtime.mjs";

test("512MB container reserves memory outside V8 even with the existing 384MB env", () => {
  assert.deepEqual(
    standaloneHeapFlags({ MAX_OLD_SPACE_SIZE: "384" }, 512 * 1024 * 1024),
    ["--max-old-space-size=256"],
  );
  assert.deepEqual(
    standaloneHeapFlags({ MAX_OLD_SPACE_SIZE: "192" }, 512 * 1024 * 1024),
    ["--max-old-space-size=192"],
  );
});
test("explicit NODE_OPTIONS wins; larger plans and local dev retain their budget", () => {
  assert.deepEqual(
    standaloneHeapFlags(
      { NODE_OPTIONS: "--max-old-space-size=300" },
      512 * 1024 * 1024,
    ),
    [],
  );
  assert.deepEqual(
    standaloneHeapFlags(
      { NODE_OPTIONS: "--max_old_space_size=300" },
      512 * 1024 * 1024,
    ),
    [],
  );
  assert.deepEqual(
    standaloneHeapFlags({ MAX_OLD_SPACE_SIZE: "1800" }, 2048 * 1024 * 1024),
    ["--max-old-space-size=1800"],
  );
  assert.deepEqual(standaloneHeapFlags({}, undefined), [
    "--max-old-space-size=384",
  ]);
  assert.deepEqual(
    standaloneHeapFlags({ MAX_OLD_SPACE_SIZE: "invalid" }, 512 * 1024 * 1024),
    ["--max-old-space-size=256"],
  );
});
