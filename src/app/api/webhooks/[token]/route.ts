import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  isValidAppointmentSlot,
  parsePreferredAppointment as parseAppointmentSlot,
} from "@/lib/appointment-slots";
import {
  createContactLead,
  getWebhookByToken,
  recordWebhookEvent,
} from "@/lib/content-repository";

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
    preferredAppointmentAt: z.string().max(80).optional(),
    preferredDate: z.string().max(40).optional(),
    preferredTime: z.string().max(20).optional(),
    appointmentNotes: z.string().max(500).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    preferredLanguage: z.string().min(2).max(10).optional(),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
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

function parsePreferredAppointment(data: Record<string, unknown>) {
  const direct = pickFirst(data, [
    "preferredAppointmentAt",
    "appointmentAt",
    "appointment",
  ]);
  if (direct) {
    const parsed = new Date(direct);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const date = pickFirst(data, ["preferredDate", "appointmentDate", "date"]);
  if (!date) return undefined;
  const time =
    pickFirst(data, ["preferredTime", "appointmentTime", "time"]) ?? "14:00";
  if (!isValidAppointmentSlot(date, time)) return undefined;
  return parseAppointmentSlot(date, time);
}

type RouteContext = {
  params: Promise<{ token: string }>;
};

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
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const fullName =
    pickFirst(data, ["fullName", "name", "full_name"]) ?? "Unknown";
  const phone = pickFirst(data, ["phone", "mobile", "phone_number"]);
  if (!phone) {
    await recordWebhookEvent({
      webhookId: webhook.id,
      payload: raw,
      statusCode: 422,
      errorMessage: "Missing phone",
      ip,
      userAgent: ua,
    });
    return NextResponse.json({ error: "phone is required" }, { status: 422 });
  }

  const email = pickFirst(data, ["email"]);
  const message = pickFirst(data, ["message", "note"]);
  const preferredAppointmentAt = parsePreferredAppointment(data);
  const appointmentNotes = pickFirst(data, [
    "appointmentNotes",
    "appointmentNote",
  ]);
  const sourceLabel =
    pickFirst(data, ["source"]) ?? webhook.defaultSource ?? "Webhook";
  const serviceSlug = pickFirst(data, ["serviceSlug", "service"]);
  const tags = [
    ...normaliseTags(data.tags),
    ...(webhook.defaultTags ?? []),
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  try {
    await createContactLead({
      fullName,
      phone,
      ...(email ? { email } : {}),
      ...(message ? { message } : {}),
      ...(preferredAppointmentAt ? { preferredAppointmentAt } : {}),
      ...(appointmentNotes ? { appointmentNotes } : {}),
      source: sourceLabel,
      ...(serviceSlug ? { serviceSlug } : {}),
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
    return NextResponse.json(
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  return handleIngest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleIngest(request, context);
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
  });
}
