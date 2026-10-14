import { createHash } from "node:crypto";
import { stripDuplicateSnapBootstrap } from "../src/lib/snap-integration.ts";

const hash = (value) => createHash("sha256").update(value).digest("hex");

/** Idempotent cleanup of the observed duplicate; retain an atomic recovery copy. */
export async function deduplicateSnapIntegration(prisma) {
  const entries = await prisma.siteSetting.findMany({
    where: {
      groupName: "integrations",
      key: { in: ["integrations.customHeadCode", "customHeadCode"] },
    },
    select: { id: true, key: true, value: true, updatedAt: true },
  });
  const results = [];
  for (const entry of entries) {
    if (typeof entry.value !== "string") continue;
    const cleaned = stripDuplicateSnapBootstrap(entry.value);
    if (cleaned === entry.value) {
      results.push({ key: entry.key, reason: "no-verified-duplicate" });
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
      await tx.appLog.create({
        data: {
          level: "info",
          kind: "cms-integration:snap-dedup-2026-10-14",
          message: `Removed verified manual Snap duplicate: ${entry.key}`,
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
      reason: changed
        ? "deduplicated-with-backup"
        : "concurrent-edit-preserved",
    });
  }
  return results;
}
