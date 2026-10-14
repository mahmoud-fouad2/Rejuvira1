import assert from "node:assert/strict";
import test from "node:test";
import { retireAwarenessCampaign } from "./retire-awareness-campaign.mjs";

const campaign =
  '<script>(function () { function addRejuveraBreastCancerCard() { const id="rejuvera-breast-awareness"; } })();</script>';
function database(value, { concurrent = false, failLog = false } = {}) {
  const state = { value, logs: [] };
  const prisma = {
    siteSetting: {
      findMany: async () => [
        {
          id: "body-setting",
          key: "integrations.customBodyCode",
          value: state.value,
          updatedAt: new Date(0),
        },
      ],
    },
    $transaction: async (fn) => {
      const snapshot = structuredClone(state);
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
              if (failLog) throw new Error("Audit unavailable");
              state.logs.push(data);
            },
          },
        });
      } catch (error) {
        Object.assign(state, snapshot);
        throw error;
      }
    },
  };
  return { prisma, state };
}

test("retirement removes only the card, saves the exact recovery value and runs once", async () => {
  const original = "<noscript>GTM</noscript>" + campaign;
  const { prisma, state } = database(original);
  assert.equal(
    (await retireAwarenessCampaign(prisma))[0].reason,
    "retired-with-backup",
  );
  assert.equal(state.value, "<noscript>GTM</noscript>");
  assert.equal(state.logs[0].meta.originalValue, original);
  assert.equal(state.logs[0].meta.afterHash.length, 64);
  assert.equal(
    (await retireAwarenessCampaign(prisma))[0].reason,
    "no-retired-card",
  );
  assert.equal(state.logs.length, 1);
});

test("a concurrent admin edit is not overwritten or recorded as a deletion", async () => {
  const { prisma, state } = database(campaign, { concurrent: true });
  assert.equal(
    (await retireAwarenessCampaign(prisma))[0].reason,
    "concurrent-edit-preserved",
  );
  assert.equal(state.value, campaign);
  assert.equal(state.logs.length, 0);
});

test("a missing audit backup rolls back the deletion", async () => {
  const { prisma, state } = database(campaign, { failLog: true });
  await assert.rejects(retireAwarenessCampaign(prisma), /Audit unavailable/);
  assert.equal(state.value, campaign);
  assert.equal(state.logs.length, 0);
});
