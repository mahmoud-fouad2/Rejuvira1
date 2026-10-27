import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const decodeXml = (value) =>
  value.replace(
    /&(amp|quot|apos|lt|gt);/g,
    (_, name) => ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" })[name],
  );
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [
      match[1].toLowerCase(),
      decodeXml(match[3]),
    ]),
  );

export function sitemapEntries(xml, canonicalOrigin) {
  assert.match(xml, /<urlset\b/);
  assert.match(xml, /<\/urlset>\s*$/);
  const entries = [...xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map(
    ([, body]) => {
      const loc = decodeXml(body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "");
      assert.equal(new URL(loc).origin, canonicalOrigin, "Foreign sitemap URL");
      const alternates = [...body.matchAll(/<xhtml:link\b[^>]*>/g)].map(
        ([tag]) => attributes(tag),
      );
      assert.equal(
        new Set(alternates.map((a) => a.hreflang)).size,
        alternates.length,
      );
      return { loc, alternates };
    },
  );
  assert.ok(entries.length > 0, "Empty sitemap");
  const byUrl = new Map(entries.map((entry) => [entry.loc, entry]));
  assert.equal(byUrl.size, entries.length, "Duplicate sitemap URLs");
  for (const entry of entries) {
    assert.ok(
      !/\/(admin|portal|patient-login)(?:\/|$)/.test(
        new URL(entry.loc).pathname,
      ),
    );
    assert.ok(entry.alternates.some((a) => a.hreflang === "ar"));
    assert.ok(entry.alternates.some((a) => a.hreflang === "x-default"));
    const language =
      new URL(entry.loc).searchParams.get("lang") === "en" ? "en" : "ar";
    assert.ok(
      entry.alternates.some(
        (a) => a.hreflang === language && a.href === entry.loc,
      ),
      "Missing self alternate",
    );
    const signature = JSON.stringify(
      entry.alternates.map((a) => [a.hreflang, a.href]).sort(),
    );
    for (const alternate of entry.alternates) {
      const target = byUrl.get(alternate.href);
      assert.ok(target, `Alternate URL absent from sitemap: ${alternate.href}`);
      assert.equal(
        JSON.stringify(
          target.alternates.map((a) => [a.hreflang, a.href]).sort(),
        ),
        signature,
        "Nonreciprocal alternates",
      );
    }
    if (new URL(entry.loc).pathname.startsWith("/p/")) {
      assert.equal(language, "ar", "Custom HTML advertises English");
      assert.ok(!entry.alternates.some((a) => a.hreflang.startsWith("en")));
    }
  }
  return entries;
}

function assertPage(body, canonical, language) {
  assert.equal(
    attributes(body.match(/<html\b[^>]*>/i)?.[0] ?? "").lang,
    language,
    "HTML language mismatch",
  );
  const links = [...body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) =>
    attributes(tag),
  );
  assert.equal(
    links.find((link) => link.rel === "canonical")?.href,
    canonical,
    "Canonical mismatch",
  );
  assert.equal(
    (
      body
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .match(/<h1(?:\s|>)/gi) ?? []
    ).length,
    1,
    "Expected one H1",
  );
  assert.ok(
    !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body),
    "Published page is noindex",
  );
}

/** Read-only deployment check: no login, form submissions, migrations or seeds. */
export async function verifyPublicSeo({
  baseUrl = "https://rejuvera.sa",
  canonicalOrigin = "https://rejuvera.sa",
  expectedRevision,
  fetchImpl = fetch,
} = {}) {
  const base = new URL(baseUrl);
  assert.ok(["https:", "http:"].includes(base.protocol));
  assert.ok(
    !base.username && !base.password,
    "Base URL must not contain credentials",
  );
  assert.ok(
    !expectedRevision ||
      (expectedRevision.length === 40 &&
        /^[a-f0-9]{40}$/i.test(expectedRevision)),
    "Expected revision must be a full Git SHA",
  );
  const checks = [];
  async function read(path, cookie) {
    const response = await fetchImpl(new URL(path, base), {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
      headers: {
        "user-agent": "Rejuvera-public-SEO-verification/1.0",
        ...(cookie ? { cookie } : {}),
      },
    });
    assert.equal(response.status, 200, `HTTP ${response.status}: ${path}`);
    checks.push(path);
    return response;
  }
  const robots = await (await read("/robots.txt")).text();
  assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
  const entries = sitemapEntries(
    await (await read("/sitemap-pages.xml")).text(),
    canonicalOrigin,
  );
  const services = entries.filter(
    (e) =>
      /^\/services\/[^/]+$/.test(new URL(e.loc).pathname) &&
      !new URL(e.loc).search,
  );
  const service =
    services.find((e) => e.alternates.some((a) => a.hreflang === "en")) ??
    services[0];
  assert.ok(service, "No published service in sitemap");
  const servicePath = new URL(service.loc).pathname;
  assertPage(
    await (await read(servicePath, "rejuvira-lang=en")).text(),
    service.loc,
    "ar",
  );
  const translated = service.alternates.find((a) => a.hreflang === "en");
  if (translated) {
    const target = new URL(translated.href);
    assertPage(
      await (
        await read(`${target.pathname}${target.search}`, "rejuvira-lang=ar")
      ).text(),
      translated.href,
      "en",
    );
  }
  const doctors = await (await read("/doctors")).text();
  assertPage(doctors, `${canonicalOrigin}/doctors`, "ar");
  const publicServices = new Set(services.map((entry) => entry.loc));
  for (const [tag] of doctors.matchAll(/<a\b[^>]*>/gi)) {
    const href = attributes(tag).href;
    if (!href) continue;
    const target = new URL(href, canonicalOrigin);
    if (
      target.origin === canonicalOrigin &&
      /^\/services\/[^/]+$/.test(target.pathname)
    ) {
      assert.ok(
        publicServices.has(`${canonicalOrigin}${target.pathname}`),
        `Navigation links to unpublished service: ${target.pathname}`,
      );
    }
  }
  assert.ok(
    !doctors.includes("كل الأطباء بنفس الحضور البصري"),
    "Internal doctor design copy remains",
  );
  const custom = entries.find((e) => new URL(e.loc).pathname.startsWith("/p/"));
  if (custom) {
    assertPage(
      await (await read(`${new URL(custom.loc).pathname}?lang=en`)).text(),
      custom.loc,
      "ar",
    );
  }
  const article = entries.find(
    (e) =>
      /^\/journal\/[^/]+$/.test(new URL(e.loc).pathname) &&
      !new URL(e.loc).search,
  );
  if (article) {
    const body = await (await read(new URL(article.loc).pathname)).text();
    assertPage(body, article.loc, "ar");
    const schemas = [
      ...body.matchAll(
        /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map(([, json]) => JSON.parse(json));
    const posting = schemas.find((schema) => schema["@type"] === "BlogPosting");
    assert.ok(
      posting?.author?.some((author) => author.name === "Mahmoud Fouad"),
      "Missing confirmed article author",
    );
    assert.ok(
      posting.author.some((author) => author["@type"] === "Organization"),
    );
    assert.ok(
      body
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .includes("Mahmoud Fouad"),
      "Missing visible byline",
    );
  }
  const healthResponse = await read("/api/health");
  const health = await healthResponse.json();
  assert.equal(health.ok, true);
  assert.equal(health.service, "rejuvera");
  const revision =
    typeof health.revision === "string" &&
    health.revision.length === 40 &&
    /^[a-f0-9]{40}$/i.test(health.revision)
      ? health.revision.toLowerCase()
      : null;
  if (expectedRevision) {
    assert.equal(
      revision,
      expectedRevision.toLowerCase(),
      "Deployed revision missing or does not match expected commit",
    );
    assert.match(healthResponse.headers.get("cache-control") ?? "", /no-store/);
  }
  return {
    checkedAt: new Date().toISOString(),
    baseUrl: base.origin,
    checks,
    sitemapLocations: entries.length,
    reciprocalLanguagePairs: entries.filter(
      (e) => new URL(e.loc).searchParams.get("lang") === "en",
    ).length,
    observedRevision: revision,
    revisionVerified: Boolean(
      expectedRevision && revision === expectedRevision.toLowerCase(),
    ),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    console.log(
      JSON.stringify(
        await verifyPublicSeo({
          baseUrl: process.env.SEO_AUDIT_BASE_URL || "https://rejuvera.sa",
          expectedRevision: process.env.SEO_EXPECTED_REVISION,
        }),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(`Public SEO verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
