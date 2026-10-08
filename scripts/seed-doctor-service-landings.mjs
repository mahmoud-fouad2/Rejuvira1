/** Explicit, host-independent release for the two new CMS pages only. */
import { PrismaClient } from "@prisma/client";
import { seedDoctorServiceLandings } from "./landing-pages/doctor-service-landings.mjs";

if (!process.env.DATABASE_URL) {
  console.error("[doctor-services] DATABASE_URL must be configured on the target server.");
  process.exitCode = 1;
} else {
  const prisma = new PrismaClient();
  try {
    for (const result of await seedDoctorServiceLandings(prisma)) {
      console.log(`[doctor-services] /p/${result.slug}: ${result.reason}`);
    }
  } catch (error) {
    console.error(`[doctor-services] Failed (${error.code || error.name || "unknown"}).`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
