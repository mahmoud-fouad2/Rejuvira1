import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { adminActionErrorMessage } from "@/lib/admin-action-errors";
import {
  createJournalPostDraft,
  updateJournalPost,
} from "@/lib/content-repository";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createJournalSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(6),
  titleEn: z.string().optional().or(z.literal("")),
  excerpt: z.string().min(12),
  excerptEn: z.string().optional().or(z.literal("")),
  body: z.string().min(40),
  coverImageUrl: z.string().optional().or(z.literal("")),
  category: z.string().min(2),
  readingTime: z.string().min(2),
  relatedServiceSlugs: z.string().optional().or(z.literal("")),
  relatedDoctorSlugs: z.string().optional().or(z.literal("")),
});

const updateJournalSchema = createJournalSchema.extend({
  id: z.string().min(3),
  status: z.nativeEnum(ContentStatus),
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
    canAccessAdminRoute("/admin/journal", session.user.role),
  );
}

function parseCommaSeparated(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBodyBlocks(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const looksLikeHtml =
    /<\/?(?:p|h2|h3|h4|ul|ol|li|blockquote|figure|img|hr|div)\b/i.test(trimmed);
  if (!looksLikeHtml) {
    return trimmed
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  const safe = sanitizeHtml(trimmed);
  const matches = safe.match(
    /<(?:p|h2|h3|h4|blockquote|ul|ol|figure|hr|div)\b[\s\S]*?<\/(?:p|h2|h3|h4|blockquote|ul|ol|figure|div)>|<hr\b[^>]*\/?>/gi,
  );
  if (matches && matches.length > 0) {
    return matches.map((block) => block.trim()).filter(Boolean);
  }
  return [safe];
}

function revalidate(slug?: string) {
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = createJournalSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    titleEn: formData.get("titleEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl"),
    category: formData.get("category"),
    readingTime: formData.get("readingTime"),
    relatedServiceSlugs: formData.get("relatedServiceSlugs"),
    relatedDoctorSlugs: formData.get("relatedDoctorSlugs"),
  });

  if (!parsed.success) {
    return json("error", "يرجى استكمال بيانات المقال بشكل صحيح.", {
      status: 400,
    });
  }

  try {
    await createJournalPostDraft({
      slug: parsed.data.slug,
      title: parsed.data.title,
      titleEn: parsed.data.titleEn,
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      body: parseBodyBlocks(parsed.data.body),
      category: parsed.data.category,
      readingTime: parsed.data.readingTime,
      relatedServiceSlugs: parseCommaSeparated(parsed.data.relatedServiceSlugs),
      relatedDoctorSlugs: parseCommaSeparated(parsed.data.relatedDoctorSlugs),
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate(parsed.data.slug);
    return json("success", "تم حفظ المقال بنجاح.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const parsed = updateJournalSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    titleEn: formData.get("titleEn"),
    excerpt: formData.get("excerpt"),
    excerptEn: formData.get("excerptEn"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl"),
    category: formData.get("category"),
    readingTime: formData.get("readingTime"),
    relatedServiceSlugs: formData.get("relatedServiceSlugs"),
    relatedDoctorSlugs: formData.get("relatedDoctorSlugs"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return json("error", "يرجى استكمال بيانات المقال قبل الحفظ.", {
      status: 400,
    });
  }

  try {
    await updateJournalPost({
      id: parsed.data.id,
      slug: parsed.data.slug,
      title: parsed.data.title,
      titleEn: parsed.data.titleEn,
      excerpt: parsed.data.excerpt,
      excerptEn: parsed.data.excerptEn,
      body: parseBodyBlocks(parsed.data.body),
      category: parsed.data.category,
      readingTime: parsed.data.readingTime,
      relatedServiceSlugs: parseCommaSeparated(parsed.data.relatedServiceSlugs),
      relatedDoctorSlugs: parseCommaSeparated(parsed.data.relatedDoctorSlugs),
      status: parsed.data.status,
      ...(parsed.data.coverImageUrl
        ? { coverImageUrl: parsed.data.coverImageUrl }
        : {}),
    });
    revalidate(parsed.data.slug);
    return json("success", "تم تحديث المقال بنجاح.");
  } catch (error) {
    return json("error", adminActionErrorMessage(error), { status: 500 });
  }
}
