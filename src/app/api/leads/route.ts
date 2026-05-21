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
  getServiceByReference,
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
  serviceName: z.string().optional().or(z.literal("")),
  serviceLabel: z.string().optional().or(z.literal("")),
  serviceType: z.string().optional().or(z.literal("")),
  serviceTypeAr: z.string().optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  preferredTime: z.string().optional().or(z.literal("")),
  appointmentNotes: z.string().max(500).optional().or(z.literal("")),
  preferredLanguage: z.string().optional().or(z.literal("")),
  source: z.string().max(120).optional().or(z.literal("")),
  utmSource: z.string().max(120).optional().or(z.literal("")),
  utmMedium: z.string().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().max(120).optional().or(z.literal("")),
  utmContent: z.string().max(120).optional().or(z.literal("")),
});

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function payloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

function wantsJson(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  const requestedWith = request.headers.get("x-requested-with") ?? "";
  return (
    accept.includes("application/json") ||
    contentType.includes("application/json") ||
    requestedWith.toLowerCase() === "fetch"
  );
}

async function readLeadPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const payload =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};
    return {
      fullName:
        payloadString(payload, "fullName") || payloadString(payload, "name"),
      phone:
        payloadString(payload, "phone") ||
        payloadString(payload, "mobile") ||
        payloadString(payload, "phone_number"),
      email: payloadString(payload, "email"),
      message:
        payloadString(payload, "message") || payloadString(payload, "note"),
      serviceSlug:
        payloadString(payload, "serviceSlug") ||
        payloadString(payload, "service") ||
        payloadString(payload, "serviceName") ||
        payloadString(payload, "serviceLabel") ||
        payloadString(payload, "serviceTypeAr") ||
        payloadString(payload, "serviceType"),
      serviceName: payloadString(payload, "serviceName"),
      serviceLabel: payloadString(payload, "serviceLabel"),
      serviceType: payloadString(payload, "serviceType"),
      serviceTypeAr: payloadString(payload, "serviceTypeAr"),
      preferredDate: payloadString(payload, "preferredDate"),
      preferredTime: payloadString(payload, "preferredTime"),
      appointmentNotes: payloadString(payload, "appointmentNotes"),
      preferredLanguage: payloadString(payload, "preferredLanguage"),
      source: payloadString(payload, "source"),
      utmSource:
        payloadString(payload, "utmSource") ||
        payloadString(payload, "utm_source"),
      utmMedium:
        payloadString(payload, "utmMedium") ||
        payloadString(payload, "utm_medium"),
      utmCampaign:
        payloadString(payload, "utmCampaign") ||
        payloadString(payload, "utm_campaign"),
      utmContent:
        payloadString(payload, "utmContent") ||
        payloadString(payload, "utm_content"),
    };
  }

  const formData = await request.formData();
  return {
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
    serviceSlug:
      formString(formData, "serviceSlug") ||
      formString(formData, "service") ||
      formString(formData, "serviceName") ||
      formString(formData, "serviceLabel") ||
      formString(formData, "serviceTypeAr") ||
      formString(formData, "serviceType"),
    serviceName: formString(formData, "serviceName"),
    serviceLabel: formString(formData, "serviceLabel"),
    serviceType: formString(formData, "serviceType"),
    serviceTypeAr: formString(formData, "serviceTypeAr"),
    preferredDate: formString(formData, "preferredDate"),
    preferredTime: formString(formData, "preferredTime"),
    appointmentNotes: formString(formData, "appointmentNotes"),
    preferredLanguage: formString(formData, "preferredLanguage"),
    source: formString(formData, "source"),
    utmSource:
      formString(formData, "utmSource") || formString(formData, "utm_source"),
    utmMedium:
      formString(formData, "utmMedium") || formString(formData, "utm_medium"),
    utmCampaign:
      formString(formData, "utmCampaign") ||
      formString(formData, "utm_campaign"),
    utmContent:
      formString(formData, "utmContent") || formString(formData, "utm_content"),
  };
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
  const jsonResponse = wantsJson(request);
  let payload: Awaited<ReturnType<typeof readLeadPayload>>;
  try {
    payload = await readLeadPayload(request);
  } catch {
    return response(
      request,
      "error",
      "يرجى مراجعة بيانات الطلب قبل الإرسال. / Please review your details.",
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    if (jsonResponse) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid lead payload",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }
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
    const hasAppointment =
      Boolean(parsed.data.preferredDate) || Boolean(parsed.data.preferredTime);
    if (
      hasAppointment &&
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

    const preferredAppointmentAt = hasAppointment
      ? parsePreferredAppointment(
          parsed.data.preferredDate,
          parsed.data.preferredTime,
        )
      : undefined;
    const serviceReference =
      parsed.data.serviceSlug ||
      parsed.data.serviceTypeAr ||
      parsed.data.serviceLabel ||
      parsed.data.serviceName ||
      parsed.data.serviceType;
    const selectedService = serviceReference
      ? await getServiceByReference(serviceReference)
      : null;
    const serviceArabicName =
      selectedService?.name ||
      parsed.data.serviceTypeAr ||
      parsed.data.serviceLabel ||
      parsed.data.serviceName ||
      parsed.data.serviceType ||
      parsed.data.serviceSlug ||
      undefined;

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
      ...(selectedService?.slug || parsed.data.serviceSlug
        ? { serviceSlug: selectedService?.slug ?? parsed.data.serviceSlug }
        : {}),
      ...(parsed.data.utmSource ? { utmSource: parsed.data.utmSource } : {}),
      ...(parsed.data.utmMedium ? { utmMedium: parsed.data.utmMedium } : {}),
      ...(parsed.data.utmCampaign
        ? { utmCampaign: parsed.data.utmCampaign }
        : {}),
      ...(parsed.data.utmContent ? { utmContent: parsed.data.utmContent } : {}),
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
        serviceSlug: serviceArabicName,
        serviceSlugRaw:
          selectedService?.slug || parsed.data.serviceSlug || undefined,
        serviceReference: serviceReference || undefined,
        service: serviceArabicName,
        serviceName: serviceArabicName,
        serviceLabel: serviceArabicName,
        serviceType: serviceArabicName,
        serviceTypeAr: serviceArabicName,
        utmSource: parsed.data.utmSource || undefined,
        utmMedium: parsed.data.utmMedium || undefined,
        utmCampaign: parsed.data.utmCampaign || undefined,
        utmContent: parsed.data.utmContent || undefined,
        utm_source: parsed.data.utmSource || undefined,
        utm_medium: parsed.data.utmMedium || undefined,
        utm_campaign: parsed.data.utmCampaign || undefined,
        utm_content: parsed.data.utmContent || undefined,
        preferredAppointmentAt,
        appointmentNotes: parsed.data.appointmentNotes || undefined,
        preferredLanguage: parsed.data.preferredLanguage || "ar",
      },
    });

    revalidatePath("/admin/crm");
    if (jsonResponse) {
      return NextResponse.json(
        { ok: true, message: "Lead captured" },
        { status: 201 },
      );
    }
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

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/leads",
    methods: ["POST"],
    contentTypes: ["application/json", "multipart/form-data"],
    required: ["fullName", "phone"],
    optional: [
      "email",
      "message",
      "serviceSlug",
      "service",
      "serviceName",
      "serviceLabel",
      "serviceType",
      "serviceTypeAr",
      "preferredDate",
      "preferredTime",
      "appointmentNotes",
      "preferredLanguage",
      "source",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
    ],
  });
}
