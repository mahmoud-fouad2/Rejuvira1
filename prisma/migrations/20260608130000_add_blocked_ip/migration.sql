CREATE TABLE "BlockedIp" (
  "id" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "reason" TEXT,
  "createdById" TEXT,
  "createdByName" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlockedIp_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlockedIp_ipAddress_key" ON "BlockedIp"("ipAddress");
CREATE INDEX "BlockedIp_isActive_idx" ON "BlockedIp"("isActive");
CREATE INDEX "BlockedIp_createdAt_idx" ON "BlockedIp"("createdAt");
CREATE INDEX "ContactSubmission_ipAddress_idx" ON "ContactSubmission"("ipAddress");
