-- AlterTable: extend ContactSubmission with tags + webhookId
ALTER TABLE "ContactSubmission"
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ContactSubmission"
  ADD COLUMN IF NOT EXISTS "webhookId" TEXT;

-- CreateTable: CrmComment
CREATE TABLE IF NOT EXISTS "CrmComment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmComment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CrmComment_submissionId_idx" ON "CrmComment"("submissionId");
CREATE INDEX IF NOT EXISTS "CrmComment_createdAt_idx" ON "CrmComment"("createdAt");

-- CreateTable: CustomPage
CREATE TABLE IF NOT EXISTS "CustomPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "htmlContent" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomPage_slug_key" ON "CustomPage"("slug");
CREATE INDEX IF NOT EXISTS "CustomPage_status_idx" ON "CustomPage"("status");

-- CreateTable: Webhook
CREATE TABLE IF NOT EXISTS "Webhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultStatus" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "defaultTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "defaultSource" TEXT,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Webhook_token_key" ON "Webhook"("token");
CREATE INDEX IF NOT EXISTS "Webhook_token_idx" ON "Webhook"("token");

-- CreateTable: WebhookEvent
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 200,
    "errorMessage" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WebhookEvent_webhookId_idx" ON "WebhookEvent"("webhookId");
CREATE INDEX IF NOT EXISTS "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ContactSubmission" DROP CONSTRAINT IF EXISTS "ContactSubmission_webhookId_fkey";
ALTER TABLE "ContactSubmission"
  ADD CONSTRAINT "ContactSubmission_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmComment" DROP CONSTRAINT IF EXISTS "CrmComment_submissionId_fkey";
ALTER TABLE "CrmComment"
  ADD CONSTRAINT "CrmComment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ContactSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmComment" DROP CONSTRAINT IF EXISTS "CrmComment_authorId_fkey";
ALTER TABLE "CrmComment"
  ADD CONSTRAINT "CrmComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Webhook" DROP CONSTRAINT IF EXISTS "Webhook_serviceId_fkey";
ALTER TABLE "Webhook"
  ADD CONSTRAINT "Webhook_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WebhookEvent" DROP CONSTRAINT IF EXISTS "WebhookEvent_webhookId_fkey";
ALTER TABLE "WebhookEvent"
  ADD CONSTRAINT "WebhookEvent_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
