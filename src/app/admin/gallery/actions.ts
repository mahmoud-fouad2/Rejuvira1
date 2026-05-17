"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createGalleryItem,
  deleteGalleryItem,
  updateGalleryItem,
  updateGalleryItemStatus,
} from "@/lib/content-repository";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";

const galleryItemSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(3, "الرابط قصير جدا")
    .regex(
      /^[a-z0-9-]+$/,
      "الرابط يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة فقط",
    ),
  title: z.string().min(3, "العنوان قصير جدا"),
  category: z.string().min(2, "التصنيف مطلوب"),
  description: z.string().min(10, "الوصف قصير جدا"),
  beforeImageUrl: z.string().min(5, "مسار صورة قبل مطلوب"),
  afterImageUrl: z.string().min(5, "مسار صورة بعد مطلوب"),
  beforeImageAlt: z.string().min(3, "النص البديل لصورة قبل مطلوب"),
  afterImageAlt: z.string().min(3, "النص البديل لصورة بعد مطلوب"),
  status: z.nativeEnum(ContentStatus).optional(),
  initialSplitPercent: z
    .preprocess((value) => {
      if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return value;
    }, z.number().int().min(0).max(100).optional())
    .default(50),
});

type State = { success: boolean; message: string };

function revalidate() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function saveGalleryItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = galleryItemSchema.safeParse(raw);

  if (!parsed.success) {
    const msgs = parsed.error.issues.map((issue) => issue.message).join(" | ");
    return { success: false, message: msgs };
  }

  const data = parsed.data;

  try {
    if (data.id) {
      await updateGalleryItem({ ...data, id: data.id });
    } else {
      await createGalleryItem(data);
    }
    revalidate();
    return { success: true, message: "تم الحفظ بنجاح." };
  } catch (error) {
    return { success: false, message: adminActionErrorMessage(error) };
  }
}

export async function setGalleryItemStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;

  try {
    await updateGalleryItemStatus(id, parsed.data);
    revalidate();
  } catch {
    return;
  }
}

export async function deleteGalleryItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { success: false, message: "معرف العنصر غير صالح." };
  }

  try {
    await deleteGalleryItem(id);
    revalidate();
    return { success: true, message: "تم الحذف." };
  } catch (error) {
    return {
      success: false,
      message: adminActionErrorMessage(error, "حدث خطأ أثناء الحذف."),
    };
  }
}
