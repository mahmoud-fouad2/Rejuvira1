import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { jsx, jsxs } from "react/jsx-runtime";
import {
  bookingServiceOptions,
  megaMenuContent,
  serviceCardContent,
  doctorCardContent,
  doctorQuoteContent,
  quoteHeadingContent,
  journalCardContent,
} from "./public-client-content.ts";
import { releaseRevision } from "./release-revision.ts";

function productionModule(
  path: string,
  modules: Record<string, any>,
  globals = {},
) {
  const exports: any = {};
  vm.runInNewContext(
    ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      require(id: string) {
        assert.ok(id in modules, `Unexpected dependency: ${id}`);
        return modules[id];
      },
      URL,
      ...globals,
    },
  );
  return exports;
}

const services = Array.from({ length: 9 }, (_, index) => ({
  id: `service-${index}`,
  slug: index === 8 ? "general-inquiry" : `service-${index}`,
  name: index === 8 ? "استفسار عام" : `خدمة ${index}`,
  category: "قسم طبي",
  coverImageUrl: `/image-${index}.webp`,
  description: "Long medical content not needed by a select or menu. ".repeat(
    200,
  ),
  status: "PUBLISHED",
}));
const doctors = Array.from({ length: 7 }, (_, index) => ({
  slug: `doctor-${index}`,
  name: `طبيب ${index}`,
  specialty: "تخصص",
  photoUrl: index === 0 ? "" : `/doctor-${index}.webp`,
  coverImageUrl: "/cover.webp",
  bio: "Doctor biography not needed in navigation. ".repeat(150),
  status: "PUBLISHED",
}));
const devices = Array.from({ length: 6 }, (_, index) => ({
  name: `Device ${index}`,
  certifications: ["First certification", "Second certification"],
  imageUrl: "/device.webp",
  description: "Long device description. ".repeat(150),
  status: "PUBLISHED",
}));

test("booking projection preserves all option IDs, values, names, order and general inquiry", () => {
  const original = JSON.stringify(services);
  const options = bookingServiceOptions(services);
  assert.deepEqual(
    options,
    services.map(({ id, slug, name }) => ({ id, slug, name })),
  );
  assert.equal(options.at(-1)?.slug, "general-inquiry");
  assert.ok(JSON.stringify(options).length < original.length / 20);
  assert.equal(JSON.stringify(services), original);
  assert.deepEqual(bookingServiceOptions([]), []);
});

test("menu projection preserves displayed fields and fallback images without catalog bodies", () => {
  const original = JSON.stringify({ services, doctors, devices });
  const menu = megaMenuContent({ services, doctors, devices });
  assert.equal(menu.services.length, 4);
  assert.equal(menu.doctors.length, 4);
  assert.equal(menu.devices.length, 4);
  assert.deepEqual(
    menu.services.map((s) => [s.slug, s.name, s.category, s.coverImageUrl]),
    services
      .slice(0, 4)
      .map((s) => [s.slug, s.name, s.category, s.coverImageUrl]),
  );
  assert.deepEqual(
    menu.doctors.map((d) => [
      d.name,
      d.specialty,
      d.photoUrl || d.coverImageUrl,
    ]),
    doctors
      .slice(0, 4)
      .map((d) => [d.name, d.specialty, d.photoUrl || d.coverImageUrl]),
  );
  assert.deepEqual(
    menu.devices.map((d) => d.certifications),
    devices.slice(0, 4).map((d) => d.certifications.slice(0, 1)),
  );
  assert.doesNotMatch(JSON.stringify(menu), /description|biography|\bbio\b/);
  assert.equal(JSON.stringify({ services, doctors, devices }), original);
  assert.deepEqual(
    megaMenuContent({ services: [], doctors: [], devices: [] }),
    { services: [], doctors: [], devices: [] },
  );
});

test("home carousel projections retain visible card content and translations without serializing article bodies or biographies", () => {
  const serviceCards = serviceCardContent(services);
  assert.equal(serviceCards.length, services.length);
  assert.equal(serviceCards[0]?.coverImageUrl, services[0]?.coverImageUrl);
  assert.doesNotMatch(JSON.stringify(serviceCards), /description/);
  const doctorSource = doctors.map((doctor, index) => ({
    ...doctor,
    id: `doctor-${index}`,
    title: "Consultant",
    yearsExperience: 25,
    languages: ["العربية", "English"],
    featured: index === 0,
    summary: "Existing doctor quote",
  }));
  const cards = doctorCardContent(doctorSource);
  assert.deepEqual(cards[0]?.languages, doctorSource[0]?.languages);
  assert.equal(cards[0]?.yearsExperience, 25);
  assert.equal(cards[0]?.featured, true);
  assert.equal(cards[0]?.title, "Consultant");
  assert.doesNotMatch(JSON.stringify(cards), /\bbio\b|summary/);
  const quotes = doctorQuoteContent(doctorSource);
  assert.equal(quotes[0]?.summary, doctorSource[0]?.summary);
  assert.equal(
    quotes[0]?.photoUrl || quotes[0]?.coverImageUrl,
    doctorSource[0]?.photoUrl || doctorSource[0]?.coverImageUrl,
  );
  assert.doesNotMatch(JSON.stringify(quotes), /\bbio\b|languages/);
  const headings = {
    quotesEyebrow: "عنوان",
    quotesEyebrowEn: "Heading",
    quotesTitle: "عنوان القسم",
    quotesTitleEn: "Section",
    quotesDescription: "شرح",
    quotesDescriptionEn: "Description",
  };
  assert.deepEqual(quoteHeadingContent({ ...headings }), headings);
  const post = {
    id: "article",
    slug: "article",
    title: "مقال",
    titleEn: "Article",
    excerpt: "مقدمة",
    excerptEn: "Introduction",
    coverImageUrl: "/article.webp",
    category: "مجلة",
    body: ["Long article body".repeat(500)],
  };
  assert.deepEqual(journalCardContent([post]), [
    {
      id: post.id,
      slug: post.slug,
      title: post.title,
      titleEn: post.titleEn,
      excerpt: post.excerpt,
      excerptEn: post.excerptEn,
      coverImageUrl: post.coverImageUrl,
      category: post.category,
    },
  ]);
  assert.doesNotMatch(JSON.stringify(journalCardContent([post])), /body/);
  assert.equal(
    journalCardContent([{ ...post, titleEn: null }])[0]?.titleEn,
    null,
  );
});

test("actual server header projects at the client boundary and excludes unpublished menu records", async () => {
  function Menu() {
    return null;
  }
  function Booking() {
    return null;
  }
  const stub = () => null;
  const loaded = productionModule(
    "../components/layout/SiteHeader.tsx",
    {
      "react/jsx-runtime": { jsx, jsxs },
      "@/lib/prisma-enums": { ContentStatus: { PUBLISHED: "PUBLISHED" } },
      "next/link": { default: stub },
      "next/headers": {
        headers: async () =>
          new Headers({ "x-url": "https://rejuvera.sa/contact" }),
      },
      "@/lib/content-repository": {
        getServices: async () => [
          { ...services[0], slug: "draft", status: "DRAFT" },
          ...services,
        ],
        getDoctors: async () => doctors,
        getDevices: async () => devices,
        getRuntimeSettings: async () => ({
          brand: { siteName: "Rejuvera", logoAlt: "Rejuvera" },
          contact: { phone: "0111111111", email: "clinic@example.test" },
        }),
      },
      "@/lib/recaptcha": { getPublicSiteKey: () => "public-site-key" },
      "@/lib/public-client-content": { bookingServiceOptions, megaMenuContent },
      "@/components/navigation/SiteMegaMenu": { SiteMegaMenu: Menu },
      "@/components/contact/PhoneCallLink": { PhoneCallLink: stub },
      "./BookingModal": { BookingModal: Booking },
      "./BrandLogo": { BrandLogo: stub },
      "./LanguageToggle": { LanguageToggle: stub },
      "./ThemeToggle": { ThemeToggle: stub },
    },
    { Headers },
  );
  const nodes: any[] = [];
  function walk(value: any) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== "object") return;
    if (value.type) nodes.push(value);
    walk(value.props?.children);
  }
  walk(await loaded.SiteHeader({ phoneOverride: "0555555555" }));
  const menu = nodes.find((node) => node.type === Menu);
  assert.deepEqual(
    menu.props.services,
    megaMenuContent({ services, doctors, devices }).services,
  );
  const buttons = nodes.filter((node) => node.type === Booking);
  assert.equal(buttons.length, 2);
  for (const button of buttons) {
    assert.deepEqual(button.props.services, bookingServiceOptions(services));
    assert.equal(button.props.recaptchaSiteKey, "public-site-key");
  }
  assert.ok(nodes.some((node) => node.props.href === "tel:0555555555"));
});

test("public revision is a full Git hash or null, never arbitrary environment contents", () => {
  const sha = "abcdef0123".repeat(4);
  assert.equal(releaseRevision(sha.toUpperCase()), sha);
  for (const invalid of [
    undefined,
    "",
    "main",
    sha.slice(0, 7),
    ` ${sha}`,
    `${sha}\n`,
    "private-credential-do-not-return",
  ]) {
    assert.equal(releaseRevision(invalid), null);
  }
});

test("actual footer renders published services only even when draft/archive records sort first", async () => {
  const stub = () => null;
  const loaded = productionModule("../components/layout/SiteFooter.tsx", {
    "react/jsx-runtime": { jsx, jsxs },
    "next/image": { default: stub },
    "next/link": { default: stub },
    "@/lib/prisma-enums": { ContentStatus: { PUBLISHED: "PUBLISHED" } },
    "@/components/contact/PhoneCallLink": { PhoneCallLink: stub },
    "@/components/layout/BookingModal": { BookingModal: stub },
    "@/components/layout/BrandLogo": { BrandLogo: stub },
    "@/components/layout/SocialIconCluster": { normalizeSocialUrl: () => "" },
    "@/components/layout/ScrollToTopButton": { ScrollToTopButton: stub },
    "@/lib/content-repository": {
      getServices: async () => [
        {
          ...services[0],
          slug: "hidden-draft",
          name: "PRIVATE_DRAFT_TITLE",
          status: "DRAFT",
        },
        {
          ...services[0],
          slug: "hidden-archive",
          name: "PRIVATE_ARCHIVE_TITLE",
          status: "ARCHIVED",
        },
        ...services,
      ],
      getRuntimeSettings: async () => ({
        brand: { logoAlt: "Rejuvera", siteName: "Rejuvera" },
        contact: {
          phone: "0111111111",
          whatsapp: "0111111111",
          domain: "rejuvera.sa",
          email: "clinic@example.test",
        },
        socialVisibility: {},
        social: {
          whatsappBusiness: "",
          instagram: "",
          twitter: "",
          youtube: "",
          linkedin: "",
          tiktok: "",
          snapchat: "",
        },
      }),
    },
    "@/lib/recaptcha": { getPublicSiteKey: () => "public-site-key" },
    "@/lib/public-client-content": { bookingServiceOptions },
    "@/lib/clinic-contact": {
      withGoogleWhatsappReferral: (href: string) => href,
    },
  });
  const tree = await loaded.SiteFooter();
  const serialized = JSON.stringify(tree);
  assert.doesNotMatch(
    serialized,
    /hidden-draft|hidden-archive|PRIVATE_DRAFT_TITLE|PRIVATE_ARCHIVE_TITLE/,
  );
  const links: string[] = [];
  function walk(node: any) {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (node.props?.href?.startsWith("/services/")) links.push(node.props.href);
    walk(node.props?.children);
  }
  walk(tree);
  assert.deepEqual(
    links,
    services.slice(0, 6).map((s) => `/services/${s.slug}`),
  );
});

test("actual health route identifies the serving revision, stays uncached and imports no DB", async () => {
  for (const revision of [
    "abcdef0123".repeat(4),
    undefined,
    "private-credential-do-not-return",
  ]) {
    const loaded = productionModule(
      "../app/api/health/route.ts",
      { "@/lib/release-revision": { releaseRevision } },
      { process: { env: { RENDER_GIT_COMMIT: revision } }, Response },
    );
    const response = await loaded.GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "rejuvera");
    assert.equal(body.revision, releaseRevision(revision));
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));
    assert.doesNotMatch(JSON.stringify(body), /private-credential/);
  }
});
