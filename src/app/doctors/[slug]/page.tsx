import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDoctorBySlug, getServices } from "@/lib/content-repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "الطبيب غير موجود",
    };
  }

  return {
    title: doctor.name,
    description: doctor.summary,
    openGraph: {
      title: doctor.name,
      description: doctor.summary,
      images: [doctor.coverImageUrl],
    },
  };
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doctor, services] = await Promise.all([
    getDoctorBySlug(slug),
    getServices(),
  ]);

  if (!doctor) {
    notFound();
  }

  const relatedServices = services.filter((service) =>
    doctor.serviceSlugs.includes(service.slug),
  );

  return (
    <div className="min-h-screen">
      <Script
        id={`doctor-structured-data-${doctor.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            name: doctor.name,
            description: doctor.summary,
            image: doctor.photoUrl,
            medicalSpecialty: doctor.specialty,
            url: `https://rejuveracenter.com/doctors/${doctor.slug}`,
            availableLanguage: doctor.languages,
          }),
        }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-panel overflow-hidden rounded-[2.5rem] p-5 shadow-sm">
            <div className="grid h-full gap-5">
              <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem]">
                <Image
                  src={doctor.coverImageUrl}
                  alt={`مشهد علاجي مرتبط بتخصص ${doctor.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="relative z-0 bg-[radial-gradient(circle_at_top,rgba(201,162,106,0.2),rgba(255,255,255,0.98))] object-contain p-6"
                />
                <div className="from-ink-strong/30 absolute inset-0 z-10 bg-gradient-to-t to-transparent mix-blend-multiply" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative min-h-44 overflow-hidden rounded-[2rem]">
                  <Image
                    src={doctor.photoUrl}
                    alt={`صورة توضيحية مرتبطة بتخصص ${doctor.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 22vw"
                    className="relative z-0 bg-[radial-gradient(circle_at_top,rgba(201,162,106,0.2),rgba(255,255,255,0.98))] object-contain p-4"
                  />
                  <div className="from-ink-strong/40 absolute inset-0 z-10 bg-gradient-to-t to-transparent mix-blend-multiply" />
                </div>
                <div className="bg-surface rounded-[2rem] p-6 shadow-sm">
                  <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                    ملاحظة تخصصية
                  </p>
                  <p className="text-ink-strong mt-4 font-serif text-3xl leading-snug tracking-[-0.02em]">
                    خبرة سريرية تعطي الأولوية للتشخيص الواضح والخطة المناسبة.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">الملف الطبي</p>
            <h1 className="text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              {doctor.name}
            </h1>
            <p className="text-ink-soft mt-4 font-serif text-xl">
              {doctor.title}
            </p>
            <p className="text-ink-soft mt-6 text-lg leading-8">{doctor.bio}</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">التخصص</p>
                <p className="text-ink-strong mt-2 font-serif text-lg">
                  {doctor.specialty}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">اللغات</p>
                <p className="text-ink-strong mt-2 font-serif text-lg">
                  {doctor.languages.join(" / ")}
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">الخبرة</p>
                <p className="text-ink-strong mt-2 font-serif text-lg">
                  {doctor.yearsExperience} سنوات
                </p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">
                احجز استشارة مع الطبيب
              </Link>
              <Link href="/services" className="btn-secondary">
                استعرض الخدمات
              </Link>
            </div>
          </article>
        </section>
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft">الرؤية العلاجية</p>
            <h2 className="text-ink-strong mt-5 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              رعاية تبدأ من قراءة الحالة قبل التفكير في الإجراء.
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              يعتمد هذا الملف على إبراز طريقة التفكير العلاجي للطبيب: متى تكون
              الخدمة مناسبة، وما الذي يجب شرحه قبلها، وكيف يبنى القرار على فهم
              واضح لا على استعجال.
            </p>
            <div className="mt-8 grid gap-4">
              {doctor.publications.map((item) => (
                <div
                  key={item}
                  className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-5 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
              <p className="eyebrow text-ink-soft">التأهيل والخبرة</p>
              <div className="mt-6 grid gap-4">
                {doctor.education.map((item) => (
                  <div
                    key={item}
                    className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-4 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
              <p className="eyebrow text-ink-soft">محطات مميزة</p>
              <div className="mt-6 grid gap-4">
                {doctor.achievements.map((item) => (
                  <div
                    key={item}
                    className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-4 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
            <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
              <p className="eyebrow text-ink-soft">الخدمات المرتبطة</p>
              <div className="mt-6 grid gap-4">
                {relatedServices.length > 0 ? (
                  relatedServices.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="border-line bg-surface text-ink-soft hover:text-ink-strong rounded-[1.5rem] border px-5 py-4 text-sm transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))
                ) : (
                  <div className="border-line bg-surface text-ink-soft rounded-[1.5rem] border px-5 py-4 text-sm">
                    لم يتم ربط خدمات علاجية محددة بهذا الملف بعد، ويمكن تحديثها
                    من لوحة التحكم عند الحاجة.
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
