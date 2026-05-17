"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createDeviceDraft,
  deleteDevice,
  updateDevice,
  updateDeviceStatus,
} from "@/lib/content-repository";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";

export type DeviceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const deviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(10),
  excerptEn: z.string().optional().or(z.literal("")),
  description: z.string().min(20),
  descriptionEn: z.string().optional().or(z.literal("")),
  certifications: z.string().min(2),
  serviceSlugs: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

const updateDeviceSchema = deviceSchema.extend({
  id: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
  featured: z.coerce.boolean().optional().default(false),
});

function revalidate() {
  revalidatePath("/admin/devices");
  revalidatePath("/devices");
  revalidatePath("/devices/[slug]", "page");
  revalidatePath("/");
}

function splitList(value: string | undefined | null) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function createDeviceAction(
  _previousState: DeviceActionState,
  formData: FormData,
): Promise<DeviceActionState> {
  const parsed = deviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    certifications: formData.get("certifications"),
    serviceSlugs: formData.get("serviceSlugs"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الجهاز غير مكتملة." };
  }

  try {
    await createDeviceDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
      excerpt: parsed.data.excerpt,
      ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
      description: parsed.data.description,
      ...(parsed.data.descriptionEn
        ? { descriptionEn: parsed.data.descriptionEn }
        : {}),
      certifications: splitList(parsed.data.certifications),
      serviceSlugs: splitList(parsed.data.serviceSlugs),
      ...(parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : {}),
    });

    revalidate();
    return { status: "success", message: "تم حفظ الجهاز." };
  } catch (error) {
    return { status: "error", message: adminActionErrorMessage(error) };
  }
}

export async function updateDeviceAction(
  _previousState: DeviceActionState,
  formData: FormData,
): Promise<DeviceActionState> {
  const parsed = updateDeviceSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    certifications: formData.get("certifications"),
    serviceSlugs: formData.get("serviceSlugs"),
    imageUrl: formData.get("imageUrl"),
    status: formData.get("status"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return { status: "error", message: "بيانات الجهاز غير صالحة للتحديث." };
  }

  try {
    await updateDevice({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      ...(parsed.data.nameEn ? { nameEn: parsed.data.nameEn } : {}),
      excerpt: parsed.data.excerpt,
      ...(parsed.data.excerptEn ? { excerptEn: parsed.data.excerptEn } : {}),
      description: parsed.data.description,
      ...(parsed.data.descriptionEn
        ? { descriptionEn: parsed.data.descriptionEn }
        : {}),
      certifications: splitList(parsed.data.certifications),
      serviceSlugs: splitList(parsed.data.serviceSlugs),
      status: parsed.data.status,
      featured: parsed.data.featured,
      ...(parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : {}),
    });

    revalidate();
    return { status: "success", message: "تم تحديث الجهاز." };
  } catch (error) {
    return { status: "error", message: adminActionErrorMessage(error) };
  }
}

export async function setDeviceStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;

  try {
    await updateDeviceStatus(id, parsed.data);
    revalidate();
  } catch {
    return;
  }
}

export async function deleteDeviceAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    await deleteDevice(id);
    revalidate();
  } catch {
    return;
  }
}
