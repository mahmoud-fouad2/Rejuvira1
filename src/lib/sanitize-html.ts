/**
 * Lightweight server-side HTML sanitizer for admin-authored custom pages.
 *
 * The clinic admins paste curated marketing pages from Rejuvera's design team.
 * We still strip the obvious script-injection vectors so a hostile
 * paste from a compromised admin device cannot run arbitrary JavaScript on
 * visitors' browsers. Uploaded landing pages may include inline CSS, so safe
 * <style> blocks are preserved after rejecting obvious CSS injection vectors.
 *
 * This is intentionally conservative: anything we are not sure about is
 * removed. If admins need richer markup (custom embeds, etc.) we should
 * consider switching to a dedicated library like `sanitize-html`.
 */

const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "blockquote",
  "br",
  "button",
  "caption",
  "code",
  "details",
  "div",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "img",
  "input",
  "label",
  "li",
  "link",
  "main",
  "mark",
  "nav",
  "ol",
  "option",
  "p",
  "picture",
  "pre",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "textarea",
  "u",
  "ul",
  "video",
]);

const ALLOWED_ATTR = new Set([
  "class",
  "id",
  "style",
  "title",
  "lang",
  "dir",
  "role",
  "aria-label",
  "aria-hidden",
  "aria-live",
  "data-*",
  "href",
  "rel",
  "target",
  "src",
  "srcset",
  "alt",
  "width",
  "height",
  "loading",
  "decoding",
  "controls",
  "muted",
  "playsinline",
  "poster",
  "name",
  "type",
  "value",
  "action",
  "method",
  "placeholder",
  "required",
  "autocomplete",
  "inputmode",
  "rows",
  "selected",
  "disabled",
  "for",
  "datetime",
  "colspan",
  "rowspan",
  "media",
  "integrity",
  "crossorigin",
  "referrerpolicy",
]);

function isAllowedAttr(attr: string): boolean {
  if (ALLOWED_ATTR.has(attr)) return true;
  if (attr.startsWith("data-") || attr.startsWith("aria-")) return true;
  return false;
}

function sanitizeStyle(value: string): string {
  // Remove anything containing url(javascript:, expression(, or @import.
  if (/(javascript:|expression\(|@import|behavior\s*:)/i.test(value)) {
    return "";
  }
  // Strip lone backslashes that can be used to obfuscate.
  return value.replace(/\\/g, "").trim();
}

function sanitizeStyleBlock(value: string): string {
  if (
    /(javascript:|expression\(|@import|behavior\s*:|<\/?script\b)/i.test(value)
  ) {
    return "";
  }
  return value.replace(/\\/g, "").trim();
}

function sanitizeUrl(value: string, attr: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // Reject javascript:, vbscript:, data: (except images), file:
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:")) return "";
  if (lower.startsWith("vbscript:")) return "";
  if (lower.startsWith("file:")) return "";
  if (lower.startsWith("data:")) {
    if (attr === "src" && /^data:image\//i.test(trimmed)) {
      return trimmed;
    }
    return "";
  }
  return trimmed;
}

/**
 * Strip script/iframe/embed blocks and event handlers. Returns sanitized HTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let html = input;
  const styleBlocks: string[] = [];

  html = html.replace(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    (_match, css: string) => {
      const cleanCss = sanitizeStyleBlock(css);
      if (!cleanCss) return "";
      const token = `___REJUVERA_STYLE_${styleBlocks.length}___`;
      styleBlocks.push(`<style>${cleanCss}</style>`);
      return token;
    },
  );

  // Remove blocks that can execute code or load untrusted embeds.
  html = html.replace(
    /<(?:script|iframe|object|embed|template)\b[^>]*>[\s\S]*?<\/(?:script|iframe|object|embed|template)>/gi,
    "",
  );

  // Remove standalone tags that can import remote behavior or affect the page head.
  html = html.replace(
    /<\/?(?:script|iframe|object|embed|meta|base|template)\b[^>]*>/gi,
    "",
  );
  // Remove HTML comments (which can hide payloads in some sniffers).
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g,
    (match, tagRaw: string, attrsRaw: string) => {
      const tag = tagRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      if (tag === "link") {
        const rel = attrsRaw.match(/\brel\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
        const href = attrsRaw.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
        const relValue = (rel?.[2] ?? rel?.[3] ?? rel?.[4] ?? "").toLowerCase();
        const hrefValue = href?.[2] ?? href?.[3] ?? href?.[4] ?? "";
        if (!relValue.split(/\s+/).includes("stylesheet")) return "";
        if (!sanitizeUrl(hrefValue, "href")) return "";
      }

      const cleanAttrs: string[] = [];
      const attrPattern =
        /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
      let m: RegExpExecArray | null;
      while ((m = attrPattern.exec(attrsRaw)) !== null) {
        const rawName = m[1];
        if (!rawName) continue;
        const name = rawName.toLowerCase();
        if (name.startsWith("on")) continue;
        if (!isAllowedAttr(name)) continue;
        let value: string = m[3] ?? m[4] ?? m[5] ?? "";

        if (name === "style") {
          value = sanitizeStyle(value);
          if (!value) continue;
        } else if (name === "href" || name === "src" || name === "action") {
          value = sanitizeUrl(value, name);
          if (!value) continue;
        }

        const escaped = value.replace(/"/g, "&quot;");
        cleanAttrs.push(`${name}="${escaped}"`);
      }

      const closingSlash = match.endsWith("/>") ? "/" : "";
      return `<${tag}${cleanAttrs.length ? ` ${cleanAttrs.join(" ")}` : ""}${closingSlash}>`;
    },
  );

  // Closing tags: keep only allowed ones.
  html = html.replace(
    /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g,
    (_match, tagRaw: string) => {
      const tag = tagRaw.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      return `</${tag}>`;
    },
  );

  styleBlocks.forEach((block, index) => {
    html = html.replace(`___REJUVERA_STYLE_${index}___`, block);
  });

  return html;
}
