"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  clearMediaSlotAction,
  setMediaSlotAction,
} from "@/app/admin/media/actions";
import { prepareImageUpload } from "@/lib/client-image-upload";

type Props = {
  slot: string;
  labelAr: string;
  labelEn: string;
  value: string;
  namespace?: "brand" | "media/uploads" | undefined;
  accept?: string | undefined;
};

/**
 * Inline editor for a single curated media slot.
 *
 * Lets the admin upload a new image directly to R2 (then store the resulting
 * URL), or paste/edit a URL by hand, or clear the slot back to the default.
 */
export function MediaSlotEditor({
  slot,
  labelAr,
  labelEn,
  value,
  namespace = "media/uploads",
  accept = "image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/x-icon,.ico",
}: Props) {
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCurrent(value);
    setDraft(value);
  }, [value]);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const preparedFile = await prepareImageUpload(file);
      const form = new FormData();
      form.append("file", preparedFile);
      form.append("namespace", namespace);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as
        | { ok: true; url: string; key: string }
        | { ok: false; error: string };
      if (!res.ok || !("ok" in data) || !data.ok) {
        throw new Error("error" in data ? data.error : "Upload failed");
      }
      setDraft(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-2"
      style={{ borderColor: "var(--admin-border)", background: "var(--admin-panel-soft)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        {(draft || current) ? (
          <Image
            src={draft || current}
            alt={labelAr}
            fill
            className="object-cover"
            sizes="240px"
            unoptimized
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-[color:var(--admin-text-faint)]">
            <span className="lang-ar">لا توجد صورة</span>
            <span className="lang-en">No image</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-[color:var(--admin-text)]">
        <span className="lang-ar">{labelAr}</span>
        <span className="lang-en">{labelEn}</span>
      </p>

      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        dir="ltr"
        className="admin-input mt-2 text-[11px]"
        placeholder="/media/..."
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="mt-1 text-[11px]" style={{ color: "#b3334b" }}>
          {error}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="admin-btn-secondary text-[11px]"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="lang-ar">جارٍ الرفع</span>
              <span className="lang-en">Uploading</span>
            </>
          ) : (
            <>
              <span className="lang-ar">رفع</span>
              <span className="lang-en">Upload</span>
            </>
          )}
        </button>
        <form
          action={setMediaSlotAction}
          onSubmit={() => setCurrent(draft)}
        >
          <input type="hidden" name="slot" value={slot} />
          <input type="hidden" name="value" value={draft} />
          <button
            type="submit"
            className="admin-btn-primary text-[11px]"
            disabled={!draft || draft === current}
          >
            <span className="lang-ar">حفظ</span>
            <span className="lang-en">Save</span>
          </button>
        </form>
        <form action={clearMediaSlotAction}>
          <input type="hidden" name="slot" value={slot} />
          <button type="submit" className="admin-btn-danger text-[11px]">
            <span className="lang-ar">إعادة افتراضي</span>
            <span className="lang-en">Reset</span>
          </button>
        </form>
      </div>
    </div>
  );
}
