"use server";

import { revalidatePath } from "next/cache";
import {
  AppointmentStatus,
  ChecklistPhase,
  FeedbackStatus,
  MessageStatus,
  NotificationChannel,
  PatientAccountStatus,
  PatientGender,
  PortalActorType,
  PortalTokenPurpose,
  ProcedureStatus,
  UserRole,
} from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  hasPortalCapability,
  type PortalCapability,
} from "@/lib/portal/permissions";
import { writePortalAudit } from "@/lib/portal/audit";
import { sendActivationEmail } from "@/lib/portal/email";
import { enqueuePortalNotification } from "@/lib/portal/notifications";
import { issueActivationToken } from "@/lib/portal/patient-auth";
import {
  addChecklistItem,
  approveTemplate,
  archivePatient,
  archiveProcedure,
  archiveTemplate,
  checkPatientDuplicates,
  createAppointment,
  createPatient,
  createProcedure,
  createTemplate,
  deleteChecklistItem,
  publishProcedureInstructions,
  replyToMessage,
  restorePatient,
  setMessageStatus,
  updateAppointmentStatus,
  updatePatient,
  updateProcedure,
  updateTemplate,
  verifyChecklistItem,
} from "@/lib/portal/repository";
import {
  isValidSaudiMobileNumber,
  SAUDI_MOBILE_ERROR_MESSAGE,
} from "@/lib/saudi-phone";
import { updatePortalSettings } from "@/lib/portal/settings";

export type PortalActionState = {
  status: "idle" | "success" | "error";
  message: string;
  payload?: Record<string, string>;
};

const GENERIC_ERROR =
  "تعذّر تنفيذ العملية. راجع البيانات وحاول مرة أخرى.";
const FORBIDDEN_ERROR = "لا تملك صلاحية تنفيذ هذه العملية.";

type StaffContext = {
  id: string;
  name: string;
  role: UserRole;
};

async function requireCapability(
  capability: PortalCapability,
): Promise<StaffContext | null> {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !hasPortalCapability(role, capability)) return null;
  return {
    id: session.user.id ?? "",
    name: session.user.name ?? "",
    role,
  };
}

function fail(message: string): PortalActionState {
  return { status: "error", message };
}

function ok(
  message: string,
  payload?: Record<string, string>,
): PortalActionState {
  return { status: "success", message, ...(payload ? { payload } : {}) };
}

function revalidatePatients(patientId?: string) {
  revalidatePath("/admin/patients");
  if (patientId) revalidatePath(`/admin/patients/${patientId}`);
}

// ------------------------------------------------------------------
// Patients
// ------------------------------------------------------------------

const patientSchema = z.object({
  fileNumber: z.string().max(40).optional().or(z.literal("")),
  fullNameAr: z.string().min(3, "الاسم العربي مطلوب").max(160),
  fullNameEn: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().min(9).max(20),
  email: z.string().email("بريد إلكتروني غير صحيح").max(160).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", ""]).optional(),
  emergencyContactName: z.string().max(160).optional().or(z.literal("")),
  emergencyContactPhone: z.string().max(20).optional().or(z.literal("")),
  preferredLanguage: z.enum(["ar", "en"]).default("ar"),
  internalNotes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createPatientAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("patients.create");
  if (!staff) return fail(FORBIDDEN_ERROR);

  const parsed = patientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  if (!isValidSaudiMobileNumber(data.phone)) {
    return fail(SAUDI_MOBILE_ERROR_MESSAGE);
  }

  try {
    const duplicates = await checkPatientDuplicates(
      data.phone,
      data.fileNumber || undefined,
    );
    if (duplicates.fileNumberTaken) {
      return fail("رقم الملف مستخدم بالفعل لمريض آخر.");
    }
    const duplicateMatch = duplicates.phoneMatches[0];
    if (duplicateMatch && formData.get("confirmDuplicate") !== "1") {
      return {
        status: "error",
        message: `رقم الجوال مسجل بالفعل للمريض ${duplicateMatch.fullNameAr} (ملف ${duplicateMatch.fileNumber}). أكد الإضافة إذا كان مريضًا مختلفًا.`,
        payload: { duplicatePhone: "1" },
      };
    }

    const patient = await createPatient({
      fileNumber: data.fileNumber || undefined,
      fullNameAr: data.fullNameAr,
      fullNameEn: data.fullNameEn || undefined,
      phone: data.phone,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender ? (data.gender as PatientGender) : undefined,
      emergencyContactName: data.emergencyContactName || undefined,
      emergencyContactPhone: data.emergencyContactPhone || undefined,
      preferredLanguage: data.preferredLanguage,
      internalNotes: data.internalNotes || undefined,
      createdById: staff.id,
      createdByName: staff.name,
    });

    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "patient.created",
      entityType: "patient",
      entityId: patient.id,
      patientId: patient.id,
      changes: { fileNumber: patient.fileNumber },
    });
    revalidatePatients();
    return ok("تم إنشاء ملف المريض بنجاح.", { patientId: patient.id });
  } catch (error) {
    if (error instanceof Error && error.message === "FILE_NUMBER_TAKEN") {
      return fail("رقم الملف مستخدم بالفعل لمريض آخر.");
    }
    console.error("[patients] create failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function updatePatientAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("patients.edit");
  if (!staff) return fail(FORBIDDEN_ERROR);

  const id = String(formData.get("patientId") ?? "");
  if (!id) return fail(GENERIC_ERROR);

  const parsed = patientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  if (!isValidSaudiMobileNumber(data.phone)) {
    return fail(SAUDI_MOBILE_ERROR_MESSAGE);
  }
  const accountStatusRaw = String(formData.get("accountStatus") ?? "");
  const accountStatus = (
    Object.values(PatientAccountStatus) as string[]
  ).includes(accountStatusRaw)
    ? (accountStatusRaw as PatientAccountStatus)
    : undefined;

  try {
    const duplicates = await checkPatientDuplicates(data.phone, undefined, id);
    const duplicateMatch = duplicates.phoneMatches[0];
    if (duplicateMatch && formData.get("confirmDuplicate") !== "1") {
      return fail(
        `رقم الجوال مسجل بالفعل للمريض ${duplicateMatch.fullNameAr} (ملف ${duplicateMatch.fileNumber}).`,
      );
    }
    await updatePatient(id, {
      fullNameAr: data.fullNameAr,
      fullNameEn: data.fullNameEn || undefined,
      phone: data.phone,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender ? (data.gender as PatientGender) : undefined,
      emergencyContactName: data.emergencyContactName || undefined,
      emergencyContactPhone: data.emergencyContactPhone || undefined,
      preferredLanguage: data.preferredLanguage,
      internalNotes: data.internalNotes || undefined,
      ...(accountStatus ? { accountStatus } : {}),
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "patient.updated",
      entityType: "patient",
      entityId: id,
      patientId: id,
    });
    revalidatePatients(id);
    return ok("تم حفظ بيانات المريض.");
  } catch (error) {
    console.error("[patients] update failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function archivePatientAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("patients.archive");
  if (!staff) return;
  const id = String(formData.get("patientId") ?? "");
  if (!id) return;
  await archivePatient(id, { id: staff.id, name: staff.name });
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "patient.archived",
    entityType: "patient",
    entityId: id,
    patientId: id,
  });
  revalidatePatients(id);
}

export async function restorePatientAction(formData: FormData): Promise<void> {
  const staff = await requireCapability("patients.archive");
  if (!staff) return;
  const id = String(formData.get("patientId") ?? "");
  if (!id) return;
  await restorePatient(id);
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "patient.restored",
    entityType: "patient",
    entityId: id,
    patientId: id,
  });
  revalidatePatients(id);
}

export async function sendActivationAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("patients.sendActivation");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const patientId = String(formData.get("patientId") ?? "");
  if (!patientId) return fail(GENERIC_ERROR);

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { archivedAt: true, email: true, fullNameAr: true },
    });
    if (!patient || patient.archivedAt) return fail(GENERIC_ERROR);

    const issued = await issueActivationToken(
      patientId,
      PortalTokenPurpose.ACTIVATION,
      { id: staff.id, name: staff.name },
    );
    const sendEmail = formData.get("channel") === "email";
    if (sendEmail) {
      if (!patient.email) {
        return fail("لا يوجد بريد إلكتروني محفوظ لهذا المريض.");
      }
      const siteUrl = (process.env.SITE_URL || "https://rejuvera.sa").replace(
        /\/$/,
        "",
      );
      await sendActivationEmail({
        to: patient.email,
        patientName: patient.fullNameAr,
        activationUrl: `${siteUrl}${issued.activationPath}`,
        otp: issued.otp,
        expiresAt: issued.expiresAt,
      });
      await enqueuePortalNotification({
        patientId,
        event: "account_activation",
        channel: NotificationChannel.EMAIL,
        title: "تفعيل حساب بوابة مرضى Rejuvera",
        body: `مرحبًا ${patient.fullNameAr}، تم تجهيز رابط تفعيل حسابك في بوابة مرضى Rejuvera. الرابط صالح لفترة محدودة ولا تشارك رمز التحقق مع أي شخص.`,
      });
    }
    revalidatePatients(patientId);
    // The link/OTP are displayed once to the staff member to share with the
    // patient through the approved channel; they are never stored raw.
    return ok(
      sendEmail
        ? "تم تجهيز رسالة التفعيل عبر البريد وإضافة المهمة لقائمة الإشعارات."
        : "تم إنشاء رابط التفعيل. شاركه مع المريض مع رمز التحقق.",
      {
      activationPath: issued.activationPath,
      otp: issued.otp,
      expiresAt: issued.expiresAt.toISOString(),
      ...(sendEmail ? { emailQueued: "1" } : {}),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP_NOT_CONFIGURED") {
      return fail("إعدادات SMTP غير مكتملة. أضف SMTP_HOST و SMTP_PORT و SMTP_USER و SMTP_PASS.");
    }
    console.error("[patients] activation failed", error);
    return fail(GENERIC_ERROR);
  }
}

// ------------------------------------------------------------------
// Procedures
// ------------------------------------------------------------------

const procedureSchema = z.object({
  patientId: z.string().min(10),
  procedureTemplateId: z.string().optional().or(z.literal("")),
  customProcedureName: z.string().max(200).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  doctorId: z.string().optional().or(z.literal("")),
  surgeonName: z.string().max(160).optional().or(z.literal("")),
  procedureDate: z.string().optional().or(z.literal("")),
  procedureTime: z.string().max(20).optional().or(z.literal("")),
  arrivalTime: z.string().max(20).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(
    Object.values(ProcedureStatus) as [string, ...string[]],
  ).default("DRAFT"),
  patientVisibleNotes: z.string().max(4000).optional().or(z.literal("")),
  privateStaffNotes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createProcedureAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("procedures.create");
  if (!staff) return fail(FORBIDDEN_ERROR);

  const parsed = procedureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  if (!data.procedureTemplateId && !data.customProcedureName) {
    return fail("اختر قالب عملية أو اكتب اسم العملية.");
  }

  try {
    const procedure = await createProcedure({
      patientId: data.patientId,
      procedureTemplateId: data.procedureTemplateId || undefined,
      customProcedureName: data.customProcedureName || undefined,
      category: data.category || undefined,
      doctorId: data.doctorId || undefined,
      surgeonName: data.surgeonName || undefined,
      procedureDate: data.procedureDate
        ? new Date(data.procedureDate)
        : undefined,
      procedureTime: data.procedureTime || undefined,
      arrivalTime: data.arrivalTime || undefined,
      location: data.location || undefined,
      status: data.status as ProcedureStatus,
      patientVisibleNotes: data.patientVisibleNotes || undefined,
      privateStaffNotes: data.privateStaffNotes || undefined,
      createdById: staff.id,
      createdByName: staff.name,
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "procedure.created",
      entityType: "procedure",
      entityId: procedure.id,
      patientId: data.patientId,
    });
    revalidatePatients(data.patientId);
    return ok("تمت إضافة العملية.", { procedureId: procedure.id });
  } catch (error) {
    if (error instanceof Error && error.message === "TEMPLATE_NOT_APPROVED") {
      return fail("لا يمكن استخدام قالب غير معتمد طبيًا. اعتمد القالب أولًا.");
    }
    console.error("[procedures] create failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function updateProcedureAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("procedures.edit");
  if (!staff) return fail(FORBIDDEN_ERROR);

  const id = String(formData.get("procedureId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  if (!id) return fail(GENERIC_ERROR);

  const parsed = procedureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;

  const canEditInstructions = hasPortalCapability(
    staff.role,
    "procedures.editInstructions",
  );
  const instructionValue = (key: string) => {
    if (!canEditInstructions) return undefined;
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };

  try {
    await updateProcedure(id, {
      customProcedureName: data.customProcedureName ?? "",
      category: data.category ?? "",
      doctorId: data.doctorId ?? "",
      surgeonName: data.surgeonName ?? "",
      procedureDate: data.procedureDate
        ? new Date(data.procedureDate)
        : undefined,
      procedureTime: data.procedureTime ?? "",
      arrivalTime: data.arrivalTime ?? "",
      location: data.location ?? "",
      status: data.status as ProcedureStatus,
      patientVisibleNotes: data.patientVisibleNotes ?? "",
      privateStaffNotes: data.privateStaffNotes ?? "",
      preOperationInstructions: instructionValue("preOperationInstructions"),
      operationDayInstructions: instructionValue("operationDayInstructions"),
      postOperationInstructions: instructionValue("postOperationInstructions"),
      warningSigns: instructionValue("warningSigns"),
      followUpInstructions: instructionValue("followUpInstructions"),
      updatedById: staff.id,
      updatedByName: staff.name,
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "procedure.updated",
      entityType: "procedure",
      entityId: id,
      patientId,
    });
    revalidatePatients(patientId);
    revalidatePath(`/admin/patients/procedures/${id}`);
    return ok("تم حفظ بيانات العملية.");
  } catch (error) {
    console.error("[procedures] update failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function publishInstructionsAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("procedures.publishInstructions");
  if (!staff) return;
  const id = String(formData.get("procedureId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  if (!id) return;
  await publishProcedureInstructions(id);
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "procedure.instructions_published",
    entityType: "procedure",
    entityId: id,
    patientId,
  });
  if (patientId) {
    await enqueuePortalNotification({
      patientId,
      procedureId: id,
      event: "instructions_published",
      title: "تعليمات جديدة متاحة",
      body: "أصبحت تعليمات عمليتك متاحة في بوابة المرضى. يرجى الاطلاع عليها وتأكيد قراءتها.",
    });
  }
  revalidatePatients(patientId);
  revalidatePath(`/admin/patients/procedures/${id}`);
}

export async function archiveProcedureAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("patients.archive");
  if (!staff) return;
  const id = String(formData.get("procedureId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  if (!id) return;
  await archiveProcedure(id);
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "procedure.archived",
    entityType: "procedure",
    entityId: id,
    patientId,
  });
  revalidatePatients(patientId);
}

// ------------------------------------------------------------------
// Templates
// ------------------------------------------------------------------

const templateSchema = z.object({
  nameAr: z.string().min(3, "اسم القالب مطلوب").max(200),
  nameEn: z.string().max(200).optional().or(z.literal("")),
  category: z.string().min(2, "التصنيف مطلوب").max(80),
  preOperationContentAr: z.string().max(20000).optional().or(z.literal("")),
  preOperationContentEn: z.string().max(20000).optional().or(z.literal("")),
  operationDayContentAr: z.string().max(20000).optional().or(z.literal("")),
  operationDayContentEn: z.string().max(20000).optional().or(z.literal("")),
  postOperationContentAr: z.string().max(20000).optional().or(z.literal("")),
  postOperationContentEn: z.string().max(20000).optional().or(z.literal("")),
  warningSignsAr: z.string().max(20000).optional().or(z.literal("")),
  warningSignsEn: z.string().max(20000).optional().or(z.literal("")),
  followUpContentAr: z.string().max(20000).optional().or(z.literal("")),
  followUpContentEn: z.string().max(20000).optional().or(z.literal("")),
});

export async function createTemplateAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("templates.edit");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const parsed = templateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  try {
    const template = await createTemplate(parsed.data, {
      id: staff.id,
      name: staff.name,
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "template.created",
      entityType: "template",
      entityId: template.id,
    });
    revalidatePath("/admin/patients/templates");
    return ok("تم إنشاء القالب كمسودة تحتاج اعتمادًا طبيًا.", {
      templateId: template.id,
    });
  } catch (error) {
    console.error("[templates] create failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function updateTemplateAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("templates.edit");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const id = String(formData.get("templateId") ?? "");
  if (!id) return fail(GENERIC_ERROR);
  const parsed = templateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  try {
    const result = await updateTemplate(id, parsed.data, {
      id: staff.id,
      name: staff.name,
    });
    const isNewVersion = result.id !== id;
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: isNewVersion ? "template.new_version" : "template.updated",
      entityType: "template",
      entityId: result.id,
      changes: { version: result.version },
    });
    revalidatePath("/admin/patients/templates");
    revalidatePath(`/admin/patients/templates/${result.id}`);
    return ok(
      isNewVersion
        ? `تم إنشاء الإصدار ${result.version} كمسودة جديدة — القالب المعتمد السابق لم يتغير.`
        : "تم حفظ القالب.",
      { templateId: result.id },
    );
  } catch (error) {
    console.error("[templates] update failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function approveTemplateAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("templates.approve");
  if (!staff) return;
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  try {
    await approveTemplate(id, { id: staff.id, name: staff.name });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "template.approved",
      entityType: "template",
      entityId: id,
    });
  } catch (error) {
    console.error("[templates] approve failed", error);
  }
  revalidatePath("/admin/patients/templates");
  revalidatePath(`/admin/patients/templates/${id}`);
}

export async function archiveTemplateAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("templates.approve");
  if (!staff) return;
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  await archiveTemplate(id);
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "template.archived",
    entityType: "template",
    entityId: id,
  });
  revalidatePath("/admin/patients/templates");
}

// ------------------------------------------------------------------
// Follow-up appointments
// ------------------------------------------------------------------

const appointmentSchema = z.object({
  procedureId: z.string().min(10),
  patientId: z.string().min(10),
  appointmentDate: z.string().min(8, "تاريخ الموعد مطلوب"),
  appointmentTime: z.string().max(20).optional().or(z.literal("")),
  appointmentType: z.string().max(120).optional().or(z.literal("")),
  doctorId: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  patientVisibleNotes: z.string().max(2000).optional().or(z.literal("")),
});

export async function createAppointmentAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("followUps.manage");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  try {
    const appointment = await createAppointment({
      procedureId: data.procedureId,
      patientId: data.patientId,
      appointmentDate: new Date(data.appointmentDate),
      appointmentTime: data.appointmentTime || undefined,
      appointmentType: data.appointmentType || undefined,
      doctorId: data.doctorId || undefined,
      notes: data.notes || undefined,
      patientVisibleNotes: data.patientVisibleNotes || undefined,
      createdById: staff.id,
      createdByName: staff.name,
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "appointment.created",
      entityType: "appointment",
      entityId: appointment.id,
      patientId: data.patientId,
    });
    revalidatePatients(data.patientId);
    revalidatePath("/admin/patients/follow-ups");
    return ok("تمت إضافة موعد المتابعة.");
  } catch (error) {
    console.error("[appointments] create failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function updateAppointmentStatusAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("followUps.manage");
  if (!staff) return;
  const id = String(formData.get("appointmentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !(Object.values(AppointmentStatus) as string[]).includes(statusRaw)) {
    return;
  }
  await updateAppointmentStatus(id, statusRaw as AppointmentStatus);
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "appointment.status_changed",
    entityType: "appointment",
    entityId: id,
    patientId,
    changes: { status: statusRaw },
  });
  revalidatePatients(patientId);
  revalidatePath("/admin/patients/follow-ups");
}

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------

export async function replyMessageAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("messages.reply");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const messageId = String(formData.get("messageId") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  const patientId = String(formData.get("patientId") ?? "");
  if (!messageId || reply.length < 2) {
    return fail("اكتب ردًا واضحًا قبل الإرسال.");
  }
  if (reply.length > 4000) return fail("الرد أطول من الحد المسموح.");
  try {
    await replyToMessage({
      messageId,
      reply,
      senderUserId: staff.id,
      senderUserName: staff.name,
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "message.replied",
      entityType: "message",
      entityId: messageId,
      patientId,
    });
    if (patientId) {
      await enqueuePortalNotification({
        patientId,
        event: "message_reply",
        title: "رد جديد من فريق المركز",
        body: "لديك رد جديد على رسالتك في بوابة المرضى.",
      });
    }
    revalidatePath("/admin/patients/messages");
    revalidatePatients(patientId);
    return ok("تم إرسال الرد للمريض.");
  } catch (error) {
    console.error("[messages] reply failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function setMessageStatusAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("messages.view");
  if (!staff) return;
  const id = String(formData.get("messageId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !(Object.values(MessageStatus) as string[]).includes(statusRaw)) {
    return;
  }
  await setMessageStatus(id, statusRaw as MessageStatus);
  revalidatePath("/admin/patients/messages");
}

// ------------------------------------------------------------------
// Checklist
// ------------------------------------------------------------------

const checklistSchema = z.object({
  procedureId: z.string().min(10),
  patientId: z.string().min(10),
  title: z.string().min(2, "عنوان المهمة مطلوب").max(300),
  description: z.string().max(2000).optional().or(z.literal("")),
  phase: z.enum(Object.values(ChecklistPhase) as [string, ...string[]]),
  dueDate: z.string().optional().or(z.literal("")),
  isRequired: z.string().optional(),
});

export async function addChecklistItemAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("followUps.manage");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const parsed = checklistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  try {
    await addChecklistItem({
      procedureId: data.procedureId,
      patientId: data.patientId,
      title: data.title,
      description: data.description || undefined,
      phase: data.phase as ChecklistPhase,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      isRequired: data.isRequired === "1",
    });
    revalidatePath(`/admin/patients/procedures/${data.procedureId}`);
    revalidatePatients(data.patientId);
    return ok("تمت إضافة المهمة.");
  } catch (error) {
    console.error("[checklist] add failed", error);
    return fail(GENERIC_ERROR);
  }
}

export async function verifyChecklistItemAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("followUps.manage");
  if (!staff) return;
  const id = String(formData.get("itemId") ?? "");
  const procedureId = String(formData.get("procedureId") ?? "");
  const verified = formData.get("verified") === "1";
  if (!id) return;
  await verifyChecklistItem(id, verified);
  revalidatePath(`/admin/patients/procedures/${procedureId}`);
}

export async function deleteChecklistItemAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("followUps.manage");
  if (!staff) return;
  const id = String(formData.get("itemId") ?? "");
  const procedureId = String(formData.get("procedureId") ?? "");
  if (!id) return;
  await deleteChecklistItem(id);
  revalidatePath(`/admin/patients/procedures/${procedureId}`);
}

// ------------------------------------------------------------------
// Feedback workflow
// ------------------------------------------------------------------

export async function setFeedbackStatusAction(
  formData: FormData,
): Promise<void> {
  const staff = await requireCapability("feedback.manage");
  if (!staff) return;
  const id = String(formData.get("feedbackId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");
  if (!id || !(Object.values(FeedbackStatus) as string[]).includes(statusRaw)) {
    return;
  }
  await prisma.patientFeedback.update({
    where: { id },
    data: {
      status: statusRaw as FeedbackStatus,
      ...(internalNotes.trim()
        ? { internalNotes: internalNotes.trim().slice(0, 4000) }
        : {}),
    },
  });
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "feedback.status_changed",
    entityType: "feedback",
    entityId: id,
    changes: { status: statusRaw },
  });
  revalidatePath("/admin/patients/feedback");
}

// ------------------------------------------------------------------
// CSV import
// ------------------------------------------------------------------

const importRowSchema = z.object({
  fullNameAr: z.string().min(3).max(160),
  phone: z.string().min(9).max(20),
  fileNumber: z.string().max(40).optional().or(z.literal("")),
  fullNameEn: z.string().max(160).optional().or(z.literal("")),
  email: z.string().max(160).optional().or(z.literal("")),
  internalNotes: z.string().max(4000).optional().or(z.literal("")),
});

export type ImportRowResult = {
  row: number;
  name: string;
  status: "created" | "skipped";
  reason?: string;
};

export type ImportActionState = PortalActionState & {
  results?: ImportRowResult[];
};

/**
 * Commits rows already previewed on the client. Every row is re-validated
 * server-side; invalid or duplicate rows are reported, never silently
 * dropped or silently imported.
 */
export async function commitPatientsImportAction(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const staff = await requireCapability("patients.import");
  if (!staff) return fail(FORBIDDEN_ERROR);

  let rows: unknown;
  try {
    rows = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    return fail("تعذّر قراءة بيانات الملف.");
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return fail("لا توجد صفوف صالحة للاستيراد.");
  }
  if (rows.length > 500) {
    return fail("الحد الأقصى للاستيراد 500 صف في المرة الواحدة.");
  }

  const results: ImportRowResult[] = [];
  let created = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const parsed = importRowSchema.safeParse(rows[index]);
    if (!parsed.success) {
      results.push({
        row: rowNumber,
        name: String((rows[index] as Record<string, unknown>)?.fullNameAr ?? "—"),
        status: "skipped",
        reason: "بيانات ناقصة أو غير صالحة",
      });
      continue;
    }
    const data = parsed.data;
    if (!isValidSaudiMobileNumber(data.phone)) {
      results.push({
        row: rowNumber,
        name: data.fullNameAr,
        status: "skipped",
        reason: "رقم جوال غير صالح",
      });
      continue;
    }
    try {
      const duplicates = await checkPatientDuplicates(
        data.phone,
        data.fileNumber || undefined,
      );
      if (duplicates.fileNumberTaken) {
        results.push({
          row: rowNumber,
          name: data.fullNameAr,
          status: "skipped",
          reason: `رقم الملف ${data.fileNumber} مستخدم`,
        });
        continue;
      }
      const phoneMatch = duplicates.phoneMatches[0];
      if (phoneMatch) {
        results.push({
          row: rowNumber,
          name: data.fullNameAr,
          status: "skipped",
          reason: `الجوال مسجل للمريض ${phoneMatch.fullNameAr}`,
        });
        continue;
      }
      const patient = await createPatient({
        fileNumber: data.fileNumber || undefined,
        fullNameAr: data.fullNameAr,
        fullNameEn: data.fullNameEn || undefined,
        phone: data.phone,
        email: data.email || undefined,
        internalNotes: data.internalNotes || undefined,
        createdById: staff.id,
        createdByName: staff.name,
      });
      created += 1;
      results.push({
        row: rowNumber,
        name: data.fullNameAr,
        status: "created",
        reason: `ملف ${patient.fileNumber}`,
      });
    } catch (error) {
      results.push({
        row: rowNumber,
        name: data.fullNameAr,
        status: "skipped",
        reason:
          error instanceof Error && error.message === "FILE_NUMBER_TAKEN"
            ? "رقم الملف مستخدم"
            : "خطأ غير متوقع أثناء الحفظ",
      });
    }
  }

  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "patient.import",
    entityType: "patient",
    changes: { total: rows.length, created, skipped: rows.length - created },
  });
  revalidatePatients();

  return {
    status: "success",
    message: `اكتمل الاستيراد: ${created} مريض جديد، ${rows.length - created} صف متخطى.`,
    results,
  };
}

// ------------------------------------------------------------------
// Portal settings
// ------------------------------------------------------------------

const settingsSchema = z.object({
  activationLinkHours: z.coerce.number().int().min(1).max(720),
  sessionHours: z.coerce.number().int().min(1).max(720),
  passwordMinLength: z.coerce.number().int().min(6).max(64),
  maxFailedLogins: z.coerce.number().int().min(3).max(20),
  lockMinutes: z.coerce.number().int().min(1).max(1440),
  privacyPolicyVersion: z.string().min(1).max(20),
  pdfFooterText: z.string().max(2000),
  googleReviewUrl: z.string().max(500).optional().or(z.literal("")),
  defaultPrintLanguage: z.enum(["ar", "en", "both"]),
  workingHours: z.string().max(300).optional().or(z.literal("")),
  notificationsEnabled: z.string().optional(),
  portalBannerEnabled: z.string().optional(),
  portalBannerTitle: z.string().max(120).optional().or(z.literal("")),
  portalBannerBody: z.string().max(500).optional().or(z.literal("")),
  portalBannerImageUrl: z.string().max(500).optional().or(z.literal("")),
  portalBannerCtaLabel: z.string().max(80).optional().or(z.literal("")),
  portalBannerCtaHref: z.string().max(500).optional().or(z.literal("")),
});

export async function updatePortalSettingsAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const staff = await requireCapability("settings.manage");
  if (!staff) return fail(FORBIDDEN_ERROR);
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }
  const data = parsed.data;
  try {
    await updatePortalSettings({
      activationLinkHours: data.activationLinkHours,
      sessionHours: data.sessionHours,
      passwordMinLength: data.passwordMinLength,
      maxFailedLogins: data.maxFailedLogins,
      lockMinutes: data.lockMinutes,
      privacyPolicyVersion: data.privacyPolicyVersion,
      pdfFooterText: data.pdfFooterText,
      googleReviewUrl: data.googleReviewUrl ?? "",
      defaultPrintLanguage: data.defaultPrintLanguage,
      workingHours: data.workingHours ?? "",
      notificationsEnabled: data.notificationsEnabled === "1",
      portalBannerEnabled: data.portalBannerEnabled === "1",
      portalBannerTitle: data.portalBannerTitle ?? "",
      portalBannerBody: data.portalBannerBody ?? "",
      portalBannerImageUrl: data.portalBannerImageUrl ?? "",
      portalBannerCtaLabel: data.portalBannerCtaLabel ?? "",
      portalBannerCtaHref: data.portalBannerCtaHref ?? "",
    });
    await writePortalAudit({
      actorType: PortalActorType.STAFF,
      actorId: staff.id,
      actorName: staff.name,
      action: "portal.settings_updated",
      entityType: "settings",
    });
    revalidatePath("/admin/patients/settings");
    return ok("تم حفظ إعدادات البوابة.");
  } catch (error) {
    console.error("[portal-settings] update failed", error);
    return fail(GENERIC_ERROR);
  }
}
