"use client";

import { ContentStatus } from "@/lib/prisma-enums";
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
  layout: PageLayoutMode;
};

type PageLayoutMode = "theme" | "full" | "blank" | "canvas" | "custom";

const STATUS_OPTIONS: Array<{ value: ContentStatus; ar: string; en: string }> =
  [
    { value: ContentStatus.DRAFT, ar: "مسودة", en: "Draft" },
    { value: ContentStatus.REVIEW, ar: "قيد المراجعة", en: "Review" },
    { value: ContentStatus.APPROVED, ar: "معتمدة", en: "Approved" },
    { value: ContentStatus.PUBLISHED, ar: "منشورة", en: "Published" },
    { value: ContentStatus.ARCHIVED, ar: "مؤرشفة", en: "Archived" },
  ];

function initialChromeOptions(htmlContent?: string): PageChromeOptions {
  const header = htmlContent?.match(/data-header="false"/) ? false : true;
  const footer = htmlContent?.match(/data-footer="false"/) ? false : true;
  const layoutMatch = htmlContent?.match(
    /data-layout="(theme|full|blank|canvas|custom)"/,
  )?.[1] as PageLayoutMode | undefined;
  return {
    showHeader: header,
    showFooter: footer,
    layout:
      layoutMatch ??
      (header && footer ? "theme" : !header && !footer ? "canvas" : "custom"),
  };
}

function stripUploadedWrapper(htmlContent: string) {
  const trimmed = htmlContent.trim();
  if (typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(trimmed, "text/html");
      const wrapper = doc.querySelector(
        "[data-custom-page-shell='true'], [data-uploaded-html='true']",
      );
      if (wrapper?.innerHTML?.trim()) return wrapper.innerHTML.trim();
    } catch {
      // Fall back to the string parser below.
    }
  }
  const match = trimmed.match(
    /^<div\b[^>]*(?:data-custom-page-shell|data-uploaded-html)="true"[^>]*>\s*([\s\S]*)\s*<\/div>\s*$/i,
  );
  return match?.[1]?.trim() ?? trimmed;
}

function layoutPreset(layout: PageLayoutMode): PageChromeOptions {
  if (layout === "theme") {
    return { layout, showHeader: true, showFooter: true };
  }
  if (layout === "full") {
    return { layout, showHeader: true, showFooter: true };
  }
  if (layout === "blank" || layout === "canvas") {
    return { layout, showHeader: false, showFooter: false };
  }
  return { layout, showHeader: true, showFooter: true };
}

function wrapCustomPage(
  htmlContent: string,
  chrome: PageChromeOptions,
  options: { uploaded?: boolean } = {},
) {
  const body = stripUploadedWrapper(htmlContent);
  const uploadedAttrs = options.uploaded ? ' data-uploaded-html="true"' : "";
  return `<div class="rv-custom-page-shell${options.uploaded ? " rv-uploaded-html-page" : ""}" data-custom-page-shell="true"${uploadedAttrs} data-layout="${chrome.layout}" data-header="${chrome.showHeader ? "true" : "false"}" data-footer="${chrome.showFooter ? "true" : "false"}">\n${body}\n</div>`;
}

export type CustomPageEditorFormProps = {
  mode: "create" | "edit";
  previewHref?: string;
  webhooks?: Array<{ token: string; name: string; isActive: boolean }>;
  serviceOptions?: Array<{
    slug: string;
    name: string;
    nameEn?: string | null;
    category?: string | null;
  }>;
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
    leadWebhookEnabled?: boolean;
    leadWebhookUrl?: string | null;
    leadWebhookSecret?: string | null;
    leadWebhookLabel?: string | null;
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
  serviceOptions = [],
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
      const htmlContent = formData.get("htmlContent");
      if (typeof htmlContent === "string") {
        formData.set(
          "htmlContent",
          wrapCustomPage(htmlContent, htmlChrome, {
            uploaded: editorMode === "html",
          }),
        );
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
          <span className="admin-field-label">Make Webhook لهذه الصفحة</span>
          <p className="text-muted-foreground text-xs">
            اختيار آمن طويل المدى: الفورم يحفظ الليد في CRM أولًا، ثم يرسل نسخة
            إلى Webhook هذه الصفحة فقط. لا تضع رابط Make داخل action مباشر في
            HTML.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--admin-border)] bg-white/70 px-4 py-3 text-sm font-semibold">
            <input
              type="checkbox"
              name="leadWebhookEnabled"
              defaultChecked={Boolean(initial?.leadWebhookEnabled)}
              className="h-4 w-4"
            />
            تفعيل Webhook مخصص لهذه الصفحة
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">اسم واضح للمصدر</span>
            <input
              name="leadWebhookLabel"
              defaultValue={initial?.leadWebhookLabel ?? ""}
              className="admin-input"
              placeholder="Make - Eid Offers"
            />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="admin-field-label">Make Webhook URL</span>
            <input
              name="leadWebhookUrl"
              dir="ltr"
              defaultValue={initial?.leadWebhookUrl ?? ""}
              className="admin-input"
              placeholder="https://hook.eu2.make.com/..."
            />
            <span className="text-muted-foreground text-[11px]">
              هذا الرابط لا يظهر للزائر. يتم استخدامه من السيرفر بعد نجاح حفظ
              الليد فقط.
            </span>
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="admin-field-label">Secret Header اختياري</span>
            <input
              name="leadWebhookSecret"
              dir="ltr"
              defaultValue={initial?.leadWebhookSecret ?? ""}
              className="admin-input"
              placeholder="optional secret sent as x-rejuvera-webhook-secret"
            />
          </label>
        </div>
      </section>

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

      <section className="custom-page-editor-form__layout">
        <div>
          <span className="admin-field-label">Page Layout</span>
          <h3>طريقة عرض الصفحة</h3>
          <p>
            استخدم Elementor Canvas أو Blank Page لصفحات الحملات الجاهزة حتى تظهر
            مثل التصميم بدون هيدر/فوتر أو مساحات من الثيم.
          </p>
        </div>
        <div className="custom-page-layout-options" role="radiogroup">
          {[
            {
              value: "theme",
              title: "Rejuvera Theme",
              hint: "هيدر وفوتر الموقع مع عرض طبيعي.",
            },
            {
              value: "full",
              title: "Full Width",
              hint: "هيدر وفوتر مع محتوى بعرض الصفحة.",
            },
            {
              value: "blank",
              title: "Blank Page",
              hint: "بدون هيدر وفوتر وبخلفية نظيفة.",
            },
            {
              value: "canvas",
              title: "Elementor Canvas",
              hint: "الأفضل للـ HTML الجاهز واللاندرز.",
            },
            {
              value: "custom",
              title: "Custom",
              hint: "تحكم يدوي في الهيدر والفوتر.",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={htmlChrome.layout === option.value ? "is-active" : ""}
            >
              <input
                type="radio"
                name="pageLayoutChoice"
                value={option.value}
                checked={htmlChrome.layout === option.value}
                onChange={() =>
                  setHtmlChrome((current) => {
                    if (option.value === "custom") {
                      return { ...current, layout: "custom" };
                    }
                    return {
                      ...current,
                      ...layoutPreset(option.value as PageLayoutMode),
                    };
                  })
                }
              />
              <span>
                <strong>{option.title}</strong>
                <small>{option.hint}</small>
              </span>
            </label>
          ))}
        </div>
        <div className="pagecraft-options">
          <label>
            <input
              type="checkbox"
              checked={htmlChrome.showHeader}
              onChange={(event) =>
                setHtmlChrome((current) => ({
                  ...current,
                  layout: "custom",
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
                  layout: "custom",
                  showFooter: event.target.checked,
                }))
              }
            />
            <span>Show site footer</span>
          </label>
        </div>
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
            serviceOptions={serviceOptions}
          />
        ) : (
          <div className="grid gap-3">
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
