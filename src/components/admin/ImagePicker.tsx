"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Namespace =
  | "doctors"
  | "services"
  | "devices"
  | "gallery"
  | "journal"
  | "brand"
  | "trust"
  | "payments"
  | "pages"
  | "media/uploads";

type ImagePickerProps = {
  /** Form field name. The picker writes the final URL here as a hidden input. */
  name: string;
  defaultValue?: string;
  namespace?: Namespace;
  /** Optional label rendered above the picker. */
  label?: string;
  helper?: string;
  required?: boolean;
  /** Aspect ratio for the crop frame (width / height). Default 1 (square). */
  aspect?: number;
  /** Show aspect ratio quick-select chips. Default true. */
  enableAspectChoice?: boolean;
  /** Show free-form aspect option. Default true. */
  allowFreeAspect?: boolean;
  onChange?: (value: string) => void;
};

type MediaLibraryItem = {
  url: string;
  label: string;
  category: string;
  source: string;
  updatedAt?: string;
};

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_OUTPUT_SIDE = 1920;
const ADMIN_MEDIA_PROXY = "/api/admin/media-proxy";

const ASPECT_PRESETS: Array<{
  id: string;
  label: string;
  value: number | null;
}> = [
  { id: "free", label: "Free", value: null },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
];

/**
 * Take an image source URL or data URL, a crop region (in source pixel
 * coordinates) and a rotation, and produce a JPEG/WebP blob.
 */
async function renderCroppedBlob(
  src: string,
  area: Area,
  rotation: number,
): Promise<Blob> {
  const image = await loadImage(src);
  const radian = (rotation * Math.PI) / 180;

  // Compute the bounding box of the rotated image so we can place it.
  const rotatedWidth =
    Math.abs(image.width * Math.cos(radian)) +
    Math.abs(image.height * Math.sin(radian));
  const rotatedHeight =
    Math.abs(image.width * Math.sin(radian)) +
    Math.abs(image.height * Math.cos(radian));

  const stage = document.createElement("canvas");
  stage.width = rotatedWidth;
  stage.height = rotatedHeight;
  const stageCtx = stage.getContext("2d");
  if (!stageCtx) throw new Error("Canvas 2D context unavailable.");
  stageCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  stageCtx.rotate(radian);
  stageCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const out = document.createElement("canvas");
  const scale = Math.min(
    1,
    MAX_OUTPUT_SIDE / Math.max(area.width, area.height),
  );
  out.width = Math.max(1, Math.round(area.width * scale));
  out.height = Math.max(1, Math.round(area.height * scale));
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas 2D context unavailable.");

  // Convert source-pixel area into rotated-stage coordinates: react-easy-crop
  // already returns pixels in the rotated stage space when we pass the same
  // rotation, so we copy directly.
  outCtx.drawImage(
    stage,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    out.width,
    out.height,
  );

  return await new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Empty crop output"))),
      "image/webp",
      0.84,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (isRemoteUrl(src)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function isRemoteUrl(src: string) {
  return /^https?:\/\//i.test(src);
}

function adminReadableImageUrl(src: string) {
  if (!isRemoteUrl(src)) return src;
  return `${ADMIN_MEDIA_PROXY}?url=${encodeURIComponent(src)}`;
}

export function ImagePicker({
  name,
  defaultValue = "",
  namespace = "media/uploads",
  label,
  helper,
  required,
  aspect: aspectProp = 1,
  enableAspectChoice = true,
  allowFreeAspect = true,
  onChange,
}: ImagePickerProps) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | null>(aspectProp);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaLibraryItem[]>([]);
  const [libraryStatus, setLibraryStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("all");

  const updateValue = useCallback(
    (next: string) => {
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (sourceObjectUrlRef.current) {
        URL.revokeObjectURL(sourceObjectUrlRef.current);
      }
    };
  }, []);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  function openPicker() {
    fileInputRef.current?.click();
  }

  async function openLibrary() {
    setLibraryOpen(true);
    if (libraryStatus === "ready" || libraryStatus === "loading") return;
    setLibraryStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/admin/media-library", {
        headers: { accept: "application/json" },
      });
      const payload = (await response.json()) as
        | { ok: true; items: MediaLibraryItem[] }
        | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error("error" in payload ? payload.error : "Library failed");
      }
      setLibraryItems(payload.items);
      setLibraryStatus("ready");
    } catch (err) {
      setLibraryStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Could not load the media library.",
      );
    }
  }

  const libraryCategories = useMemo(() => {
    return Array.from(new Set(libraryItems.map((item) => item.category))).sort(
      (left, right) => left.localeCompare(right),
    );
  }, [libraryItems]);

  const filteredLibraryItems = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return libraryItems.filter((item) => {
      if (libraryCategory !== "all" && item.category !== libraryCategory) {
        return false;
      }
      if (!query) return true;
      return `${item.label} ${item.category} ${item.source} ${item.url}`
        .toLowerCase()
        .includes(query);
    });
  }, [libraryCategory, libraryItems, librarySearch]);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("الملف ليس صورة / Not an image file.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("Image is too large. Please choose an image under 12 MB.");
      return;
    }
    try {
      if (sourceObjectUrlRef.current) {
        URL.revokeObjectURL(sourceObjectUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      sourceObjectUrlRef.current = objectUrl;
      setEditorSource(objectUrl);
      setRotation(0);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setEditorOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Read failed");
    }
  }

  async function uploadBlob(
    blob: Blob,
    suggestedName: string,
  ): Promise<string> {
    const form = new FormData();
    form.append("file", blob, suggestedName);
    form.append("namespace", namespace);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as
      | { ok: true; url: string; key: string }
      | { ok: false; error: string };
    if (!res.ok || !("ok" in data) || !data.ok) {
      throw new Error("error" in data ? data.error : "Upload failed");
    }
    return data.url;
  }

  async function handleApply() {
    if (!editorSource) return;
    setBusy(true);
    setError(null);
    try {
      const readableSource = adminReadableImageUrl(editorSource);
      const area = croppedArea ?? { x: 0, y: 0, width: 0, height: 0 };
      const blob =
        area.width > 0 && area.height > 0
          ? await renderCroppedBlob(readableSource, area, rotation)
          : await fetch(readableSource).then((r) => {
              if (!r.ok) throw new Error("Could not read image");
              return r.blob();
            });
      const url = await uploadBlob(blob, `image-${Date.now()}.webp`);
      updateValue(url);
      setEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function handleEditExisting() {
    if (!value) return;
    setEditorSource(value);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setEditorOpen(true);
  }

  const aspectChoices = allowFreeAspect
    ? ASPECT_PRESETS
    : ASPECT_PRESETS.filter((preset) => preset.value !== null);

  return (
    <div className="rv-image-picker">
      {label ? (
        <label htmlFor={inputId} className="admin-field-label mb-1 block">
          {label}
        </label>
      ) : null}

      <input type="hidden" name={name} value={value} required={required} />
      <input
        ref={fileInputRef}
        type="file"
        accept={DEFAULT_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <div className="rv-image-picker__preview">
        {value ? (
          <Image
            src={value}
            alt="preview"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96vw, 360px"
            unoptimized
          />
        ) : (
          <div className="rv-image-picker__placeholder">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="lang-ar">لا توجد صورة</span>
            <span className="lang-en">No image</span>
          </div>
        )}
      </div>

      <div className="rv-image-picker__actions">
        <button
          type="button"
          id={inputId}
          className="admin-btn-primary"
          onClick={openPicker}
          disabled={busy}
        >
          <span className="lang-ar">رفع صورة</span>
          <span className="lang-en">Upload image</span>
        </button>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => void openLibrary()}
          disabled={busy}
        >
          <span className="lang-ar">اختيار من المكتبة</span>
          <span className="lang-en">Choose from library</span>
        </button>
        {value ? (
          <>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleEditExisting}
              disabled={busy}
            >
              <span className="lang-ar">قص / تدوير</span>
              <span className="lang-en">Crop / rotate</span>
            </button>
            <button
              type="button"
              className="admin-btn-danger"
              onClick={() => updateValue("")}
              disabled={busy}
            >
              <span className="lang-ar">إزالة</span>
              <span className="lang-en">Remove</span>
            </button>
          </>
        ) : null}
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => updateValue(event.target.value)}
        dir="ltr"
        placeholder="https://... or /media/..."
        className="admin-input mt-2 text-[11px]"
      />

      {helper ? (
        <p className="mt-1 text-[11px] text-[color:var(--admin-text-faint)]">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-[11px]" style={{ color: "#b3334b" }}>
          {error}
        </p>
      ) : null}

      {libraryOpen ? (
        <div
          className="rv-image-picker__library"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="rv-image-picker__editor-backdrop"
            aria-label="Close media library"
            onClick={() => setLibraryOpen(false)}
          />
          <div className="rv-image-picker__library-panel">
            <header className="rv-image-picker__editor-header">
              <div>
                <h3>
                  <span className="lang-ar">اختيار صورة من المكتبة</span>
                  <span className="lang-en">Choose from media library</span>
                </h3>
                <p className="rv-image-picker__library-subtitle">
                  <span className="lang-ar">
                    صور مرفوعة سابقًا ومستخدمة داخل الموقع.
                  </span>
                  <span className="lang-en">
                    Previously uploaded and site-used images.
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setLibraryOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="rv-image-picker__library-toolbar">
              <input
                value={librarySearch}
                onChange={(event) => setLibrarySearch(event.target.value)}
                placeholder="بحث باسم الصورة أو المصدر / Search media"
                className="admin-input"
              />
              <div className="rv-image-picker__library-chips" role="list">
                <button
                  type="button"
                  className={libraryCategory === "all" ? "is-active" : ""}
                  onClick={() => setLibraryCategory("all")}
                >
                  الكل
                </button>
                {libraryCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={libraryCategory === category ? "is-active" : ""}
                    onClick={() => setLibraryCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="rv-image-picker__library-body">
              {libraryStatus === "loading" ? (
                <p className="rv-image-picker__library-state">
                  جاري تحميل مكتبة الصور...
                </p>
              ) : libraryStatus === "error" ? (
                <p className="rv-image-picker__library-state is-error">
                  تعذر تحميل مكتبة الصور. يمكنك الاستمرار بالرفع أو الرابط اليدوي.
                </p>
              ) : filteredLibraryItems.length === 0 ? (
                <p className="rv-image-picker__library-state">
                  لا توجد صور مطابقة للبحث الحالي.
                </p>
              ) : (
                <div className="rv-image-picker__library-grid">
                  {filteredLibraryItems.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      className={`rv-image-picker__library-card ${
                        value === item.url ? "is-selected" : ""
                      }`}
                      onClick={() => {
                        updateValue(item.url);
                        setLibraryOpen(false);
                      }}
                    >
                      <span className="rv-image-picker__library-thumb">
                        <Image
                          src={item.url}
                          alt={item.label}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 44vw, 160px"
                          unoptimized
                        />
                      </span>
                      <span className="rv-image-picker__library-title">
                        {item.label}
                      </span>
                      <span className="rv-image-picker__library-meta">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {editorOpen && editorSource ? (
        <div
          className="rv-image-picker__editor"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="rv-image-picker__editor-backdrop"
            aria-label="Close"
            onClick={() => (busy ? undefined : setEditorOpen(false))}
          />
          <div className="rv-image-picker__editor-panel">
            <header className="rv-image-picker__editor-header">
              <h3>
                <span className="lang-ar">تعديل الصورة</span>
                <span className="lang-en">Edit image</span>
              </h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => (busy ? undefined : setEditorOpen(false))}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="rv-image-picker__stage">
              <Cropper
                image={adminReadableImageUrl(editorSource)}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect ?? undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
                cropShape="rect"
                restrictPosition
              />
            </div>

            <div className="rv-image-picker__controls">
              {enableAspectChoice ? (
                <div className="admin-segmented">
                  {aspectChoices.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={aspect === preset.value ? "is-active" : ""}
                      onClick={() => setAspect(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="rv-image-picker__slider">
                <label>
                  <span className="lang-ar">تكبير</span>
                  <span className="lang-en">Zoom</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </div>

              <div className="rv-image-picker__slider">
                <label>
                  <span className="lang-ar">تدوير</span>
                  <span className="lang-en">Rotate</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                />
              </div>

              <div className="rv-image-picker__quick-rotate">
                <button
                  type="button"
                  className="admin-btn-secondary text-xs"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  90°
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary text-xs"
                  onClick={() => setRotation(0)}
                >
                  <span className="lang-ar">إعادة</span>
                  <span className="lang-en">Reset</span>
                </button>
              </div>
            </div>

            <footer className="rv-image-picker__editor-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setEditorOpen(false)}
                disabled={busy}
              >
                <span className="lang-ar">إلغاء</span>
                <span className="lang-en">Cancel</span>
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleApply}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="lang-ar">جارٍ الحفظ...</span>
                    <span className="lang-en">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="lang-ar">حفظ ورفع</span>
                    <span className="lang-en">Save & upload</span>
                  </>
                )}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
