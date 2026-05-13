"use server";

import { SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateCrmSubmission } from "@/lib/content-repository";

export type CrmActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const crmSchema = z.object({
  id: z.string().min(3),
  status: z.nativeEnum(SubmissionStatus),
  notes: z.string().optional().or(z.literal("")),
});

export async function updateCrmSubmissionAction(
  _previousState: CrmActionState,
  formData: FormData,
): Promise<CrmActionState> {
  const parsed = crmSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
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
    ...(parsed.data.notes
      ? {
          notes: parsed.data.notes,
        }
      : {}),
  });

  revalidatePath("/admin/crm");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم تحديث الطلب بنجاح."
        : "تم اعتماد التحديث داخل بيئة العمل الحالية بنجاح.",
  };
}
