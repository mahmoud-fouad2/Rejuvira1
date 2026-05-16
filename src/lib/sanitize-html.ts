/**
 * Lightweight server-side HTML sanitizer for admin-authored custom pages.
 *
 * The clinic admins paste curated marketing pages from Rejuvira's design team.
 * We still strip the obvious script-injection vectors so a hostile
 * paste from a compromised admin device cannot run arbitrary JavaScript on
 * visitors' browsers.
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
  "label",
  "li",
  "main",
  "mark",
  "nav",
  "ol",
  "p",
  "picture",
  "pre",
  "section",
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
  "for",
  "datetime",
  "colspan",
  "rowspan",
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
 * Strip script/style/iframe blocks and event handlers. Returns sanitized HTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let html = input;

  // Remove <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>
  html = html.replace(
    /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|textarea|select|template)\b[^>]*>/gi,
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
        } else if (name === "href" || name === "src") {
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
  html = html.replace(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g, (_match, tagRaw: string) => {
    const tag = tagRaw.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    return `</${tag}>`;
  });

  return html;
}
