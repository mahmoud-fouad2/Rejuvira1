import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getDoctors,
  getDevices,
  getServiceBySlug,
} from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "الخدمة غير موجودة | Service not found",
    };
  }

  const canonicalUrl = `${getSiteUrl()}/services/${service.slug}`;

  return {
    title: service.nameEn ? `${service.name} | ${service.nameEn}` : service.name,
    description: service.excerptEn
      ? `${service.excerpt} ${service.excerptEn}`
      : service.excerpt,
    keywords: [
      service.name,
      service.nameEn ?? "",
      service.category,
      service.categoryEn ?? "",
      "ريجوفيرا",
      "Rejuvera Medical Center",
      "مركز تجميل الرياض",
      "Aesthetic clinic Riyadh",
      ...service.doctorSlugs,
      ...service.deviceSlugs,
    ].filter(Boolean),
    openGraph: {
      title: service.name,
      description: service.excerpt,
      url: canonicalUrl,
      images: [service.coverImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: service.name,
      description: service.excerpt,
      images: [service.coverImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, doctors, devices] = await Promise.all([
    getServiceBySlug(slug),
    getDoctors(),
    getDevices(),
  ]);

  if (!service) {
    notFound();
  }

  const doctorSlugSet = new Set(service.doctorSlugs);
  const deviceSlugSet = new Set(service.deviceSlugs);
  const relatedDoctors = doctors.filter((doctor) =>
    doctorSlugSet.has(doctor.slug),
  );
  const relatedDevices = devices.filter((device) =>
    deviceSlugSet.has(device.slug),
  );
  const serviceUrl = `${getSiteUrl()}/services/${service.slug}`;
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    alternateName: service.nameEn,
    description: service.excerpt,
    image: service.coverImageUrl,
    url: serviceUrl,
    procedureType: service.category,
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
      />
      <script
        id={`service-breadcrumb-data-${service.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-20 px-6 pt-16 pb-32 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">
              <span className="lang-ar">{service.category}</span>
              <span className="lang-en">
                {service.categoryEn ?? service.category}
              </span>
            </p>
            <h1 className="text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">{service.name}</span>
              <span className="lang-en">{service.nameEn ?? service.name}</span>
            </h1>
            <p className="text-ink-soft mt-6 text-lg leading-8">
              <span className="lang-ar">{service.description}</span>
              <span className="lang-en">
                {service.descriptionEn ?? service.description}
              </span>
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  <span className="lang-ar">القسم</span>
                  <span className="lang-en">Category</span>
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  <span className="lang-ar">{service.category}</span>
                  <span className="lang-en">
                    {service.categoryEn ?? service.category}
                  </span>
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  <span className="lang-ar">الأطباء</span>
                  <span className="lang-en">Doctors</span>
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {relatedDoctors.length}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">
                  <span className="lang-ar">الأجهزة</span>
                  <span className="lang-en">Devices</span>
                </p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {relatedDevices.length}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                <span className="lang-ar">احجزي استشارة لهذه الخدمة</span>
                <span className="lang-en">Book this service</span>
              </Link>
              <Link href="/services" className="btn-secondary">
                <span className="lang-ar">كل الخدمات</span>
                <span className="lang-en">All services</span>
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
            <div className="mt-4 rounded-[1.5rem] bg-white/88 p-5 shadow-sm backdrop-blur">
              <p className="text-ink-strong font-serif text-2xl leading-snug">
                <span className="lang-ar">{service.excerpt}</span>
                <span className="lang-en">
                  {service.excerptEn ?? service.excerpt}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">
              <span className="lang-ar">تفاصيل الخدمة</span>
              <span className="lang-en">Service Details</span>
            </p>
            <h2 className="text-ink-strong mt-5 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              <span className="lang-ar">
                تفاصيل {service.name}
              </span>
              <span className="lang-en">
                {service.nameEn ?? service.name}
              </span>
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              <span className="lang-ar">
                {service.description}
              </span>
              <span className="lang-en">
                {service.descriptionEn ?? service.description}
              </span>
            </p>

            {service.benefits.length > 0 ? (
              <div className="mt-8 grid gap-3">
                {service.benefits.map((benefit) => (
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
                <span className="lang-ar">الأطباء المرتبطون</span>
                <span className="lang-en">Linked Doctors</span>
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
                        <span className="lang-ar">{doctor.name}</span>
                        <span className="lang-en">
                          {doctor.nameEn ?? doctor.name}
                        </span>
                      </span>
                      <span className="mt-2 block leading-6">
                        <span className="lang-ar">{doctor.specialty}</span>
                        <span className="lang-en">
                          {doctor.specialtyEn ?? doctor.specialty}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm">
                    <span className="lang-ar">
                      لا يوجد طبيب مرتبط بهذه الخدمة حالياً.
                    </span>
                    <span className="lang-en">
                      No doctors are currently linked to this service.
                    </span>
                  </p>
                )}
              </div>
            </article>

            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-10">
              <p className="eyebrow text-ink-soft">
                <span className="lang-ar">الأجهزة المرتبطة</span>
                <span className="lang-en">Linked Devices</span>
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
                        <span className="lang-ar">{device.name}</span>
                        <span className="lang-en">
                          {device.nameEn ?? device.name}
                        </span>
                      </span>
                      <span className="mt-2 block leading-6">
                        <span className="lang-ar">{device.excerpt}</span>
                        <span className="lang-en">
                          {device.excerptEn ?? device.excerpt}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm">
                    <span className="lang-ar">
                      لا توجد أجهزة مرتبطة بهذه الخدمة حاليًا.
                    </span>
                    <span className="lang-en">
                      No devices are currently linked to this service.
                    </span>
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
