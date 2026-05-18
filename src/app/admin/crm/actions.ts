"use server";

import { SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import {
  addCrmComment,
  deleteCrmComment,
  deleteCrmSubmission,
  updateCrmSubmission,
} from "@/lib/content-repository";
import { isValidAppointmentSlot } from "@/lib/appointment-slots";

export type CrmActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      return val.filter((v) => typeof v === "string" && v.trim().length > 0);
    }
    return val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  });

const updateSchema = z.object({
  id: z.string().min(3),
  status: z.nativeEnum(SubmissionStatus),
  notes: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2).max(160).optional(),
  phone: z.string().min(4).max(40).optional(),
  email: z.string().email().max(160).optional().or(z.literal("")),
  preferredAppointmentAt: z.string().optional().or(z.literal("")),
  appointmentNotes: z.string().max(500).optional().or(z.literal("")),
  serviceSlug: z.string().max(120).optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
  tags: tagsSchema,
});

function revalidate() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

function isValidAdminAppointment(value?: string) {
  if (!value) return true;
  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (localMatch) {
    return isValidAppointmentSlot(localMatch[1], localMatch[2]);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(parsed)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  return isValidAppointmentSlot(
    `${parts.year}-${parts.month}-${parts.day}`,
    `${parts.hour}:${parts.minute}`,
  );
}

export async function updateCrmSubmissionAction(
  _previousState: CrmActionState,
  formData: FormData,
): Promise<CrmActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    fullName: formData.get("fullName") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
    preferredAppointmentAt: formData.get("preferredAppointmentAt"),
    appointmentNotes: formData.get("appointmentNotes"),
    serviceSlug: formData.get("serviceSlug"),
    assignedToId: formData.get("assignedToId"),
    tags: formData.getAll("tags").length
      ? (formData.getAll("tags") as string[]).join(",")
      : ((formData.get("tagsCsv") as string | null) ?? undefined),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "بيانات المتابعة غير مكتملة أو غير صحيحة.",
    };
  }

  if (!isValidAdminAppointment(parsed.data.preferredAppointmentAt || "")) {
    return {
      status: "error",
      message:
        "الموعد يجب أن يكون من السبت إلى الخميس بين 2:00 مساءً و10:00 مساءً.",
    };
  }

  const result = await updateCrmSubmission({
    id: parsed.data.id,
    status: parsed.data.status,
    ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    ...(parsed.data.fullName ? { fullName: parsed.data.fullName } : {}),
    ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    ...(parsed.data.email !== undefined
      ? { email: parsed.data.email || null }
      : {}),
    ...(parsed.data.preferredAppointmentAt !== undefined
      ? { preferredAppointmentAt: parsed.data.preferredAppointmentAt || null }
      : {}),
    ...(parsed.data.appointmentNotes !== undefined
      ? { appointmentNotes: parsed.data.appointmentNotes || null }
      : {}),
    ...(parsed.data.serviceSlug !== undefined
      ? { serviceSlug: parsed.data.serviceSlug || null }
      : {}),
    ...(parsed.data.assignedToId !== undefined
      ? { assignedToId: parsed.data.assignedToId || null }
      : {}),
    ...(parsed.data.tags !== undefined ? { tags: parsed.data.tags } : {}),
  });

  revalidate();

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم تحديث الطلب بنجاح."
        : "تم اعتماد التحديث في بيئة العمل الحالية.",
  };
}

const commentSchema = z.object({
  submissionId: z.string().min(3),
  body: z.string().min(2).max(2000),
});

export async function addCrmCommentAction(
  _previousState: CrmActionState,
  formData: FormData,
): Promise<CrmActionState> {
  const parsed = commentSchema.safeParse({
    submissionId: formData.get("submissionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { status: "error", message: "النص قصير جدًا." };
  }
  const session = await auth();
  await addCrmComment({
    submissionId: parsed.data.submissionId,
    body: parsed.data.body,
    ...(session?.user?.id ? { authorId: session.user.id } : {}),
    ...(session?.user?.name ? { authorName: session.user.name } : {}),
  });
  revalidate();
  return { status: "success", message: "تم إضافة الملاحظة." };
}

export async function deleteCrmCommentAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteCrmComment(id);
  revalidate();
}

export async function deleteCrmSubmissionAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteCrmSubmission(id);
  revalidate();
}

export async function setCrmStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(SubmissionStatus).safeParse(status);
  if (!parsed.success) return;
  await updateCrmSubmission({ id, status: parsed.data });
  revalidate();
}
