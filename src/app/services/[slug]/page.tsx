import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyMobileCta } from "@/components/public/StickyMobileCta";
import { ServiceSearchQuestions } from "@/components/public/ServiceSearchQuestions";
import { ServicePatientGuide } from "@/components/public/ServicePatientGuide";
import { getCspNonce } from "@/lib/csp-nonce";
import {
  getDoctors,
  getDevices,
  getRuntimeSettings,
  getServiceBySlug,
  getServices,
  getJournalPosts,
} from "@/lib/content-repository";
import { getCoreServiceSeo } from "@/lib/core-search";
import { ContentStatus } from "@/lib/prisma-enums";
import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { getSiteUrl } from "@/lib/seo";
import { publicServiceSlug } from "@/lib/public-service-slug";
import { hasEnglishServiceContent, resolveServiceSeo } from "@/lib/service-seo";
import {
  servicePatientGuide,
  serviceContentModifiedAt,
} from "@/lib/service-patient-guides";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const publicSlug = publicServiceSlug(slug);
  if (publicSlug !== slug) permanentRedirect(`/services/${publicSlug}`);
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  if (service.status !== ContentStatus.PUBLISHED) {
    const session = await auth();
    if (
      !session?.user?.id ||
      !canAccessAdminRoute("/admin/services", session.user.role)
    ) {
      notFound();
    }
  }

  const arUrl = new URL(`/services/${service.slug}`, getSiteUrl()).href;
  const coreSeo = getCoreServiceSeo(service);
  const seo = resolveServiceSeo(service, coreSeo);
  const hasEnglish = hasEnglishServiceContent(service);
  const english = hasEnglish && (await searchParams).lang === "en";
  const canonicalUrl = english ? `${arUrl}?lang=en` : arUrl;
  const title = english ? seo.titleEn : seo.titleAr;
  const description = english ? seo.descriptionEn : seo.descriptionAr;

  return {
    title: { absolute: title },
    description,
    keywords: [
      service.name,
      service.nameEn ?? "",
      service.category,
      service.categoryEn ?? "",
      "ريجوفيرا",
      "Rejuvera Medical Center",
      "مركز تجميل الرياض",
      "Aesthetic clinic Riyadh",
      ...(service.keywordsAr ?? []),
      ...(service.keywordsEn ?? []),
      ...(coreSeo?.keywordsAr ?? []),
      ...(coreSeo?.keywordsEn ?? []),
      ...service.doctorSlugs,
      ...service.deviceSlugs,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: english ? "en_US" : "ar_SA",
      ...(hasEnglish ? { alternateLocale: english ? "ar_SA" : "en_US" } : {}),
      images: [service.coverImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [service.coverImageUrl],
    },
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
    robots: {
      index: service.status === ContentStatus.PUBLISHED,
      follow: true,
    },
  };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const publicSlug = publicServiceSlug(slug);
  if (publicSlug !== slug) permanentRedirect(`/services/${publicSlug}`);
  const [service, doctors, devices, runtimeSettings, nonce, services, posts] =
    await Promise.all([
      getServiceBySlug(slug),
      getDoctors(),
      getDevices(),
      getRuntimeSettings(),
      getCspNonce(),
      getServices(),
      getJournalPosts(),
    ]);

  if (!service) {
    notFound();
  }

  if (service.status !== ContentStatus.PUBLISHED) {
    const session = await auth();
    if (
      !session?.user?.id ||
      !canAccessAdminRoute("/admin/services", session.user.role)
    ) {
      notFound();
    }
  }

  const doctorSlugSet = new Set(service.doctorSlugs);
  const deviceSlugSet = new Set(service.deviceSlugs);
  const relatedDoctors = doctors.filter(
    (doctor) =>
      doctor.status === ContentStatus.PUBLISHED &&
      doctorSlugSet.has(doctor.slug),
  );
  const relatedDevices = devices.filter(
    (device) =>
      device.status === ContentStatus.PUBLISHED &&
      deviceSlugSet.has(device.slug),
  );
  const english =
    hasEnglishServiceContent(service) && (await searchParams).lang === "en";
  const serviceUrl = `${getSiteUrl()}/services/${service.slug}${english ? "?lang=en" : ""}`;
  const published = service.status === ContentStatus.PUBLISHED;
  const benefits = english ? (service.benefitsEn ?? []) : service.benefits;
  const guide = published ? servicePatientGuide(service.slug) : undefined;
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${serviceUrl}#webpage`,
    name: english ? service.nameEn : service.name,
    description: english ? service.descriptionEn : service.description,
    image: service.coverImageUrl,
    url: serviceUrl,
    inLanguage: english ? "en" : "ar",
    ...(published
      ? { dateModified: serviceContentModifiedAt(service.updatedAt) }
      : service.updatedAt
        ? { dateModified: service.updatedAt }
        : {}),
    isPartOf: { "@id": `${getSiteUrl()}#website` },
    publisher: { "@id": `${getSiteUrl()}#organization` },
    ...(guide ? { citation: guide.sources.map((source) => source.url) } : {}),
    mainEntity: {
      "@type": "Service",
      "@id": `${getSiteUrl()}/services/${service.slug}#service`,
      name: english ? service.nameEn : service.name,
      serviceType: english
        ? (service.categoryEn ?? service.category)
        : service.category,
      provider: { "@id": `${getSiteUrl()}#organization` },
      areaServed: { "@type": "City", name: "Riyadh" },
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
        name: "Services",
        item: `${getSiteUrl()}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: serviceUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        id={`service-structured-data-${service.slug}`}
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
      />
      <script
        id={`service-breadcrumb-data-${service.slug}`}
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />
      <main
        lang={english ? "en" : "ar"}
        dir={english ? "ltr" : "rtl"}
        data-content-language={english ? "en" : "ar"}
        data-has-english={hasEnglishServiceContent(service)}
        className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-20 px-6 pt-16 pb-32 lg:px-10"
      >
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">
              {!english && <span className="lang-ar">{service.category}</span>}
              {english && (
                <span className="lang-en">
                  {service.categoryEn ?? service.category}
                </span>
              )}
            </p>
            <h1 className="text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              {!english && <span className="lang-ar">{service.name}</span>}
              {english && (
                <span className="lang-en">
                  {service.nameEn ?? service.name}
                </span>
              )}
            </h1>
            <p className="text-ink-soft mt-6 text-lg leading-8">
              {!english && <span className="lang-ar">{service.excerpt}</span>}
              {english && (
                <span className="lang-en">
                  {service.excerptEn ?? service.excerpt}
                </span>
              )}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  {!english && <span className="lang-ar">القسم</span>}
                  {english && <span className="lang-en">Category</span>}
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {!english && (
                    <span className="lang-ar">{service.category}</span>
                  )}
                  {english && (
                    <span className="lang-en">
                      {service.categoryEn ?? service.category}
                    </span>
                  )}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  {!english && <span className="lang-ar">الأطباء</span>}
                  {english && <span className="lang-en">Doctors</span>}
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {relatedDoctors.length}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  {!english && <span className="lang-ar">الأجهزة</span>}
                  {english && <span className="lang-en">Devices</span>}
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {relatedDevices.length}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                {!english && (
                  <span className="lang-ar">احجزي استشارة لهذه الخدمة</span>
                )}
                {english && <span className="lang-en">Book this service</span>}
              </Link>
              <Link href="/services" className="btn-secondary">
                {!english && <span className="lang-ar">كل الخدمات</span>}
                {english && <span className="lang-en">All services</span>}
              </Link>
            </div>
          </article>

          <div className="surface-panel overflow-hidden rounded-[2.5rem] p-5 shadow-sm">
            <div className="rv-service-detail-visual rv-service-art-frame relative min-h-[36rem] overflow-hidden rounded-[2rem]">
              <Image
                src={service.coverImageUrl}
                alt={service.name}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="rv-service-art-img"
                priority
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">
              {!english && <span className="lang-ar">تفاصيل الخدمة</span>}
              {english && <span className="lang-en">Service Details</span>}
            </p>
            <h2 className="text-ink-strong mt-5 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              {!english && (
                <span className="lang-ar">تفاصيل {service.name}</span>
              )}
              {english && (
                <span className="lang-en">
                  {service.nameEn ?? service.name}
                </span>
              )}
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              {!english && (
                <span className="lang-ar">{service.description}</span>
              )}
              {english && (
                <span className="lang-en">
                  {service.descriptionEn ?? service.description}
                </span>
              )}
            </p>

            {benefits.length > 0 ? (
              <div className="mt-8 grid gap-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="border-line bg-surface text-ink-soft rounded-[1.4rem] border px-5 py-4 text-sm"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-10">
              <p className="eyebrow text-ink-soft">
                {!english && <span className="lang-ar">الأطباء المرتبطون</span>}
                {english && <span className="lang-en">Linked Doctors</span>}
              </p>
              <div className="mt-6 grid gap-4">
                {relatedDoctors.length > 0 ? (
                  relatedDoctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.slug}`}
                      className="border-line bg-surface text-ink-soft hover:text-ink rounded-[1.5rem] border px-5 py-5 text-sm transition-colors"
                    >
                      <span className="text-ink-strong block font-semibold">
                        {!english && (
                          <span className="lang-ar">{doctor.name}</span>
                        )}
                        {english && (
                          <span className="lang-en">
                            {doctor.nameEn ?? doctor.name}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block leading-6">
                        {!english && (
                          <span className="lang-ar">{doctor.specialty}</span>
                        )}
                        {english && (
                          <span className="lang-en">
                            {doctor.specialtyEn ?? doctor.specialty}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm">
                    {!english && (
                      <span className="lang-ar">
                        لا يوجد طبيب مرتبط بهذه الخدمة حالياً.
                      </span>
                    )}
                    {english && (
                      <span className="lang-en">
                        No doctors are currently linked to this service.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </article>

            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-10">
              <p className="eyebrow text-ink-soft">
                {!english && <span className="lang-ar">الأجهزة المرتبطة</span>}
                {english && <span className="lang-en">Linked Devices</span>}
              </p>
              <div className="mt-6 grid gap-4">
                {relatedDevices.length > 0 ? (
                  relatedDevices.map((device) => (
                    <Link
                      key={device.id}
                      href="/devices"
                      className="border-line bg-surface text-ink-soft hover:text-ink rounded-[1.5rem] border px-5 py-5 text-sm transition-colors"
                    >
                      <span className="text-ink-strong block font-semibold">
                        {!english && (
                          <span className="lang-ar">{device.name}</span>
                        )}
                        {english && (
                          <span className="lang-en">
                            {device.nameEn ?? device.name}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block leading-6">
                        {!english && (
                          <span className="lang-ar">{device.excerpt}</span>
                        )}
                        {english && (
                          <span className="lang-en">
                            {device.excerptEn ?? device.excerpt}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm">
                    {!english && (
                      <span className="lang-ar">
                        لا توجد أجهزة مرتبطة بهذه الخدمة حاليًا.
                      </span>
                    )}
                    {english && (
                      <span className="lang-en">
                        No devices are currently linked to this service.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
        {published && (
          <>
            <ServicePatientGuide
              english={english}
              service={service}
              services={services.filter(
                (item) => item.status === ContentStatus.PUBLISHED,
              )}
              posts={posts}
            />
            <ServiceSearchQuestions
              english={english}
              slug={service.slug}
              name={service.name}
              nameEn={service.nameEn}
            />
          </>
        )}
      </main>
      <StickyMobileCta
        titleAr={service.name}
        titleEn={service.nameEn ?? service.name}
        whatsappNumber={
          runtimeSettings.contact.whatsapp || runtimeSettings.contact.phone
        }
        bookingHref="/contact"
        whatsappMessage={`مرحباً ريجوفيرا، أود حجز استشارة لخدمة ${service.name}.`}
      />
      <SiteFooter />
    </div>
  );
}
