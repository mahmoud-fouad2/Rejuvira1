import assert from "node:assert/strict";

// Read-only checks, safe to run against the deployed public website.
const base = (
  process.env.SEO_SMOKE_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");
const canonicalOrigin = "https://rejuvera.sa";
async function read(path) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    headers: { "user-agent": "rejuvera-seo-verification/1.0" },
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.text(),
  };
}
function canonical(body) {
  return /<link rel="canonical" href="([^"]+)"/.exec(body)?.[1];
}
const service = await read("/services/facelift-surgery");
assert.equal(service.status, 200);
assert.equal(
  canonical(service.body),
  `${canonicalOrigin}/services/facelift-surgery`,
);
assert.ok(service.body.includes("كيف أختار أفضل دكتور شد وجه في الرياض؟"));
const englishService = await read("/services/facelift-surgery?lang=en");
assert.equal(englishService.status, 200);
assert.equal(
  canonical(englishService.body),
  `${canonicalOrigin}/services/facelift-surgery?lang=en`,
);
assert.ok(!/<title>[^<]*[\u0600-\u06ff]/.test(englishService.body));
console.log("PASS service search questions and localized canonical/title");

const secondPage = await read("/journal?page=2");
assert.equal(secondPage.status, 200);
assert.equal(canonical(secondPage.body), `${canonicalOrigin}/journal?page=2`);
assert.ok(!/hrefLang="en"/.test(secondPage.body));
for (const path of [
  "/journal?page=999",
  "/journal?page=-1",
  "/journal?page=1.5",
]) {
  const invalid = await read(path);
  assert.ok(invalid.body.includes('content="noindex'));
  assert.ok(!canonical(invalid.body));
}
console.log("PASS page-specific journal canonical and invalid-page noindex");

const article = await read("/journal/choose-plastic-surgeon-riyadh?lang=en");
assert.equal(article.status, 200);
const translated = /hrefLang="en"/.test(article.body);
assert.equal(
  canonical(article.body),
  `${canonicalOrigin}/journal/choose-plastic-surgeon-riyadh${translated ? "?lang=en" : ""}`,
);
assert.ok(
  new RegExp(`<article[^>]*lang="${translated ? "en" : "ar"}"`).test(
    article.body,
  ),
);
console.log("PASS article alternates agree with actual rendered language");

const legacy = await read(
  `/services/${encodeURIComponent("عملية شد الصدر")}?lang=en`,
);
assert.equal(legacy.status, 308);
assert.equal(
  legacy.headers.get("location"),
  `${canonicalOrigin}/services/breast-lift?lang=en`,
);
console.log("PASS verified breast-lift alias preserves query in 308");

const sitemap = await read("/sitemap-pages.xml");
assert.equal(sitemap.status, 200);
const homeEntry = sitemap.body
  .split("<url>")
  .find((entry) => entry.includes(`<loc>${canonicalOrigin}/</loc>`));
assert.ok(homeEntry && !homeEntry.includes("<lastmod>"));
const articleEntry = sitemap.body
  .split("<url>")
  .find((entry) =>
    entry.includes(
      `<loc>${canonicalOrigin}/journal/choose-plastic-surgeon-riyadh</loc>`,
    ),
  );
assert.ok(articleEntry);
assert.equal(articleEntry.includes('hreflang="en"'), translated);
assert.ok(!sitemap.body.includes(encodeURIComponent("عملية شد الصدر")));
console.log(
  "PASS sitemap timestamps, article language, and redirected URL exclusion",
);
console.log(`SEO verification passed for ${base}`);
