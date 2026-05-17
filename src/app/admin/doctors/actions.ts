"use server";

import { revalidatePath } from "next/cache";
import { ContentStatus } from "@prisma/client";
import { z } from "zod";

import {
  createDoctorDraft,
  deleteDoctor,
  updateDoctorProfile,
  updateDoctorStatus,
} from "@/lib/content-repository";

export type DoctorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const doctorSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  title: z.string().min(3),
  specialty: z.string().min(3),
  summary: z.string().min(10),
  bio: z.string().min(20),
  yearsExperience: z.coerce.number().int().min(0),
  languages: z.string().min(2),
  photoUrl: z.string().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().optional().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  serviceSlugs: z.string().optional().or(z.literal("")),
});

function parseSlugList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

const updateDoctorSchema = doctorSchema.extend({
  id: z.string().min(3),
});

export async function createDoctorAction(
  _previousState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  const parsed = doctorSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    title: formData.get("title"),
    specialty: formData.get("specialty"),
    summary: formData.get("summary"),
    bio: formData.get("bio"),
    yearsExperience: formData.get("yearsExperience"),
    languages: formData.get("languages"),
    photoUrl: formData.get("photoUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
    featured: formData.get("featured"),
    status: formData.get("status"),
    serviceSlugs: formData.get("serviceSlugs"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى مراجعة بيانات الطبيب قبل حفظ المسودة.",
    };
  }

  const serviceSlugs = parseSlugList(formData.get("serviceSlugs"));

  let result: Awaited<ReturnType<typeof createDoctorDraft>>;
  try {
    result = await createDoctorDraft({
      slug: parsed.data.slug,
      name: parsed.data.name,
      title: parsed.data.title,
      specialty: parsed.data.specialty,
      summary: parsed.data.summary,
      bio: parsed.data.bio,
      yearsExperience: parsed.data.yearsExperience,
      languages: parsed.data.languages
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      featured: parsed.data.featured,
      status: parsed.data.status,
      serviceSlugs,
      ...(parsed.data.photoUrl
        ? {
            photoUrl: parsed.data.photoUrl,
          }
        : {}),
      ...(parsed.data.coverImageUrl
        ? {
            coverImageUrl: parsed.data.coverImageUrl,
          }
        : {}),
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? `تعذر حفظ الطبيب: ${error.message}`
          : "تعذر حفظ الطبيب حاليًا. يرجى مراجعة البيانات والمحاولة مرة أخرى.",
    };
  }

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم حفظ ملف الطبيب بنجاح."
        : "تم اعتماد ملف الطبيب داخل بيئة العمل الحالية بنجاح.",
  };
}

export async function updateDoctorAction(
  _previousState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  const parsed = updateDoctorSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    title: formData.get("title"),
    specialty: formData.get("specialty"),
    summary: formData.get("summary"),
    bio: formData.get("bio"),
    yearsExperience: formData.get("yearsExperience"),
    languages: formData.get("languages"),
    photoUrl: formData.get("photoUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
    featured: formData.get("featured"),
    status: formData.get("status"),
    serviceSlugs: formData.get("serviceSlugs"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "بيانات الطبيب غير مكتملة أو غير صالحة للتحديث.",
    };
  }

  const serviceSlugs = parseSlugList(formData.get("serviceSlugs"));

  let result: Awaited<ReturnType<typeof updateDoctorProfile>>;
  try {
    result = await updateDoctorProfile({
      id: parsed.data.id,
      slug: parsed.data.slug,
      name: parsed.data.name,
      title: parsed.data.title,
      specialty: parsed.data.specialty,
      summary: parsed.data.summary,
      bio: parsed.data.bio,
      yearsExperience: parsed.data.yearsExperience,
      languages: parsed.data.languages
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      featured: parsed.data.featured,
      status: parsed.data.status,
      serviceSlugs,
      ...(parsed.data.photoUrl
        ? {
            photoUrl: parsed.data.photoUrl,
          }
        : {}),
      ...(parsed.data.coverImageUrl
        ? {
            coverImageUrl: parsed.data.coverImageUrl,
          }
        : {}),
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? `تعذر تحديث الطبيب: ${error.message}`
          : "تعذر تحديث الطبيب حاليًا. يرجى مراجعة البيانات والمحاولة مرة أخرى.",
    };
  }

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath(`/doctors/${parsed.data.slug}`);
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");

  return {
    status: "success",
    message:
      result.mode === "database"
        ? "تم تحديث ملف الطبيب بنجاح."
        : "تم تحديث الملف داخل بيئة العمل الحالية بنجاح.",
  };
}

export async function setDoctorStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  const parsed = z.nativeEnum(ContentStatus).safeParse(status);
  if (!parsed.success) return;
  await updateDoctorStatus(id, parsed.data);
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");
}

export async function deleteDoctorAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteDoctor(id);
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  revalidatePath("/doctors/[slug]", "page");
  revalidatePath("/");
}
