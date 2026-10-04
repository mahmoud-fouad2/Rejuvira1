import type { Metadata } from "next";
import { ContentStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JournalBody } from "@/components/public/JournalBody";
import { getCspNonce } from "@/lib/csp-nonce";
import {
  getDoctors,
  getJournalPostBySlug,
  getServices,
} from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";
import { hasEnglishJournalContent } from "@/lib/journal-content";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (
    !post ||
    (post.status ?? ContentStatus.PUBLISHED) !== ContentStatus.PUBLISHED
  ) {
    return {
      title: "المقال غير موجود",
    };
  }

  const hasEnglish = hasEnglishJournalContent(post);
  const english = hasEnglish && (await searchParams).lang === "en";
  const arUrl = `${getSiteUrl()}/journal/${post.slug}`;
  const canonicalUrl = english ? `${arUrl}?lang=en` : arUrl;
  const title = english ? post.titleEn! : post.title;
  const description = english ? post.excerptEn! : post.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: arUrl,
        "ar-SA": arUrl,
        ...(hasEnglish
          ? { en: `${arUrl}?lang=en`, "en-US": `${arUrl}?lang=en` }
          : {}),
        "x-default": arUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [post.coverImageUrl],
      type: "article",
      publishedTime: post.publishedAt,
      locale: english ? "en_US" : "ar_SA",
      ...(hasEnglish ? { alternateLocale: english ? "ar_SA" : "en_US" } : {}),
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "geo.region": "SA-01",
      "geo.placename": "Riyadh",
      "geo.position": "24.7225835;46.6527524",
      ICBM: "24.7225835, 46.6527524",
    },
  };
}

export default async function JournalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (
    !post ||
    (post.status ?? ContentStatus.PUBLISHED) !== ContentStatus.PUBLISHED
  ) {
    notFound();
  }

  const [services, doctors, nonce] = await Promise.all([
    getServices(),
    getDoctors(),
    getCspNonce(),
  ]);

  const english =
    hasEnglishJournalContent(post) && (await searchParams).lang === "en";
  const articleTitle = english ? post.titleEn! : post.title;
  const articleExcerpt = english ? post.excerptEn! : post.excerpt;
  const articleBody = english ? post.bodyEn! : post.body;
  const articleLang = english ? "en" : "ar";
  const relatedServiceSlugSet = new Set(post.relatedServiceSlugs);
  const doctorsBySlug = new Map(doctors.map((doctor) => [doctor.slug, doctor]));
  const relatedServices = services.filter((service) =>
    relatedServiceSlugSet.has(service.slug),
  );
  const relatedDoctors = post.relatedDoctorSlugs
    .map((doctorSlug) => doctorsBySlug.get(doctorSlug))
    .filter((doctor) => doctor !== undefined);
  const postUrl = `${getSiteUrl()}/journal/${post.slug}${english ? "?lang=en" : ""}`;
  const journalJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: articleTitle,
    description: articleExcerpt,
    image: post.coverImageUrl,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    url: postUrl,
    inLanguage: articleLang,
    mainEntityOfPage: postUrl,
    publisher: {
      "@id": `${getSiteUrl()}#organization`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${getSiteUrl()}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${getSiteUrl()}/journal`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: articleTitle,
        item: postUrl,
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <script
        id={`journal-structured-data-${post.slug}`}
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(journalJsonLd),
        }}
      />
      <script
        id={`journal-breadcrumb-data-${post.slug}`}
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />
      <main className="section-shell pt-8 pb-20">
        <section
          lang={articleLang}
          dir={english ? "ltr" : "rtl"}
          className="surface-panel rounded-[2.5rem] p-7 lg:p-10"
        >
          <p className="text-ink-soft font-mono text-xs tracking-[0.36em] uppercase">
            {post.category}
          </p>
          <h1 className="balanced-text text-ink mt-4 font-serif text-4xl leading-[1.15] tracking-[-0.02em] md:text-5xl">
            {articleTitle}
          </h1>
          <div className="text-ink-faint mt-5 flex flex-wrap gap-3 text-sm">
            <span>{post.readingTime}</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString(
                english ? "en-US" : "ar-SA",
              )}
            </span>
          </div>
          <p className="text-ink-soft mt-6 max-w-3xl text-base leading-8 md:text-lg">
            {articleExcerpt}
          </p>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article
            lang={articleLang}
            dir={english ? "ltr" : "rtl"}
            className="surface-panel rounded-[2.5rem] p-7 lg:p-10"
          >
            <JournalBody body={articleBody} title={articleTitle} />
          </article>
          <div className="grid gap-5">
            <article className="surface-panel rounded-[2rem] p-6">
              <p className="text-ink-soft font-mono text-[11px] tracking-[0.3em] uppercase">
                الخدمات المرتبطة
              </p>
              <div className="mt-4 grid gap-3">
                {relatedServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="border-line bg-surface text-ink-soft hover:border-purple-mid/40 rounded-[1.4rem] border px-4 py-4 text-sm transition-colors"
                  >
                    <span className="text-ink block font-semibold">
                      {service.name}
                    </span>
                    <span className="mt-2 block leading-6">
                      {service.excerpt}
                    </span>
                  </Link>
                ))}
              </div>
            </article>
            <article className="surface-panel rounded-[2rem] p-6">
              <p className="text-ink-soft font-mono text-[11px] tracking-[0.3em] uppercase">
                الأطباء المرتبطون
              </p>
              <div className="mt-4 grid gap-3">
                {relatedDoctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/doctors/${doctor.slug}`}
                    className="border-line bg-surface text-ink-soft hover:border-purple-mid/40 rounded-[1.4rem] border px-4 py-4 text-sm transition-colors"
                  >
                    <span className="text-ink block font-semibold">
                      {doctor.name}
                    </span>
                    <span className="mt-2 block leading-6">
                      {doctor.specialty}
                    </span>
                  </Link>
                ))}
              </div>
            </article>
            <article className="surface-panel rounded-[2rem] p-6">
              <p className="text-ink-soft font-mono text-[11px] tracking-[0.3em] uppercase">
                الخطوة التالية
              </p>
              <h2 className="text-ink mt-4 font-serif text-3xl tracking-[-0.04em]">
                حوّل المعرفة إلى استشارة واضحة.
              </h2>
              <p className="text-ink-soft mt-3 text-sm leading-7">
                حين تصبح الصورة أوضح، تكون الخطوة التالية بسيطة: تواصلي معنا،
                اطرح أسئلتك، ودع الفريق يوجّهك إلى المسار الأنسب.
              </p>
              <Link
                href="/contact"
                className="bg-ink text-canvas mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                ابدئي مسار التواصل
              </Link>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
