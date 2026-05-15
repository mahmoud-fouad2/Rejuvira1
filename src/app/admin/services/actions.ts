"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createServiceDraft,
  deleteService,
  updateService,
  updateServiceStatus,
} from "@/lib/content-repository";

export type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const serviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  excerpt: z.string().min(8),
  excerptEn: z.string().optional().or(z.literal("")),
  description: z.string().min(20),
  descriptionEn: z.string().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
});

const updateServiceSchema = serviceSchema.extend({
  id: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
  featured: z.coerce.boolean().optional().default(false),
});

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/doctors");
}

export async function createServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const parsed = serviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    category: formData.get("category"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الخدمة غير مكتملة." };
  }

  await createServiceDraft({
    slug: parsed.data.slug,
    name: parsed.data.name,
    ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
    category: parsed.data.category,
    excerpt: parsed.data.excerpt,
    ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
    description: parsed.data.description,
    ...(parsed.data.descriptionEn ? { descriptionEn: parsed.data.descriptionEn } : {}),
    ...(parsed.data.coverImageUrl ? { coverImageUrl: parsed.data.coverImageUrl } : {}),
  });

  revalidate();
  return { status: "success", message: "تم حفظ الخدمة." };
}

export async function updateServiceAction(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const parsed = updateServiceSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    category: formData.get("category"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
    status: formData.get("status"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الخدمة غير صالحة للتحديث." };
  }

  await updateService({
    id: parsed.data.id,
    slug: parsed.data.slug,
    name: parsed.data.name,
    ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
    category: parsed.data.category,
    excerpt: parsed.data.excerpt,
    ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
    description: parsed.data.description,
    ...(parsed.data.descriptionEn ? { descriptionEn: parsed.data.descriptionEn } : {}),
    status: parsed.data.status,
    featured: parsed.data.featured,
    ...(parsed.data.coverImageUrl ? { coverImageUrl: parsed.data.coverImageUrl } : {}),
  });

  revalidate();
  return { status: "success", message: "تم تحديث الخدمة." };
}

export async function setServiceStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;
  await updateServiceStatus(id, parsed.data);
  revalidate();
}

export async function deleteServiceAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteService(id);
  revalidate();
}
