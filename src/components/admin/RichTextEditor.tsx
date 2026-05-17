"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { prepareImageUpload } from "@/lib/client-image-upload";

type RichTextEditorProps = {
  /** Form field name; the editor writes the HTML to a hidden input. */
  name: string;
  defaultValue?: string;
  /** Visible label rendered above the toolbar. */
  label?: string;
  required?: boolean;
  /** Minimum visible height in CSS units. Default "12rem". */
  minHeight?: string;
  /** Optional helper text. */
  helper?: string;
  /** Image upload namespace (R2). */
  imageNamespace?: "journal" | "media/uploads";
};

const SANITIZE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""],
  [/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ""],
  [/ on\w+="[^"]*"/gi, ""],
  [/ on\w+='[^']*'/gi, ""],
  [/javascript:/gi, ""],
];

function sanitizeHtml(input: string): string {
  let html = input;
  for (const [pattern, replacement] of SANITIZE_REPLACEMENTS) {
    html = html.replace(pattern, replacement);
  }
  return html;
}

/**
 * Lightweight content-editable rich text editor with paragraphs, headings,
 * bold/italic, ordered/unordered lists, link, blockquote and image upload.
 *
 * Output is sanitized HTML written into a hidden form field. No external
 * editor framework is required; we rely on built-in DOM editing semantics
 * which keep the bundle small.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  label,
  required,
  minHeight = "16rem",
  helper,
  imageNamespace = "journal",
}: RichTextEditorProps) {
  const id = useId();
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  useEffect(() => {
    if (surfaceRef.current && surfaceRef.current.innerHTML !== defaultValue) {
      surfaceRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  const sync = useCallback(() => {
    if (!surfaceRef.current) return;
    const html = sanitizeHtml(surfaceRef.current.innerHTML);
    setValue(html);
  }, []);

  function exec(command: string, arg?: string) {
    if (!surfaceRef.current) return;
    surfaceRef.current.focus();
    document.execCommand(command, false, arg);
    sync();
  }

  function setBlock(tag: "P" | "H2" | "H3" | "BLOCKQUOTE") {
    exec("formatBlock", tag);
  }

  function insertLink() {
    const url = linkUrl.trim();
    if (!url) {
      setLinkPanelOpen(false);
      return;
    }
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      setError("الروابط يجب أن تبدأ بـ https:// أو /");
      return;
    }
    setError(null);
    exec("createLink", url);
    setLinkPanelOpen(false);
    setLinkUrl("https://");
  }

  async function uploadImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const preparedFile = await prepareImageUpload(file);
      const form = new FormData();
      form.append("file", preparedFile);
      form.append("namespace", imageNamespace);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as
        | { ok: true; url: string }
        | { ok: false; error: string };
      if (!res.ok || !("ok" in data) || !data.ok) {
        throw new Error("error" in data ? data.error : "Upload failed");
      }
      exec("insertImage", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    // Force plain-text paste, preserving line breaks, to avoid foreign styling.
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    sync();
  }

  return (
    <div className="rv-rte">
      {label ? (
        <label htmlFor={id} className="admin-field-label mb-1 block">
          {label}
        </label>
      ) : null}

      <input type="hidden" name={name} value={value} required={required} />
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadImage(file);
          event.target.value = "";
        }}
      />

      <div className="rv-rte__toolbar" role="toolbar" aria-label="Format">
        <button type="button" onClick={() => setBlock("P")} title="Paragraph">¶</button>
        <button type="button" onClick={() => setBlock("H2")} title="Heading 2">H2</button>
        <button type="button" onClick={() => setBlock("H3")} title="Heading 3">H3</button>
        <span className="rv-rte__sep" />
        <button type="button" onClick={() => exec("bold")} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => exec("italic")} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => exec("underline")} title="Underline"><u>U</u></button>
        <span className="rv-rte__sep" />
        <button type="button" onClick={() => exec("insertUnorderedList")} title="Bulleted list">•</button>
        <button type="button" onClick={() => exec("insertOrderedList")} title="Numbered list">1.</button>
        <button type="button" onClick={() => setBlock("BLOCKQUOTE")} title="Quote">❝</button>
        <span className="rv-rte__sep" />
        <button
          type="button"
          onClick={() => setLinkPanelOpen((current) => !current)}
          title="Insert link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Insert image"
          disabled={busy}
        >
          {busy ? "…" : "🖼"}
        </button>
        <span className="rv-rte__sep" />
        <button
          type="button"
          onClick={() => exec("removeFormat")}
          title="Clear formatting"
        >
          ⌫
        </button>
      </div>

      {linkPanelOpen ? (
        <div className="rv-rte__link-panel">
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                insertLink();
              }
              if (event.key === "Escape") {
                setLinkPanelOpen(false);
              }
            }}
            className="admin-input"
            dir="ltr"
            placeholder="https://example.com"
            autoFocus
          />
          <button type="button" className="admin-btn-primary" onClick={insertLink}>
            <span className="lang-ar">إضافة الرابط</span>
            <span className="lang-en">Apply link</span>
          </button>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => setLinkPanelOpen(false)}
          >
            <span className="lang-ar">إلغاء</span>
            <span className="lang-en">Cancel</span>
          </button>
        </div>
      ) : null}

      <div
        ref={surfaceRef}
        id={id}
        className="rv-rte__surface"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        onPaste={handlePaste}
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: defaultValue }}
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
    </div>
  );
}
