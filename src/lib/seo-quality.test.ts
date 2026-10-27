import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import {
  languageNavigationUrl,
  seoLanguageFromUrl,
  localizedSeoValues,
  hasEnglishDoctorContent,
} from "./seo-localization.ts";
import { hasEnglishServiceContent, resolveServiceSeo } from "./service-seo.ts";
import { hasEnglishJournalContent } from "./journal-content.ts";
import { publicServiceSlug } from "./public-service-slug.ts";
import { doctorProfileSections } from "./doctor-profile-content.ts";
import { journalAuthors } from "./journal-attribution.ts";
import { publicEditorialCopy } from "./public-editorial-copy.ts";
import { bookingServiceOptions } from "./public-client-content.ts";

function load(
  relativePath: string,
  modules: Record<string, any>,
  globals = {},
) {
  const exports: any = {};
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(new URL(relativePath, import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText,
    {
      exports,
      require(id: string) {
        if (!(id in modules)) throw new Error(`Unexpected dependency: ${id}`);
        return modules[id];
      },
      URL,
      console,
      ...globals,
    },
  );
  return exports;
}

const doctor = {
  id: "doctor-fixture",
  slug: "fixture-doctor",
  name: "اسم الطبيب",
  nameEn: "Doctor fixture",
  title: "تخصص الطبيب",
  titleEn: "Doctor title",
  specialty: "تخصص",
  specialtyEn: "Specialty",
  summary: "ملخص عربي موثق",
  summaryEn: "English summary",
  bio: "سيرة الطبيب العربية",
  bioEn: "English doctor biography",
  photoUrl: "/fixture.jpg",
  coverImageUrl: "/fixture.jpg",
  yearsExperience: 10,
  languages: ["العربية", "English"],
  education: [],
  achievements: [],
  publications: [],
  serviceSlugs: [],
  status: "PUBLISHED",
};
const service = {
  id: "service-fixture",
  slug: "fixture-service",
  name: "خدمة عربية",
  nameEn: "English service",
  category: "قسم عربي",
  categoryEn: "English department",
  excerpt: "مقدمة عربية كاملة",
  excerptEn: "Complete English introduction",
  description: "وصف عربي كامل للخدمة",
  descriptionEn: "Complete English service description",
  coverImageUrl: "/fixture.jpg",
  doctorSlugs: [],
  deviceSlugs: [],
  benefits: [],
  status: "PUBLISHED",
};

function sitemapModule() {
  return load("./seo-sitemaps.ts", {
    "@prisma/client": { ContentStatus: { PUBLISHED: "PUBLISHED" } },
    "@/lib/content-repository": {
      getRuntimeSettings: async () => ({
        brand: { siteName: "Rejuvera", seoDescription: "Fixture" },
        media: { ogImage: "/fixture.jpg", brandLogo: "/logo.png" },
      }),
      getDoctors: async () => [
        doctor,
        { ...doctor, slug: "draft-doctor", status: "DRAFT" },
      ],
      getServices: async () => [
        service,
        { ...service, slug: "ar-only-service", descriptionEn: null },
      ],
      getDevices: async () => [],
      getGalleryItems: async () => [],
      getJournalPosts: async () => [],
      getCustomPages: async () => [
        {
          slug: "ar-campaign",
          titleAr: "عنوان",
          titleEn: "English title is not a translated body",
          htmlContent: "محتوى عربي",
          status: "PUBLISHED",
          noindex: false,
          updatedAt: "2026-10-26",
        },
        { slug: "private-campaign", status: "PUBLISHED", noindex: true },
      ],
    },
    "@/lib/core-search": { getCoreServiceDefinition: () => null },
    "@/lib/seo": { getSiteUrl: () => "https://rejuvera.sa" },
    "@/lib/journal-content": { hasEnglishJournalContent },
    "@/lib/public-service-slug": { publicServiceSlug },
    "@/lib/service-seo": { hasEnglishServiceContent },
    "@/lib/seo-localization": { hasEnglishDoctorContent },
    "@/lib/service-patient-guides": {
      serviceContentModifiedAt: (date: string) => date,
    },
  });
}

test("sitemap emits reciprocal standalone AR/EN nodes only for real translations", async () => {
  const loaded = sitemapModule();
  const entries = await loaded.getSitemapEntries();
  const xml = loaded.renderPagesSitemapXml(entries);
  const nodes = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
    (match) => match[1]!,
  );
  const node = (url: string) =>
    nodes.find((text) => text.includes(`<loc>${url}</loc>`));
  for (const path of ["/services/fixture-service", "/doctors/fixture-doctor"]) {
    const url = `https://rejuvera.sa${path}`;
    const ar = node(url)!;
    const en = node(`${url}?lang=en`)!;
    assert.ok(ar && en);
    const links = (text: string) =>
      [...text.matchAll(/<xhtml:link[^>]+\/>/g)].map((match) => match[0]);
    assert.deepEqual(links(ar), links(en));
    assert.ok(ar.includes(`hreflang="en" href="${url}?lang=en"`));
    assert.ok(en.includes(`hreflang="ar" href="${url}"`));
  }
  for (const path of [
    "/p/ar-campaign",
    "/services/ar-only-service",
    "/journal",
  ]) {
    const ar = node(`https://rejuvera.sa${path}`)!;
    assert.ok(ar);
    assert.equal(ar.includes('hreflang="en"'), false);
    assert.equal(node(`https://rejuvera.sa${path}?lang=en`), undefined);
  }
  assert.equal(xml.includes("draft-doctor"), false);
  assert.equal(xml.includes("private-campaign"), false);
  assert.equal(
    new Set(nodes.map((text) => text.match(/<loc>(.*?)<\/loc>/)?.[1])).size,
    nodes.length,
  );
});

test("unknown translation eligibility defaults to Arabic and XML URLs are escaped", () => {
  const xml = sitemapModule().renderPagesSitemapXml([
    {
      path: "/test?a=1&b=2",
      title: "Fixture",
      priority: 0.5,
      changeFrequency: "monthly",
    },
  ]);
  assert.equal((xml.match(/<url>/g) || []).length, 1);
  assert.ok(xml.includes("?a=1&amp;b=2"));
  assert.equal(xml.includes('hreflang="en"'), false);
});

test("language URLs preserve tracking, pagination, hashes and never use preference cookies", () => {
  const href =
    "https://rejuvera.sa/services/fixture-service?utm_source=test&gclid=synthetic&page=2#booking";
  const english = languageNavigationUrl(href, "en");
  assert.equal(
    english,
    "/services/fixture-service?utm_source=test&gclid=synthetic&page=2&lang=en#booking",
  );
  assert.equal(
    languageNavigationUrl(english, "ar"),
    new URL(href).pathname + new URL(href).search + new URL(href).hash,
  );
  assert.equal(seoLanguageFromUrl(href), "ar");
});

test("initial document language agrees with actual service, doctor, journal and campaign availability", async () => {
  const loaded = load("./page-language.ts", {
    "@/lib/content-repository": {
      getDoctorBySlug: async () => doctor,
      getServiceBySlug: async () => service,
      getJournalPostBySlug: async () => ({ titleEn: "Only a title" }),
    },
    "@/lib/seo-localization": { hasEnglishDoctorContent, seoLanguageFromUrl },
    "@/lib/service-seo": { hasEnglishServiceContent },
    "@/lib/journal-content": { hasEnglishJournalContent },
  });
  for (const path of [
    "/services/fixture-service",
    "/doctors/fixture-doctor",
    "/contact",
  ])
    assert.equal(
      (await loaded.pageLanguage(path, `https://rejuvera.sa${path}?lang=en`))
        .language,
      "en",
    );
  for (const path of ["/p/ar-campaign", "/journal", "/journal/untranslated"]) {
    const result = await loaded.pageLanguage(
      path,
      `https://rejuvera.sa${path}?lang=en`,
    );
    assert.equal(result.language, "ar");
    assert.equal(result.hasEnglish, false);
  }
});

test("actual language provider navigates with a URL and obeys content availability even with blocked storage", () => {
  for (const initialLang of ["ar", "en"] as const) {
    const pushes: any[] = [];
    const effects: Array<() => void> = [];
    const states: any[] = [];
    const href = `https://rejuvera.sa/services/fixture-service?utm_source=fixture${initialLang === "en" ? "&lang=en" : ""}#booking`;
    const html: any = { dataset: {} };
    const loaded = load(
      "../components/providers/LanguageProvider.tsx",
      {
        react: {
          createContext: () => ({ Provider: "provider" }),
          useContext() {},
          useCallback: (fn: any) => fn,
          useEffect: (effect: any) => effects.push(effect),
          useState: (value: any) => [value, (next: any) => states.push(next)],
        },
        "react/jsx-runtime": { Fragment, jsx, jsxs },
        "next/navigation": {
          useRouter: () => ({ push: (...args: any[]) => pushes.push(args) }),
          usePathname: () => "/services/fixture-service",
          useSearchParams: () => new URL(href).searchParams,
        },
        "@/lib/seo-localization": { languageNavigationUrl },
      },
      {
        window: { location: { href } },
        document: {
          documentElement: html,
          querySelector: () => ({ dataset: { hasEnglish: "true" } }),
        },
        localStorage: {
          setItem() {
            throw new Error("blocked");
          },
        },
      },
    );
    const provider = loaded.LanguageProvider({
      children: null,
      initialLang,
      initialHasEnglish: true,
    });
    effects[0]!();
    assert.equal(html.lang, initialLang);
    provider.props.value.switchLanguage();
    assert.equal(
      pushes[0][0],
      languageNavigationUrl(href, initialLang === "ar" ? "en" : "ar"),
    );
    assert.equal(pushes[0][1].scroll, false);
    assert.ok(states.includes(initialLang));
  }
});

test("legacy biographies and job titles are not presented as publications or degrees", () => {
  const original = {
    ...doctor,
    education: [doctor.title, "Documented qualification"],
    publications: [
      doctor.summary,
      doctor.bio.slice(0, 10),
      "https://doi.org/10.1234/fixture",
    ],
    achievements: ["Professional milestone"],
  };
  const before = JSON.stringify(original);
  const sections = doctorProfileSections(original);
  assert.deepEqual(sections[0]!.items, ["Documented qualification"]);
  assert.deepEqual(sections[2]!.items, ["https://doi.org/10.1234/fixture"]);
  assert.equal(JSON.stringify(original), before);
  assert.equal(
    sections.some((section) =>
      /المنشورات العلمية|الاقتباسات/.test(section.label),
    ),
    false,
  );
});

for (const kind of ["services", "doctors"]) {
  test(`${kind} actual page renders one language and self-canonical with reciprocal metadata`, async () => {
    const record = kind === "services" ? service : doctor;
    const stub = () => null;
    const modules: Record<string, any> = {
      "react/jsx-runtime": { Fragment, jsx, jsxs },
      "next/link": {
        default: ({ href, children }: any) => jsx("a", { href, children }),
      },
      "next/image": {
        default: ({ src, alt }: any) => jsx("img", { src, alt }),
      },
      "next/navigation": {
        notFound: () => {
          throw new Error("Not found");
        },
      },
      "@/auth": {},
      "@/lib/admin-permissions": {},
      "@/lib/prisma-enums": { ContentStatus: { PUBLISHED: "PUBLISHED" } },
      "@/lib/content-repository": {
        getServiceBySlug: async () => service,
        getDoctorBySlug: async () => doctor,
        getServices: async () => [],
        getDoctors: async () => [],
        getDevices: async () => [],
        getJournalPosts: async () => [],
        getRuntimeSettings: async () => ({
          contact: { phone: "", whatsapp: "" },
        }),
      },
      "@/lib/core-search": {
        getCoreServiceSeo: () => null,
        coreSearchKeywords: [],
      },
      "@/lib/csp-nonce": { getCspNonce: async () => "fixture-nonce" },
      "@/lib/seo": { getSiteUrl: () => "https://rejuvera.sa" },
      "@/lib/public-service-slug": { publicServiceSlug },
      "@/lib/service-seo": { hasEnglishServiceContent, resolveServiceSeo },
      "@/lib/seo-localization": { hasEnglishDoctorContent, localizedSeoValues },
      "@/lib/doctor-profile-content": { doctorProfileSections },
      "@/lib/public-client-content": { bookingServiceOptions },
      "@/lib/service-patient-guides": {
        servicePatientGuide: () => undefined,
        serviceContentModifiedAt: () => "2026-10-26",
      },
      "@/lib/clinic-contact": { clinicWhatsappHref: () => "" },
      "@/lib/recaptcha": { getPublicSiteKey: () => "" },
    };
    for (const name of [
      "layout/SiteFooter",
      "layout/SiteHeader",
      "layout/BookingModal",
      "public/StickyMobileCta",
      "public/ServicePatientGuide",
      "public/ServiceSearchQuestions",
      "contact/PhoneCallLink",
    ])
      modules[`@/components/${name}`] = new Proxy({}, { get: () => stub });
    const page = load(`../app/${kind}/[slug]/page.tsx`, modules);
    for (const english of [false, true]) {
      const props = {
        params: Promise.resolve({ slug: record.slug }),
        searchParams: Promise.resolve(english ? { lang: "en" } : {}),
      };
      const html = renderToStaticMarkup(await page.default(props));
      const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
      assert.ok(main);
      assert.equal((main.match(/<h1[\s>]/g) || []).length, 1);
      assert.ok(
        main.includes(
          english
            ? kind === "services"
              ? service.descriptionEn
              : doctor.bioEn
            : kind === "services"
              ? service.description
              : doctor.bio,
        ),
      );
      assert.equal(
        main.includes(
          english
            ? kind === "services"
              ? service.description
              : doctor.bio
            : kind === "services"
              ? service.descriptionEn
              : doctor.bioEn,
        ),
        false,
      );
      if (kind === "services")
        assert.equal(
          (
            main.match(
              new RegExp(
                english ? service.descriptionEn : service.description,
                "g",
              ),
            ) || []
          ).length,
          1,
        );
      const metadata = await page.generateMetadata(props);
      const url = `https://rejuvera.sa/${kind}/${record.slug}`;
      assert.equal(
        metadata.alternates.canonical,
        english ? `${url}?lang=en` : url,
      );
      assert.equal(metadata.alternates.languages.en, `${url}?lang=en`);
    }
  });
}

test("article authors match the confirmed byline without inventing medical review", () => {
  const authors = journalAuthors("Rejuvera", "https://rejuvera.sa");
  assert.deepEqual(
    authors.map((author) => [author["@type"], author.name]),
    [
      ["Person", "Mahmoud Fouad"],
      ["Organization", "Rejuvera"],
    ],
  );
  assert.equal(JSON.stringify(authors).includes("review"), false);
  assert.equal(JSON.stringify(authors).includes("ma-fo.info"), false);
});

test("verified landing design note is replaced without changing forms, attributes, scripts or stored input", () => {
  const note =
    "إضافة صور المركز داخل الصفحة تساعد الزائر على تكوين انطباع أوضح عن المكان قبل الحجز.";
  const form = `<form action="/api/leads"><input name="serviceSlug" value="plastic-surgery"><input name="message" value="${note}"></form>`;
  const script = `<script>window.fixture=${JSON.stringify(note)};</script>`;
  const html = `<p>${note}</p>${form}${script}<p>محتوى طبي محفوظ</p>`;
  const result = publicEditorialCopy(html);
  assert.equal(result.startsWith(`<p>${note}</p>`), false);
  assert.ok(result.includes(form));
  assert.ok(result.includes(script));
  assert.ok(result.endsWith("<p>محتوى طبي محفوظ</p>"));
  assert.ok(html.startsWith(`<p>${note}</p>`));
});

test("actual article byline and JSON-LD use the same confirmed authors", async () => {
  const post = {
    slug: "article-fixture",
    title: "عنوان المقال",
    excerpt: "مقدمة",
    body: ["نص المقال"],
    coverImageUrl: "/fixture.jpg",
    publishedAt: "2026-10-01",
    relatedServiceSlugs: [],
    relatedDoctorSlugs: [],
    status: "PUBLISHED",
  };
  const stub = () => null;
  const page = load("../app/journal/[slug]/page.tsx", {
    "react/jsx-runtime": { jsx, jsxs, Fragment },
    "@prisma/client": { ContentStatus: { PUBLISHED: "PUBLISHED" } },
    "next/link": {
      default: ({ href, children }: any) => jsx("a", { href, children }),
    },
    "next/navigation": {
      notFound() {
        throw new Error("not found");
      },
    },
    "@/components/layout/SiteHeader": { SiteHeader: stub },
    "@/components/layout/SiteFooter": { SiteFooter: stub },
    "@/components/public/JournalBody": {
      JournalBody: ({ body }: any) => jsx("p", { children: body.join(" ") }),
    },
    "@/lib/csp-nonce": { getCspNonce: async () => "fixture" },
    "@/lib/content-repository": {
      getJournalPostBySlug: async () => post,
      getServices: async () => [],
      getDoctors: async () => [],
      getRuntimeSettings: async () => ({ brand: { siteName: "Rejuvera" } }),
    },
    "@/lib/seo": { getSiteUrl: () => "https://rejuvera.sa" },
    "@/lib/journal-content": { hasEnglishJournalContent },
    "@/lib/journal-attribution": { journalAuthors },
  });
  const html = renderToStaticMarkup(
    await page.default({
      params: Promise.resolve({ slug: post.slug }),
      searchParams: Promise.resolve({}),
    }),
  );
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  assert.ok(main.includes("Mahmoud Fouad"));
  assert.ok(main.includes("Rejuvera"));
  const schema = JSON.parse(
    html.match(
      /id="journal-structured-data-article-fixture"[^>]*>([\s\S]*?)<\/script>/,
    )![1]!,
  );
  assert.deepEqual(
    schema.author.map((author: any) => author.name),
    ["Mahmoud Fouad", "Rejuvera"],
  );
  assert.equal(schema.reviewedBy, undefined);
});
