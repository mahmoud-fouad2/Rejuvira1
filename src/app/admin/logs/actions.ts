"use server";

import { revalidatePath } from "next/cache";

import { updateErrorLogResolution } from "@/lib/content-repository";

export async function toggleErrorLogResolutionAction(formData: FormData) {
  const logId = formData.get("logId");
  const nextValue = formData.get("nextValue");

  if (typeof logId !== "string" || typeof nextValue !== "string") {
    return;
  }

  await updateErrorLogResolution(logId, nextValue === "true");
  revalidatePath("/admin/logs");
}
