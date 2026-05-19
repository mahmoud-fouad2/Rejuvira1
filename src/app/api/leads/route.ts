import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAppLog } from "@/lib/app-log";
import {
  isValidAppointmentSlot,
  parsePreferredAppointment,
} from "@/lib/appointment-slots";
import {
  createContactLead,
  getRuntimeSettings,
} from "@/lib/content-repository";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function wantsJson(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const requestedWith = request.headers.get("x-requested-with") ?? "";
  return (
    accept.includes("application/json") ||
    requestedWith.toLowerCase() === "fetch"
  );
}

function response(
  request: Request,
  status: "success" | "error",
  message: string,
  init?: ResponseInit,
) {
  if (wantsJson(request)) {
    return NextResponse.json({ status, message }, init);
  }
  const referer = request.headers.get("referer") || "/contact";
  const url = new URL(referer, request.url);
  url.searchParams.set("lead", status);
  return NextResponse.redirect(url, { status: 303 });
}

async function dispatchFormWebhook({
  settings,
  payload,
}: {
  settings: Awaited<ReturnType<typeof getRuntimeSettings>>;
  payload: Record<string, unknown>;
}) {
  if (!settings.integrations.formWebhookEnabled) return;
  if (!settings.integrations.formWebhookUrl.trim()) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    await fetch(settings.integrations.formWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(settings.integrations.formWebhookSecret
          ? {
              "x-rejuvera-webhook-secret":
                settings.integrations.formWebhookSecret,
              "x-rejuvira-webhook-secret":
                settings.integrations.formWebhookSecret,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    await recordAppLog({
      level: "warn",
      kind: "webhook",
      message: "Landing page webhook delivery failed",
      meta: {
        error: error instanceof Error ? error.message : "unknown",
        source: payload.source,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return response(
      request,
      "error",
      "يرجى مراجعة بيانات الطلب قبل الإرسال. / Please review your details.",
      { status: 400 },
    );
  }

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
    return response(
      request,
      "error",
      "يرجى مراجعة الاسم ورقم الجوال والخدمة المطلوبة قبل الإرسال. / Please review your details before submitting.",
      { status: 400 },
    );
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
    return response(
      request,
      "error",
      "تم تجاوز عدد المحاولات المسموح به. الرجاء المحاولة بعد دقائق. / Too many attempts. Please try again later.",
      { status: 429 },
    );
  }

  try {
    if (
      !isValidAppointmentSlot(
        parsed.data.preferredDate,
        parsed.data.preferredTime,
      )
    ) {
      return response(
        request,
        "error",
        "يرجى اختيار موعد من السبت إلى الخميس بين 2:00 م و10:00 م. / Please choose Sat-Thu between 2 PM and 10 PM.",
        { status: 400 },
      );
    }

    const preferredAppointmentAt = parsePreferredAppointment(
      parsed.data.preferredDate,
      parsed.data.preferredTime,
    );

    const result = await createContactLead({
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

    const settings = await getRuntimeSettings();
    await dispatchFormWebhook({
      settings,
      payload: {
        event: "landing_lead.created",
        source: parsed.data.source || "Landing page form",
        submittedAt: new Date().toISOString(),
        mode: result.mode,
        submissionId:
          result.mode === "database" ? result.submission.id : undefined,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || undefined,
        message: parsed.data.message || undefined,
        serviceSlug: parsed.data.serviceSlug || undefined,
        preferredAppointmentAt,
        appointmentNotes: parsed.data.appointmentNotes || undefined,
        preferredLanguage: parsed.data.preferredLanguage || "ar",
      },
    });

    revalidatePath("/admin/crm");
    return response(
      request,
      "success",
      "تم استلام طلبك بنجاح، وسيتواصل معك الفريق قريبا. / Your request has been received.",
    );
  } catch (error) {
    await recordAppLog({
      level: "error",
      kind: "form",
      message: "Landing page lead capture failed",
      meta: { error: error instanceof Error ? error.message : "unknown" },
    });
    return response(
      request,
      "error",
      "تعذر حفظ الطلب الآن. الرجاء المحاولة مرة أخرى. / Could not save your request.",
      { status: 500 },
    );
  }
}
