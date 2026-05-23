-- CreateEnum: IntegrationToolType
DO $$ BEGIN
  CREATE TYPE "IntegrationToolType" AS ENUM ('WEBHOOK', 'API_CALL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: IntegrationAuthType
DO $$ BEGIN
  CREATE TYPE "IntegrationAuthType" AS ENUM ('NONE', 'BEARER', 'API_KEY', 'BASIC');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: IntegrationHttpMethod
DO $$ BEGIN
  CREATE TYPE "IntegrationHttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable: IntegrationTool
CREATE TABLE IF NOT EXISTS "IntegrationTool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "IntegrationToolType" NOT NULL DEFAULT 'WEBHOOK',
    "method" "IntegrationHttpMethod" NOT NULL DEFAULT 'POST',
    "url" TEXT NOT NULL,
    "headersJson" JSONB NOT NULL DEFAULT '[]',
    "authType" "IntegrationAuthType" NOT NULL DEFAULT 'NONE',
    "authConfigJson" JSONB,
    "parametersJson" JSONB NOT NULL DEFAULT '[]',
    "bodyTemplateJson" JSONB,
    "responseMappingJson" JSONB,
    "aiInstructions" TEXT,
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestStatus" TEXT,
    "lastTestAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationTool_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationTool_name_key" ON "IntegrationTool"("name");
CREATE INDEX IF NOT EXISTS "IntegrationTool_isActive_idx" ON "IntegrationTool"("isActive");
CREATE INDEX IF NOT EXISTS "IntegrationTool_type_idx" ON "IntegrationTool"("type");

-- CreateTable: IntegrationToolLog
CREATE TABLE IF NOT EXISTS "IntegrationToolLog" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "requestPreview" JSONB,
    "responsePreview" JSONB,
    "error" TEXT,
    "executionMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationToolLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IntegrationToolLog_integrationId_idx" ON "IntegrationToolLog"("integrationId");
CREATE INDEX IF NOT EXISTS "IntegrationToolLog_createdAt_idx" ON "IntegrationToolLog"("createdAt");

DO $$ BEGIN
  ALTER TABLE "IntegrationToolLog"
    ADD CONSTRAINT "IntegrationToolLog_integrationId_fkey"
    FOREIGN KEY ("integrationId") REFERENCES "IntegrationTool"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
