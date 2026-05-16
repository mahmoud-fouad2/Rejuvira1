"use client";

import { useActionState } from "react";

import {
  createCustomPageAction,
  updateCustomPageAction,
  type CustomPageActionState,
} from "@/app/admin/pages/actions";
import { ContentStatus } from "@prisma/client";

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
  initial,
}: CustomPageEditorFormProps) {
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createCustomPageAction : updateCustomPageAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      {mode === "edit" && initial ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">المسار (Slug)</span>
            <span className="lang-en">Slug</span>
          </span>
          <input
            name="slug"
            required
            defaultValue={initial?.slug ?? ""}
            placeholder="about-us"
            className="admin-input"
            pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            title="slug must be lowercase letters/numbers/hyphens"
          />
          <span className="text-[11px] text-muted-foreground">
            <span className="lang-ar">سيظهر على /p/&lt;slug&gt;</span>
            <span className="lang-en">Will appear at /p/&lt;slug&gt;</span>
          </span>
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الحالة</span>
            <span className="lang-en">Status</span>
          </span>
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
          <span className="admin-field-label">
            <span className="lang-ar">العنوان (عربي)</span>
            <span className="lang-en">Title (Arabic)</span>
          </span>
          <input
            name="titleAr"
            required
            defaultValue={initial?.titleAr ?? ""}
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">العنوان (إنجليزي)</span>
            <span className="lang-en">Title (English)</span>
          </span>
          <input
            name="titleEn"
            defaultValue={initial?.titleEn ?? ""}
            className="admin-input"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">SEO Title</span>
            <span className="lang-en">SEO Title</span>
          </span>
          <input
            name="seoTitle"
            defaultValue={initial?.seoTitle ?? ""}
            className="admin-input"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">SEO Description</span>
            <span className="lang-en">SEO Description</span>
          </span>
          <input
            name="seoDescription"
            defaultValue={initial?.seoDescription ?? ""}
            className="admin-input"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="admin-field-label">
          <span className="lang-ar">محتوى HTML</span>
          <span className="lang-en">HTML content</span>
        </span>
        <textarea
          name="htmlContent"
          required
          defaultValue={initial?.htmlContent ?? ""}
          rows={14}
          className="admin-input font-mono text-[12.5px] leading-relaxed"
          placeholder="<section><h1>Hello</h1><p>...</p></section>"
        />
        <span className="text-[11px] text-muted-foreground">
          <span className="lang-ar">
            يُسمح بوسوم HTML الآمنة فقط — يتم تنقية المحتوى قبل العرض.
          </span>
          <span className="lang-en">
            Only safe HTML is allowed; content is sanitized before render.
          </span>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="noindex"
          value="true"
          defaultChecked={initial?.noindex ?? false}
          className="h-4 w-4"
        />
        <span>
          <span className="lang-ar">منع الفهرسة (noindex)</span>
          <span className="lang-en">No-index</span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <button type="submit" className="admin-btn-primary" disabled={pending}>
          <span className="lang-ar">
            {mode === "create" ? "إنشاء صفحة" : "حفظ التغييرات"}
          </span>
          <span className="lang-en">
            {mode === "create" ? "Create page" : "Save changes"}
          </span>
        </button>
        {state.message ? (
          <span
            className={`text-sm ${state.status === "error" ? "text-red-500" : "text-emerald-500"}`}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
