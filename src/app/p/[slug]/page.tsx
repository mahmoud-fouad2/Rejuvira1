import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";

import { PhoneCallLink } from "@/components/contact/PhoneCallLink";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getCustomPageBySlug,
  getRuntimeSettings,
} from "@/lib/content-repository";
import { hardenCustomPageLeadForms } from "@/lib/custom-page-form-hardening";
import {
  optimizeCustomPageImages,
  repairCustomPageMediaUrls,
  unwrapAdminMediaProxyUrl,
} from "@/lib/custom-page-media";
import {
  buildCustomPageJsonLd,
  hasCustomPageH1,
  resolveCustomPageSeo,
} from "@/lib/custom-page-quality";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function readBuilderBoolean(html: string, attr: "header" | "footer") {
  const match = html.match(new RegExp(`data-${attr}="(true|false)"`));
  if (!match) return true;
  return match[1] !== "false";
}

function readPageLayout(html: string) {
  const match = html.match(/data-layout="(theme|full|blank|canvas|custom)"/);
  return match?.[1] ?? "theme";
}

function absoluteMediaUrl(value?: string | null) {
  if (!value) return undefined;
  const repaired = unwrapAdminMediaProxyUrl(repairCustomPageMediaUrls(value));
  if (/^https?:\/\//i.test(repaired)) return repaired;
  if (repaired.startsWith("/")) return `${getSiteUrl()}${repaired}`;
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page || page.status !== ContentStatus.PUBLISHED) {
    return { title: "Rejuvera" };
  }
  const seo = resolveCustomPageSeo(page, slug);
  const robots = page.noindex ? "noindex,nofollow" : undefined;
  const title = seo.title;
  const description = seo.description;
  const canonicalSlug = page.seoSlug || page.slug;
  const canonicalUrl = `${getSiteUrl()}/p/${canonicalSlug}`;
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = absoluteMediaUrl(page.ogImage);
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { absolute: title },
    description,
    keywords: page.keywords.length ? [...page.keywords] : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      type: "website",
      locale: "ar_SA",
      alternateLocale: "en_US",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    other: {
      "geo.region": "SA-01",
      "geo.placename": "Riyadh",
      "geo.position": "24.7225835;46.6527524",
      ICBM: "24.7225835, 46.6527524",
      ...(page.hashtags.length
        ? { "article:tag": page.hashtags.join(", ") }
        : {}),
    },
    ...(robots ? { robots } : {}),
  };
}

export default async function CustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lead?: string }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const [page, runtimeSettings, headerStore] = await Promise.all([
    getCustomPageBySlug(slug),
    getRuntimeSettings(),
    headers(),
  ]);
  if (!page) notFound();
  if (page.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const isUploadedHtml = page.htmlContent.includes("data-uploaded-html");
  const showHeader = readBuilderBoolean(page.htmlContent, "header");
  const showFooter = readBuilderBoolean(page.htmlContent, "footer");
  const pageLayout = readPageLayout(page.htmlContent);
  const repairedHtml = repairCustomPageMediaUrls(page.htmlContent);
  const safeHtml = hardenCustomPageLeadForms(
    sanitizeHtml(optimizeCustomPageImages(repairedHtml)),
    undefined,
    page.slug,
  );
  const seo = resolveCustomPageSeo(page, slug);
  const canonicalSlug = page.seoSlug || page.slug;
  const canonicalUrl = `${getSiteUrl()}/p/${canonicalSlug}`;
  const pageJsonLd = buildCustomPageJsonLd({
    page,
    routeSlug: slug,
    title: seo.title,
    description: seo.description,
    canonicalUrl,
    image: absoluteMediaUrl(page.ogImage),
  });
  const semanticTitle = seo.title.split("|")[0]?.trim() || page.titleAr;
  const phoneDigits = runtimeSettings.contact.phone.replace(/\D/g, "");
  const nonce = headerStore.get("x-nonce") ?? "";

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      {showHeader ? <SiteHeader /> : null}
      <main
        className={`rv-custom-page rv-custom-page--${pageLayout} ${
          isUploadedHtml ? "rv-custom-page--uploaded" : ""
        }`}
      >
        {query.lead === "success" ||
        query.lead === "duplicate" ||
        query.lead === "error" ? (
          <div
            className={`mx-auto mt-6 max-w-4xl rounded-2xl border px-5 py-3 text-center text-sm font-semibold ${
              query.lead === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : query.lead === "duplicate"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {query.lead === "success"
              ? "تم استلام طلبك بنجاح، وسيتواصل معك الفريق قريباً."
              : query.lead === "duplicate"
                ? "رقمك مسجل لدينا بالفعل، وسيتواصل معك الفريق في أقرب وقت."
                : "تعذر إرسال الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى."}
          </div>
        ) : null}
        {!hasCustomPageH1(repairedHtml) ? (
          <h1 className="rv-custom-page__semantic-title">{semanticTitle}</h1>
        ) : null}
        <article
          className={`rv-custom-page__content ${
            isUploadedHtml ? "rv-custom-page__content--uploaded" : ""
          }`}
          dir="auto"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        <aside
          className="rv-custom-page__contact-cta"
          aria-label="التواصل والحجز"
        >
          <div>
            <p className="rv-custom-page__contact-kicker">
              تحتاج مساعدة قبل الحجز؟
            </p>
            <h2>تواصل مع فريق ريجوفيرا</h2>
            <p>اتصل بنا مباشرة أو أرسل طلبك ليؤكد الفريق التفاصيل المناسبة.</p>
          </div>
          <div className="rv-custom-page__contact-actions">
            {phoneDigits ? (
              <PhoneCallLink
                href={`tel:${phoneDigits}`}
                className="rv-custom-page__contact-call"
              >
                اتصال مباشر
              </PhoneCallLink>
            ) : null}
            <a href="/contact" className="rv-custom-page__contact-book">
              احجز استشارة
            </a>
          </div>
        </aside>
      </main>
      {showFooter ? <SiteFooter /> : null}
    </>
  );
}
