import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
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
      title: "الخدمة غير موجودة",
    };
  }

  return {
    title: service.name,
    description: service.excerpt,
    keywords: [
      service.name,
      service.category,
      "ريجوفيرا",
      "Rejuvera Medical Center",
      "مركز تجميل الرياض",
      "Aesthetic clinic Riyadh",
      ...service.doctorSlugs,
      ...service.deviceSlugs,
    ],
    openGraph: {
      title: service.name,
      description: service.excerpt,
      images: [service.coverImageUrl],
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

  return (
    <div className="min-h-screen">
      <Script
        id={`service-structured-data-${service.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalProcedure",
            name: service.name,
            description: service.excerpt,
            image: service.coverImageUrl,
            url: `${getSiteUrl()}/services/${service.slug}`,
            procedureType: service.category,
          }),
        }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">{service.category}</p>
            <h1 className="text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              {service.name}
            </h1>
            <p className="text-ink-soft mt-6 text-lg leading-8">
              {service.description}
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">الفئة</p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {service.category}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">الأطباء</p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {relatedDoctors.length}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">التقنيات</p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  {Math.max(relatedDevices.length, 1)}
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {service.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="border-line bg-surface text-ink-soft rounded-[1.4rem] border px-5 py-4 text-sm"
                >
                  {benefit}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                احجزي استشارة لهذه الخدمة
              </Link>
              <Link href="/journal" className="btn-secondary">
                اقرأ مقالات مرتبطة
              </Link>
            </div>
          </article>
          <div className="surface-panel overflow-hidden rounded-[2.5rem] p-5 shadow-sm">
            <div className="grid h-full gap-5">
              <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem]">
                <Image
                  src={service.coverImageUrl}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))] p-6 shadow-sm">
                  <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                    خطة العلاج
                  </p>
                  <p className="text-ink-strong mt-4 font-serif text-3xl leading-snug tracking-[-0.02em]">
                    تقييم منظم يحدد مدى ملاءمة الخدمة وخطواتها المتوقعة قبل
                    البدء.
                  </p>
                </div>
                <div className="relative min-h-56 overflow-hidden rounded-[2rem]">
                  <Image
                    src={
                      relatedDoctors[0]?.photoUrl ??
                      "/media/curated/doctor-team.jpg"
                    }
                    alt={
                      relatedDoctors[0]?.name ??
                      `مشهد مرتبط بخدمة ${service.name}`
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, 24vw"
                    className="bg-[radial-gradient(circle_at_top,rgba(201,162,106,0.2),rgba(255,255,255,0.98))] object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">نبذة عن الخدمة</p>
            <h2 className="text-ink-strong mt-5 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              ليست كل خدمة مناسبة لكل حالة، ولذلك يبدأ القرار من التقييم الهادئ.
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              يقدم هذا القسم ملخصًا واضحًا عن نطاق الخدمة، ما الذي تعالجه، وكيف
              يتم تحديد ملاءمتها للحالة قبل اعتمادها ضمن الخطة العلاجية.
            </p>
          </article>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-10">
              <p className="eyebrow text-ink-soft">الأطباء المناسبون</p>
              <div className="mt-6 grid gap-4">
                {relatedDoctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/doctors/${doctor.slug}`}
                    className="border-line bg-surface text-ink-soft hover:text-ink rounded-[1.5rem] border px-5 py-5 text-sm transition-colors"
                  >
                    <span className="text-ink-strong block font-semibold">
                      {doctor.name}
                    </span>
                    <span className="mt-2 block leading-6">
                      {doctor.specialty}
                    </span>
                  </Link>
                ))}
              </div>
            </article>
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-10">
              <p className="eyebrow text-ink-soft">الأجهزة الداعمة</p>
              <div className="mt-6 grid gap-4">
                {relatedDevices.length > 0 ? (
                  relatedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm"
                    >
                      <span className="text-ink-strong block font-semibold">
                        {device.name}
                      </span>
                      <span className="mt-2 block leading-6">
                        {device.excerpt}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm">
                    يتم اعتماد الجهاز المناسب بعد مراجعة الحالة وتحديد الأولوية
                    العلاجية.
                  </div>
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
