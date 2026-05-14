"use client";

import { useCallback, useId, useRef, useState } from "react";

type Namespace =
  | "doctors"
  | "services"
  | "devices"
  | "gallery"
  | "journal"
  | "brand"
  | "trust"
  | "payments"
  | "media/uploads";

type ImageUploaderProps = {
  name: string;
  defaultValue?: string;
  namespace?: Namespace;
  label?: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  accept?: string;
};

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/svg+xml";

export function ImageUploader({
  name,
  defaultValue = "",
  namespace = "media/uploads",
  label,
  placeholder = "https://...",
  helper,
  required,
  accept = DEFAULT_ACCEPT,
}: ImageUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "uploading"; progress?: number }
    | { kind: "error"; message: string }
    | { kind: "success"; key: string }
  >({ kind: "idle" });

  const handleSelect = useCallback(
    async (file: File) => {
      setStatus({ kind: "uploading" });
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("namespace", namespace);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = (await response.json()) as
          | { ok: true; url: string; key: string }
          | { ok: false; error: string };
        if (!response.ok || !("ok" in data) || !data.ok) {
          throw new Error(
            "error" in data && data.error ? data.error : "Upload failed",
          );
        }
        setValue(data.url);
        setStatus({ kind: "success", key: data.key });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "تعذّر رفع الملف.";
        setStatus({ kind: "error", message });
      }
    },
    [namespace],
  );

  return (
    <div className="grid gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-ink-strong text-xs font-semibold tracking-[0.18em] uppercase"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type="text"
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        required={required}
        dir="ltr"
        className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
      />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleSelect(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status.kind === "uploading"}
          className="border-line bg-surface text-ink hover:border-accent/30 disabled:opacity-60 rounded-full border px-4 py-2 text-xs font-semibold transition"
        >
          {status.kind === "uploading" ? "جارٍ الرفع..." : "رفع ملف إلى R2"}
        </button>
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-ink-soft hover:text-ink-strong text-xs underline"
          >
            معاينة
          </a>
        ) : null}
        {status.kind === "success" ? (
          <span className="text-emerald text-xs">تم الرفع: {status.key}</span>
        ) : null}
        {status.kind === "error" ? (
          <span className="text-burgundy text-xs">{status.message}</span>
        ) : null}
      </div>
      {helper ? (
        <p className="text-ink-faint text-[11px] leading-6">{helper}</p>
      ) : null}
    </div>
  );
}
