import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAppLog } from "@/lib/app-log";
import {
  createContactLead,
  getCustomPageLeadWebhookBySlug,
  getRuntimeSettings,
  getServiceByReference,
  isBlockedIpAddress,
} from "@/lib/content-repository";
import { dispatchFormWebhook, dispatchJsonWebhook } from "@/lib/form-webhook";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  GENERAL_INQUIRY_SERVICE_VALUE,
  isGeneralInquiryService,
} from "@/lib/general-inquiry";
import { getLeadRequestMetadata } from "@/lib/lead-request-metadata";
import {
  evaluateLeadIntakeGuard,
  LEAD_DUPLICATE_MESSAGE,
  LEAD_HONEYPOT_FIELD,
  LEAD_RENDERED_AT_FIELD,
  LEAD_SPAM_GUARD_MESSAGE,
} from "@/lib/lead-intake-guard";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";
import { mergeRequestTracking } from "@/lib/request-tracking";
import {
  normalizeSaudiMobileNumber,
  SAUDI_MOBILE_ERROR_MESSAGE,
  SAUDI_MOBILE_REGEX,
} from "@/lib/saudi-phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const leadSchema = z.object({
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
  serviceName: z.string().optional().or(z.literal("")),
  serviceLabel: z.string().optional().or(z.literal("")),
  serviceType: z.string().optional().or(z.literal("")),
  serviceTypeAr: z.string().optional().or(z.literal("")),
  offerName: z.string().max(180).optional().or(z.literal("")),
  offerPrice: z.string().max(80).optional().or(z.literal("")),
  preferredLanguage: z.string().optional().or(z.literal("")),
  source: z.string().max(120).optional().or(z.literal("")),
  utmSource: z.string().max(120).optional().or(z.literal("")),
  utmMedium: z.string().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().max(120).optional().or(z.literal("")),
  utmContent: z.string().max(120).optional().or(z.literal("")),
  utmTerm: z.string().max(120).optional().or(z.literal("")),
  pageUrl: z.string().max(1000).optional().or(z.literal("")),
  landingPageUrl: z.string().max(1000).optional().or(z.literal("")),
  landingPagePath: z.string().max(500).optional().or(z.literal("")),
  landingPageSlug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
    .optional()
    .or(z.literal("")),
  referrerUrl: z.string().max(1000).optional().or(z.literal("")),
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
      offerName:
        payloadString(payload, "offerName") ||
        payloadString(payload, "offer_name"),
      offerPrice:
        payloadString(payload, "offerPrice") ||
        payloadString(payload, "offer_price"),
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
      utmTerm:
        payloadString(payload, "utmTerm") || payloadString(payload, "utm_term"),
      pageUrl: payloadString(payload, "pageUrl"),
      landingPageUrl: payloadString(payload, "landingPageUrl"),
      landingPagePath:
        payloadString(payload, "landingPagePath") ||
        payloadString(payload, "landingPagePathname"),
      landingPageSlug:
        payloadString(payload, "landingPageSlug") ||
        payloadString(payload, "pageSlug"),
      referrerUrl: payloadString(payload, "referrerUrl"),
      [LEAD_HONEYPOT_FIELD]: payloadString(payload, LEAD_HONEYPOT_FIELD),
      [LEAD_RENDERED_AT_FIELD]: payloadString(payload, LEAD_RENDERED_AT_FIELD),
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
    offerName:
      formString(formData, "offerName") || formString(formData, "offer_name"),
    offerPrice:
      formString(formData, "offerPrice") || formString(formData, "offer_price"),
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
    utmTerm:
      formString(formData, "utmTerm") || formString(formData, "utm_term"),
    pageUrl: formString(formData, "pageUrl"),
    landingPageUrl: formString(formData, "landingPageUrl"),
    landingPagePath:
      formString(formData, "landingPagePath") ||
      formString(formData, "landingPagePathname"),
    landingPageSlug:
      formString(formData, "landingPageSlug") || formString(formData, "pageSlug"),
    referrerUrl: formString(formData, "referrerUrl"),
    [LEAD_HONEYPOT_FIELD]: formString(formData, LEAD_HONEYPOT_FIELD),
    [LEAD_RENDERED_AT_FIELD]: formString(formData, LEAD_RENDERED_AT_FIELD),
  };
}

function extractCustomPageSlugFromUrl(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/p\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\/)?$/i);
    return match?.[1]?.toLowerCase() ?? "";
  } catch {
    const match = value.match(/\/p\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:[/?#]|$)/i);
    return match?.[1]?.toLowerCase() ?? "";
  }
}

function response(
  request: Request,
  status: "success" | "error",
  message: string,
  init?: ResponseInit,
  leadState?: "success" | "error" | "duplicate",
) {
  if (wantsJson(request)) {
    return NextResponse.json(
      {
        ok: status === "success",
        status,
        message,
        duplicate: leadState === "duplicate",
      },
      init,
    );
  }
  const referer = request.headers.get("referer") || "/contact";
  const url = new URL(referer, request.url);
  url.searchParams.set("lead", leadState ?? status);
  return NextResponse.redirect(url, { status: 303 });
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
  payload = mergeRequestTracking(payload, request);

  const intakeGuard = evaluateLeadIntakeGuard(payload);
  if (!intakeGuard.ok) {
    await recordAppLog({
      level: "warn",
      kind: "form-spam",
      message: "Landing page form rejected by intake guard",
      meta: { reason: intakeGuard.reason },
    });
    if (jsonResponse) {
      return NextResponse.json(
        {
          ok: false,
          status: "error",
          error: LEAD_SPAM_GUARD_MESSAGE,
          message: LEAD_SPAM_GUARD_MESSAGE,
        },
        { status: 400 },
      );
    }
    return response(request, "error", LEAD_SPAM_GUARD_MESSAGE, {
      status: 400,
    });
  }

  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    const phoneInvalid = parsed.error.issues.some(
      (issue) => issue.path[0] === "phone",
    );
    if (jsonResponse) {
      const errorMessage = phoneInvalid
        ? SAUDI_MOBILE_ERROR_MESSAGE
        : "Invalid lead payload";
      return NextResponse.json(
        {
          ok: false,
          status: "error",
          error: errorMessage,
          message: errorMessage,
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }
    return response(
      request,
      "error",
      phoneInvalid
        ? SAUDI_MOBILE_ERROR_MESSAGE
        : "يرجى مراجعة الاسم ورقم الجوال والخدمة المطلوبة قبل الإرسال. / Please review your details before submitting.",
      { status: 400 },
    );
  }

  const clientIp = extractClientIp(request.headers);
  if (clientIp !== "unknown" && (await isBlockedIpAddress(clientIp))) {
    await recordAppLog({
      level: "warn",
      kind: "blocked-ip",
      message: "Landing page lead blocked by IP denylist",
      meta: { ip: clientIp },
    });
    return response(
      request,
      "error",
      "تعذر استقبال الطلب حاليًا. / Request could not be accepted.",
      { status: 403 },
    );
  }
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
    const serviceReference =
      parsed.data.serviceSlug ||
      parsed.data.serviceTypeAr ||
      parsed.data.serviceLabel ||
      parsed.data.serviceName ||
      parsed.data.serviceType;
    const isGeneralInquiry = isGeneralInquiryService(serviceReference);
    const selectedService = serviceReference && !isGeneralInquiry
      ? await getServiceByReference(serviceReference)
      : null;
    const serviceArabicName =
      isGeneralInquiry
        ? GENERAL_INQUIRY_SERVICE_AR
        : selectedService?.name ||
          parsed.data.serviceTypeAr ||
          parsed.data.serviceLabel ||
          parsed.data.serviceName ||
          parsed.data.serviceType ||
          parsed.data.offerName ||
          parsed.data.serviceSlug ||
          undefined;
    const landingPageUrl =
      parsed.data.landingPageUrl ||
      parsed.data.pageUrl ||
      request.headers.get("referer") ||
      "";
    const landingPageSlug =
      parsed.data.landingPageSlug ||
      extractCustomPageSlugFromUrl(landingPageUrl);
    const leadNotes = [
      parsed.data.offerName ? `Offer: ${parsed.data.offerName}` : "",
      parsed.data.offerPrice ? `Offer price: ${parsed.data.offerPrice}` : "",
      parsed.data.landingPagePath
        ? `Landing page path: ${parsed.data.landingPagePath}`
        : "",
      parsed.data.utmTerm ? `utm_term: ${parsed.data.utmTerm}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await createContactLead({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
      source: parsed.data.source || "Landing page form",
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
      ...(leadNotes ? { notes: leadNotes } : {}),
      ...getLeadRequestMetadata(request, {
        referrerUrl: parsed.data.referrerUrl || undefined,
        landingPageUrl: landingPageUrl || undefined,
      }),
    });

    const buildLeadWebhookPayload = (
      event: "landing_lead.created",
      duplicate: boolean,
    ) => ({
      event,
      source: parsed.data.source || "Landing page form",
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
      offerName: parsed.data.offerName || undefined,
      offerPrice: parsed.data.offerPrice || undefined,
      serviceSlug: serviceArabicName,
      serviceSlugRaw:
        selectedService?.slug ||
        (isGeneralInquiry
          ? GENERAL_INQUIRY_SERVICE_VALUE
          : parsed.data.serviceSlug) ||
        undefined,
      serviceReference: isGeneralInquiry
        ? GENERAL_INQUIRY_SERVICE_VALUE
        : serviceReference || undefined,
      service: serviceArabicName,
      serviceName: serviceArabicName,
      serviceLabel: serviceArabicName,
      serviceType: serviceArabicName,
      serviceTypeAr: serviceArabicName,
      landingPageSlug: landingPageSlug || undefined,
      landingPageUrl: landingPageUrl || undefined,
      landingPagePath: parsed.data.landingPagePath || undefined,
      pageUrl: parsed.data.pageUrl || undefined,
      referrerUrl: parsed.data.referrerUrl || undefined,
      utmSource: parsed.data.utmSource || undefined,
      utmMedium: parsed.data.utmMedium || undefined,
      utmCampaign: parsed.data.utmCampaign || undefined,
      utmContent: parsed.data.utmContent || undefined,
      utmTerm: parsed.data.utmTerm || undefined,
      utm_source: parsed.data.utmSource || undefined,
      utm_medium: parsed.data.utmMedium || undefined,
      utm_campaign: parsed.data.utmCampaign || undefined,
      utm_content: parsed.data.utmContent || undefined,
      utm_term: parsed.data.utmTerm || undefined,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
    });

    const dispatchLeadWebhooks = async (
      leadWebhookPayload: ReturnType<typeof buildLeadWebhookPayload>,
      customPageEvent: "custom_page_lead.created",
    ) => {
      const pageWebhook = landingPageSlug
        ? await getCustomPageLeadWebhookBySlug(landingPageSlug)
        : null;
      if (pageWebhook?.leadWebhookEnabled && pageWebhook.leadWebhookUrl) {
        await dispatchJsonWebhook({
          url: pageWebhook.leadWebhookUrl,
          secret: pageWebhook.leadWebhookSecret,
          failureMessage: "Custom page lead webhook delivery failed",
          payload: {
            ...leadWebhookPayload,
            event: customPageEvent,
            pageTitle: pageWebhook.titleAr,
            pageWebhookLabel:
              pageWebhook.leadWebhookLabel || pageWebhook.titleAr,
          },
          logMeta: {
            webhookScope: "custom-page",
            pageSlug: pageWebhook.slug,
            pageId: pageWebhook.id,
          },
        });
        return;
      }

      const settings = await getRuntimeSettings();
      await dispatchFormWebhook({
        settings,
        failureMessage: "Landing page webhook delivery failed",
        payload: leadWebhookPayload,
      });
    };

    if (result.mode === "duplicate") {
      await recordAppLog({
        level: "info",
        kind: "webhook",
        message: "Duplicate landing lead webhook delivery suppressed",
        meta: {
          submissionId: result.submission.id,
          source: parsed.data.source || "Landing page form",
          landingPageSlug: landingPageSlug || undefined,
          duplicate: true,
        },
      });
      revalidatePath("/admin/crm");
      if (jsonResponse) {
        return NextResponse.json(
          {
            ok: true,
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

    await dispatchLeadWebhooks(
      buildLeadWebhookPayload("landing_lead.created", false),
      "custom_page_lead.created",
    );

    revalidatePath("/admin/crm");
    if (jsonResponse) {
      return NextResponse.json(
        {
          ok: true,
          status: "success",
          duplicate: false,
          message: "Lead captured",
          submissionId:
            result.mode === "database" ? result.submission.id : undefined,
        },
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
      "offerName",
      "offerPrice",
      "preferredLanguage",
      "source",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utmTerm",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "landingPageUrl",
      "landingPagePath",
      "landingPageSlug",
    ],
  });
}
