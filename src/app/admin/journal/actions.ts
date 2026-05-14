"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createJournalPostDraft,
  deleteJournalPost,
  updateJournalPostStatus,
} from "@/lib/content-repository";

export type JournalActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const createJournalSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(6),
  excerpt: z.string().min(12),
  body: z.string().min(40),
  coverImageUrl: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  readingTime: z.string().min(2),
  relatedServiceSlugs: z.string().optional().or(z.literal("")),
  relatedDoctorSlugs: z.string().optional().or(z.literal("")),
});

const updateJournalSchema = z.object({
  slug: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
});

const deleteJournalSchema = z.object({
  slug: z.string().min(3),
});

function parseCommaSeparated(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createJournalPostAction(
  _previousState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const parsed = createJournalSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl"),
    category: formData.get("category"),
    readingTime: formData.get("readingTime"),
    relatedServiceSlugs: formData.get("relatedServiceSlugs"),
    relatedDoctorSlugs: formData.get("relatedDoctorSlugs"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى استكمال بيانات المقال بشكل صحيح.",
    };
  }

  const result = await createJournalPostDraft({
    slug: parsed.data.slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    body: parsed.data.body
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    category: parsed.data.category,
    readingTime: parsed.data.readingTime,
    relatedServiceSlugs: parseCommaSeparated(parsed.data.relatedServiceSlugs),
    relatedDoctorSlugs: parseCommaSeparated(parsed.data.relatedDoctorSlugs),
    ...(parsed.data.coverImageUrl
      ? {
          coverImageUrl: parsed.data.coverImageUrl,
        }
      : {}),
  });

  revalidatePath("/admin/journal");
  revalidatePath("/journal");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم حفظ المقال بنجاح."
        : "تم اعتماد المقال داخل بيئة العمل الحالية بنجاح.",
  };
}

export async function updateJournalPostStatusAction(formData: FormData) {
  const parsed = updateJournalSchema.safeParse({
    slug: formData.get("slug"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  await updateJournalPostStatus(parsed.data.slug, parsed.data.status);

  revalidatePath("/admin/journal");
  revalidatePath("/journal");
}

export async function deleteJournalPostAction(formData: FormData) {
  const parsed = deleteJournalSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return;
  }

  await deleteJournalPost(parsed.data.slug);

  revalidatePath("/admin/journal");
  revalidatePath("/journal");
}
