"use server";

import { SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createWebhook,
  deleteWebhook,
  rotateWebhookToken,
  updateWebhook,
} from "@/lib/content-repository";

export type WebhookActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const tagsSchema = z
  .string()
  .optional()
  .transform((val) =>
    (val ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

const createSchema = z.object({
  name: z.string().min(2).max(80),
  defaultStatus: z.nativeEnum(SubmissionStatus).default(SubmissionStatus.NEW),
  defaultTags: tagsSchema,
  defaultSource: z.string().max(80).optional().or(z.literal("")),
  serviceSlug: z.string().max(80).optional().or(z.literal("")),
});

const updateSchema = createSchema.extend({
  id: z.string().min(3),
  isActive: z.coerce.boolean().default(true),
});

function revalidate() {
  revalidatePath("/admin/webhooks");
}

export async function createWebhookAction(
  _previousState: WebhookActionState,
  formData: FormData,
): Promise<WebhookActionState> {
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    defaultStatus: formData.get("defaultStatus") || SubmissionStatus.NEW,
    defaultTags: formData.get("defaultTags") ?? "",
    defaultSource: formData.get("defaultSource"),
    serviceSlug: formData.get("serviceSlug"),
  });
  if (!parsed.success) {
    return { status: "error", message: "بيانات الويب هوك غير صحيحة." };
  }
  await createWebhook({
    name: parsed.data.name,
    defaultStatus: parsed.data.defaultStatus,
    defaultTags: parsed.data.defaultTags,
    ...(parsed.data.defaultSource
      ? { defaultSource: parsed.data.defaultSource }
      : {}),
    ...(parsed.data.serviceSlug
      ? { serviceSlug: parsed.data.serviceSlug }
      : {}),
  });
  revalidate();
  return { status: "success", message: "تم إنشاء الويب هوك." };
}

export async function updateWebhookAction(
  _previousState: WebhookActionState,
  formData: FormData,
): Promise<WebhookActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    isActive: formData.get("isActive"),
    defaultStatus: formData.get("defaultStatus") || SubmissionStatus.NEW,
    defaultTags: formData.get("defaultTags") ?? "",
    defaultSource: formData.get("defaultSource"),
    serviceSlug: formData.get("serviceSlug"),
  });
  if (!parsed.success) {
    return { status: "error", message: "تعذّر تحديث الويب هوك." };
  }
  await updateWebhook({
    id: parsed.data.id,
    name: parsed.data.name,
    isActive: parsed.data.isActive,
    defaultStatus: parsed.data.defaultStatus,
    defaultTags: parsed.data.defaultTags,
    ...(parsed.data.defaultSource
      ? { defaultSource: parsed.data.defaultSource }
      : {}),
    ...(parsed.data.serviceSlug
      ? { serviceSlug: parsed.data.serviceSlug }
      : {}),
  });
  revalidate();
  return { status: "success", message: "تم حفظ الإعدادات." };
}

export async function deleteWebhookAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteWebhook(id);
  revalidate();
}

export async function rotateWebhookTokenAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await rotateWebhookToken(id);
  revalidate();
}
