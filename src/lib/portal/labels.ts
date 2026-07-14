import {
  AppointmentStatus,
  ChecklistPhase,
  FeedbackStatus,
  MessageStatus,
  PatientAccountStatus,
  ProcedureStatus,
  TemplateStatus,
} from "@prisma/client";

/** Arabic labels for every portal enum — the UI never shows raw enum values. */

export const patientStatusLabels: Record<PatientAccountStatus, string> = {
  PENDING: "بانتظار التفعيل",
  ACTIVE: "مفعل",
  SUSPENDED: "موقوف",
  ARCHIVED: "مؤرشف",
};

export const patientStatusTone: Record<PatientAccountStatus, string> = {
  PENDING: "is-warning",
  ACTIVE: "is-success",
  SUSPENDED: "is-danger",
  ARCHIVED: "is-muted",
};

export const procedureStatusLabels: Record<ProcedureStatus, string> = {
  DRAFT: "مسودة",
  SCHEDULED: "مجدولة",
  COMPLETED: "مكتملة",
  POSTPONED: "مؤجلة",
  CANCELLED: "ملغاة",
  FOLLOW_UP: "متابعة",
};

export const procedureStatusTone: Record<ProcedureStatus, string> = {
  DRAFT: "is-muted",
  SCHEDULED: "is-info",
  COMPLETED: "is-success",
  POSTPONED: "is-warning",
  CANCELLED: "is-danger",
  FOLLOW_UP: "is-gold",
};

export const templateStatusLabels: Record<TemplateStatus, string> = {
  DRAFT: "مسودة — تحتاج اعتماد طبي",
  MEDICALLY_APPROVED: "معتمد طبيًا",
  ARCHIVED: "مؤرشف",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "مجدول",
  CONFIRMED: "مؤكد",
  COMPLETED: "تم",
  MISSED: "لم يحضر",
  CANCELLED: "ملغي",
};

export const messageStatusLabels: Record<MessageStatus, string> = {
  UNREAD: "جديدة",
  READ: "قيد المراجعة",
  REPLIED: "تم الرد",
  CLOSED: "مغلقة",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  NEW: "جديد",
  REVIEWED: "تمت المراجعة",
  CONTACTED: "تم التواصل",
  CLOSED: "مغلق",
};

export const checklistPhaseLabels: Record<ChecklistPhase, string> = {
  BEFORE_OPERATION: "قبل العملية",
  OPERATION_DAY: "يوم العملية",
  AFTER_OPERATION: "بعد العملية",
  FOLLOW_UP: "المتابعة",
};

export const messageCategories = [
  { value: "pre_op_question", label: "سؤال قبل العملية" },
  { value: "post_op_question", label: "سؤال بعد العملية" },
  { value: "follow_up", label: "موعد متابعة" },
  { value: "documents", label: "مستندات" },
  { value: "general", label: "ملاحظة عامة" },
  { value: "call_request", label: "أحتاج اتصالًا من المركز" },
] as const;

export function messageCategoryLabel(value: string): string {
  return (
    messageCategories.find((item) => item.value === value)?.label ??
    "ملاحظة عامة"
  );
}

export const templateCategories = [
  { value: "face_neck", label: "عمليات الوجه والرقبة" },
  { value: "body", label: "عمليات الجسم" },
  { value: "breast", label: "عمليات الصدر" },
  { value: "feminine", label: "التجميل النسائي" },
  { value: "other", label: "قوالب إضافية" },
] as const;

export function templateCategoryLabel(value: string | null | undefined) {
  return (
    templateCategories.find((item) => item.value === value)?.label ??
    value ??
    "غير مصنف"
  );
}

const riyadhDate = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeZone: "Asia/Riyadh",
});
const riyadhDateTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return riyadhDate.format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return riyadhDateTime.format(new Date(value));
}
