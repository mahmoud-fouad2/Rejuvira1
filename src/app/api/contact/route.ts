import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAppLog } from "@/lib/app-log";
import {
  createContactLead,
  getRuntimeSettings,
  getServiceByReference,
} from "@/lib/content-repository";
import { dispatchFormWebhook } from "@/lib/form-webhook";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  GENERAL_INQUIRY_SERVICE_VALUE,
  isGeneralInquiryService,
} from "@/lib/general-inquiry";
import { getLeadRequestMetadata } from "@/lib/lead-request-metadata";
import {
  evaluateLeadIntakeGuard,
  LEAD_DUPLICATE_MESSAGE,
  LEAD_SPAM_GUARD_MESSAGE,
} from "@/lib/lead-intake-guard";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { mergeRequestTracking } from "@/lib/request-tracking";
import {
  normalizeSaudiMobileNumber,
  SAUDI_MOBILE_ERROR_MESSAGE,
  SAUDI_MOBILE_REGEX,
} from "@/lib/saudi-phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  fullName: z.string().min(3),
  phone: z
    .string()
    .transform(normalizeSaudiMobileNumber)
    .refine((phone) => SAUDI_MOBILE_REGEX.test(phone), {
      message: SAUDI_MOBILE_ERROR_MESSAGE,
    }),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  serviceSlug: z.string().optional().or(z.literal("")),
  preferredLanguage: z.string().optional().or(z.literal("")),
  recaptchaToken: z.string().optional().or(z.literal("")),
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
  leadState?: "success" | "error" | "duplicate",
) {
  if (wantsJson(request)) {
    return NextResponse.json({ status, message }, init);
  }

  const referer = request.headers.get("referer") || "/contact";
  const url = new URL(referer, request.url);
  url.searchParams.set("lead", leadState ?? status);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return response(
      request,
      "error",
      "يرجى مراجعة بيانات التواصل قبل الإرسال. / Please review your details.",
      { status: 400 },
    );
  }

  const payload = mergeRequestTracking(
    {
      fullName: formString(formData, "fullName"),
      phone: formString(formData, "phone"),
      email: formString(formData, "email"),
      message: formString(formData, "message"),
      serviceSlug: formString(formData, "serviceSlug"),
      preferredLanguage: formString(formData, "preferredLanguage"),
      recaptchaToken: formString(formData, "recaptchaToken"),
      source: formString(formData, "source"),
      utmSource:
        formString(formData, "utmSource") || formString(formData, "utm_source"),
      utmMedium:
        formString(formData, "utmMedium") || formString(formData, "utm_medium"),
      utmCampaign:
        formString(formData, "utmCampaign") ||
        formString(formData, "utm_campaign"),
      utmContent:
        formString(formData, "utmContent") ||
        formString(formData, "utm_content"),
    },
    request,
  );

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const errorMessage = parsed.error.issues.some(
      (issue) => issue.path[0] === "phone",
    )
      ? SAUDI_MOBILE_ERROR_MESSAGE
      : "يرجى مراجعة بيانات التواصل والخدمة المطلوبة قبل الإرسال. / Please review your details before submitting.";
    return response(
      request,
      "error",
      errorMessage,
      { status: 400 },
    );
  }

  const intakeGuard = evaluateLeadIntakeGuard(formData);
  if (!intakeGuard.ok) {
    await recordAppLog({
      level: "warn",
      kind: "form-spam",
      message: "Contact form rejected by intake guard",
      meta: { reason: intakeGuard.reason },
    });
    return response(request, "error", LEAD_SPAM_GUARD_MESSAGE, {
      status: 400,
    });
  }

  const clientIp = extractClientIp(request.headers);
  const limit = rateLimit({
    key: `contact:${clientIp}`,
    limit: 5,
    windowSeconds: 60 * 10,
  });

  if (!limit.ok) {
    await recordAppLog({
      level: "warn",
      kind: "rate-limit",
      message: "Contact form rate limit hit",
      meta: { ip: clientIp, retryAfter: limit.retryAfter },
    });
    return response(
      request,
      "error",
      "تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة بعد دقائق. / Too many attempts. Please try again in a few minutes.",
      { status: 429 },
    );
  }

  const settings = await getRuntimeSettings();
  const requireRecaptcha =
    settings.ops.recaptchaEnabled !== false &&
    Boolean(process.env.RECAPTCHA_SECRET_KEY);

  if (requireRecaptcha) {
    const verification = await verifyRecaptchaToken(
      parsed.data.recaptchaToken,
      "contact",
      clientIp !== "unknown" ? { remoteIp: clientIp } : {},
    );
    if (!verification.success || verification.score < 0.4) {
      await recordAppLog({
        level: "warn",
        kind: "recaptcha",
        message: "Contact form rejected by reCAPTCHA",
        meta: {
          score: verification.score,
          action: verification.action,
          errors: verification.errors,
          hostname: verification.hostname,
        },
      });
      if (process.env.RECAPTCHA_STRICT === "1") {
        return response(
          request,
          "error",
          "تعذّر التحقّق من الطلب لأسباب أمنية. الرجاء المحاولة مرة أخرى. / Could not verify your request for security reasons. Please try again.",
          { status: 403 },
        );
      }
    }
  }

  const isGeneralInquiry = isGeneralInquiryService(parsed.data.serviceSlug);
  const selectedService = parsed.data.serviceSlug && !isGeneralInquiry
    ? await getServiceByReference(parsed.data.serviceSlug)
    : null;
  const serviceArabicName =
    isGeneralInquiry
      ? GENERAL_INQUIRY_SERVICE_AR
      : selectedService?.name || parsed.data.serviceSlug || undefined;

  try {
    const result = await createContactLead({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
      source: parsed.data.source || "Website contact form",
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      ...(parsed.data.message ? { message: parsed.data.message } : {}),
      ...(selectedService?.slug
        ? { serviceSlug: selectedService.slug }
        : {}),
      ...(isGeneralInquiry ? { tags: [GENERAL_INQUIRY_SERVICE_AR] } : {}),
      ...(parsed.data.utmSource ? { utmSource: parsed.data.utmSource } : {}),
      ...(parsed.data.utmMedium ? { utmMedium: parsed.data.utmMedium } : {}),
      ...(parsed.data.utmCampaign
        ? { utmCampaign: parsed.data.utmCampaign }
        : {}),
      ...(parsed.data.utmContent ? { utmContent: parsed.data.utmContent } : {}),
      ...getLeadRequestMetadata(request),
    });

    const buildContactWebhookPayload = (
      event: "contact_submission.created" | "contact_submission.repeated",
      duplicate: boolean,
    ) => ({
      event,
      source: parsed.data.source || "Website contact form",
      submittedAt: new Date().toISOString(),
      mode: result.mode,
      duplicate,
      submissionId:
        result.mode === "database" || result.mode === "duplicate"
          ? result.submission.id
          : undefined,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      message: parsed.data.message || undefined,
      serviceSlug: serviceArabicName,
      serviceSlugRaw: isGeneralInquiry
        ? GENERAL_INQUIRY_SERVICE_VALUE
        : parsed.data.serviceSlug || undefined,
      serviceReference: isGeneralInquiry
        ? GENERAL_INQUIRY_SERVICE_VALUE
        : parsed.data.serviceSlug || undefined,
      service: serviceArabicName,
      serviceName: serviceArabicName,
      serviceLabel: serviceArabicName,
      serviceType: serviceArabicName,
      serviceTypeAr: serviceArabicName,
      serviceCategory: selectedService?.category || undefined,
      utmSource: parsed.data.utmSource || undefined,
      utmMedium: parsed.data.utmMedium || undefined,
      utmCampaign: parsed.data.utmCampaign || undefined,
      utmContent: parsed.data.utmContent || undefined,
      utm_source: parsed.data.utmSource || undefined,
      utm_medium: parsed.data.utmMedium || undefined,
      utm_campaign: parsed.data.utmCampaign || undefined,
      utm_content: parsed.data.utmContent || undefined,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
    });

    if (result.mode === "duplicate") {
      await dispatchFormWebhook({
        settings,
        failureMessage: "Form webhook delivery failed",
        payload: buildContactWebhookPayload(
          "contact_submission.repeated",
          true,
        ),
      });
      revalidatePath("/admin/crm");
      if (wantsJson(request)) {
        return NextResponse.json(
          {
            status: "success",
            duplicate: true,
            message: LEAD_DUPLICATE_MESSAGE,
            submissionId: result.submission.id,
          },
          { status: 200 },
        );
      }
      return response(
        request,
        "success",
        LEAD_DUPLICATE_MESSAGE,
        { status: 200 },
        "duplicate",
      );
    }

    await dispatchFormWebhook({
      settings,
      failureMessage: "Form webhook delivery failed",
      payload: buildContactWebhookPayload("contact_submission.created", false),
    });

    revalidatePath("/admin/crm");

    return response(
      request,
      "success",
      "تم استلام طلبك بنجاح، وسيتواصل معك الفريق في أقرب وقت. / Your request has been received.",
    );
  } catch (error) {
    await recordAppLog({
      level: "error",
      kind: "form",
      message: "Contact form save failed",
      meta: { error: error instanceof Error ? error.message : "unknown" },
    });
    return response(
      request,
      "error",
      "تعذّر حفظ الطلب الآن. الرجاء المحاولة مرة أخرى. / Could not save your request. Please try again.",
      { status: 500 },
    );
  }
}
