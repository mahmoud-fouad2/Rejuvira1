"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FeedbackStatus,
  MessageSenderType,
  MessageStatus,
  PortalActorType,
} from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { writePortalAudit } from "@/lib/portal/audit";
import {
  changePatientPassword,
  getPatientSession,
  logoutPatient,
  revokeAllPatientSessions,
} from "@/lib/portal/patient-auth";
import { messageCategories } from "@/lib/portal/labels";

export type PortalPatientActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const GENERIC_ERROR = "تعذّر تنفيذ الطلب. حاول مرة أخرى.";

function fail(message: string): PortalPatientActionState {
  return { status: "error", message };
}

function ok(message: string): PortalPatientActionState {
  return { status: "success", message };
}

/** Loads the session or redirects to login — every patient action starts here. */
async function requirePatient() {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");
  return session;
}

/** Asserts the procedure belongs to the signed-in patient. */
async function requireOwnProcedure(procedureId: string, patientId: string) {
  const procedure = await prisma.procedure.findFirst({
    where: { id: procedureId, patientId, archivedAt: null },
    select: {
      id: true,
      instructionsVersion: true,
      instructionsPublishedAt: true,
      status: true,
    },
  });
  if (!procedure) throw new Error("NOT_FOUND");
  return procedure;
}

// ------------------------------------------------------------------
// Instructions acknowledgement
// ------------------------------------------------------------------

export async function acknowledgeInstructionsAction(
  formData: FormData,
): Promise<void> {
  const session = await requirePatient();
  const procedureId = String(formData.get("procedureId") ?? "");
  if (!procedureId) return;

  try {
    const procedure = await requireOwnProcedure(
      procedureId,
      session.patientId,
    );
    if (!procedure.instructionsPublishedAt) return;

    await prisma.procedure.update({
      where: { id: procedure.id },
      data: {
        instructionsAcknowledgedAt: new Date(),
        acknowledgedVersion: procedure.instructionsVersion,
      },
    });
    await writePortalAudit({
      actorType: PortalActorType.PATIENT,
      actorId: session.patientId,
      actorName: session.fullNameAr,
      action: "procedure.instructions_acknowledged",
      entityType: "procedure",
      entityId: procedure.id,
      patientId: session.patientId,
      changes: { version: procedure.instructionsVersion },
    });
    revalidatePath(`/portal/procedures/${procedure.id}`);
    revalidatePath("/portal");
  } catch {
    /* silently ignore cross-patient attempts; audit already covers access */
  }
}

// ------------------------------------------------------------------
// Checklist
// ------------------------------------------------------------------

export async function toggleChecklistItemAction(
  formData: FormData,
): Promise<void> {
  const session = await requirePatient();
  const itemId = String(formData.get("itemId") ?? "");
  const completed = formData.get("completed") === "1";
  if (!itemId) return;

  // Ownership enforced in the WHERE clause — a patient can never toggle
  // another patient's checklist item.
  await prisma.procedureChecklistItem.updateMany({
    where: { id: itemId, patientId: session.patientId },
    data: { patientCompletedAt: completed ? new Date() : null },
  });
  const item = await prisma.procedureChecklistItem.findFirst({
    where: { id: itemId, patientId: session.patientId },
    select: { procedureId: true },
  });
  if (item) {
    revalidatePath(`/portal/procedures/${item.procedureId}`);
    revalidatePath("/portal");
  }
}

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------

const messageSchema = z.object({
  procedureId: z.string().optional().or(z.literal("")),
  category: z.string().min(2).max(40),
  message: z.string().min(5, "اكتب رسالة أوضح من فضلك.").max(4000),
});

export async function sendPatientMessageAction(
  _prev: PortalPatientActionState,
  formData: FormData,
): Promise<PortalPatientActionState> {
  const session = await requirePatient();

  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  const category = messageCategories.some((item) => item.value === data.category)
    ? data.category
    : "general";

  try {
    if (data.procedureId) {
      await requireOwnProcedure(data.procedureId, session.patientId);
    }
    const message = await prisma.patientMessage.create({
      data: {
        patientId: session.patientId,
        procedureId: data.procedureId || null,
        senderType: MessageSenderType.PATIENT,
        category,
        message: data.message.trim(),
        status: MessageStatus.UNREAD,
        isUrgent: category === "call_request",
      },
    });
    await writePortalAudit({
      actorType: PortalActorType.PATIENT,
      actorId: session.patientId,
      actorName: session.fullNameAr,
      action: "message.sent",
      entityType: "message",
      entityId: message.id,
      patientId: session.patientId,
    });
    revalidatePath("/portal/messages");
    return ok("تم استلام رسالتك وسيراجعها الفريق خلال أوقات العمل.");
  } catch {
    return fail(GENERIC_ERROR);
  }
}

// ------------------------------------------------------------------
// Feedback
// ------------------------------------------------------------------

const feedbackSchema = z.object({
  procedureId: z.string().min(10),
  overallRating: z.coerce.number().int().min(1).max(5),
  careRating: z.coerce.number().int().min(1).max(5).optional(),
  communicationRating: z.coerce.number().int().min(1).max(5).optional(),
  instructionsRating: z.coerce.number().int().min(1).max(5).optional(),
  cleanlinessRating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().max(4000).optional().or(z.literal("")),
  permissionToContact: z.string().optional(),
  permissionToPublish: z.string().optional(),
});

export async function submitFeedbackAction(
  _prev: PortalPatientActionState,
  formData: FormData,
): Promise<PortalPatientActionState> {
  const session = await requirePatient();

  const raw = Object.fromEntries(formData);
  // Optional ratings arrive as "" when untouched — drop them before parsing.
  for (const key of [
    "careRating",
    "communicationRating",
    "instructionsRating",
    "cleanlinessRating",
  ]) {
    if (raw[key] === "") delete raw[key];
  }
  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("اختر تقييمًا عامًا من 1 إلى 5 قبل الإرسال.");
  }
  const data = parsed.data;

  try {
    await requireOwnProcedure(data.procedureId, session.patientId);
    const existing = await prisma.patientFeedback.findFirst({
      where: { procedureId: data.procedureId, patientId: session.patientId },
      select: { id: true },
    });
    if (existing) {
      return fail("سبق أن أرسلت تقييمًا لهذه العملية — شكرًا لك.");
    }

    const feedback = await prisma.patientFeedback.create({
      data: {
        patientId: session.patientId,
        procedureId: data.procedureId,
        overallRating: data.overallRating,
        careRating: data.careRating ?? null,
        communicationRating: data.communicationRating ?? null,
        instructionsRating: data.instructionsRating ?? null,
        cleanlinessRating: data.cleanlinessRating ?? null,
        comment: data.comment?.trim() || null,
        permissionToContact: data.permissionToContact === "1",
        permissionToPublish: data.permissionToPublish === "1",
        status: FeedbackStatus.NEW,
      },
    });

    await writePortalAudit({
      actorType: PortalActorType.PATIENT,
      actorId: session.patientId,
      actorName: session.fullNameAr,
      action: "feedback.submitted",
      entityType: "feedback",
      entityId: feedback.id,
      patientId: session.patientId,
      changes: { overallRating: data.overallRating },
    });

    // Low ratings raise an internal alert for management follow-up. The
    // patient always sees the same warm thank-you message.
    if (data.overallRating <= 2) {
      const { recordAppLog } = await import("@/lib/app-log");
      await recordAppLog({
        level: "warn",
        kind: "patient-feedback",
        message: "تقييم منخفض من مريض يحتاج متابعة الإدارة",
        meta: {
          feedbackId: feedback.id,
          procedureId: data.procedureId,
          overallRating: data.overallRating,
          permissionToContact: data.permissionToContact === "1",
        },
      });
    }

    revalidatePath(`/portal/procedures/${data.procedureId}`);
    return ok("شكرًا لتقييمك — ملاحظاتك تساعدنا على تحسين رعايتنا.");
  } catch {
    return fail(GENERIC_ERROR);
  }
}

// ------------------------------------------------------------------
// Account
// ------------------------------------------------------------------

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية."),
  newPassword: z.string().min(1, "اختر كلمة مرور جديدة."),
  confirmPassword: z.string(),
});

export async function changePasswordAction(
  _prev: PortalPatientActionState,
  formData: FormData,
): Promise<PortalPatientActionState> {
  const session = await requirePatient();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return fail("كلمتا المرور غير متطابقتين.");
  }
  const result = await changePatientPassword({
    patientId: session.patientId,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
  });
  if (!result.ok) return fail(result.error ?? GENERIC_ERROR);
  revalidatePath("/portal/account");
  return ok("تم تغيير كلمة المرور بنجاح.");
}

export async function endAllSessionsAction(): Promise<void> {
  const session = await requirePatient();
  await revokeAllPatientSessions(session.patientId);
  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: session.patientId,
    actorName: session.fullNameAr,
    action: "patient.sessions_revoked",
    entityType: "patient",
    entityId: session.patientId,
    patientId: session.patientId,
  });
  await logoutPatient();
  redirect("/patient-login");
}

export async function logoutAction(): Promise<void> {
  await logoutPatient();
  redirect("/patient-login");
}

// ------------------------------------------------------------------
// Documents
// ------------------------------------------------------------------

export async function recordDocumentDownloadAction(
  formData: FormData,
): Promise<void> {
  const session = await requirePatient();
  const documentId = String(formData.get("documentId") ?? "");
  if (!documentId) return;
  const document = await prisma.patientDocument.findFirst({
    where: {
      id: documentId,
      patientId: session.patientId,
      visibility: "PATIENT_VISIBLE",
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!document) return;
  await writePortalAudit({
    actorType: PortalActorType.PATIENT,
    actorId: session.patientId,
    actorName: session.fullNameAr,
    action: "document.downloaded",
    entityType: "document",
    entityId: document.id,
    patientId: session.patientId,
  });
}
