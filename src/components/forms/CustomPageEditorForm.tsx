"use client";

import { ContentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { CustomPageBuilder } from "@/components/forms/CustomPageBuilder";

type CustomPageActionState = {
  status: "idle" | "success" | "error";
  message: string;
  id?: string | null;
};

const initialState: CustomPageActionState = { status: "idle", message: "" };

const STATUS_OPTIONS: Array<{ value: ContentStatus; ar: string; en: string }> =
  [
    { value: ContentStatus.DRAFT, ar: "مسودة", en: "Draft" },
    { value: ContentStatus.REVIEW, ar: "قيد المراجعة", en: "Review" },
    { value: ContentStatus.APPROVED, ar: "معتمدة", en: "Approved" },
    { value: ContentStatus.PUBLISHED, ar: "منشورة", en: "Published" },
    { value: ContentStatus.ARCHIVED, ar: "مؤرشفة", en: "Archived" },
  ];

export type CustomPageEditorFormProps = {
  mode: "create" | "edit";
  previewHref?: string;
  initial?: {
    id: string;
    slug: string;
    titleAr: string;
    titleEn?: string | null;
    htmlContent: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status: ContentStatus;
    noindex: boolean;
  };
};

export function CustomPageEditorForm({
  mode,
  previewHref,
  initial,
}: CustomPageEditorFormProps) {
  const router = useRouter();
  const [state, setState] = useState<CustomPageActionState>(initialState);
  const [pending, setPending] = useState(false);
  const [editorMode, setEditorMode] = useState<"builder" | "html">(() =>
    initial?.htmlContent && !initial.htmlContent.includes("rv-builder-page")
      ? "html"
      : "builder",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/custom-pages", {
        method: mode === "create" ? "POST" : "PUT",
        body: new FormData(event.currentTarget),
      });
      const data = (await response.json()) as CustomPageActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        if (mode === "create" && data.id) {
          router.push(`/admin/pages/${data.id}`);
        } else {
          router.refresh();
        }
      }
    } catch {
      setState({
        status: "error",
        message: "تعذّر الاتصال بالخادم. احفظي عملك ثم حاولي مرة أخرى.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="custom-page-editor-form">
      {mode === "edit" && initial ? (
        <>
          <input type="hidden" name="id" value={initial.id} />
          <input type="hidden" name="oldSlug" value={initial.slug} />
        </>
      ) : null}

      <div className="custom-page-editor-form__top">
        <div>
          <p className="custom-page-editor-form__eyebrow">
            {mode === "create" ? "PageCraft" : `/p/${initial?.slug ?? ""}`}
          </p>
          <h2>
            {mode === "create"
              ? "إنشاء Landing Page جديدة"
              : "تعديل الصفحة المخصصة"}
          </h2>
          <p>
            حفظ هذه الصفحة يتم مباشرة في قاعدة البيانات، والمعاينة داخل البيلدر
            تتحدث فور تعديل المكونات.
          </p>
        </div>
        <div className="custom-page-editor-form__actions">
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-secondary"
            >
              معاينة الصفحة
            </a>
          ) : null}
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={pending}
          >
            {pending
              ? "جار الحفظ..."
              : mode === "create"
                ? "حفظ الصفحة"
                : "حفظ التعديلات"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">المسار (Slug)</span>
          <input
            name="slug"
            required
            minLength={2}
            maxLength={80}
            defaultValue={initial?.slug ?? ""}
            placeholder="about-us"
            className="admin-input"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="slug must be lowercase letters/numbers/hyphens"
          />
          <span className="text-muted-foreground text-[11px]">
            سيظهر على /p/&lt;slug&gt;
          </span>
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">الحالة</span>
          <select
            name="status"
            defaultValue={initial?.status ?? ContentStatus.DRAFT}
            className="admin-input"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.ar} · {option.en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">العنوان (عربي)</span>
          <input
            name="titleAr"
            required
            defaultValue={initial?.titleAr ?? ""}
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">العنوان (إنجليزي)</span>
          <input
            name="titleEn"
            defaultValue={initial?.titleEn ?? ""}
            className="admin-input"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">SEO Title</span>
          <input
            name="seoTitle"
            defaultValue={initial?.seoTitle ?? ""}
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">SEO Description</span>
          <input
            name="seoDescription"
            defaultValue={initial?.seoDescription ?? ""}
            className="admin-input"
          />
        </label>
      </div>

      <section className="grid gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="admin-field-label">محتوى الصفحة</span>
          <div className="admin-segmented">
            <button
              type="button"
              className={editorMode === "builder" ? "is-active" : ""}
              onClick={() => setEditorMode("builder")}
            >
              PageCraft
            </button>
            <button
              type="button"
              className={editorMode === "html" ? "is-active" : ""}
              onClick={() => setEditorMode("html")}
            >
              HTML
            </button>
          </div>
        </div>
        {editorMode === "builder" ? (
          <CustomPageBuilder
            name="htmlContent"
            defaultValue={initial?.htmlContent ?? ""}
          />
        ) : (
          <textarea
            name="htmlContent"
            required
            rows={22}
            dir="ltr"
            defaultValue={initial?.htmlContent ?? ""}
            className="admin-input font-mono text-xs leading-relaxed"
            placeholder="<section>...</section>"
          />
        )}
        <span className="text-muted-foreground text-[11px]">
          {editorMode === "builder"
            ? "يتم حفظ الصفحة كـ HTML آمن بعد ترتيب البلوكات وتعديل خصائصها."
            : "محرر HTML يحافظ على الصفحات المستوردة. يتم تنظيف السكربتات الخطرة عند العرض العام."}
        </span>
      </section>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="noindex"
          value="true"
          defaultChecked={initial?.noindex ?? false}
          className="h-4 w-4"
        />
        <span>منع الفهرسة (noindex)</span>
      </label>

      <div className="custom-page-editor-form__savebar">
        <button type="submit" className="admin-btn-primary" disabled={pending}>
          {mode === "create" ? "إنشاء صفحة" : "حفظ التغييرات"}
        </button>
        {state.message ? (
          <span
            className={`text-sm ${
              state.status === "error" ? "text-red-500" : "text-emerald-500"
            }`}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
