import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAppLog } from "@/lib/app-log";
import {
  isValidAppointmentSlot,
  parsePreferredAppointment,
} from "@/lib/appointment-slots";
import { createContactLead } from "@/lib/content-repository";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";

const leadSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  serviceSlug: z.string().optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  preferredTime: z.string().optional().or(z.literal("")),
  appointmentNotes: z.string().max(500).optional().or(z.literal("")),
  preferredLanguage: z.string().optional().or(z.literal("")),
  source: z.string().max(120).optional().or(z.literal("")),
});

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function redirectBack(request: Request, status: "success" | "error") {
  const referer = request.headers.get("referer") || "/contact";
  const url = new URL(referer, request.url);
  url.searchParams.set("lead", status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = leadSchema.safeParse({
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
    serviceSlug: formString(formData, "serviceSlug"),
    preferredDate: formString(formData, "preferredDate"),
    preferredTime: formString(formData, "preferredTime"),
    appointmentNotes: formString(formData, "appointmentNotes"),
    preferredLanguage: formString(formData, "preferredLanguage"),
    source: formString(formData, "source"),
  });

  if (!parsed.success) {
    return redirectBack(request, "error");
  }

  const clientIp = extractClientIp(request.headers);
  const limit = rateLimit({
    key: `landing-lead:${clientIp}`,
    limit: 6,
    windowSeconds: 60 * 10,
  });

  if (!limit.ok) {
    await recordAppLog({
      level: "warn",
      kind: "rate-limit",
      message: "Landing page lead rate limit hit",
      meta: { ip: clientIp, retryAfter: limit.retryAfter },
    });
    return redirectBack(request, "error");
  }

  try {
    if (
      !isValidAppointmentSlot(
        parsed.data.preferredDate,
        parsed.data.preferredTime,
      )
    ) {
      return redirectBack(request, "error");
    }

    const preferredAppointmentAt = parsePreferredAppointment(
      parsed.data.preferredDate,
      parsed.data.preferredTime,
    );

    await createContactLead({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
      source: parsed.data.source || "Landing page form",
      ...(preferredAppointmentAt ? { preferredAppointmentAt } : {}),
      ...(parsed.data.appointmentNotes
        ? { appointmentNotes: parsed.data.appointmentNotes }
        : {}),
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      ...(parsed.data.message ? { message: parsed.data.message } : {}),
      ...(parsed.data.serviceSlug
        ? { serviceSlug: parsed.data.serviceSlug }
        : {}),
    });
    revalidatePath("/admin/crm");
    return redirectBack(request, "success");
  } catch (error) {
    await recordAppLog({
      level: "error",
      kind: "form",
      message: "Landing page lead capture failed",
      meta: { error: error instanceof Error ? error.message : "unknown" },
    });
    return redirectBack(request, "error");
  }
}
