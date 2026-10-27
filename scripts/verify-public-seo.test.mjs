import assert from "node:assert/strict";
import test from "node:test";
import { verifyPublicSeo, sitemapEntries } from "./verify-public-seo.mjs";

const origin = "https://rejuvera.sa";
const sha = "abcdef0123".repeat(4);
const group = (ar, en) =>
  [ar, ...(en ? [en] : [])]
    .map(
      (loc) =>
        `<url><loc>${origin}${loc}</loc><xhtml:link rel="alternate" hreflang="ar" href="${origin}${ar}"/>${en ? `<xhtml:link rel="alternate" hreflang="en" href="${origin}${en}"/>` : ""}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}${ar}"/></url>`,
    )
    .join("");
const sitemap = `<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">${group("/services/ar-only")}${group("/services/translated", "/services/translated?lang=en")}${group("/p/landing")}${group("/journal/article")}</urlset>`;
const page = (path, language = "ar") =>
  `<html lang="${language}"><head><link href="${origin}${path}" rel="canonical"></head><body><main><h1>عنوان</h1></main></body></html>`;
function fixture(overrides = {}) {
  const calls = [];
  const routes = {
    "/robots.txt": `Sitemap: ${origin}/sitemap.xml`,
    "/sitemap-pages.xml": sitemap,
    "/services/translated": page("/services/translated"),
    "/services/translated?lang=en": page("/services/translated?lang=en", "en"),
    "/doctors": page("/doctors"),
    "/p/landing?lang=en": page("/p/landing"),
    "/journal/article": page("/journal/article").replace(
      "</main>",
      `إعداد: Mahmoud Fouad وريجوفيرا</main><script type="application/ld+json">${JSON.stringify(
        {
          "@type": "BlogPosting",
          author: [
            { "@type": "Person", name: "Mahmoud Fouad" },
            { "@type": "Organization", name: "ريجوفيرا" },
          ],
        },
      )}</script>`,
    ),
    "/api/health": JSON.stringify({
      ok: true,
      service: "rejuvera",
      revision: sha,
    }),
    ...overrides,
  };
  return {
    calls,
    fetchImpl: async (url, options) => {
      const path = url.pathname + url.search;
      calls.push({ path, options });
      return new Response(routes[path] ?? "", {
        status: path in routes ? 200 : 404,
        headers: { "cache-control": "no-store" },
      });
    },
  };
}

test("deployment audit follows actual published sitemap URLs, preserves conflicting-cookie checks and verifies SHA", async () => {
  const source = fixture();
  const result = await verifyPublicSeo({
    baseUrl: "http://127.0.0.1:3001",
    expectedRevision: sha,
    fetchImpl: source.fetchImpl,
  });
  assert.equal(result.revisionVerified, true);
  assert.equal(result.observedRevision, sha);
  assert.equal(result.sitemapLocations, 5);
  assert.equal(result.reciprocalLanguagePairs, 1);
  assert.equal(
    source.calls.find((c) => c.path === "/services/translated").options.headers
      .cookie,
    "rejuvira-lang=en",
  );
  assert.equal(
    source.calls.find((c) => c.path === "/services/translated?lang=en").options
      .headers.cookie,
    "rejuvira-lang=ar",
  );
  assert.ok(
    source.calls.every(
      (c) => !c.options.method && c.options.redirect === "manual",
    ),
  );
  assert.ok(!source.calls.some((c) => c.path.includes("facelift-surgery")));
});

test("structural success never pretends to prove an unknown deployment revision", async () => {
  const source = fixture({
    "/api/health": JSON.stringify({ ok: true, service: "rejuvera" }),
  });
  const result = await verifyPublicSeo({ fetchImpl: source.fetchImpl });
  assert.equal(result.revisionVerified, false);
  assert.equal(result.observedRevision, null);
  await assert.rejects(
    verifyPublicSeo({ expectedRevision: sha, fetchImpl: source.fetchImpl }),
    /Deployed revision/,
  );
  await assert.rejects(
    verifyPublicSeo({ expectedRevision: "main", fetchImpl: source.fetchImpl }),
    /full Git SHA/,
  );
});

test("deployment verification fails on wrong revisions, HTTP errors, language/canonical disagreement or missing authors", async () => {
  for (const overrides of [
    {
      "/api/health": JSON.stringify({
        ok: true,
        service: "rejuvera",
        revision: "b".repeat(40),
      }),
    },
    { "/services/translated?lang=en": page("/services/translated", "en") },
    {
      "/services/translated?lang=en": page(
        "/services/translated?lang=en",
        "ar",
      ),
    },
    { "/journal/article": page("/journal/article") },
  ]) {
    await assert.rejects(
      verifyPublicSeo({
        expectedRevision: sha,
        fetchImpl: fixture(overrides).fetchImpl,
      }),
    );
  }
  const source = fixture();
  await assert.rejects(
    verifyPublicSeo({
      fetchImpl: async (...args) =>
        new URL(args[0]).pathname === "/doctors"
          ? new Response("", { status: 503 })
          : source.fetchImpl(...args),
    }),
    /HTTP 503/,
  );
});

test("deployment audit catches broken footer navigation to unpublished services", async () => {
  const source = fixture({
    "/doctors": page("/doctors").replace(
      "</main>",
      '<a href="/services/archived">Archived service</a></main>',
    ),
  });
  await assert.rejects(
    verifyPublicSeo({ fetchImpl: source.fetchImpl }),
    /Navigation links to unpublished service/,
  );
});

test("sitemap verification rejects missing reciprocal nodes, inconsistent annotations and invented custom translations", () => {
  assert.equal(sitemapEntries(sitemap, origin).length, 5);
  for (const invalid of [
    sitemap.replace(
      /<url><loc>https:\/\/rejuvera.sa\/services\/translated\?lang=en<\/loc>[\s\S]*?<\/url>/,
      "",
    ),
    sitemap.replace('hreflang="en"', 'hreflang="fr"'),
    sitemap.replace(
      "</urlset>",
      group("/p/false-en", "/p/false-en?lang=en") + "</urlset>",
    ),
    sitemap.replace("</urlset>", group("/services/ar-only") + "</urlset>"),
  ])
    assert.throws(() => sitemapEntries(invalid, origin));
});
