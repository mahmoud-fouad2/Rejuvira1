"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createServiceCategory,
  deleteServiceCategory,
  updateServiceCategory,
} from "@/lib/content-repository";

export type ServiceCategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const categorySchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  nameEn: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.PUBLISHED),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const updateCategorySchema = categorySchema.extend({
  id: z.string().min(3),
});

function revalidate() {
  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function createServiceCategoryAction(
  _previousState: ServiceCategoryActionState,
  formData: FormData,
): Promise<ServiceCategoryActionState> {
  const parsed = categorySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    status: formData.get("status") || ContentStatus.PUBLISHED,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { status: "error", message: "Category data is incomplete." };
  }

  await createServiceCategory(parsed.data);
  revalidate();
  return { status: "success", message: "Category saved." };
}

export async function updateServiceCategoryAction(
  _previousState: ServiceCategoryActionState,
  formData: FormData,
): Promise<ServiceCategoryActionState> {
  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    status: formData.get("status") || ContentStatus.PUBLISHED,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { status: "error", message: "Category data is invalid." };
  }

  await updateServiceCategory(parsed.data);
  revalidate();
  return { status: "success", message: "Category updated." };
}

export async function deleteServiceCategoryAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteServiceCategory(id);
  revalidate();
}
