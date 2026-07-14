-- CreateEnum
CREATE TYPE "PatientAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PatientGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'MEDICALLY_APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('PATIENT', 'STAFF');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChecklistPhase" AS ENUM ('BEFORE_OPERATION', 'OPERATION_DAY', 'AFTER_OPERATION', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('STAFF_ONLY', 'PATIENT_VISIBLE');

-- CreateEnum
CREATE TYPE "PortalTokenPurpose" AS ENUM ('ACTIVATION', 'RECOVERY');

-- CreateEnum
CREATE TYPE "PortalActorType" AS ENUM ('STAFF', 'PATIENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MEDICAL_DIRECTOR';
ALTER TYPE "UserRole" ADD VALUE 'DOCTOR';
ALTER TYPE "UserRole" ADD VALUE 'NURSE';
ALTER TYPE "UserRole" ADD VALUE 'COORDINATOR';
ALTER TYPE "UserRole" ADD VALUE 'RECEPTIONIST';
ALTER TYPE "UserRole" ADD VALUE 'AUDITOR';

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "fileNumber" TEXT NOT NULL,
    "fullNameAr" TEXT NOT NULL,
    "fullNameEn" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "PatientGender",
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "accountStatus" "PatientAccountStatus" NOT NULL DEFAULT 'PENDING',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ar',
    "internalNotes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "archivedById" TEXT,
    "archivedByName" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAccount" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "loginIdentifier" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "phoneVerifiedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "lastPasswordChangeAt" TIMESTAMP(3),
    "termsAcceptedAt" TIMESTAMP(3),
    "privacyPolicyVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientActivationToken" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "otpHash" TEXT,
    "purpose" "PortalTokenPurpose" NOT NULL DEFAULT 'ACTIVATION',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientActivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureTemplate" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT NOT NULL,
    "preOperationContentAr" TEXT,
    "preOperationContentEn" TEXT,
    "operationDayContentAr" TEXT,
    "operationDayContentEn" TEXT,
    "postOperationContentAr" TEXT,
    "postOperationContentEn" TEXT,
    "warningSignsAr" TEXT,
    "warningSignsEn" TEXT,
    "followUpContentAr" TEXT,
    "followUpContentEn" TEXT,
    "checklistJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "parentTemplateId" TEXT,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureTemplateId" TEXT,
    "templateVersion" INTEGER,
    "customProcedureName" TEXT,
    "category" TEXT,
    "doctorId" TEXT,
    "surgeonName" TEXT,
    "procedureDate" TIMESTAMP(3),
    "procedureTime" TEXT,
    "arrivalTime" TEXT,
    "location" TEXT,
    "status" "ProcedureStatus" NOT NULL DEFAULT 'DRAFT',
    "preOperationInstructions" TEXT,
    "operationDayInstructions" TEXT,
    "postOperationInstructions" TEXT,
    "warningSigns" TEXT,
    "followUpInstructions" TEXT,
    "privateStaffNotes" TEXT,
    "patientVisibleNotes" TEXT,
    "instructionsVersion" INTEGER NOT NULL DEFAULT 1,
    "instructionsPublishedAt" TIMESTAMP(3),
    "instructionsAcknowledgedAt" TIMESTAMP(3),
    "acknowledgedVersion" INTEGER,
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByName" TEXT,
    "updatedById" TEXT,
    "updatedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpAppointment" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT,
    "appointmentType" TEXT,
    "doctorId" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "patientVisibleNotes" TEXT,
    "reminderStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMessage" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT,
    "parentMessageId" TEXT,
    "senderType" "MessageSenderType" NOT NULL,
    "senderUserId" TEXT,
    "senderUserName" TEXT,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFeedback" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "careRating" INTEGER,
    "communicationRating" INTEGER,
    "instructionsRating" INTEGER,
    "cleanlinessRating" INTEGER,
    "comment" TEXT,
    "permissionToContact" BOOLEAN NOT NULL DEFAULT false,
    "permissionToPublish" BOOLEAN NOT NULL DEFAULT false,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureChecklistItem" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" "ChecklistPhase" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "patientCompletedAt" TIMESTAMP(3),
    "staffVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'STAFF_ONLY',
    "uploadedById" TEXT,
    "uploadedByName" TEXT,
    "expiresAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalAuditLog" (
    "id" TEXT NOT NULL,
    "actorType" "PortalActorType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "patientId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientNotification" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "procedureId" TEXT,
    "event" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_fileNumber_key" ON "Patient"("fileNumber");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_accountStatus_idx" ON "Patient"("accountStatus");

-- CreateIndex
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");

-- CreateIndex
CREATE INDEX "Patient_archivedAt_idx" ON "Patient"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_patientId_key" ON "PatientAccount"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_loginIdentifier_key" ON "PatientAccount"("loginIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "PatientActivationToken_tokenHash_key" ON "PatientActivationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PatientActivationToken_patientId_idx" ON "PatientActivationToken"("patientId");

-- CreateIndex
CREATE INDEX "PatientActivationToken_expiresAt_idx" ON "PatientActivationToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSession_tokenHash_key" ON "PatientSession"("tokenHash");

-- CreateIndex
CREATE INDEX "PatientSession_patientId_idx" ON "PatientSession"("patientId");

-- CreateIndex
CREATE INDEX "PatientSession_expiresAt_idx" ON "PatientSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ProcedureTemplate_status_idx" ON "ProcedureTemplate"("status");

-- CreateIndex
CREATE INDEX "ProcedureTemplate_category_idx" ON "ProcedureTemplate"("category");

-- CreateIndex
CREATE INDEX "ProcedureTemplate_parentTemplateId_idx" ON "ProcedureTemplate"("parentTemplateId");

-- CreateIndex
CREATE INDEX "Procedure_patientId_idx" ON "Procedure"("patientId");

-- CreateIndex
CREATE INDEX "Procedure_status_idx" ON "Procedure"("status");

-- CreateIndex
CREATE INDEX "Procedure_procedureDate_idx" ON "Procedure"("procedureDate");

-- CreateIndex
CREATE INDEX "Procedure_doctorId_idx" ON "Procedure"("doctorId");

-- CreateIndex
CREATE INDEX "Procedure_archivedAt_idx" ON "Procedure"("archivedAt");

-- CreateIndex
CREATE INDEX "FollowUpAppointment_patientId_idx" ON "FollowUpAppointment"("patientId");

-- CreateIndex
CREATE INDEX "FollowUpAppointment_procedureId_idx" ON "FollowUpAppointment"("procedureId");

-- CreateIndex
CREATE INDEX "FollowUpAppointment_appointmentDate_idx" ON "FollowUpAppointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "FollowUpAppointment_status_idx" ON "FollowUpAppointment"("status");

-- CreateIndex
CREATE INDEX "PatientMessage_patientId_idx" ON "PatientMessage"("patientId");

-- CreateIndex
CREATE INDEX "PatientMessage_procedureId_idx" ON "PatientMessage"("procedureId");

-- CreateIndex
CREATE INDEX "PatientMessage_status_idx" ON "PatientMessage"("status");

-- CreateIndex
CREATE INDEX "PatientMessage_parentMessageId_idx" ON "PatientMessage"("parentMessageId");

-- CreateIndex
CREATE INDEX "PatientMessage_createdAt_idx" ON "PatientMessage"("createdAt");

-- CreateIndex
CREATE INDEX "PatientFeedback_status_idx" ON "PatientFeedback"("status");

-- CreateIndex
CREATE INDEX "PatientFeedback_overallRating_idx" ON "PatientFeedback"("overallRating");

-- CreateIndex
CREATE INDEX "PatientFeedback_submittedAt_idx" ON "PatientFeedback"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientFeedback_procedureId_patientId_key" ON "PatientFeedback"("procedureId", "patientId");

-- CreateIndex
CREATE INDEX "ProcedureChecklistItem_procedureId_idx" ON "ProcedureChecklistItem"("procedureId");

-- CreateIndex
CREATE INDEX "ProcedureChecklistItem_patientId_idx" ON "ProcedureChecklistItem"("patientId");

-- CreateIndex
CREATE INDEX "ProcedureChecklistItem_phase_idx" ON "ProcedureChecklistItem"("phase");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- CreateIndex
CREATE INDEX "PatientDocument_procedureId_idx" ON "PatientDocument"("procedureId");

-- CreateIndex
CREATE INDEX "PatientDocument_visibility_idx" ON "PatientDocument"("visibility");

-- CreateIndex
CREATE INDEX "PortalAuditLog_patientId_idx" ON "PortalAuditLog"("patientId");

-- CreateIndex
CREATE INDEX "PortalAuditLog_action_idx" ON "PortalAuditLog"("action");

-- CreateIndex
CREATE INDEX "PortalAuditLog_entityType_entityId_idx" ON "PortalAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PortalAuditLog_createdAt_idx" ON "PortalAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PatientNotification_patientId_idx" ON "PatientNotification"("patientId");

-- CreateIndex
CREATE INDEX "PatientNotification_status_idx" ON "PatientNotification"("status");

-- CreateIndex
CREATE INDEX "PatientNotification_event_idx" ON "PatientNotification"("event");

-- CreateIndex
CREATE INDEX "PatientNotification_scheduledFor_idx" ON "PatientNotification"("scheduledFor");

-- AddForeignKey
ALTER TABLE "PatientAccount" ADD CONSTRAINT "PatientAccount_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientActivationToken" ADD CONSTRAINT "PatientActivationToken_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSession" ADD CONSTRAINT "PatientSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_procedureTemplateId_fkey" FOREIGN KEY ("procedureTemplateId") REFERENCES "ProcedureTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpAppointment" ADD CONSTRAINT "FollowUpAppointment_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpAppointment" ADD CONSTRAINT "FollowUpAppointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpAppointment" ADD CONSTRAINT "FollowUpAppointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMessage" ADD CONSTRAINT "PatientMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMessage" ADD CONSTRAINT "PatientMessage_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureChecklistItem" ADD CONSTRAINT "ProcedureChecklistItem_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureChecklistItem" ADD CONSTRAINT "ProcedureChecklistItem_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientNotification" ADD CONSTRAINT "PatientNotification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
