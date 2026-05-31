import { Prisma, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute, canManageCrm } from "@/lib/admin-permissions";
import {
  addCrmComment,
  deleteCrmComment,
  deleteCrmSubmission,
  recordAuditLog,
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

const bulkIdsSchema = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().min(3)).min(1).max(500));

const bulkSchema = z.object({
  action: z.enum(["status", "assign", "source", "archive", "delete"]),
  ids: bulkIdsSchema,
  status: z.nativeEnum(SubmissionStatus).optional(),
  assignedToId: z.string().optional().or(z.literal("")),
  source: z.string().max(160).optional().or(z.literal("")),
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

async function requireCrmManager() {
  const session = await requireAdmin();
  if (!session?.user?.role || !canManageCrm(session.user.role)) {
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

export async function PATCH(request: Request) {
  const session = await requireCrmManager();
  if (!session) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = bulkSchema.safeParse({
    action: readFormString(formData, "action"),
    ids: readFormString(formData, "ids"),
    status: readFormString(formData, "status") || undefined,
    assignedToId: readFormString(formData, "assignedToId") || undefined,
    source: readFormString(formData, "source") || undefined,
  });

  if (!parsed.success) {
    return json(
      "error",
      "اختر طلبًا واحدًا على الأقل وتأكد من بيانات الإجراء. / Invalid bulk action.",
      { status: 400 },
    );
  }

  const { action, ids } = parsed.data;

  try {
    if (action === "status") {
      if (!parsed.data.status) {
        return json("error", "اختر الحالة الجديدة أولًا. / Choose a status.", {
          status: 400,
        });
      }
      for (const id of ids) {
        await updateCrmSubmission({ id, status: parsed.data.status });
      }
    }

    if (action === "assign") {
      for (const id of ids) {
        await updateCrmSubmission({
          id,
          assignedToId: parsed.data.assignedToId || null,
        });
      }
    }

    if (action === "source") {
      const source = parsed.data.source?.trim();
      if (!source) {
        return json("error", "اكتب المصدر الجديد أولًا. / Enter a source.", {
          status: 400,
        });
      }
      for (const id of ids) {
        await updateCrmSubmission({ id, source });
      }
    }

    if (action === "archive") {
      for (const id of ids) {
        await updateCrmSubmission({ id, status: SubmissionStatus.CLOSED });
      }
    }

    if (action === "delete") {
      for (const id of ids) {
        await deleteCrmSubmission(id);
      }
    }

    await recordAuditLog({
      actorUserId: session.user?.id,
      action: `crm.bulk.${action}`,
      entityType: "ContactSubmission",
      metadata: {
        affected: ids.length,
        ids,
        status: parsed.data.status,
        assignedToId: parsed.data.assignedToId || null,
        source: parsed.data.source || null,
      },
    });

    revalidate();
    return NextResponse.json({
      status: "success",
      message: `تم تنفيذ الإجراء على ${ids.length} طلب. / Bulk action completed.`,
      affected: ids.length,
    });
  } catch {
    return json(
      "error",
      "تعذر تنفيذ الإجراء الجماعي. راجع الطلبات وحاول مرة أخرى. / Bulk action failed.",
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
  if (!(await requireCrmManager())) {
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
