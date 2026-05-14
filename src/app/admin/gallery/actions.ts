"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/content-repository";

/* ── Input validation ────────────────────────────────────── */
const galleryItemSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3, "الرابط قصير جدًا").regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة فقط"),
  title: z.string().min(3, "العنوان قصير جدًا"),
  category: z.string().min(2, "التصنيف مطلوب"),
  description: z.string().min(10, "الوصف قصير جدًا"),
  beforeImageUrl: z.string().min(5, "مسار صورة قبل مطلوب"),
  afterImageUrl: z.string().min(5, "مسار صورة بعد مطلوب"),
  beforeImageAlt: z.string().min(3, "النص البديل لصورة قبل مطلوب"),
  afterImageAlt: z.string().min(3, "النص البديل لصورة بعد مطلوب"),
  initialSplitPercent: z
    .preprocess(
      (value) => {
        if (typeof value === "string" && value.trim().length > 0) {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        }
        return value;
      },
      z.number().int().min(0).max(100).optional(),
    )
    .default(50),
});

type State = { success: boolean; message: string };

/* ── Save (create or update) ─────────────────────────────── */
export async function saveGalleryItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = galleryItemSchema.safeParse(raw);

  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => i.message).join(" | ");
    return { success: false, message: msgs };
  }

  const data = parsed.data;

  try {
    if (data.id) {
      await updateGalleryItem({ ...data, id: data.id });
    } else {
      await createGalleryItem(data);
    }
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true, message: "تم الحفظ بنجاح." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
    return { success: false, message: msg };
  }
}

/* ── Delete ──────────────────────────────────────────────── */
export async function deleteGalleryItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { success: false, message: "معرّف العنصر غير صالح." };
  }

  try {
    await deleteGalleryItem(id);
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true, message: "تم الحذف." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الحذف.";
    return { success: false, message: msg };
  }
}
