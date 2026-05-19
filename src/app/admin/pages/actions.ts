"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createCustomPage,
  deleteCustomPage,
  updateCustomPage,
} from "@/lib/content-repository";

export type CustomPageActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const baseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(slugRegex, { message: "Slug غير صالح" }),
  titleAr: z.string().min(2).max(160),
  titleEn: z.string().max(160).optional().or(z.literal("")),
  htmlContent: z.string().min(1).max(1_000_000),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(360).optional().or(z.literal("")),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  noindex: z.coerce.boolean().optional().default(false),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().min(3),
  oldSlug: z.string().optional().or(z.literal("")),
});

function revalidate(slug?: string, oldSlug?: string) {
  revalidatePath("/admin/pages");
  if (slug) {
    revalidatePath(`/p/${slug}`);
  }
  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/p/${oldSlug}`);
  }
  revalidatePath("/sitemap.xml");
}

export async function createCustomPageAction(
  _previousState: CustomPageActionState,
  formData: FormData,
): Promise<CustomPageActionState> {
  const parsed = createSchema.safeParse({
    slug: formData.get("slug"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    htmlContent: formData.get("htmlContent"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    status: formData.get("status") || ContentStatus.DRAFT,
    noindex: formData.get("noindex"),
  });
  if (!parsed.success) {
    return { status: "error", message: "بيانات الصفحة غير صحيحة." };
  }
  try {
    await createCustomPage({
      slug: parsed.data.slug,
      titleAr: parsed.data.titleAr,
      ...(parsed.data.titleEn ? { titleEn: parsed.data.titleEn } : {}),
      htmlContent: parsed.data.htmlContent,
      ...(parsed.data.seoTitle ? { seoTitle: parsed.data.seoTitle } : {}),
      ...(parsed.data.seoDescription
        ? { seoDescription: parsed.data.seoDescription }
        : {}),
      status: parsed.data.status,
      noindex: parsed.data.noindex,
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.toLowerCase().includes("unique")
          ? "هذا الرابط مستخدم بالفعل. اختاري رابطًا آخر."
          : "تعذر إنشاء الصفحة. راجعي البيانات ثم حاولي مرة أخرى.",
    };
  }
  revalidate(parsed.data.slug);
  return { status: "success", message: "تم إنشاء الصفحة." };
}

export async function updateCustomPageAction(
  _previousState: CustomPageActionState,
  formData: FormData,
): Promise<CustomPageActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    htmlContent: formData.get("htmlContent"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    status: formData.get("status") || ContentStatus.DRAFT,
    noindex: formData.get("noindex"),
    oldSlug: formData.get("oldSlug"),
  });
  if (!parsed.success) {
    return { status: "error", message: "تعذّر تحديث الصفحة." };
  }
  try {
    await updateCustomPage({
      id: parsed.data.id,
      slug: parsed.data.slug,
      titleAr: parsed.data.titleAr,
      ...(parsed.data.titleEn ? { titleEn: parsed.data.titleEn } : {}),
      htmlContent: parsed.data.htmlContent,
      ...(parsed.data.seoTitle ? { seoTitle: parsed.data.seoTitle } : {}),
      ...(parsed.data.seoDescription
        ? { seoDescription: parsed.data.seoDescription }
        : {}),
      status: parsed.data.status,
      noindex: parsed.data.noindex,
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.toLowerCase().includes("unique")
          ? "هذا الرابط مستخدم بالفعل. اختاري رابطًا آخر."
          : "تعذر حفظ التعديلات. تأكدي أن الصفحة ما زالت موجودة.",
    };
  }
  revalidate(parsed.data.slug, parsed.data.oldSlug);
  return { status: "success", message: "تم حفظ التغييرات." };
}

export async function deleteCustomPageAction(formData: FormData) {
  const id = formData.get("id");
  const slug = formData.get("slug");
  if (typeof id !== "string" || !id) return;
  await deleteCustomPage(id);
  revalidate(typeof slug === "string" ? slug : undefined);
}
