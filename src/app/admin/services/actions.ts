"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServiceDraft } from "@/lib/content-repository";

export type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const serviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  category: z.string().min(2),
  excerpt: z.string().min(8),
  description: z.string().min(20),
  coverImageUrl: z.string().optional().or(z.literal("")),
});

export async function createServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const parsed = serviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    category: formData.get("category"),
    excerpt: formData.get("excerpt"),
    description: formData.get("description"),
    coverImageUrl: formData.get("coverImageUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى استكمال بيانات الخدمة بشكل صحيح.",
    };
  }

  const result = await createServiceDraft({
    slug: parsed.data.slug,
    name: parsed.data.name,
    category: parsed.data.category,
    excerpt: parsed.data.excerpt,
    description: parsed.data.description,
    ...(parsed.data.coverImageUrl
      ? {
          coverImageUrl: parsed.data.coverImageUrl,
        }
      : {}),
  });

  revalidatePath("/admin/services");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم حفظ الخدمة بنجاح."
        : "تم اعتماد الخدمة داخل بيئة العمل الحالية بنجاح.",
  };
}
