"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createDeviceDraft } from "@/lib/content-repository";

export type DeviceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const deviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  excerpt: z.string().min(10),
  description: z.string().min(20),
  certifications: z.string().min(2),
  serviceSlugs: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

export async function createDeviceAction(
  _previousState: DeviceActionState,
  formData: FormData,
): Promise<DeviceActionState> {
  const parsed = deviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    excerpt: formData.get("excerpt"),
    description: formData.get("description"),
    certifications: formData.get("certifications"),
    serviceSlugs: formData.get("serviceSlugs"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى مراجعة بيانات الجهاز قبل حفظ المسودة.",
    };
  }

  const result = await createDeviceDraft({
    slug: parsed.data.slug,
    name: parsed.data.name,
    excerpt: parsed.data.excerpt,
    description: parsed.data.description,
    certifications: parsed.data.certifications
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    serviceSlugs: (parsed.data.serviceSlugs ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    ...(parsed.data.imageUrl
      ? {
          imageUrl: parsed.data.imageUrl,
        }
      : {}),
  });

  revalidatePath("/admin/devices");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم حفظ الجهاز بنجاح."
        : "تم اعتماد الجهاز داخل بيئة العمل الحالية بنجاح.",
  };
}
