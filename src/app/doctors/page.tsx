import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { getDoctors, getMediaSelections } from "@/lib/content-repository";
import { buildCollectionPageJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "doctors", path: "/doctors" });
}

export default async function DoctorsPage() {
  const [doctors, mediaSelections] = await Promise.all([
    getDoctors(),
    getMediaSelections(),
  ]);
  const featuredDoctorsCount = doctors.filter(
    (doctor) => doctor.featured,
  ).length;
  const heroImage = mediaSelections.doctorsHero;
  const doctorsJsonLd = buildCollectionPageJsonLd({
    path: "/doctors",
    name: "فريق الأطباء في Rejuvera Center",
    description:
      "ملفات أطباء بتخصصات الجلدية والتجميل الطبي داخل Rejuvera Center في الرياض.",
  });

  return (
    <div className="animate-fade-in relative z-10 min-h-screen">
      <Script
        id="doctors-collection-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorsJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 lg:p-12">
            <p className="eyebrow">
              <span className="lang-ar">فريقنا الطبي</span>
              <span className="lang-en">Medical Team</span>
            </p>
            <h1 className="balanced-text text-ink mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">
                ملفات الأطباء والتخصصات المتاحة بصورة مباشرة وواضحة.
              </span>
              <span className="lang-en">
                Doctor profiles and specialties presented clearly.
              </span>
            </h1>
            <p className="text-ink-soft mt-5 max-w-3xl text-lg leading-8">
              <span className="lang-ar">
                يوضح هذا القسم تخصص كل طبيب، سنوات الخبرة، والخدمات المرتبطة به
                دون عناصر مشتتة لا تخدم قرار الاختيار.
              </span>
              <span className="lang-en">
                Review each doctor's specialty, experience, and related services
                without distracting content.
              </span>
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "أطباء متاحون",
                  labelEn: "Available doctors",
                  value: doctors.length,
                },
                {
                  label: "تخصصات دقيقة",
                  labelEn: "Specialties",
                  value: new Set(doctors.map((d) => d.specialty)).size,
                },
                {
                  label: "أطباء مميزون",
                  labelEn: "Featured doctors",
                  value: featuredDoctorsCount,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface-panel rounded-[1.8rem] p-6 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <p className="text-ink-soft text-sm font-medium">
                    <span className="lang-ar">{stat.label}</span>
                    <span className="lang-en">{stat.labelEn}</span>
                  </p>
                  <p className="text-ink mt-2 font-serif text-3xl">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-panel overflow-hidden rounded-[2.5rem] p-5">
            <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem]">
              <Image
                src={heroImage}
                alt="Rejuvera medical team"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-all duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
                <p className="eyebrow text-white/80">
                  <span className="lang-ar">غلاف القسم</span>
                  <span className="lang-en">Section cover</span>
                </p>
                <h2 className="mt-3 font-serif text-4xl leading-[1.15] tracking-[-0.02em]">
                  <span className="lang-ar">كل الأطباء بنفس الحضور البصري</span>
                  <span className="lang-en">
                    Every doctor gets the same visual weight
                  </span>
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/85">
                  <span className="lang-ar">
                    الصورة هنا تمثل القسم كاملًا، بينما تظهر علامة المميز كتاج
                    صغير داخل بطاقة الطبيب فقط.
                  </span>
                  <span className="lang-en">
                    This image represents the full section; featured doctors are
                    marked only with a small badge.
                  </span>
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="surface-panel overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="group relative h-80 overflow-hidden">
                <Image
                  src={doctor.photoUrl || doctor.coverImageUrl}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 1280px) 50vw, 30vw"
                  className="object-cover object-top transition-all duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {doctor.featured ? (
                  <span className="absolute end-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#9a6a12] shadow-lg">
                    <span aria-hidden>★</span>
                    <span className="lang-ar">مميز</span>
                    <span className="lang-en">Featured</span>
                  </span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 z-10 p-8">
                  <p className="text-sm text-white/80">{doctor.specialty}</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-white">
                    {doctor.name}
                  </h2>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" size="md">
                    {doctor.yearsExperience}{" "}
                    <span className="lang-ar">سنوات خبرة</span>
                    <span className="lang-en">years</span>
                  </Badge>
                  {doctor.languages.length > 0 ? (
                    <Badge variant="outline" size="md">
                      {doctor.languages.join(" / ")}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-ink-soft mt-5 text-base leading-7">
                  {doctor.summary}
                </p>
                <Link
                  href={`/doctors/${doctor.slug}`}
                  className="btn-secondary mt-8 inline-flex"
                >
                  <span className="lang-ar">افتحي ملف الطبيب</span>
                  <span className="lang-en">View doctor profile</span>
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
