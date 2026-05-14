import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getDoctorBySlug,
  getJournalPostBySlug,
  getServices,
} from "@/lib/content-repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) {
    return {
      title: "المقال غير موجود",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImageUrl],
      type: "article",
    },
  };
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [services, doctors] = await Promise.all([
    getServices(),
    Promise.all(
      post.relatedDoctorSlugs.map((doctorSlug) => getDoctorBySlug(doctorSlug)),
    ),
  ]);

  const relatedServices = services.filter((service) =>
    post.relatedServiceSlugs.includes(service.slug),
  );
  const relatedDoctors = doctors.filter((doctor) => doctor !== null);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <Script
        id={`journal-structured-data-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImageUrl,
            datePublished: post.publishedAt,
            url: `https://rejuveracenter.sa/journal/${post.slug}`,
            publisher: {
              "@type": "Organization",
              name: "Rejuvira Center",
            },
          }),
        }}
      />
      <SiteHeader />
      <main className="section-shell pt-8 pb-20">
        <section className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
          <p className="text-ink-soft font-mono text-xs tracking-[0.36em] uppercase">
            {post.category}
          </p>
          <h1 className="balanced-text text-ink mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
            {post.title}
          </h1>
          <div className="text-ink-faint mt-5 flex flex-wrap gap-3 text-sm">
            <span>{post.readingTime}</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("ar-SA")}
            </span>
          </div>
          <p className="text-ink-soft mt-6 max-w-3xl text-base leading-8">
            {post.excerpt}
          </p>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
            <div className="grid gap-6">
              {post.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-ink-soft text-base leading-9"
                >
                  {paragraph}
                </p>
              ))}
            </div>
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
                    className="border-line bg-surface text-ink-soft rounded-[1.4rem] border px-4 py-4 text-sm"
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
                    className="border-line bg-surface text-ink-soft rounded-[1.4rem] border px-4 py-4 text-sm"
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
                className="bg-ink text-canvas mt-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
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
