/** Isolated visual preview: no database writes, tracking scripts or live submissions. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { improveBodyContouringLanding } from "../src/lib/body-contouring-landing.ts";
import { improveBookingLanding } from "../src/lib/booking-landing.ts";
import { improveBreastSurgeryLanding } from "../src/lib/breast-surgery-landing.ts";
import { improveFaceliftLanding } from "../src/lib/facelift-landing.ts";
import { improveTiktokLanding } from "../src/lib/tiktok-landing.ts";
import { sanitizeHtml } from "../src/lib/sanitize-html.ts";

// PREVIEW_PAGE=facelift (default) | body | booking | breast | tiktok; PREVIEW_PORT overrides the port.
const uploaded =
  "rv-custom-page rv-custom-page--canvas rv-custom-page--uploaded";
const targets = {
  facelift: {
    slug: "facelift-riyadh",
    improve: improveFaceliftLanding,
    marker: 'data-facelift-optimized="1"',
    gallery: "facelift-gallery",
    title: "شد الوجه",
    main: uploaded,
  },
  body: {
    slug: "body-contouring-riyadh",
    improve: improveBodyContouringLanding,
    marker: 'data-focused-landing="body-contouring"',
    gallery: "body-gallery",
    title: "نحت الجسم",
    main: uploaded,
  },
  booking: {
    slug: "book",
    improve: improveBookingLanding,
    marker: 'data-focused-landing="booking"',
    gallery: null,
    title: "الحجز",
    main: "rv-custom-page rv-custom-page--theme",
  },
  tiktok: {
    slug: "tiktok-customer",
    improve: improveTiktokLanding,
    marker: 'data-focused-landing="tiktok"',
    gallery: null,
    title: "تيك توك",
    main: "rv-custom-page rv-custom-page--theme",
  },
  breast: {
    slug: "breast-surgery-riyadh",
    improve: improveBreastSurgeryLanding,
    marker: 'data-focused-landing="breast-surgery"',
    gallery: "breast-gallery",
    title: "جراحات الصدر",
    main: uploaded,
  },
};
const target =
  targets[process.env.PREVIEW_PAGE ?? "facelift"] ?? targets.facelift;
const port = Number(process.env.PREVIEW_PORT) || 3012;

const response = await fetch(`https://rejuvera.sa/p/${target.slug}`);
if (!response.ok) throw new Error(`Source page returned ${response.status}`);
const source = await response.text();
// The CMS content has nested article cards; match the OUTER article boundary.
const article = source.match(
  /<article\b[^>]*class="(?:rv-custom-page__content|rv-landing-content)[^>]*>([\s\S]*?)<\/article>(?=\s*<(?:aside|section)\b|\s*<\/main>)/i,
)?.[1];
if (!article) throw new Error("Expected landing-page article not found");
// A previously deployed presentation is not the CMS source. Reconstruct a
// preview-only input from its preserved form/gallery to exercise the NEW renderer.
// Do not mutate the live page or submit this form.
let previewSource = article;
if (article.includes(target.marker)) {
  const originalForm = article
    .match(/<form\b[\s\S]*?<\/form>/i)?.[0]
    ?.replace(
      /<div class="rvx-field rvx-field-wide"><label for="facelift-timing">[\s\S]*?<\/div>/,
      "",
    );
  const existingGallery = target.gallery
    ? article.match(
        new RegExp(
          `<section\\b[^>]*id="${target.gallery}"[\\s\\S]*?<\\/section>`,
          "i",
        ),
      )?.[0]
    : "";
  if (!originalForm || existingGallery === undefined)
    throw new Error("Expected preserved form/gallery not found");
  previewSource = `${originalForm}<section><h2>أمثلة توضيحية قبل وبعد</h2>${(existingGallery.match(/<img\b[^>]*>/gi) ?? []).join("")}</section>`;
}
const enhanced = target.improve(previewSource, target.slug);
if (!enhanced.includes(target.marker))
  throw new Error("CMS layout did not match; preview refused");
const html = sanitizeHtml(enhanced);
const globals = await readFile(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
// Production order: the route stylesheet (facelift.css) loads BEFORE the site stylesheet, so
// equal-specificity site rules win. Keep that order here or the preview hides real conflicts.
const focusedStylesOnly = process.env.PREVIEW_CSS_MODE === "focused";
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
  const previewQuery = new URL(req.url ?? "/", `http://127.0.0.1:${port}`)
    .searchParams;
  const includeFullStyles = !focusedStylesOnly || previewQuery.has("full");
  // Visual fixtures only; these do not create or claim any backend lead receipt.
  const receipt = previewQuery.get("receipt");
  const notice = ["success", "duplicate", "error"].includes(receipt)
    ? `<div class="rv-custom-page__lead-notice rv-custom-page__lead-notice--${receipt}">معاينة رسالة ${receipt} فقط — لا يوجد طلب مرسل</div>`
    : "";
  res.end(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>معاينة محلية — ${target.title}</title><style>${css}\n${includeFullStyles ? globals : ""}\n@font-face{font-family:PreviewArabic;src:url('/font.woff2')}body{margin:0;--font-rejuvira-sans:PreviewArabic}</style></head><body><main class="${target.main}">${notice}<article class="rv-landing-content">${html}</article></main></body></html>`,
  );
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Visual-only preview: http://127.0.0.1:${port} (POST disabled)`),
);
