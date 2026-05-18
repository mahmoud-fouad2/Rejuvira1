import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import { createDeviceDraft, updateDevice } from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deviceSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(10),
  excerptEn: z.string().optional().or(z.literal("")),
  description: z.string().min(20),
  descriptionEn: z.string().optional().or(z.literal("")),
  certifications: z.string().min(2),
  serviceSlugs: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

const updateDeviceSchema = deviceSchema.extend({
  id: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
  featured: z.coerce.boolean().optional().default(false),
});

function splitList(value: string | undefined | null) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
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
    canAccessAdminRoute("/admin/devices", session.user.role),
  );
}

function revalidate() {
  revalidatePath("/admin/devices");
  revalidatePath("/devices");
  revalidatePath("/devices/[slug]", "page");
  revalidatePath("/");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = deviceSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    certifications: formData.get("certifications"),
    serviceSlugs: formData.get("serviceSlugs"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الجهاز غير مكتملة.", { status: 400 });
  }

  try {
    await createDeviceDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      description: parsed.data.description,
      descriptionEn: parsed.data.descriptionEn,
      certifications: splitList(parsed.data.certifications),
      serviceSlugs: splitList(parsed.data.serviceSlugs),
      ...(parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : {}),
    });
    revalidate();
    return json("success", "تم حفظ الجهاز.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = updateDeviceSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn"),
    certifications: formData.get("certifications"),
    serviceSlugs: formData.get("serviceSlugs"),
    imageUrl: formData.get("imageUrl"),
    status: formData.get("status"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الجهاز غير صالحة للتحديث.", {
      status: 400,
    });
  }

  try {
    await updateDevice({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      description: parsed.data.description,
      descriptionEn: parsed.data.descriptionEn,
      certifications: splitList(parsed.data.certifications),
      serviceSlugs: splitList(parsed.data.serviceSlugs),
      status: parsed.data.status,
      featured: parsed.data.featured,
      ...(parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : {}),
    });
    revalidate();
    return json("success", "تم تحديث الجهاز.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}
