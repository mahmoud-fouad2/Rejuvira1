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

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const baseSchema = z.object({
  slug: z.string().min(2).max(80).regex(slugRegex, { message: "Invalid slug" }),
  titleAr: z.string().min(2).max(160),
  titleEn: z.string().max(160).optional().or(z.literal("")),
  htmlContent: z.string().min(1).max(1_000_000),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(360).optional().or(z.literal("")),
  metaTitle: z.string().max(160).optional().or(z.literal("")),
  metaDescription: z.string().max(500).optional().or(z.literal("")),
  keywords: z.string().max(1000).optional().or(z.literal("")),
  ogTitle: z.string().max(160).optional().or(z.literal("")),
  ogDescription: z.string().max(500).optional().or(z.literal("")),
  ogImage: z.string().url().max(500).optional().or(z.literal("")),
  seoSlug: z
    .string()
    .max(80)
    .regex(slugRegex, { message: "Invalid SEO slug" })
    .optional()
    .or(z.literal("")),
  hashtags: z.string().max(1000).optional().or(z.literal("")),
  formConfig: z.string().max(50_000).optional().or(z.literal("")),
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

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = baseSchema.safeParse({
    slug: formData.get("slug"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    htmlContent: formData.get("htmlContent"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    keywords: formData.get("keywords"),
    ogTitle: formData.get("ogTitle"),
    ogDescription: formData.get("ogDescription"),
    ogImage: formData.get("ogImage"),
    seoSlug: formData.get("seoSlug"),
    hashtags: formData.get("hashtags"),
    formConfig: formData.get("formConfig"),
    status: formData.get("status") || ContentStatus.DRAFT,
    noindex: formData.get("noindex"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الصفحة غير صحيحة.", { status: 400 });
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
    id: formData.get("id"),
    slug: formData.get("slug"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    htmlContent: formData.get("htmlContent"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    keywords: formData.get("keywords"),
    ogTitle: formData.get("ogTitle"),
    ogDescription: formData.get("ogDescription"),
    ogImage: formData.get("ogImage"),
    seoSlug: formData.get("seoSlug"),
    hashtags: formData.get("hashtags"),
    formConfig: formData.get("formConfig"),
    status: formData.get("status") || ContentStatus.DRAFT,
    noindex: formData.get("noindex"),
    oldSlug: formData.get("oldSlug"),
  });

  if (!parsed.success) {
    return json("error", "تعذّر تحديث الصفحة.", { status: 400 });
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
