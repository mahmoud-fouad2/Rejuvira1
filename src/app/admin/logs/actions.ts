"use server";

import { revalidatePath } from "next/cache";

import {
  clearAppLogs,
  clearErrorLogs,
  deleteAppLog,
  deleteErrorLog,
  updateErrorLogResolution,
} from "@/lib/content-repository";

function revalidate() {
  revalidatePath("/admin/logs");
  revalidatePath("/admin");
}

export async function toggleErrorLogResolutionAction(formData: FormData) {
  const logId = formData.get("logId");
  const nextValue = formData.get("nextValue");

  if (typeof logId !== "string" || typeof nextValue !== "string") {
    return;
  }

  await updateErrorLogResolution(logId, nextValue === "true");
  revalidate();
}

export async function deleteErrorLogAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteErrorLog(id);
  revalidate();
}

export async function clearErrorLogsAction(formData: FormData) {
  const onlyResolved = formData.get("onlyResolved") === "true";
  await clearErrorLogs({ onlyResolved });
  revalidate();
}

export async function deleteAppLogAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteAppLog(id);
  revalidate();
}

export async function clearAppLogsAction(formData: FormData) {
  const level = formData.get("level");
  await clearAppLogs(typeof level === "string" && level ? { level } : {});
  revalidate();
}
