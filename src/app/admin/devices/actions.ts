"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteDevice, updateDeviceStatus } from "@/lib/content-repository";

function revalidate() {
  revalidatePath("/admin/devices");
  revalidatePath("/devices");
  revalidatePath("/devices/[slug]", "page");
  revalidatePath("/");
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
