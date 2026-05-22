"use client";

import { ContentStatus } from "@prisma/client";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { CustomPageBuilder } from "@/components/forms/CustomPageBuilder";

type CustomPageActionState = {
  status: "idle" | "success" | "error";
  message: string;
  id?: string | null;
};

const initialState: CustomPageActionState = { status: "idle", message: "" };

type PageChromeOptions = {
  showHeader: boolean;
  showFooter: boolean;
};

const STATUS_OPTIONS: Array<{ value: ContentStatus; ar: string; en: string }> =
  [
    { value: ContentStatus.DRAFT, ar: "مسودة", en: "Draft" },
    { value: ContentStatus.REVIEW, ar: "قيد المراجعة", en: "Review" },
    { value: ContentStatus.APPROVED, ar: "معتمدة", en: "Approved" },
    { value: ContentStatus.PUBLISHED, ar: "منشورة", en: "Published" },
    { value: ContentStatus.ARCHIVED, ar: "مؤرشفة", en: "Archived" },
  ];

function initialChromeOptions(htmlContent?: string): PageChromeOptions {
  return {
    showHeader: htmlContent?.match(/data-header="false"/) ? false : true,
    showFooter: htmlContent?.match(/data-footer="false"/) ? false : true,
  };
}

function stripUploadedWrapper(htmlContent: string) {
  const trimmed = htmlContent.trim();
  const match = trimmed.match(
    /^<div\b[^>]*data-uploaded-html="true"[^>]*>\s*([\s\S]*?)\s*<\/div>\s*$/i,
  );
  return match?.[1]?.trim() ?? trimmed;
}

function wrapHtmlPage(htmlContent: string, chrome: PageChromeOptions) {
  const body = stripUploadedWrapper(htmlContent);
  return `<div class="rv-uploaded-html-page" data-uploaded-html="true" data-header="${chrome.showHeader ? "true" : "false"}" data-footer="${chrome.showFooter ? "true" : "false"}">\n${body}\n</div>`;
}

export type CustomPageEditorFormProps = {
  mode: "create" | "edit";
  previewHref?: string;
  webhooks?: Array<{ token: string; name: string; isActive: boolean }>;
  initial?: {
    id: string;
    slug: string;
    titleAr: string;
    titleEn?: string | null;
    htmlContent: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: readonly string[] | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    seoSlug?: string | null;
    hashtags?: readonly string[] | null;
    formConfig?: unknown;
    status: ContentStatus;
    noindex: boolean;
  };
};

function listValue(value?: readonly string[] | null) {
  return value?.filter(Boolean).join(", ") ?? "";
}

function jsonValue(value: unknown) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function CustomPageEditorForm({
  mode,
  previewHref,
  webhooks = [],
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
  const [htmlChrome, setHtmlChrome] = useState<PageChromeOptions>(() =>
    initialChromeOptions(initial?.htmlContent),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialState);

    try {
      const formData = new FormData(event.currentTarget);
      if (editorMode === "html") {
        const htmlContent = formData.get("htmlContent");
        if (typeof htmlContent === "string") {
          formData.set("htmlContent", wrapHtmlPage(htmlContent, htmlChrome));
        }
      }
      const response = await fetch("/api/admin/custom-pages", {
        method: mode === "create" ? "POST" : "PUT",
        body: formData,
      });
      const data = (await response.json()) as CustomPageActionState;
      setState(data);
      if (response.ok && data.status === "success") {
        if (mode === "create" && data.id) {
          router.push(`/admin/pages/${data.id}` as Route);
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

      <section className="custom-page-editor-form__seo">
        <div>
          <span className="admin-field-label">SEO المتقدم</span>
          <p className="text-muted-foreground text-xs">
            هذه الحقول تتحكم في عنوان المتصفح، وصف نتائج البحث، وبيانات المشاركة
            في الشبكات الاجتماعية.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="admin-field-label">Meta Title</span>
            <input
              name="metaTitle"
              maxLength={160}
              defaultValue={initial?.metaTitle ?? initial?.seoTitle ?? ""}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">SEO Slug</span>
            <input
              name="seoSlug"
              dir="ltr"
              maxLength={80}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={initial?.seoSlug ?? ""}
              className="admin-input"
              placeholder="campaign-rhinoplasty"
            />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="admin-field-label">Meta Description</span>
          <textarea
            name="metaDescription"
            rows={3}
            maxLength={500}
            defaultValue={
              initial?.metaDescription ?? initial?.seoDescription ?? ""
            }
            className="admin-input"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="admin-field-label">Keywords</span>
            <textarea
              name="keywords"
              rows={3}
              defaultValue={listValue(initial?.keywords)}
              className="admin-input"
              placeholder="تجميل الأنف, الرياض, ريجوفيرا"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">Hashtags</span>
            <textarea
              name="hashtags"
              rows={3}
              defaultValue={listValue(initial?.hashtags)}
              className="admin-input"
              placeholder="#ريجوفيرا, #تجميل_الأنف"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="admin-field-label">OG Title</span>
            <input
              name="ogTitle"
              maxLength={160}
              defaultValue={initial?.ogTitle ?? ""}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">OG Image</span>
            <input
              name="ogImage"
              dir="ltr"
              type="url"
              defaultValue={initial?.ogImage ?? ""}
              className="admin-input"
              placeholder="https://rejuvera.sa/media/..."
            />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="admin-field-label">OG Description</span>
          <textarea
            name="ogDescription"
            rows={3}
            maxLength={500}
            defaultValue={initial?.ogDescription ?? ""}
            className="admin-input"
          />
        </label>
        <details className="custom-page-editor-form__advanced">
          <summary>تهيئة الفورم المتقدمة JSON</summary>
          <textarea
            name="formConfig"
            rows={8}
            dir="ltr"
            className="admin-input font-mono text-xs leading-relaxed"
            defaultValue={jsonValue(initial?.formConfig)}
            placeholder='{"fields":[{"name":"phone","type":"phone","required":true}]}'
          />
        </details>
      </section>

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
            webhooks={webhooks}
          />
        ) : (
          <div className="grid gap-3">
            <div className="pagecraft-options">
              <label>
                <input
                  type="checkbox"
                  checked={htmlChrome.showHeader}
                  onChange={(event) =>
                    setHtmlChrome((current) => ({
                      ...current,
                      showHeader: event.target.checked,
                    }))
                  }
                />
                <span>Show site header</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={htmlChrome.showFooter}
                  onChange={(event) =>
                    setHtmlChrome((current) => ({
                      ...current,
                      showFooter: event.target.checked,
                    }))
                  }
                />
                <span>Show site footer</span>
              </label>
            </div>
            <textarea
              name="htmlContent"
              required
              rows={22}
              dir="ltr"
              defaultValue={stripUploadedWrapper(initial?.htmlContent ?? "")}
              className="admin-input font-mono text-xs leading-relaxed"
              placeholder="<section>...</section>"
            />
          </div>
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
