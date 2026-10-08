/** Targeted, idempotent CMS releases; preserves administrator edits. */
import { PrismaClient } from "@prisma/client";
import {
  seedSahamLandingPage,
  SAHAM_LANDING_SLUG,
} from "./landing-pages/dr-saham-arfaj.mjs";
import { seedLandingContent } from "./landing-pages/content-enrichment.mjs";
import { seedDoctorServiceLandings } from "./landing-pages/doctor-service-landings.mjs";

const renderBuild = Boolean(
  process.env.RENDER || process.env.RENDER_SERVICE_ID,
);
if (process.argv.includes("--if-render") && !renderBuild) {
  console.log("[doctor-landing] Not a Render build; no database writes.");
} else if (!process.env.DATABASE_URL) {
  console.log("[doctor-landing] DATABASE_URL is not configured; skipping.");
} else {
  const prisma = new PrismaClient();
  try {
    const result = await seedSahamLandingPage(prisma);
    console.log(`[doctor-landing] /p/${SAHAM_LANDING_SLUG}: ${result.reason}`);
    for (const addition of await seedDoctorServiceLandings(prisma)) {
      console.log(`[doctor-landing] /p/${addition.slug}: ${addition.reason}`);
    }
    for (const addition of await seedLandingContent(prisma)) {
      console.log(`[landing-content] /p/${addition.slug}: ${addition.reason}`);
    }
  } catch (error) {
    // Avoid logging database URLs or connection credentials in deployment output.
    console.error(
      `[doctor-landing] Failed (${error.code || error.name || "unknown"}).`,
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
