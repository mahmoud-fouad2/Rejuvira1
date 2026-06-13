import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { getReferenceAssets } from "@/lib/reference-assets";

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
  const url = input.url.trim();
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
  const storedUrl = String(meta?.publicUrl ?? "").trim();
  if (isImageUrl(storedUrl)) return storedUrl;

  const key = uploadedKeyFromLog(message);
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!key || !publicBase) return "";
  return `${publicBase}/${key.replace(/^\/+/, "")}`;
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
