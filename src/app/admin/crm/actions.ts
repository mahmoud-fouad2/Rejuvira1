"use server";

import { SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute, canManageCrm } from "@/lib/admin-permissions";
import {
  addCrmComment,
  createContactLead,
  deleteCrmComment,
  deleteCrmSubmission,
  recordAuditLog,
  updateCrmSubmission,
} from "@/lib/content-repository";

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
  serviceSlug: z.string().max(120).optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
  tags: tagsSchema,
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

function revalidate() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

async function ensureCrmAccess() {
  const session = await auth();
  if (!canAccessAdminRoute("/admin/crm", session?.user?.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

async function ensureCrmManager() {
  const session = await ensureCrmAccess();
  if (!canManageCrm(session?.user?.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function updateCrmSubmissionAction(
  _previousState: CrmActionState,
  formData: FormData,
): Promise<CrmActionState> {
  try {
    await ensureCrmAccess();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لتحديث الطلب.",
    };
  }

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    fullName: formData.get("fullName") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
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

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsvRows(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0] ?? "").map((header) =>
    header.toLowerCase().replace(/\s+/g, ""),
  );
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, cells[index] ?? ""]),
    );
  });
}

function csvValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key.toLowerCase().replace(/\s+/g, "")];
    if (value) return value.trim();
  }
  return "";
}

function parseImportStatus(value: string) {
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, SubmissionStatus> = {
    NEW: SubmissionStatus.NEW,
    جديد: SubmissionStatus.NEW,
    CONTACTED: SubmissionStatus.CONTACTED,
    تمالتواصل: SubmissionStatus.CONTACTED,
    FOLLOW_UP: SubmissionStatus.FOLLOW_UP,
    FOLLOWUP: SubmissionStatus.FOLLOW_UP,
    متابعة: SubmissionStatus.FOLLOW_UP,
    BOOKED: SubmissionStatus.BOOKED,
    محجوز: SubmissionStatus.BOOKED,
    CLOSED: SubmissionStatus.CLOSED,
    مغلق: SubmissionStatus.CLOSED,
  };
  return aliases[normalized.replace(/\s+/g, "")] ?? SubmissionStatus.NEW;
}

export async function importCrmCsvAction(formData: FormData) {
  try {
    await ensureCrmManager();
  } catch {
    return;
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const text = await file.text();
  const rows = parseCsvRows(text).slice(0, 3000);
  for (const row of rows) {
    const fullName = csvValue(row, ["name", "fullName", "الاسم"]);
    const phone = csvValue(row, ["phone", "mobile", "الجوال", "الهاتف"]);
    if (!fullName || !phone) continue;
    const tags = csvValue(row, ["tags", "الوسوم"])
      .split(/[;,،]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    await createContactLead({
      fullName,
      phone,
      email: csvValue(row, ["email", "البريد"]) || undefined,
      message: csvValue(row, ["message", "الرسالة"]) || undefined,
      notes: csvValue(row, ["notes", "ملاحظات", "ملاحظاتداخلية"]) || undefined,
      serviceSlug:
        csvValue(row, ["serviceSlug", "service", "الخدمة"]) || undefined,
      source: csvValue(row, ["source", "المصدر"]) || "استيراد CRM",
      utmSource: csvValue(row, ["utmSource", "utm_source"]) || undefined,
      utmMedium: csvValue(row, ["utmMedium", "utm_medium"]) || undefined,
      utmCampaign: csvValue(row, ["utmCampaign", "utm_campaign"]) || undefined,
      utmContent: csvValue(row, ["utmContent", "utm_content"]) || undefined,
      tags,
      status: parseImportStatus(csvValue(row, ["status", "الحالة"])),
    });
  }
  revalidate();
}

export async function addCrmCommentAction(
  _previousState: CrmActionState,
  formData: FormData,
): Promise<CrmActionState> {
  let session;
  try {
    session = await ensureCrmAccess();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لإضافة ملاحظة.",
    };
  }

  const parsed = commentSchema.safeParse({
    submissionId: formData.get("submissionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { status: "error", message: "النص قصير جدًا." };
  }
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
  try {
    await ensureCrmManager();
  } catch {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteCrmComment(id);
  revalidate();
}

export async function deleteCrmSubmissionAction(formData: FormData) {
  try {
    await ensureCrmManager();
  } catch {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteCrmSubmission(id);
  revalidate();
}

export async function bulkCrmSubmissionsAction(
  formData: FormData,
): Promise<CrmActionState & { affected?: number }> {
  let session;
  try {
    session = await ensureCrmManager();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لتنفيذ إجراء جماعي على الطلبات.",
    };
  }

  const parsed = bulkSchema.safeParse({
    action: formData.get("action"),
    ids: formData.get("ids"),
    status: formData.get("status") || undefined,
    assignedToId: formData.get("assignedToId"),
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "اختر طلبًا واحدًا على الأقل وتأكد من بيانات الإجراء.",
    };
  }

  const { action, ids } = parsed.data;
  try {
    if (action === "status") {
      if (!parsed.data.status) {
        return { status: "error", message: "اختر الحالة الجديدة أولًا." };
      }
      await Promise.all(
        ids.map((id) => updateCrmSubmission({ id, status: parsed.data.status })),
      );
    }

    if (action === "assign") {
      await Promise.all(
        ids.map((id) =>
          updateCrmSubmission({
            id,
            assignedToId: parsed.data.assignedToId || null,
          }),
        ),
      );
    }

    if (action === "source") {
      const source = parsed.data.source?.trim();
      if (!source) {
        return { status: "error", message: "اكتب المصدر الجديد أولًا." };
      }
      await Promise.all(ids.map((id) => updateCrmSubmission({ id, source })));
    }

    if (action === "archive") {
      await Promise.all(
        ids.map((id) =>
          updateCrmSubmission({ id, status: SubmissionStatus.CLOSED }),
        ),
      );
    }

    if (action === "delete") {
      await Promise.all(ids.map((id) => deleteCrmSubmission(id)));
    }

    await recordAuditLog({
      actorUserId: session?.user?.id,
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
    return {
      status: "success",
      message: `تم تنفيذ الإجراء على ${ids.length} طلب.`,
      affected: ids.length,
    };
  } catch {
    return {
      status: "error",
      message: "تعذر تنفيذ الإجراء الجماعي. راجع الطلبات وحاول مرة أخرى.",
    };
  }
}

export async function setCrmStatusAction(formData: FormData) {
  try {
    await ensureCrmAccess();
  } catch {
    return;
  }
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(SubmissionStatus).safeParse(status);
  if (!parsed.success) return;
  await updateCrmSubmission({ id, status: parsed.data });
  revalidate();
}
