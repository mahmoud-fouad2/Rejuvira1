import { PrismaClient } from "@prisma/client";
import { rollbackLandingContent } from "./landing-pages/content-enrichment.mjs";
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for explicit CMS rollback.");
  process.exitCode = 1;
} else {
  const prisma = new PrismaClient();
  try {
    for (const result of await rollbackLandingContent(prisma))
      console.log(`[landing-rollback] ${result.slug}: ${result.reason}`);
  } catch (error) {
    console.error(
      `[landing-rollback] Failed (${error.code || error.name || "unknown"}).`,
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
