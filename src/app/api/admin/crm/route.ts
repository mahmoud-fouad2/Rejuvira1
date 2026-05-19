import { Prisma, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { isValidAppointmentSlot } from "@/lib/appointment-slots";
import {
  addCrmComment,
  deleteCrmComment,
  deleteCrmSubmission,
  updateCrmSubmission,
} from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const items = Array.isArray(value) ? value : value.split(",");
    return items.map((item) => item.trim()).filter(Boolean);
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

const commentSchema = z.object({
  submissionId: z.string().min(3),
  body: z.string().min(2).max(2000),
});

const deleteSchema = z.object({
  id: z.string().min(3),
  type: z.enum(["lead", "comment"]).default("lead"),
});

function json(
  status: "success" | "error",
  message: string,
  init?: ResponseInit,
) {
  return NextResponse.json({ status, message }, init);
}

async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user?.role ||
    !canAccessAdminRoute("/admin/crm", session.user.role)
  ) {
    return null;
  }
  return session;
}

function revalidate() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

function isMissingRecord(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
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

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
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
    tags: readFormString(formData, "tagsCsv") || undefined,
  });

  if (!parsed.success) {
    return json(
      "error",
      "يرجى مراجعة بيانات الطلب قبل الحفظ. / Please review the lead details.",
      { status: 400 },
    );
  }

  if (!isValidAdminAppointment(parsed.data.preferredAppointmentAt || "")) {
    return json(
      "error",
      "الموعد يجب أن يكون من السبت إلى الخميس بين 2:00 مساء و10:00 مساء. / Choose Sat-Thu between 2 PM and 10 PM.",
      { status: 400 },
    );
  }

  try {
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
    return json(
      "success",
      result.mode === "database"
        ? "تم تحديث الطلب بنجاح. / Lead updated."
        : "تم اعتماد التحديث في بيئة المعاينة. / Preview updated.",
    );
  } catch (error) {
    if (isMissingRecord(error)) {
      return json(
        "error",
        "هذا الطلب غير موجود أو تم حذفه بالفعل. / This lead no longer exists.",
        { status: 404 },
      );
    }
    return json(
      "error",
      error instanceof Error
        ? `تعذر تحديث الطلب: ${error.message}`
        : "تعذر تحديث الطلب حاليا.",
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = commentSchema.safeParse({
    submissionId: formData.get("submissionId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return json("error", "النص قصير جدا. / The note is too short.", {
      status: 400,
    });
  }

  try {
    await addCrmComment({
      submissionId: parsed.data.submissionId,
      body: parsed.data.body,
      ...(session.user?.id ? { authorId: session.user.id } : {}),
      ...(session.user?.name ? { authorName: session.user.name } : {}),
    });
    revalidate();
    return json("success", "تم إضافة الملاحظة. / Note added.");
  } catch (error) {
    if (isMissingRecord(error)) {
      return json(
        "error",
        "لا يمكن إضافة ملاحظة لأن الطلب غير موجود. / Lead not found.",
        { status: 404 },
      );
    }
    return json("error", "تعذر إضافة الملاحظة حاليا.", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = deleteSchema.safeParse({
    id: url.searchParams.get("id"),
    type: url.searchParams.get("type") || "lead",
  });

  if (!parsed.success) {
    return json("error", "طلب الحذف غير صالح. / Invalid delete request.", {
      status: 400,
    });
  }

  try {
    if (parsed.data.type === "comment") {
      await deleteCrmComment(parsed.data.id);
      revalidate();
      return json("success", "تم حذف الملاحظة. / Note deleted.");
    }
    await deleteCrmSubmission(parsed.data.id);
    revalidate();
    return json("success", "تم حذف الطلب. / Lead deleted.");
  } catch (error) {
    if (isMissingRecord(error)) {
      return json("success", "العنصر محذوف بالفعل. / Already deleted.");
    }
    return json("error", "تعذر الحذف حاليا. / Delete failed.", {
      status: 500,
    });
  }
}
