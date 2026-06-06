import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import {
  createCustomPage,
  deleteCustomPage,
  updateCustomPage,
} from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_CONTENT_CHARS = 8_000_000;
const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const baseSchema = z.object({
  slug: z.string().min(2).max(80).regex(slugRegex),
  titleAr: z.string().min(2).max(160),
  titleEn: z.string().max(160).optional().or(z.literal("")),
  htmlContent: z.string().min(1).max(MAX_HTML_CONTENT_CHARS),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(360).optional().or(z.literal("")),
  metaTitle: z.string().max(160).optional().or(z.literal("")),
  metaDescription: z.string().max(500).optional().or(z.literal("")),
  keywords: z.string().max(1000).optional().or(z.literal("")),
  ogTitle: z.string().max(160).optional().or(z.literal("")),
  ogDescription: z.string().max(500).optional().or(z.literal("")),
  ogImage: z.string().url().max(500).optional().or(z.literal("")),
  seoSlug: z.string().max(80).regex(slugRegex).optional().or(z.literal("")),
  hashtags: z.string().max(1000).optional().or(z.literal("")),
  formConfig: z.string().max(50_000).optional().or(z.literal("")),
  leadWebhookEnabled: z.coerce.boolean().optional().default(false),
  leadWebhookUrl: z.string().url().max(1000).optional().or(z.literal("")),
  leadWebhookSecret: z.string().max(300).optional().or(z.literal("")),
  leadWebhookLabel: z.string().max(120).optional().or(z.literal("")),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  noindex: z.coerce.boolean().optional().default(false),
});

const updateSchema = baseSchema.extend({
  id: z.string().min(3),
  oldSlug: z.string().optional().or(z.literal("")),
});

function json(
  status: "success" | "error",
  message: string,
  init?: ResponseInit,
) {
  return NextResponse.json({ status, message }, init);
}

async function requireAdmin() {
  const session = await auth();
  return Boolean(
    session?.user?.role &&
      canAccessAdminRoute("/admin/pages", session.user.role),
  );
}

function revalidate(slug?: string, oldSlug?: string) {
  revalidatePath("/admin/pages");
  if (slug) revalidatePath(`/p/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/p/${oldSlug}`);
  revalidatePath("/sitemap.xml");
}

function parseList(value?: string) {
  return (value ?? "")
    .split(/[,\n،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFormConfig(value?: string) {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formHtmlString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return false;
  return ["1", "true", "on", "yes"].includes(value.toLowerCase());
}

function truncate(value: string, max: number) {
  return value.length > max ? value.slice(0, max).trim() : value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeOptionalUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeStatus(value: string) {
  const statuses = Object.values(ContentStatus) as string[];
  return statuses.includes(value) ? value : ContentStatus.DRAFT;
}

function customPagePayload(formData: FormData) {
  const rawTitle = formString(formData, "titleAr");
  const titleAr = truncate(rawTitle || "Landing Page", 160);
  const titleEn = truncate(formString(formData, "titleEn") || titleAr, 160);
  const slug =
    slugify(formString(formData, "slug")) ||
    slugify(titleEn) ||
    `landing-${Date.now().toString(36)}`;
  const seoTitle = truncate(formString(formData, "seoTitle") || titleAr, 160);
  const seoDescription = truncate(
    formString(formData, "seoDescription") || `Landing page: ${titleAr}`,
    360,
  );
  const metaTitle = truncate(formString(formData, "metaTitle") || seoTitle, 160);
  const metaDescription = truncate(
    formString(formData, "metaDescription") || seoDescription,
    500,
  );

  return {
    slug,
    titleAr,
    titleEn,
    htmlContent: formHtmlString(formData, "htmlContent"),
    seoTitle,
    seoDescription,
    metaTitle,
    metaDescription,
    keywords: formString(formData, "keywords"),
    ogTitle: truncate(formString(formData, "ogTitle"), 160),
    ogDescription: truncate(formString(formData, "ogDescription"), 500),
    ogImage: normalizeOptionalUrl(formString(formData, "ogImage")),
    seoSlug: slugify(formString(formData, "seoSlug")),
    hashtags: formString(formData, "hashtags"),
    formConfig: formHtmlString(formData, "formConfig"),
    leadWebhookEnabled: formBoolean(formData, "leadWebhookEnabled"),
    leadWebhookUrl: normalizeOptionalUrl(formString(formData, "leadWebhookUrl")),
    leadWebhookSecret: formString(formData, "leadWebhookSecret"),
    leadWebhookLabel: truncate(formString(formData, "leadWebhookLabel"), 120),
    status: normalizeStatus(formString(formData, "status")),
    noindex: formBoolean(formData, "noindex"),
  };
}

function leadWebhookValidationMessage(data: {
  leadWebhookEnabled: boolean;
  leadWebhookUrl?: string | undefined;
}) {
  if (data.leadWebhookEnabled && !data.leadWebhookUrl) {
    return "فعّلت Webhook الصفحة، لذلك يجب إدخال رابط Make صحيح يبدأ بـ https://.";
  }
  return "";
}

function validationMessage(error: z.ZodError) {
  const firstIssue = error.issues[0];
  const field = String(firstIssue?.path?.[0] ?? "");

  if (field === "htmlContent") {
    return `ملف HTML مطلوب، والحد الأقصى ${(MAX_HTML_CONTENT_CHARS / 1_000_000).toFixed(1)}MB. إذا كان الملف يحتوي صور Base64 كبيرة، ارفع الصور كروابط خارجية.`;
  }
  if (field === "slug" || field === "seoSlug") {
    return "الرابط يجب أن يكون إنجليزيًا فقط مثل ramadan-campaign وبدون /p/.";
  }
  if (field === "titleAr") {
    return "اسم الصفحة مطلوب ويجب أن يكون حرفين على الأقل.";
  }
  if (field === "formConfig") {
    return "إعدادات الفورم غير صحيحة. جرّب حفظ الصفحة بدون إعدادات الفورم ثم عدّلها.";
  }

  return `تعذر حفظ الصفحة بسبب حقل ${field || "غير معروف"}. راجع البيانات ثم حاول مرة أخرى.`;
}

function logValidationError(action: "create" | "update", error: z.ZodError) {
  console.warn(
    `[custom-pages] invalid ${action} payload:`,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      code: issue.code,
      message: issue.message,
    })),
  );
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = baseSchema.safeParse(customPagePayload(formData));

  if (!parsed.success) {
    logValidationError("create", parsed.error);
    return json("error", validationMessage(parsed.error), { status: 400 });
  }
  const leadWebhookError = leadWebhookValidationMessage(parsed.data);
  if (leadWebhookError) {
    return json("error", leadWebhookError, { status: 400 });
  }

  try {
    const result = await createCustomPage({
      slug: parsed.data.slug,
      titleAr: parsed.data.titleAr,
      titleEn: parsed.data.titleEn,
      htmlContent: parsed.data.htmlContent,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      metaTitle: parsed.data.metaTitle || parsed.data.seoTitle,
      metaDescription:
        parsed.data.metaDescription || parsed.data.seoDescription,
      keywords: parseList(parsed.data.keywords),
      ogTitle: parsed.data.ogTitle,
      ogDescription: parsed.data.ogDescription,
      ogImage: parsed.data.ogImage,
      seoSlug: parsed.data.seoSlug,
      hashtags: parseList(parsed.data.hashtags),
      formConfig: parseFormConfig(parsed.data.formConfig),
      leadWebhookEnabled: parsed.data.leadWebhookEnabled,
      leadWebhookUrl: parsed.data.leadWebhookUrl,
      leadWebhookSecret: parsed.data.leadWebhookSecret,
      leadWebhookLabel: parsed.data.leadWebhookLabel,
      status: parsed.data.status,
      noindex: parsed.data.noindex,
    });
    revalidate(parsed.data.slug);
    return NextResponse.json({
      status: "success",
      message: "تم إنشاء الصفحة.",
      id: result.mode === "database" ? result.item.id : null,
    });
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = updateSchema.safeParse({
    ...customPagePayload(formData),
    id: formString(formData, "id"),
    oldSlug: formString(formData, "oldSlug"),
  });

  if (!parsed.success) {
    logValidationError("update", parsed.error);
    return json("error", validationMessage(parsed.error), { status: 400 });
  }
  const leadWebhookError = leadWebhookValidationMessage(parsed.data);
  if (leadWebhookError) {
    return json("error", leadWebhookError, { status: 400 });
  }

  try {
    await updateCustomPage({
      id: parsed.data.id,
      slug: parsed.data.slug,
      titleAr: parsed.data.titleAr,
      titleEn: parsed.data.titleEn,
      htmlContent: parsed.data.htmlContent,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      metaTitle: parsed.data.metaTitle || parsed.data.seoTitle,
      metaDescription:
        parsed.data.metaDescription || parsed.data.seoDescription,
      keywords: parseList(parsed.data.keywords),
      ogTitle: parsed.data.ogTitle,
      ogDescription: parsed.data.ogDescription,
      ogImage: parsed.data.ogImage,
      seoSlug: parsed.data.seoSlug,
      hashtags: parseList(parsed.data.hashtags),
      formConfig: parseFormConfig(parsed.data.formConfig),
      leadWebhookEnabled: parsed.data.leadWebhookEnabled,
      leadWebhookUrl: parsed.data.leadWebhookUrl,
      leadWebhookSecret: parsed.data.leadWebhookSecret,
      leadWebhookLabel: parsed.data.leadWebhookLabel,
      status: parsed.data.status,
      noindex: parsed.data.noindex,
    });
    revalidate(parsed.data.slug, parsed.data.oldSlug);
    return json("success", "تم حفظ التغييرات.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug") || undefined;
  if (!id) {
    return json("error", "طلب الحذف غير صالح.", { status: 400 });
  }

  try {
    await deleteCustomPage(id);
    revalidate(slug, slug);
    return json("success", "تم حذف الصفحة.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}
