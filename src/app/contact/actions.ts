"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAppLog } from "@/lib/app-log";
import { createContactLead, getRuntimeSettings } from "@/lib/content-repository";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

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
  preferredLanguage: z.string().optional().or(z.literal("")),
  recaptchaToken: z.string().optional().or(z.literal("")),
  source: z.string().max(120).optional().or(z.literal("")),
});

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
          ? { "x-rejuvira-webhook-secret": settings.integrations.formWebhookSecret }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    await recordAppLog({
      level: "warn",
      kind: "webhook",
      message: "Form webhook delivery failed",
      meta: {
        error: error instanceof Error ? error.message : "unknown",
        source: payload.source,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function submitContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    fullName: formString(formData, "fullName"),
    phone: formString(formData, "phone"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
    serviceSlug: formString(formData, "serviceSlug"),
    preferredLanguage: formString(formData, "preferredLanguage"),
    recaptchaToken: formString(formData, "recaptchaToken"),
    source: formString(formData, "source"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "يرجى مراجعة بيانات التواصل والخدمة المطلوبة قبل الإرسال. / Please review your details before submitting.",
    };
  }

  const headerStore = await headers();
  const clientIp = extractClientIp(headerStore);
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
    return {
      status: "error",
      message:
        "تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة بعد دقائق. / Too many attempts. Please try again in a few minutes.",
    };
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
        },
      });
      return {
        status: "error",
        message:
          "تعذّر التحقّق من الطلب لأسباب أمنية. الرجاء المحاولة مرة أخرى. / Could not verify your request for security reasons. Please try again.",
      };
    }
  }

  const result = await createContactLead({
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    preferredLanguage: parsed.data.preferredLanguage || "ar",
    source: parsed.data.source || "Website contact form",
    ...(parsed.data.email ? { email: parsed.data.email } : {}),
    ...(parsed.data.message ? { message: parsed.data.message } : {}),
    ...(parsed.data.serviceSlug
      ? { serviceSlug: parsed.data.serviceSlug }
      : {}),
  });

  await dispatchFormWebhook({
    settings,
    payload: {
      event: "contact_submission.created",
      source: parsed.data.source || "Website contact form",
      submittedAt: new Date().toISOString(),
      mode: result.mode,
      submissionId: result.mode === "database" ? result.submission.id : undefined,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      message: parsed.data.message || undefined,
      serviceSlug: parsed.data.serviceSlug || undefined,
      preferredLanguage: parsed.data.preferredLanguage || "ar",
    },
  });

  revalidatePath("/admin/crm");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم استلام طلبك بنجاح، وسيتواصل معك الفريق في أقرب وقت. / Your request has been received."
        : "تم استلام طلبك بنجاح، وسيتواصل معك الفريق في أقرب وقت. / Your request has been received.",
  };
}
