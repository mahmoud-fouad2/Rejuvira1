"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { prepareImageUpload } from "@/lib/client-image-upload";

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

type LibraryResponse =
  | { ok: true; items: MediaLibraryItem[] }
  | { ok: false; error: string };

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  Uploads: { ar: "الصور المرفوعة", en: "Uploads" },
  Settings: { ar: "إعدادات الموقع", en: "Settings" },
  Doctors: { ar: "الأطباء", en: "Doctors" },
  Services: { ar: "الخدمات", en: "Services" },
  Devices: { ar: "الأجهزة", en: "Devices" },
  Gallery: { ar: "المعرض", en: "Gallery" },
  Journal: { ar: "المجلة", en: "Journal" },
  Pages: { ar: "الصفحات المخصصة", en: "Custom pages" },
};

function previewUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) return url;
  return `/api/admin/media-proxy?url=${encodeURIComponent(url)}`;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes < 1) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? { ar: category, en: category };
}

export function AdminMediaLibrary() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/media-library", {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const payload = (await response.json()) as LibraryResponse;
      if (!response.ok || !payload.ok) {
        throw new Error("error" in payload ? payload.error : "Library failed");
      }
      setItems(payload.items);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "تعذر تحميل مكتبة الصور / Could not load media library.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (!copiedUrl) return;
    const timeout = window.setTimeout(() => setCopiedUrl(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [copiedUrl]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [items]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!normalizedQuery) return true;
      return `${item.label} ${item.category} ${item.source} ${item.url}`
        .toLocaleLowerCase("ar")
        .includes(normalizedQuery);
    });
  }, [category, items, query]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const preparedFile = await prepareImageUpload(file);
      const form = new FormData();
      form.append("file", preparedFile);
      form.append("namespace", "media/uploads");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json()) as
        | {
            ok: true;
            key: string;
            url: string;
            publicUrl?: string;
            size: number;
            contentType: string;
          }
        | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error("error" in payload ? payload.error : "Upload failed");
      }

      const uploadedUrl = payload.publicUrl || payload.url;
      setItems((current) => [
        {
          url: uploadedUrl,
          label: preparedFile.name,
          category: "Uploads",
          source: "media/uploads",
          updatedAt: new Date().toISOString(),
          key: payload.key,
          size: payload.size,
          contentType: payload.contentType,
        },
        ...current.filter((item) => item.url !== uploadedUrl),
      ]);
      setCategory("Uploads");
      setQuery("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "تعذر رفع الصورة / Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
    } catch {
      setError("تعذر نسخ الرابط تلقائيًا / Could not copy the URL.");
    }
  }

  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__subtitle">Media library</div>
          <div className="admin-card__title">
            <span className="lang-ar">مكتبة الصور المرفوعة والمستخدمة</span>
            <span className="lang-en">Uploaded & used media</span>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-[color:var(--admin-text-faint)]">
            <span className="lang-ar">
              كل الصور المرفوعة أو المرتبطة بالمحتوى في مكان واحد. يمكنك رفع
              صورة جديدة، البحث عن صورة سابقة، ثم نسخ رابطها واستخدامه مرة أخرى.
            </span>
            <span className="lang-en">
              Find uploaded and in-use images, upload new media, and copy a URL
              for reuse anywhere in the website.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-chip">
            {visibleItems.length} / {items.length}
          </span>
          <button
            type="button"
            className="admin-btn-primary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <span className="admin-button-spinner" /> : null}
            <span className="lang-ar">
              {uploading ? "جاري الرفع" : "رفع صورة جديدة"}
            </span>
            <span className="lang-en">
              {uploading ? "Uploading" : "Upload image"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFile(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 border-b border-[color:var(--admin-border)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.35fr)_auto]">
        <label>
          <span className="admin-field-label">
            <span className="lang-ar">بحث في المكتبة</span>
            <span className="lang-en">Search library</span>
          </span>
          <input
            type="search"
            className="admin-input mt-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="اسم الصورة أو الرابط / Name or URL"
          />
        </label>
        <label>
          <span className="admin-field-label">
            <span className="lang-ar">التصنيف</span>
            <span className="lang-en">Category</span>
          </span>
          <select
            className="admin-input mt-1"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">الكل / All ({items.length})</option>
            {categories.map(([value, count]) => {
              const label = categoryLabel(value);
              return (
                <option key={value} value={value}>
                  {label.ar} / {label.en} ({count})
                </option>
              );
            })}
          </select>
        </label>
        <button
          type="button"
          className="admin-btn-secondary self-end"
          onClick={() => void loadLibrary()}
          disabled={loading}
        >
          <span className="lang-ar">تحديث المكتبة</span>
          <span className="lang-en">Refresh</span>
        </button>
      </div>

      {error ? (
        <div
          className="m-4 rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: "rgba(179, 51, 75, 0.28)",
            background: "rgba(179, 51, 75, 0.08)",
            color: "var(--admin-danger)",
          }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {copiedUrl ? (
        <div className="admin-media-library__toast" role="status">
          <span className="lang-ar">تم نسخ رابط الصورة</span>
          <span className="lang-en">Image URL copied</span>
        </div>
      ) : null}

      <div className="admin-card__body">
        {loading ? (
          <div className="admin-media-library__grid" aria-busy="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="admin-media-library__item animate-pulse"
              >
                <div className="aspect-[4/3] bg-[color:var(--admin-panel-soft)]" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-2/3 rounded bg-[color:var(--admin-border)]" />
                  <div className="h-8 rounded bg-[color:var(--admin-panel-soft)]" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="admin-empty-note text-center">
            <span className="lang-ar">
              لا توجد صور مطابقة. غيّر البحث أو ارفع صورة جديدة.
            </span>
            <span className="lang-en">
              No matching images. Change the filters or upload a new image.
            </span>
          </div>
        ) : (
          <div className="admin-media-library__grid">
            {visibleItems.map((item) => {
              const label = categoryLabel(item.category);
              const meta = [formatBytes(item.size), formatDate(item.updatedAt)]
                .filter(Boolean)
                .join(" · ");
              return (
                <section key={item.url} className="admin-media-library__item">
                  <div className="admin-media-library__preview">
                    <Image
                      src={previewUrl(item.url)}
                      alt={item.label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 22vw"
                      className="object-contain"
                      unoptimized
                    />
                    <span className="admin-media-library__category">
                      <span className="lang-ar">{label.ar}</span>
                      <span className="lang-en">{label.en}</span>
                    </span>
                  </div>
                  <div className="grid gap-2 p-3">
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-bold text-[color:var(--admin-text)]"
                        title={item.label}
                      >
                        {item.label}
                      </p>
                      <p className="truncate text-[11px] text-[color:var(--admin-text-faint)]">
                        {item.source}
                        {meta ? ` · ${meta}` : ""}
                      </p>
                    </div>
                    <input
                      className="admin-input font-mono text-[10px]"
                      value={item.url}
                      dir="ltr"
                      readOnly
                      aria-label={`Image URL: ${item.label}`}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="admin-btn-primary min-w-0 px-2 text-[11px]"
                        onClick={() => void copyUrl(item.url)}
                      >
                        <span className="lang-ar">نسخ الرابط</span>
                        <span className="lang-en">Copy URL</span>
                      </button>
                      <a
                        className="admin-btn-secondary min-w-0 px-2 text-[11px]"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="lang-ar">فتح الصورة</span>
                        <span className="lang-en">Open</span>
                      </a>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
