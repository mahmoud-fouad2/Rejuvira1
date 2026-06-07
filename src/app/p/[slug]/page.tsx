import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCustomPageBySlug } from "@/lib/content-repository";
import { hardenCustomPageLeadForms } from "@/lib/custom-page-form-hardening";
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
  const robots = page.noindex ? "noindex,nofollow" : undefined;
  const title = page.metaTitle || page.seoTitle || page.titleAr;
  const description =
    page.metaDescription || page.seoDescription || page.titleEn || undefined;
  const canonicalSlug = page.seoSlug || page.slug;
  const canonicalUrl = `${getSiteUrl()}/p/${canonicalSlug}`;
  const ogTitle = page.ogTitle || title;
  const ogDescription = page.ogDescription || description;
  return {
    title,
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
      ...(page.ogImage ? { images: [{ url: page.ogImage }] } : {}),
    },
    twitter: {
      card: page.ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription,
      ...(page.ogImage ? { images: [page.ogImage] } : {}),
    },
    other: page.hashtags.length
      ? { "article:tag": page.hashtags.join(", ") }
      : undefined,
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
  const page = await getCustomPageBySlug(slug);
  if (!page) notFound();
  if (page.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const isUploadedHtml = page.htmlContent.includes("data-uploaded-html");
  const showHeader = readBuilderBoolean(page.htmlContent, "header");
  const showFooter = readBuilderBoolean(page.htmlContent, "footer");
  const pageLayout = readPageLayout(page.htmlContent);
  const safeHtml = hardenCustomPageLeadForms(
    sanitizeHtml(page.htmlContent),
    undefined,
    page.slug,
  );

  return (
    <>
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
        <article
          className={`rv-custom-page__content ${
            isUploadedHtml ? "rv-custom-page__content--uploaded" : ""
          }`}
          dir="auto"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </main>
      {showFooter ? <SiteFooter /> : null}
    </>
  );
}
