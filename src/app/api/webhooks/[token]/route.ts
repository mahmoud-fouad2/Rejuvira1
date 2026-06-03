import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContactLead,
  getWebhookByToken,
  recordWebhookEvent,
} from "@/lib/content-repository";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  isGeneralInquiryService,
} from "@/lib/general-inquiry";
import { rateLimit } from "@/lib/rate-limit";
import {
  isValidSaudiMobileNumber,
  normalizeSaudiMobileNumber,
  SAUDI_MOBILE_ERROR_MESSAGE,
} from "@/lib/saudi-phone";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z
  .object({
    fullName: z.string().min(1).max(160).optional(),
    name: z.string().min(1).max(160).optional(),
    phone: z.string().min(4).max(40).optional(),
    mobile: z.string().min(4).max(40).optional(),
    phone_number: z.string().min(4).max(40).optional(),
    email: z.string().email().max(160).optional(),
    message: z.string().max(2000).optional(),
    note: z.string().max(2000).optional(),
    source: z.string().max(120).optional(),
    serviceSlug: z.string().max(120).optional(),
    service: z.string().max(120).optional(),
    serviceName: z.string().max(120).optional(),
    serviceLabel: z.string().max(120).optional(),
    serviceType: z.string().max(120).optional(),
    serviceTypeAr: z.string().max(120).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    preferredLanguage: z.string().min(2).max(10).optional(),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
    utmContent: z.string().max(120).optional(),
    utm_source: z.string().max(120).optional(),
    utm_medium: z.string().max(120).optional(),
    utm_campaign: z.string().max(120).optional(),
    utm_content: z.string().max(120).optional(),
  })
  .passthrough();

function flattenFormData(form: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    out[key] = typeof value === "string" ? value : value.name;
  }
  return out;
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      if (body && typeof body === "object" && !Array.isArray(body)) {
        return body as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    try {
      const form = await request.formData();
      return flattenFormData(form);
    } catch {
      return {};
    }
  }
  // Try as URL-encoded fallback.
  try {
    const text = await request.text();
    if (!text) return {};
    if (text.trim().startsWith("{")) {
      return JSON.parse(text) as Record<string, unknown>;
    }
    const params = new URLSearchParams(text);
    const out: Record<string, unknown> = {};
    params.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch {
    return {};
  }
}

function pickFirst<T extends Record<string, unknown>>(
  source: T,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function normaliseTags(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

type RouteContext = {
  params: Promise<{ token: string }>;
};

function wantsJson(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const requestedWith = request.headers.get("x-requested-with") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  return (
    accept.includes("application/json") ||
    requestedWith.toLowerCase() === "fetch" ||
    contentType.includes("application/json")
  );
}

function webhookResponse(
  request: Request,
  body: Record<string, unknown>,
  init: ResponseInit,
) {
  if (wantsJson(request)) {
    return NextResponse.json(body, init);
  }
  const referer = request.headers.get("referer") || "/";
  const url = new URL(referer, request.url);
  url.searchParams.set(
    "lead",
    init.status && init.status >= 400 ? "error" : "success",
  );
  return NextResponse.redirect(url, { status: 303 });
}

async function handleIngest(request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }
  const webhook = await getWebhookByToken(token);
  if (!webhook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!webhook.isActive) {
    return NextResponse.json({ error: "Webhook disabled" }, { status: 410 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const ua = request.headers.get("user-agent") ?? null;

  const limit = rateLimit({
    key: `webhook:${token}:${ip ?? "unknown"}`,
    limit: 120,
    windowSeconds: 60 * 10,
  });
  if (!limit.ok) {
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: { error: "rate_limit" },
      statusCode: 429,
      errorMessage: "Webhook rate limit hit",
      ip,
      userAgent: ua,
    });
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const raw = await readBody(request);
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: raw,
      statusCode: 400,
      errorMessage: parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
        .slice(0, 500),
      ip,
      userAgent: ua,
    });
    return webhookResponse(
      request,
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const fullName =
    pickFirst(data, ["fullName", "name", "full_name"]) ?? "Unknown";
  const rawPhone = pickFirst(data, ["phone", "mobile", "phone_number"]);
  const phone = rawPhone ? normalizeSaudiMobileNumber(rawPhone) : "";
  if (!phone || !isValidSaudiMobileNumber(phone)) {
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: raw,
      statusCode: 422,
      errorMessage: rawPhone ? SAUDI_MOBILE_ERROR_MESSAGE : "Missing phone",
      ip,
      userAgent: ua,
    });
    return webhookResponse(
      request,
      { error: rawPhone ? SAUDI_MOBILE_ERROR_MESSAGE : "phone is required" },
      { status: 422 },
    );
  }

  const email = pickFirst(data, ["email"]);
  const message = pickFirst(data, ["message", "note"]);
  const sourceLabel =
    webhook.name?.trim() ||
    webhook.defaultSource?.trim() ||
    pickFirst(data, ["source"]) ||
    "Webhook";
  const serviceSlug =
    pickFirst(data, [
      "serviceSlug",
      "service",
      "serviceName",
      "serviceLabel",
      "serviceTypeAr",
      "serviceType",
    ]) ?? webhook.service?.slug;
  const isGeneralInquiry = isGeneralInquiryService(serviceSlug);
  const tags = [
    ...normaliseTags(data.tags),
    ...(webhook.defaultTags ?? []),
    ...(isGeneralInquiry ? [GENERAL_INQUIRY_SERVICE_AR] : []),
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  try {
    await createContactLead({
      fullName,
      phone,
      ...(email ? { email } : {}),
      ...(message ? { message } : {}),
      ...(pickFirst(data, ["utmSource", "utm_source"])
        ? { utmSource: pickFirst(data, ["utmSource", "utm_source"]) }
        : {}),
      ...(pickFirst(data, ["utmMedium", "utm_medium"])
        ? { utmMedium: pickFirst(data, ["utmMedium", "utm_medium"]) }
        : {}),
      ...(pickFirst(data, ["utmCampaign", "utm_campaign"])
        ? { utmCampaign: pickFirst(data, ["utmCampaign", "utm_campaign"]) }
        : {}),
      ...(pickFirst(data, ["utmContent", "utm_content"])
        ? { utmContent: pickFirst(data, ["utmContent", "utm_content"]) }
        : {}),
      source: sourceLabel,
      ...(serviceSlug && !isGeneralInquiry ? { serviceSlug } : {}),
      preferredLanguage: pickFirst(data, ["preferredLanguage"]) ?? "ar",
      webhookId: webhook.id,
      tags,
      status: webhook.defaultStatus,
    });
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: raw,
      statusCode: 200,
      ip,
      userAgent: ua,
    });
    revalidatePath("/admin/crm");
    revalidatePath("/admin/webhooks");
    return webhookResponse(
      request,
      { ok: true, message: "Lead captured" },
      { status: 200 },
    );
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Internal error";
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: raw,
      statusCode: 500,
      errorMessage: messageText.slice(0, 500),
      ip,
      userAgent: ua,
    });
    return webhookResponse(
      request,
      { error: "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  return handleIngest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleIngest(request, context);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const webhook = await getWebhookByToken(token);
  if (!webhook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    name: webhook.name,
    isActive: webhook.isActive,
    defaultStatus: webhook.defaultStatus,
    defaultSource: webhook.defaultSource ?? "Webhook",
    defaultTags: webhook.defaultTags,
    service: webhook.service
      ? {
          slug: webhook.service.slug,
          name: webhook.service.nameAr,
        }
      : null,
    methods: ["POST", "PUT"],
    contentTypes: [
      "application/json",
      "multipart/form-data",
      "application/x-www-form-urlencoded",
    ],
    acceptedFields: [
      "fullName",
      "name",
      "phone",
      "mobile",
      "email",
      "message",
      "serviceSlug",
      "service",
      "serviceName",
      "serviceLabel",
      "serviceType",
      "serviceTypeAr",
      "tags",
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
