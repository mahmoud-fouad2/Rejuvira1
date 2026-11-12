import { randomUUID } from "node:crypto";
import { DocumentVisibility, PortalActorType } from "@prisma/client";
import { auth } from "@/auth";
import { writePortalAudit } from "@/lib/portal/audit";
import {
  MAX_PATIENT_DOCUMENT_BYTES,
  patientDocumentFormat,
  readPatientDocumentForm,
} from "@/lib/portal/document-upload";
import { canManagePatientDocuments } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";
import {
  canUploadPatientDocuments,
  writePatientDocumentObject,
} from "@/lib/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(status: number, message: string) {
  return Response.json({ message }, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const staff = (await auth())?.user;
  if (!staff?.id || !canManagePatientDocuments(staff.role)) {
    return reply(403, "لا تملك صلاحية رفع مستندات المرضى.");
  }
  const origin = new URL(request.headers.get("x-url") ?? request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return reply(403, "افتح ملف المريض وأعد المحاولة من داخل الموقع.");
  }
  if (!canUploadPatientDocuments()) {
    return reply(503, "التخزين الخاص للمستندات غير متاح حاليًا.");
  }

  const { id: patientId } = await params;
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, archivedAt: null },
    select: { id: true },
  });
  if (!patient) return reply(404, "ملف المريض غير متاح.");

  let form: FormData;
  try {
    form = await readPatientDocumentForm(request);
  } catch (error) {
    return error instanceof RangeError
      ? reply(413, "الحد الأقصى لحجم الملف 8 ميغابايت.")
      : reply(400, "تعذرت قراءة الملف المرفق.");
  }
  const title = form.get("title");
  const file = form.get("file");
  if (typeof title !== "string" || !title.trim() || title.trim().length > 160 ||
      !(file instanceof File) || !file.size) {
    return reply(400, "أدخل عنوان المستند واختر ملفًا.");
  }
  if (file.size > MAX_PATIENT_DOCUMENT_BYTES) {
    return reply(413, "الحد الأقصى لحجم الملف 8 ميغابايت.");
  }
  const body = Buffer.from(await file.arrayBuffer());
  const format = patientDocumentFormat(body);
  if (!format) return reply(415, "اختر مستند PDF أو صورة JPEG أو PNG.");

  const id = randomUUID();
  let storageKey: string;
  try {
    storageKey = await writePatientDocumentObject(id, { body, contentType: format.mime });
  } catch {
    return reply(503, "تعذر حفظ الملف في التخزين الخاص.");
  }

  const visibility = form.get("share") === "on"
    ? DocumentVisibility.PATIENT_VISIBLE
    : DocumentVisibility.STAFF_ONLY;
  try {
    await prisma.patientDocument.create({
      data: {
        id,
        patientId,
        title: title.trim(),
        documentType: format.type,
        storageKey,
        fileName: `document.${format.extension}`,
        fileSize: body.byteLength,
        mimeType: format.mime,
        visibility,
        uploadedById: staff.id,
        uploadedByName: staff.name ?? null,
      },
    });
  } catch {
    // Preserve the object if the database result is uncertain after a disconnect.
    const saved = await prisma.patientDocument.findUnique({
      where: { id },
      select: { id: true },
    }).catch(() => undefined);
    if (saved === null) await writePatientDocumentObject(id).catch(() => undefined);
    if (!saved) return reply(503, "تعذر تأكيد حفظ المستند في ملف المريض. راجع التبويب قبل إعادة المحاولة.");
  }
  await writePortalAudit({
    actorType: PortalActorType.STAFF,
    actorId: staff.id,
    actorName: staff.name,
    action: "document.uploaded",
    entityType: "document",
    entityId: id,
    patientId,
    changes: { visibility },
  });
  return reply(201, "تم حفظ المستند.");
}
