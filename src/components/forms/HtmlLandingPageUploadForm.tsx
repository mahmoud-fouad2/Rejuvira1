"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type UploadState = {
  status: "idle" | "success" | "error";
  message: string;
};

type PageLayoutMode = "theme" | "full" | "blank" | "canvas" | "custom";

const initialState: UploadState = { status: "idle", message: "" };
const MAX_HTML_CONTENT_CHARS = 8_000_000;

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

function wrapUploadedHtml(
  content: string,
  options: {
    showHeader?: boolean;
    showFooter?: boolean;
    layout?: PageLayoutMode;
  } = {},
) {
  const showHeader = options.showHeader ?? false;
  const showFooter = options.showFooter ?? false;
  const layout = options.layout ?? "canvas";
  return `<div class="rv-custom-page-shell rv-uploaded-html-page" data-custom-page-shell="true" data-uploaded-html="true" data-layout="${layout}" data-header="${showHeader ? "true" : "false"}" data-footer="${showFooter ? "true" : "false"}">\n${stripUploadedWrapper(content)}\n</div>`;
}

function layoutPreset(layout: PageLayoutMode) {
  if (layout === "theme" || layout === "full") {
    return { layout, showHeader: true, showFooter: true };
  }
  if (layout === "blank" || layout === "canvas") {
    return { layout, showHeader: false, showFooter: false };
  }
  return { layout, showHeader: false, showFooter: false };
}

function extractLandingHtml(source: string) {
  if (typeof DOMParser === "undefined") return source;
  try {
    const doc = new DOMParser().parseFromString(source, "text/html");
    const styles = Array.from(doc.querySelectorAll("style"))
      .map((style) => style.textContent?.trim())
      .filter(Boolean)
      .map((css) => `<style>\n${css}\n</style>`)
      .join("\n");
    const stylesheets = Array.from(
      doc.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]'),
    )
      .map((link) => {
        const href = link.getAttribute("href")?.trim();
        if (!href || !/^(https?:\/\/|\/)/i.test(href)) return "";
        const media = link.getAttribute("media")?.trim();
        return `<link rel="stylesheet" href="${href.replace(/"/g, "&quot;")}"${media ? ` media="${media.replace(/"/g, "&quot;")}"` : ""}>`;
      })
      .filter(Boolean)
      .join("\n");
    const body = doc.body?.innerHTML?.trim();
    const bodyClass = doc.body?.getAttribute("class")?.trim();
    const bodyStyle = doc.body?.getAttribute("style")?.trim();
    if (body) {
      const bodyAttrs = [
        bodyClass ? `class="${bodyClass.replace(/"/g, "&quot;")}"` : "",
        bodyStyle ? `style="${bodyStyle.replace(/"/g, "&quot;")}"` : "",
      ]
        .filter(Boolean)
        .join(" ");
      const bodyMarkup = bodyAttrs ? `<div ${bodyAttrs}>\n${body}\n</div>` : body;
      return [stylesheets, styles, bodyMarkup].filter(Boolean).join("\n");
    }
  } catch {
    return source;
  }
  return source;
}

async function readHtmlFile(file: File) {
  const text = await file.text();
  return extractLandingHtml(text);
}

export function HtmlLandingPageUploadForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("");
  const [layout, setLayout] = useState<PageLayoutMode>("canvas");
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<UploadState>(initialState);

  const publicUrl = useMemo(() => (slug ? `/p/${slug}` : "/p/..."), [slug]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (content.length > MAX_HTML_CONTENT_CHARS) {
      setState({
        status: "error",
        message: `حجم ملف HTML بعد التجهيز أكبر من ${(MAX_HTML_CONTENT_CHARS / 1_000_000).toFixed(1)}MB. ارفع الصور كروابط خارجية بدل تضمينها داخل الملف.`,
      });
      return;
    }

    const nextTitle = (title || titleFromFile(file.name)).slice(0, 160);
    const nextSlug =
      slug || slugify(file.name) || slugify(nextTitle) || fallbackSlug();
    setFileName(file.name);
    setHtml(content);
    setTitle(nextTitle);
    setSlug(nextSlug);
    setState({
      status: "success",
      message:
        "تم تحميل الملف داخل النموذج. راجع اسم الصفحة والرابط ثم احفظ الصفحة.",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanSlug = slugify(slug);
    const wrappedHtml = wrapUploadedHtml(html, {
      showHeader,
      showFooter,
      layout,
    });

    if (!html.trim()) {
      setState({ status: "error", message: "ارفع ملف HTML قبل الحفظ." });
      return;
    }
    if (!cleanSlug) {
      setState({
        status: "error",
        message: "اكتب رابطًا بالإنجليزية مثل ramadan-campaign.",
      });
      return;
    }
    if (wrappedHtml.length > MAX_HTML_CONTENT_CHARS) {
      setState({
        status: "error",
        message: `حجم صفحة HTML أكبر من ${(MAX_HTML_CONTENT_CHARS / 1_000_000).toFixed(1)}MB. قلل CSS/JS المضمن أو استخدم روابط للصور.`,
      });
      return;
    }

    const pageTitle = title || cleanSlug;
    const formData = new FormData();
    formData.set("slug", cleanSlug);
    formData.set("titleAr", pageTitle);
    formData.set("titleEn", pageTitle);
    formData.set("seoTitle", pageTitle);
    formData.set("seoDescription", `Landing page: ${pageTitle}`);
    formData.set("metaTitle", pageTitle);
    formData.set("metaDescription", `Landing page: ${pageTitle}`);
    formData.set("keywords", "");
    formData.set("ogTitle", "");
    formData.set("ogDescription", "");
    formData.set("ogImage", "");
    formData.set("seoSlug", "");
    formData.set("hashtags", "");
    formData.set("formConfig", "");
    formData.set("htmlContent", wrappedHtml);
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

  if (!mounted) {
    return (
      <div className="html-upload-card" suppressHydrationWarning>
        <div>
          <span className="admin-card__subtitle">HTML upload</span>
          <h2>رفع Landing Page جاهزة</h2>
          <p>جار تجهيز نموذج رفع صفحات الحملات...</p>
        </div>
      </div>
    );
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
            maxLength={160}
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
            type="radio"
            name="uploadLayout"
            checked={layout === "canvas"}
            onChange={() => {
              const next = layoutPreset("canvas");
              setLayout(next.layout);
              setShowHeader(next.showHeader);
              setShowFooter(next.showFooter);
            }}
          />
          <span>Elementor Canvas</span>
        </label>
        <label>
          <input
            type="radio"
            name="uploadLayout"
            checked={layout === "blank"}
            onChange={() => {
              const next = layoutPreset("blank");
              setLayout(next.layout);
              setShowHeader(next.showHeader);
              setShowFooter(next.showFooter);
            }}
          />
          <span>Blank Page</span>
        </label>
        <label>
          <input
            type="radio"
            name="uploadLayout"
            checked={layout === "full"}
            onChange={() => {
              const next = layoutPreset("full");
              setLayout(next.layout);
              setShowHeader(next.showHeader);
              setShowFooter(next.showFooter);
            }}
          />
          <span>Full Width</span>
        </label>
        <label>
          <input
            type="radio"
            name="uploadLayout"
            checked={layout === "theme"}
            onChange={() => {
              const next = layoutPreset("theme");
              setLayout(next.layout);
              setShowHeader(next.showHeader);
              setShowFooter(next.showFooter);
            }}
          />
          <span>Rejuvera Theme</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(event) => {
              setLayout("custom");
              setShowHeader(event.target.checked);
            }}
          />
          <span>Show site header</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showFooter}
            onChange={(event) => {
              setLayout("custom");
              setShowFooter(event.target.checked);
            }}
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
