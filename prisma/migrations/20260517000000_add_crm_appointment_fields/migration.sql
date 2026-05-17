ALTER TABLE "ContactSubmission"
  ADD COLUMN IF NOT EXISTS "preferredAppointmentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "appointmentNotes" TEXT;

CREATE INDEX IF NOT EXISTS "ContactSubmission_preferredAppointmentAt_idx"
  ON "ContactSubmission"("preferredAppointmentAt");
