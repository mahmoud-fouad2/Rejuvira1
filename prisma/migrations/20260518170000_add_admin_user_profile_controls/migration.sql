ALTER TABLE "User"
  ADD COLUMN "positionTitle" TEXT,
  ADD COLUMN "department" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
