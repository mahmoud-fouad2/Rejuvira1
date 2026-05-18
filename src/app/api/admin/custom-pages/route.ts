import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import { createCustomPage, updateCustomPage } from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const baseSchema = z.object({
  slug: z.string().min(2).max(80).regex(slugRegex, { message: "Invalid slug" }),
  titleAr: z.string().min(2).max(160),
  titleEn: z.string().max(160).optional().or(z.literal("")),
  htmlContent: z.string().min(1).max(200_000),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(360).optional().or(z.literal("")),
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
      status: parsed.data.status,
      noindex: parsed.data.noindex,
    });
    revalidate(parsed.data.slug, parsed.data.oldSlug);
    return json("success", "تم حفظ التغييرات.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}
