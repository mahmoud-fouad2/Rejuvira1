import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import { createServiceDraft, updateService } from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const serviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  categoryId: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(8),
  excerptEn: z.string().optional().or(z.literal("")),
  description: z.string().min(20),
  descriptionEn: z.string().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
  doctorSlugs: z.string().optional().or(z.literal("")),
  deviceSlugs: z.string().optional().or(z.literal("")),
});

const updateServiceSchema = serviceSchema.extend({
  id: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
  featured: z.coerce.boolean().optional().default(false),
});

function parseSlugList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

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
    canAccessAdminRoute("/admin/services", session.user.role),
  );
}

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/devices");
  revalidatePath("/sitemap.xml");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = serviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    category: formData.get("category"),
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
    doctorSlugs: formData.get("doctorSlugs"),
    deviceSlugs: formData.get("deviceSlugs"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الخدمة غير مكتملة.", { status: 400 });
  }

  try {
    await createServiceDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      category: parsed.data.category,
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      description: parsed.data.description,
      descriptionEn: parsed.data.descriptionEn,
      doctorSlugs: parseSlugList(formData.get("doctorSlugs")),
      deviceSlugs: parseSlugList(formData.get("deviceSlugs")),
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate();
    return json("success", "تم حفظ الخدمة.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = updateServiceSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    category: formData.get("category"),
    categoryId: formData.get("categoryId"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    coverImageUrl: formData.get("coverImageUrl"),
    status: formData.get("status"),
    featured: formData.get("featured"),
    doctorSlugs: formData.get("doctorSlugs"),
    deviceSlugs: formData.get("deviceSlugs"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الخدمة غير صالحة للتحديث.", { status: 400 });
  }

  try {
    await updateService({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      category: parsed.data.category,
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      description: parsed.data.description,
      descriptionEn: parsed.data.descriptionEn,
      status: parsed.data.status,
      featured: parsed.data.featured,
      doctorSlugs: parseSlugList(formData.get("doctorSlugs")),
      deviceSlugs: parseSlugList(formData.get("deviceSlugs")),
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate();
    return json("success", "تم تحديث الخدمة.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}
