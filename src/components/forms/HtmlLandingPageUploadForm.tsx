"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

type UploadState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: UploadState = { status: "idle", message: "" };

function fallbackSlug() {
  return `landing-${Date.now().toString(36)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function titleFromFile(fileName: string) {
  return (
    fileName
      .replace(/\.html?$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Landing Page"
  );
}

function stripUploadedWrapper(content: string) {
  const trimmed = content.trim();
  const match = trimmed.match(
    /^<div\b[^>]*data-uploaded-html="true"[^>]*>\s*([\s\S]*?)\s*<\/div>\s*$/i,
  );
  return match?.[1]?.trim() ?? trimmed;
}

function wrapUploadedHtml(
  content: string,
  options: { showHeader?: boolean; showFooter?: boolean } = {},
) {
  const showHeader = options.showHeader ?? true;
  const showFooter = options.showFooter ?? true;
  return `<div class="rv-uploaded-html-page" data-uploaded-html="true" data-header="${showHeader ? "true" : "false"}" data-footer="${showFooter ? "true" : "false"}">\n${stripUploadedWrapper(content)}\n</div>`;
}

function extractLandingHtml(source: string) {
  if (typeof DOMParser === "undefined") return wrapUploadedHtml(source);
  try {
    const doc = new DOMParser().parseFromString(source, "text/html");
    const styles = Array.from(doc.querySelectorAll("style"))
      .map((style) => style.textContent?.trim())
      .filter(Boolean)
      .map((css) => `<style>\n${css}\n</style>`)
      .join("\n");
    const body = doc.body?.innerHTML?.trim();
    if (body)
      return wrapUploadedHtml([styles, body].filter(Boolean).join("\n"));
  } catch {
    return wrapUploadedHtml(source);
  }
  return wrapUploadedHtml(source);
}

async function readHtmlFile(file: File) {
  const text = await file.text();
  return extractLandingHtml(text);
}

export function HtmlLandingPageUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("");
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<UploadState>(initialState);

  const publicUrl = useMemo(() => (slug ? `/p/${slug}` : "/p/..."), [slug]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) {
      setState({
        status: "error",
        message: "يرجى اختيار ملف HTML فقط.",
      });
      return;
    }

    const content = await readHtmlFile(file);
    const nextTitle = title || titleFromFile(file.name);
    const nextSlug = slug || slugify(nextTitle || file.name) || fallbackSlug();
    setFileName(file.name);
    setHtml(content);
    setTitle(nextTitle);
    setSlug(nextSlug);
    setState({
      status: "success",
      message: "تم تحميل الملف داخل النموذج. راجع البيانات ثم احفظ الصفحة.",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanSlug = slugify(slug);
    if (!html.trim()) {
      setState({ status: "error", message: "ارفع ملف HTML قبل الحفظ." });
      return;
    }
    if (!cleanSlug) {
      setState({
        status: "error",
        message: "اكتب رابطا بالإنجليزية مثل ramadan-campaign.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("slug", cleanSlug);
    formData.set("titleAr", title || cleanSlug);
    formData.set("titleEn", title || cleanSlug);
    formData.set("seoTitle", title || cleanSlug);
    formData.set("seoDescription", `Landing page: ${title || cleanSlug}`);
    formData.set("metaTitle", title || cleanSlug);
    formData.set("metaDescription", `Landing page: ${title || cleanSlug}`);
    formData.set(
      "htmlContent",
      wrapUploadedHtml(html, { showHeader, showFooter }),
    );
    formData.set("status", "PUBLISHED");
    formData.set("noindex", "false");

    setPending(true);
    setState(initialState);
    try {
      const response = await fetch("/api/admin/custom-pages", {
        method: "POST",
        body: formData,
        headers: { accept: "application/json", "x-requested-with": "fetch" },
      });
      const data = (await response.json().catch(() => null)) as
        | (UploadState & { id?: string | null })
        | null;
      if (!response.ok || data?.status === "error") {
        setState({
          status: "error",
          message: data?.message || "تعذر حفظ صفحة HTML.",
        });
        return;
      }
      setState({
        status: "success",
        message: `تم حفظ الصفحة. الرابط: /p/${cleanSlug}`,
      });
      if (data?.id) router.push(`/admin/pages/${data.id}` as Route);
      else router.refresh();
    } catch {
      setState({
        status: "error",
        message: "تعذر الاتصال بالخادم. حاول مرة أخرى.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="html-upload-card">
      <div>
        <span className="admin-card__subtitle">HTML upload</span>
        <h2>رفع Landing Page جاهزة</h2>
        <p>
          ارفع ملف HTML مصمم خارج لوحة التحكم، وسيتم حفظه كصفحة عامة لها رابط
          مستقل يصلح للحملات الإعلانية.
        </p>
      </div>

      <label className="html-upload-card__drop">
        <input
          type="file"
          accept=".html,text/html"
          onChange={(event) => void handleFileChange(event)}
        />
        <strong>{fileName || "اختيار ملف HTML"}</strong>
        <span>سيتم حفظ الصفحة على رابط مثل {publicUrl}</span>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">اسم الصفحة</span>
          <input
            required
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              setSlug((current) => current || slugify(value) || fallbackSlug());
            }}
            className="admin-input"
            placeholder="Ramadan campaign"
          />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">الرابط (Slug)</span>
          <input
            required
            minLength={2}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            className="admin-input"
            dir="ltr"
            placeholder="ramadan-campaign"
          />
        </label>
      </div>

      <div className="pagecraft-options">
        <label>
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(event) => setShowHeader(event.target.checked)}
          />
          <span>Show site header</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showFooter}
            onChange={(event) => setShowFooter(event.target.checked)}
          />
          <span>Show site footer</span>
        </label>
      </div>

      <div className="html-upload-card__actions">
        <button type="submit" className="admin-btn-primary" disabled={pending}>
          {pending ? "جاري الحفظ..." : "حفظ ونشر الصفحة"}
        </button>
        <span className="text-muted-foreground text-xs" dir="ltr">
          {publicUrl}
        </span>
      </div>

      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "error" ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
