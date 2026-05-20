"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteService, updateServiceStatus } from "@/lib/content-repository";

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/devices");
  revalidatePath("/sitemap.xml");
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
