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
import { adminActionErrorMessage } from "@/lib/admin-action-errors";

export type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const serviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  categoryId: z.string().optional().or(z.literal("")),
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
  doctorSlugs: z.string().optional().or(z.literal("")),
});

function parseSlugList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

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
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الخدمة غير مكتملة." };
  }

  try {
    await createServiceDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
      category: parsed.data.category,
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
      excerpt: parsed.data.excerpt,
      ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
      description: parsed.data.description,
      ...(parsed.data.descriptionEn ? { descriptionEn: parsed.data.descriptionEn } : {}),
      ...(parsed.data.coverImageUrl ? { coverImageUrl: parsed.data.coverImageUrl } : {}),
    });

    revalidate();
    return { status: "success", message: "تم حفظ الخدمة." };
  } catch (error) {
    return { status: "error", message: adminActionErrorMessage(error) };
  }
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
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
    status: formData.get("status"),
    featured: formData.get("featured"),
    doctorSlugs: formData.get("doctorSlugs"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الخدمة غير صالحة للتحديث." };
  }

  try {
    await updateService({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
      category: parsed.data.category,
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
      excerpt: parsed.data.excerpt,
      ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
      description: parsed.data.description,
      ...(parsed.data.descriptionEn ? { descriptionEn: parsed.data.descriptionEn } : {}),
      status: parsed.data.status,
      featured: parsed.data.featured,
      doctorSlugs: parseSlugList(formData.get("doctorSlugs")),
      ...(parsed.data.coverImageUrl ? { coverImageUrl: parsed.data.coverImageUrl } : {}),
    });

    revalidate();
    return { status: "success", message: "تم تحديث الخدمة." };
  } catch (error) {
    return { status: "error", message: adminActionErrorMessage(error) };
  }
}

export async function setServiceStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;

  try {
    await updateServiceStatus(id, parsed.data);
    revalidate();
  } catch {
    return;
  }
}

export async function deleteServiceAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    await deleteService(id);
    revalidate();
  } catch {
    return;
  }
}
