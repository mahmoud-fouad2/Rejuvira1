import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  createDoctorDraft,
  updateDoctorProfile,
} from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const doctorSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  nameEn: z.string().optional().or(z.literal("")),
  title: z.string().min(3),
  titleEn: z.string().optional().or(z.literal("")),
  specialty: z.string().min(3),
  specialtyEn: z.string().optional().or(z.literal("")),
  summary: z.string().min(10),
  bio: z.string().min(20),
  bioEn: z.string().optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0),
  languages: z.string().min(2),
  photoUrl: z.string().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().optional().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  serviceSlugs: z.string().optional().or(z.literal("")),
});

const updateDoctorSchema = doctorSchema.extend({
  id: z.string().min(3),
});

function parseSlugList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function parseLanguages(raw: string): string[] {
  return raw
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
    canAccessAdminRoute("/admin/doctors", session.user.role),
  );
}

function revalidate(slug?: string) {
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  if (slug) revalidatePath(`/doctors/${slug}`);
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = doctorSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    title: formData.get("title"),
    titleEn: formData.get("titleEn"),
    specialty: formData.get("specialty"),
    specialtyEn: formData.get("specialtyEn"),
    summary: formData.get("summary"),
    bio: formData.get("bio"),
    bioEn: formData.get("bioEn"),
    yearsExperience: formData.get("yearsExperience"),
    languages: formData.get("languages"),
    photoUrl: formData.get("photoUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
    featured: formData.get("featured"),
    status: formData.get("status"),
    serviceSlugs: formData.get("serviceSlugs"),
  });

  if (!parsed.success) {
    return json("error", "يرجى مراجعة بيانات الطبيب قبل الحفظ.", {
      status: 400,
    });
  }

  try {
    await createDoctorDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      title: parsed.data.title,
      titleEn: parsed.data.titleEn,
      specialty: parsed.data.specialty,
      specialtyEn: parsed.data.specialtyEn,
      summary: parsed.data.summary,
      bio: parsed.data.bio,
      bioEn: parsed.data.bioEn,
      yearsExperience: parsed.data.yearsExperience,
      languages: parseLanguages(parsed.data.languages),
      featured: parsed.data.featured,
      status: parsed.data.status,
      serviceSlugs: parseSlugList(formData.get("serviceSlugs")),
      ...(parsed.data.photoUrl ? { photoUrl: parsed.data.photoUrl } : {}),
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate(parsed.data.slug);
    return json("success", "تم حفظ ملف الطبيب بنجاح.");
  } catch (error) {
    return json(
      "error",
      error instanceof Error
        ? `تعذر حفظ الطبيب: ${error.message}`
        : "تعذر حفظ الطبيب حاليا.",
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = updateDoctorSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameEn: formData.get("nameEn"),
    title: formData.get("title"),
    titleEn: formData.get("titleEn"),
    specialty: formData.get("specialty"),
    specialtyEn: formData.get("specialtyEn"),
    summary: formData.get("summary"),
    bio: formData.get("bio"),
    bioEn: formData.get("bioEn"),
    yearsExperience: formData.get("yearsExperience"),
    languages: formData.get("languages"),
    photoUrl: formData.get("photoUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
    featured: formData.get("featured"),
    status: formData.get("status"),
    serviceSlugs: formData.get("serviceSlugs"),
  });

  if (!parsed.success) {
    return json("error", "بيانات الطبيب غير مكتملة أو غير صالحة للتحديث.", {
      status: 400,
    });
  }

  try {
    await updateDoctorProfile({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn,
      title: parsed.data.title,
      titleEn: parsed.data.titleEn,
      specialty: parsed.data.specialty,
      specialtyEn: parsed.data.specialtyEn,
      summary: parsed.data.summary,
      bio: parsed.data.bio,
      bioEn: parsed.data.bioEn,
      yearsExperience: parsed.data.yearsExperience,
      languages: parseLanguages(parsed.data.languages),
      featured: parsed.data.featured,
      status: parsed.data.status,
      serviceSlugs: parseSlugList(formData.get("serviceSlugs")),
      ...(parsed.data.photoUrl ? { photoUrl: parsed.data.photoUrl } : {}),
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate(parsed.data.slug);
    return json("success", "تم تحديث ملف الطبيب بنجاح.");
  } catch (error) {
    return json(
      "error",
      error instanceof Error
        ? `تعذر تحديث الطبيب: ${error.message}`
        : "تعذر تحديث الطبيب حاليا.",
      { status: 500 },
    );
  }
}
