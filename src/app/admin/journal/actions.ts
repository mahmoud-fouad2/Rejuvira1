"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createJournalPostDraft,
  deleteJournalPost,
  updateJournalPostStatus,
} from "@/lib/content-repository";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import { sanitizeHtml } from "@/lib/sanitize-html";

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
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBodyBlocks(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const looksLikeHtml =
    /<\/?(?:p|h2|h3|h4|ul|ol|li|blockquote|figure|img|hr|div)\b/i.test(trimmed);
  if (!looksLikeHtml) {
    return trimmed
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  const safe = sanitizeHtml(trimmed);
  const matches = safe.match(
    /<(?:p|h2|h3|h4|blockquote|ul|ol|figure|hr|div)\b[\s\S]*?<\/(?:p|h2|h3|h4|blockquote|ul|ol|figure|div)>|<hr\b[^>]*\/?>/gi,
  );
  if (matches && matches.length > 0) {
    return matches.map((block) => block.trim()).filter(Boolean);
  }
  return [safe];
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

  try {
    const result = await createJournalPostDraft({
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      body: parseBodyBlocks(parsed.data.body),
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
  } catch (error) {
    return { status: "error", message: adminActionErrorMessage(error) };
  }
}

export async function updateJournalPostStatusAction(formData: FormData) {
  const parsed = updateJournalSchema.safeParse({
    slug: formData.get("slug"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  try {
    await updateJournalPostStatus(parsed.data.slug, parsed.data.status);
    revalidatePath("/admin/journal");
    revalidatePath("/journal");
  } catch {
    return;
  }
}

export async function deleteJournalPostAction(formData: FormData) {
  const parsed = deleteJournalSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) return;

  try {
    await deleteJournalPost(parsed.data.slug);
    revalidatePath("/admin/journal");
    revalidatePath("/journal");
  } catch {
    return;
  }
}
