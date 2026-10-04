import assert from "node:assert/strict";
import { patientGuides } from "../src/lib/service-patient-guides.ts";

// GET-only verification. Limit concurrency to two requests for the live server.
const base = (
  process.env.SEO_SMOKE_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");
const origin = "https://rejuvera.sa";
const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
async function read(path) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(45000),
    headers: { "user-agent": "rejuvera-content-verification/1.0" },
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.text(),
  };
}
const canonical = (body) =>
  decode(/<link rel="canonical" href="([^"]+)"/.exec(body)?.[1] ?? "");
function jsonLd(body) {
  return [
    ...body.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
}

const directory = await read("/site-map");
assert.equal(directory.status, 200);
assert.equal(canonical(directory.body), `${origin}/site-map`);
const links = new Set(
  [...directory.body.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(
    (match) => new URL(decode(match[1]), origin).href,
  ),
);
const sitemap = await read("/sitemap-pages.xml");
assert.equal(sitemap.status, 200);
const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  decode(match[1]),
);
assert.ok(urls.length > 20);
for (const url of urls)
  assert.ok(
    links.has(new URL(url).href),
    `Published page absent from directory: ${url}`,
  );
console.log(`PASS directory links to all ${urls.length} sitemap URLs`);

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const parsed = new URL(url);
    const page = await read(`${parsed.pathname}${parsed.search}`);
    assert.equal(page.status, 200, url);
    assert.ok(/<title>[^<]+<\/title>/.test(page.body), `Missing title: ${url}`);
    assert.ok(
      /<meta name="description" content="[^"]+"/.test(page.body),
      `Missing description: ${url}`,
    );
    assert.equal(
      new URL(canonical(page.body)).href,
      new URL(url).href,
      `Canonical mismatch: ${url}`,
    );
    assert.ok(
      ![
        ...page.body.matchAll(
          /<meta name="(?:robots|googlebot)" content="([^"]+)"/g,
        ),
      ].some((match) => /\bnoindex\b/.test(match[1])),
      `noindex in sitemap: ${url}`,
    );
    assert.ok(
      !/\bnoindex\b/.test(page.headers.get("x-robots-tag") || ""),
      `noindex header: ${url}`,
    );
    const guide = patientGuides.find((item) =>
      item.slugs.includes(
        decodeURIComponent(parsed.pathname.replace("/services/", "")),
      ),
    );
    const isService = parsed.pathname.startsWith("/services/");
    if (isService) {
      assert.ok(
        page.body.includes('id="service-consultation-questions"'),
        `Missing consultation questions: ${url}`,
      );
      const schema = jsonLd(page.body).find(
        (item) => item["@type"] === "MedicalWebPage",
      );
      assert.ok(schema, `Missing service page schema: ${url}`);
      assert.equal(schema.inLanguage, "ar");
      assert.equal(schema.url, url);
      assert.equal(schema.mainEntity["@type"], "Service");
      if (guide) {
        assert.ok(
          page.body.includes(guide.summaryAr),
          `Missing patient summary: ${url}`,
        );
        for (const source of guide.sources) {
          assert.ok(
            page.body.includes(`href="${source.url}"`),
            `Missing visible reference: ${url}`,
          );
          assert.ok(
            schema.citation.includes(source.url),
            `Missing matching citation: ${url}`,
          );
        }
        for (const question of guide.questions)
          assert.ok(
            page.body.includes(question.questionAr),
            `Missing specific question: ${url}`,
          );
      }
    }
    results.push({ url, service: isService, guide: Boolean(guide) });
  }
}
await Promise.all([worker(), worker()]);
console.log(
  `PASS ${results.length} published pages: HTTP 200, title, description, self canonical and indexable directives`,
);
console.log(
  `PASS questions on ${results.filter((item) => item.service).length} service pages; sourced guides on ${results.filter((item) => item.guide).length}`,
);

for (const path of ["/", "/services", "/doctors", "/contact", "/site-map"]) {
  const english = await read(`${path}?lang=en`);
  assert.equal(english.status, 200);
  assert.equal(
    new URL(canonical(english.body)).href,
    new URL(`${origin}${path}?lang=en`).href,
  );
  assert.ok(
    !/<title>[^<]*[\u0600-\u06ff]/.test(english.body),
    `Mixed-language title: ${path}`,
  );
}
const englishService = await read("/services/facelift-surgery?lang=en");
const englishSchema = jsonLd(englishService.body).find(
  (item) => item["@type"] === "MedicalWebPage",
);
assert.equal(englishSchema.inLanguage, "en");
assert.equal(englishSchema.url, `${origin}/services/facelift-surgery?lang=en`);
const article = await read("/journal/choose-plastic-surgeon-riyadh");
assert.ok(
  !/<meta name="author"/.test(article.body),
  "Website developer inherited as medical article author",
);
assert.ok(/<time datetime="[^"]+"/i.test(article.body));
console.log(
  "PASS localized collection metadata, service language/schema and article authorship/date markup",
);
console.log(`Content verification passed for ${base}`);
