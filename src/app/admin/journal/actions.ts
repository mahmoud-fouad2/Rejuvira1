"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteJournalPost,
  updateJournalPostStatus,
} from "@/lib/content-repository";

const updateJournalStatusSchema = z.object({
  slug: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
});

const deleteJournalSchema = z.object({
  slug: z.string().min(3),
});

export async function updateJournalPostStatusAction(formData: FormData) {
  const parsed = updateJournalStatusSchema.safeParse({
    slug: formData.get("slug"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  try {
    await updateJournalPostStatus(parsed.data.slug, parsed.data.status);
    revalidatePath("/admin/journal");
    revalidatePath("/journal");
  } catch {
    return;
  }
}

export async function deleteJournalPostAction(formData: FormData) {
  const parsed = deleteJournalSchema.safeParse({
    slug: formData.get("slug"),
  });

  if (!parsed.success) return;

  try {
    await deleteJournalPost(parsed.data.slug);
    revalidatePath("/admin/journal");
    revalidatePath("/journal");
  } catch {
    return;
  }
}
