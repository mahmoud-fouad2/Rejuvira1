"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createContactLead } from "@/lib/content-repository";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const contactSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  serviceSlug: z.string().optional().or(z.literal("")),
});

export async function submitContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    serviceSlug: formData.get("serviceSlug"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى مراجعة بيانات التواصل والخدمة المطلوبة قبل الإرسال.",
    };
  }

  const result = await createContactLead({
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    preferredLanguage: "ar",
    source: "Website contact form",
    ...(parsed.data.email ? { email: parsed.data.email } : {}),
    ...(parsed.data.message ? { message: parsed.data.message } : {}),
    ...(parsed.data.serviceSlug
      ? { serviceSlug: parsed.data.serviceSlug }
      : {}),
  });

  revalidatePath("/admin/crm");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم استلام طلبك بنجاح، وسيتواصل معك الفريق في أقرب وقت."
        : "تم استلام طلبك بنجاح، وسيتواصل معك الفريق في أقرب وقت.",
  };
}
