"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteDoctor, updateDoctorStatus } from "@/lib/content-repository";

function revalidate() {
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");
}

export async function setDoctorStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;
  await updateDoctorStatus(id, parsed.data);
  revalidate();
}

export async function deleteDoctorAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteDoctor(id);
  revalidate();
}
