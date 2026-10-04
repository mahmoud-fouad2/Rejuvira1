ALTER TABLE "ContactSubmission"
  ADD COLUMN IF NOT EXISTS "utmTerm" TEXT,
  ADD COLUMN IF NOT EXISTS "gclid" TEXT,
  ADD COLUMN IF NOT EXISTS "gbraid" TEXT,
  ADD COLUMN IF NOT EXISTS "wbraid" TEXT;

CREATE INDEX IF NOT EXISTS "ContactSubmission_gclid_idx"
  ON "ContactSubmission"("gclid");
