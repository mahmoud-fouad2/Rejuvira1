/** Isolated visual preview: no database writes, tracking scripts or live submissions. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { improveFaceliftLanding } from "../src/lib/facelift-landing.ts";
import { sanitizeHtml } from "../src/lib/sanitize-html.ts";

const response = await fetch("https://rejuvera.sa/p/facelift-riyadh");
if (!response.ok) throw new Error(`Source page returned ${response.status}`);
const source = await response.text();
// The CMS content has nested article cards; match the OUTER article boundary.
const article = source.match(
  /<article\b[^>]*class="rv-custom-page__content[^>]*>([\s\S]*?)<\/article>(?=\s*<aside\b|\s*<\/main>)/i,
)?.[1];
if (!article) throw new Error("Expected landing-page article not found");
const enhanced = improveFaceliftLanding(article, "facelift-riyadh");
if (!enhanced.includes('data-facelift-optimized="1"'))
  throw new Error("CMS layout did not match; preview refused");
const html = sanitizeHtml(enhanced);
const globals = await readFile(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
const font = await readFile(
  new URL(
    "../public/assets/fonts/IBMPlexSansArabic-Regular.woff2",
    import.meta.url,
  ),
);
const server = createServer(async (req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405);
    res.end("Preview only: lead submission disabled");
    return;
  }
  if (req.url === "/font.woff2") {
    res.writeHead(200, { "Content-Type": "font/woff2" });
    res.end(font);
    return;
  }
  if (req.url?.startsWith("/media/")) {
    try {
      const path = new URL(
        `../public${req.url.split("?")[0]}`,
        import.meta.url,
      );
      if (!path.pathname.includes("/public/media/"))
        throw new Error("Invalid asset path");
      const body = await readFile(path);
      res.writeHead(200, {
        "Content-Type": path.pathname.endsWith(".webp")
          ? "image/webp"
          : "image/png",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https:; font-src 'self'; form-action 'self'; base-uri 'none'",
  });
  const css = await readFile(
    new URL("../src/app/p/[slug]/facelift.css", import.meta.url),
    "utf8",
  );
  res.end(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>معاينة محلية — شد الوجه</title><style>${globals}\n@font-face{font-family:PreviewArabic;src:url('/font.woff2')}body{margin:0;--font-rejuvira-sans:PreviewArabic}${css}</style></head><body><main class="rv-custom-page rv-custom-page--uploaded"><article class="rv-custom-page__content rv-custom-page__content--uploaded">${html}</article></main></body></html>`,
  );
});
server.listen(3012, "127.0.0.1", () =>
  console.log("Visual-only preview: http://127.0.0.1:3012 (POST disabled)"),
);
