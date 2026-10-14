import { createHash } from "node:crypto";
import { stripRetiredAwarenessCampaign } from "../src/lib/integration-snippets.ts";

export const AWARENESS_RETIREMENT_LOG =
  "cms-integration:retire-awareness-2026-10-14";
const hash = (value) => createHash("sha256").update(value).digest("hex");

/** Remove only the verified card from saved integration fields, with a recovery copy. */
export async function retireAwarenessCampaign(prisma) {
  const entries = await prisma.siteSetting.findMany({
    where: {
      groupName: "integrations",
      key: {
        in: [
          "integrations.customHeadCode",
          "integrations.customBodyCode",
          "customHeadCode",
          "customBodyCode",
        ],
      },
    },
    select: { id: true, key: true, value: true, updatedAt: true },
  });
  const results = [];
  for (const entry of entries) {
    if (typeof entry.value !== "string") continue;
    const cleaned = stripRetiredAwarenessCampaign(entry.value);
    if (cleaned === entry.value) {
      results.push({ key: entry.key, reason: "no-retired-card" });
      continue;
    }
    const changed = await prisma.$transaction(async (tx) => {
      const result = await tx.siteSetting.updateMany({
        where: {
          id: entry.id,
          updatedAt: entry.updatedAt,
          value: { equals: entry.value },
        },
        data: { value: cleaned },
      });
      if (result.count !== 1) return false;
      // Recovery data lives in the audit log, never in the public settings cache.
      await tx.appLog.create({
        data: {
          level: "info",
          kind: AWARENESS_RETIREMENT_LOG,
          message: `Retired October floating card: ${entry.key}`,
          meta: {
            settingId: entry.id,
            key: entry.key,
            originalValue: entry.value,
            beforeHash: hash(entry.value),
            afterHash: hash(cleaned),
          },
        },
      });
      return true;
    });
    results.push({
      key: entry.key,
      reason: changed ? "retired-with-backup" : "concurrent-edit-preserved",
    });
  }
  return results;
}
