"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { saveSettingsGroup } from "@/lib/content-repository";

const KNOWN_SLOTS = [
  "brandLogo",
  "brandMark",
  "favicon",
  "appleIcon",
  "ogImage",
  "homeHero",
  "heroCard1",
  "heroCard2",
  "heroCard3",
  "heroCard4",
  "doctorsHero",
  "servicesHero",
  "aboutHero",
  "journalHero",
] as const;

const slotSchema = z.object({
  slot: z.enum(KNOWN_SLOTS),
  value: z.string().trim().min(1).max(2000),
});

function revalidate() {
  revalidatePath("/admin/media");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function setMediaSlotAction(formData: FormData) {
  const parsed = slotSchema.safeParse({
    slot: formData.get("slot"),
    value: formData.get("value"),
  });
  if (!parsed.success) return;
  await saveSettingsGroup("media", { [parsed.data.slot]: parsed.data.value });
  revalidate();
}

export async function clearMediaSlotAction(formData: FormData) {
  const slot = formData.get("slot");
  const parsed = z.enum(KNOWN_SLOTS).safeParse(slot);
  if (!parsed.success) return;
  await saveSettingsGroup("media", { [parsed.data]: "" });
  revalidate();
}
