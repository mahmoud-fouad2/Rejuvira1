import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { recordAppLog } from "@/lib/app-log";
import { prisma } from "@/lib/prisma";
import { getReferenceAssets } from "@/lib/reference-assets";
import { buildPublicMediaUrl, normalizeMediaUrl } from "@/lib/media-url";
import { deleteObject, isR2Configured } from "@/lib/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaLibraryItem = {
  url: string;
  label: string;
  category: string;
  source: string;
  updatedAt?: string;
  key?: string;
  size?: number;
  contentType?: string;
};

const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

function isImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return (
    (trimmed.startsWith("/media/") ||
      trimmed.startsWith("data:image/") ||
      /^https?:\/\//i.test(trimmed)) &&
    IMAGE_EXTENSIONS.test(trimmed.split("?")[0] ?? trimmed)
  );
}

function collectImageUrls(value: unknown, output = new Set<string>()) {
  if (isImageUrl(value)) {
    output.add(value.trim());
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectImageUrls(item, output);
  }
  return output;
}

function addItem(
  items: Map<string, MediaLibraryItem>,
  input: MediaLibraryItem,
) {
  const url = normalizeMediaUrl(input.url);
  if (!isImageUrl(url) || items.has(url)) return;
  items.set(url, { ...input, url });
}

function uploadedKeyFromLog(message: string) {
  return message.replace(/^Uploaded\s+/i, "").trim();
}

function uploadedUrlFromLog(
  message: string,
  meta: Record<string, unknown> | null,
) {
  const key = uploadedKeyFromLog(message);
  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  if (key && publicBase) {
    try {
      return buildPublicMediaUrl(publicBase, key);
    } catch {
      // Fall back to the stored value so the rest of the library remains usable.
    }
  }

  const storedUrl = normalizeMediaUrl(String(meta?.publicUrl ?? ""));
  return isImageUrl(storedUrl) ? storedUrl : "";
}

function uploadedFileName(key: string, meta: Record<string, unknown> | null) {
  const originalName = String(meta?.originalName ?? "").trim();
  if (originalName) return originalName;
  const storedName = key.split("/").pop() ?? "";
  return storedName.replace(/^[a-f0-9]{16}-/i, "") || "Uploaded image";
}

function imageUrlsFromHtml(html: string) {
  const urls = new Set<string>();
  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    collectImageUrls(match[1], urls);
  }
  return urls;
}

async function getDatabaseMediaItems() {
  const items = new Map<string, MediaLibraryItem>();

  if (!process.env.DATABASE_URL) {
    return items;
  }

  const [
    settings,
    doctors,
    services,
    devices,
    galleryItems,
    journalPosts,
    customPages,
    uploadLogs,
  ] = await Promise.all([
    prisma.siteSetting.findMany({
      select: { key: true, value: true, groupName: true, updatedAt: true },
    }),
    prisma.doctor.findMany({
      select: {
        nameAr: true,
        nameEn: true,
        photoUrl: true,
        coverImageUrl: true,
        updatedAt: true,
      },
    }),
    prisma.service.findMany({
      select: {
        nameAr: true,
        nameEn: true,
        coverImageUrl: true,
        updatedAt: true,
      },
    }),
    prisma.device.findMany({
      select: { nameAr: true, nameEn: true, gallery: true, updatedAt: true },
    }),
    prisma.galleryItem.findMany({
      select: {
        titleAr: true,
        titleEn: true,
        beforeImageUrl: true,
        afterImageUrl: true,
        updatedAt: true,
      },
    }),
    prisma.journalPost.findMany({
      select: {
        titleAr: true,
        titleEn: true,
        coverImageUrl: true,
        updatedAt: true,
      },
    }),
    prisma.customPage.findMany({
      select: {
        titleAr: true,
        titleEn: true,
        htmlContent: true,
        ogImage: true,
        updatedAt: true,
      },
    }),
    prisma.appLog.findMany({
      where: { kind: "media", message: { startsWith: "Uploaded " } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { message: true, meta: true, createdAt: true },
    }),
  ]);

  for (const setting of settings) {
    for (const url of collectImageUrls(setting.value)) {
      addItem(items, {
        url,
        label: `${setting.groupName} / ${setting.key}`,
        category: "Settings",
        source: "settings",
        updatedAt: setting.updatedAt.toISOString(),
      });
    }
  }

  for (const doctor of doctors) {
    const label = doctor.nameAr || doctor.nameEn || "Doctor";
    for (const url of [doctor.photoUrl, doctor.coverImageUrl]) {
      if (!url) continue;
      addItem(items, {
        url,
        label,
        category: "Doctors",
        source: "doctors",
        updatedAt: doctor.updatedAt.toISOString(),
      });
    }
  }

  for (const service of services) {
    if (!service.coverImageUrl) continue;
    addItem(items, {
      url: service.coverImageUrl,
      label: service.nameAr || service.nameEn || "Service",
      category: "Services",
      source: "services",
      updatedAt: service.updatedAt.toISOString(),
    });
  }

  for (const device of devices) {
    const label = device.nameAr || device.nameEn || "Device";
    for (const url of collectImageUrls(device.gallery as Prisma.JsonValue)) {
      addItem(items, {
        url,
        label,
        category: "Devices",
        source: "devices",
        updatedAt: device.updatedAt.toISOString(),
      });
    }
  }

  for (const gallery of galleryItems) {
    const label = gallery.titleAr || gallery.titleEn || "Gallery";
    for (const url of [gallery.beforeImageUrl, gallery.afterImageUrl]) {
      addItem(items, {
        url,
        label,
        category: "Gallery",
        source: "gallery",
        updatedAt: gallery.updatedAt.toISOString(),
      });
    }
  }

  for (const post of journalPosts) {
    addItem(items, {
      url: post.coverImageUrl,
      label: post.titleAr || post.titleEn || "Journal",
      category: "Journal",
      source: "journal",
      updatedAt: post.updatedAt.toISOString(),
    });
  }

  for (const page of customPages) {
    const label = page.titleAr || page.titleEn || "Custom page";
    const pageUrls = imageUrlsFromHtml(page.htmlContent);
    collectImageUrls(page.ogImage, pageUrls);
    for (const url of pageUrls) {
      addItem(items, {
        url,
        label,
        category: "Pages",
        source: "pages",
        updatedAt: page.updatedAt.toISOString(),
      });
    }
  }

  for (const log of uploadLogs) {
    const meta = log.meta as Record<string, unknown> | null;
    const key = uploadedKeyFromLog(log.message);
    const url = uploadedUrlFromLog(log.message, meta);
    const namespace = String(meta?.namespace ?? "media/uploads");
    const size =
      typeof meta?.size === "number" && Number.isFinite(meta.size)
        ? meta.size
        : null;
    const contentType =
      typeof meta?.contentType === "string" ? meta.contentType : "";
    addItem(items, {
      url,
      label: uploadedFileName(key, meta),
      category: "Uploads",
      source: namespace,
      updatedAt: log.createdAt.toISOString(),
      key,
      ...(size !== null ? { size } : {}),
      ...(contentType ? { contentType } : {}),
    });
  }

  return items;
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !role ||
    (!canAccessAdminRoute("/admin/media", role) &&
      !canAccessAdminRoute("/admin/pages", role))
  ) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const items = new Map<string, MediaLibraryItem>();
  const referenceAssets = await getReferenceAssets();
  for (const asset of referenceAssets) {
    addItem(items, {
      url: asset.path,
      label: asset.label,
      category: asset.category,
      source: "reference",
    });
  }

  try {
    const databaseItems = await getDatabaseMediaItems();
    for (const item of databaseItems.values()) addItem(items, item);
  } catch {
    // The picker still works with bundled reference assets if the database is unavailable.
  }

  return NextResponse.json(
    {
      ok: true,
      items: Array.from(items.values()).sort((left, right) => {
        const leftDate = left.updatedAt ? Date.parse(left.updatedAt) : 0;
        const rightDate = right.updatedAt ? Date.parse(right.updatedAt) : 0;
        if (leftDate !== rightDate) return rightDate - leftDate;
        return `${left.category}-${left.label}`.localeCompare(
          `${right.category}-${right.label}`,
        );
      }),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

function extractKeyFromMediaUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, "");
    // If it has a namespace prefix like media/uploads, doctors, services, etc.
    if (
      path.startsWith("media/uploads/") ||
      path.startsWith("doctors/") ||
      path.startsWith("services/") ||
      path.startsWith("devices/") ||
      path.startsWith("gallery/") ||
      path.startsWith("journal/") ||
      path.startsWith("brand/") ||
      path.startsWith("trust/") ||
      path.startsWith("payments/") ||
      path.startsWith("pages/")
    ) {
      return path;
    }
  } catch {
    // Relative path or invalid URL
    const clean = url.replace(/^\/+/, "");
    if (
      clean.startsWith("media/uploads/") ||
      clean.startsWith("doctors/") ||
      clean.startsWith("services/")
    ) {
      return clean;
    }
  }
  return "";
}

export async function DELETE(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canAccessAdminRoute("/admin/media", role)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      key?: string;
      url?: string;
    };
    let key = typeof body?.key === "string" ? body.key.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!key && url) {
      key = extractKeyFromMediaUrl(url);
    }

    if (!key && !url) {
      return NextResponse.json(
        { ok: false, error: "Missing key or url to delete" },
        { status: 400 },
      );
    }

    // 1. Delete from Cloudflare R2 if configured and key is known
    if (key && isR2Configured()) {
      try {
        await deleteObject(key);
      } catch (err) {
        console.warn(`[media-library] R2 delete warning for ${key}:`, err);
      }
    }

    // 2. Remove from AppLog upload records so it disappears from Uploads list
    if (key || url) {
      await prisma.appLog.deleteMany({
        where: {
          kind: "media",
          OR: [
            ...(key
              ? [{ message: `Uploaded ${key}` }, { message: { contains: key } }]
              : []),
            ...(url ? [{ meta: { path: ["publicUrl"], equals: url } }] : []),
          ],
        },
      });
    }

    await recordAppLog({
      level: "info",
      kind: "media",
      message: `Deleted media ${key || url}`,
      meta: {
        key,
        url,
        actor: session.user.email ?? session.user.id ?? "unknown",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "تم حذف الصورة بنجاح / Image deleted successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
