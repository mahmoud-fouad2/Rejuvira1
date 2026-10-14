import assert from "node:assert/strict";
import test from "node:test";
import { deduplicateSnapIntegration } from "./deduplicate-snap-integration.mjs";
import { REDUNDANT_SNAP_BOOTSTRAP } from "../src/lib/snap-integration.ts";
const source = `<script>j.src='https://www.googletagmanager.com/gtm.js?id='+i; })(window,document,'script','dataLayer','GTM-WRR5GX93');</script><script>${REDUNDANT_SNAP_BOOTSTRAP}</script>`;
function database({ concurrent = false, failLog = false } = {}) {
  const state = { value: source, logs: [] };
  const prisma = {
    siteSetting: {
      findMany: async () => [
        {
          id: "head",
          key: "integrations.customHeadCode",
          updatedAt: new Date(0),
          value: state.value,
        },
      ],
    },
    $transaction: async (fn) => {
      const before = structuredClone(state);
      try {
        return await fn({
          siteSetting: {
            updateMany: async ({ where, data }) => {
              assert.equal(where.value.equals, state.value);
              if (concurrent) return { count: 0 };
              state.value = data.value;
              return { count: 1 };
            },
          },
          appLog: {
            create: async ({ data }) => {
              if (failLog) throw Error("backup failed");
              state.logs.push(data);
            },
          },
        });
      } catch (e) {
        Object.assign(state, before);
        throw e;
      }
    },
  };
  return { state, prisma };
}
test("cleanup retains GTM, backs up exact original and skips a second run", async () => {
  const { state, prisma } = database();
  assert.equal(
    (await deduplicateSnapIntegration(prisma))[0].reason,
    "deduplicated-with-backup",
  );
  assert.equal(state.logs[0].meta.originalValue, source);
  assert.match(state.value, /GTM-WRR5GX93/);
  assert.doesNotMatch(state.value, /snaptr/);
  assert.equal(
    (await deduplicateSnapIntegration(prisma))[0].reason,
    "no-verified-duplicate",
  );
  assert.equal(state.logs.length, 1);
});
test("concurrent edit or missing recovery log never causes destructive overwrite", async () => {
  const c = database({ concurrent: true });
  assert.equal(
    (await deduplicateSnapIntegration(c.prisma))[0].reason,
    "concurrent-edit-preserved",
  );
  assert.equal(c.state.value, source);
  const b = database({ failLog: true });
  await assert.rejects(deduplicateSnapIntegration(b.prisma), /backup failed/);
  assert.equal(b.state.value, source);
});
