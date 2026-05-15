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
  const [featuredDoctor, ...otherDoctors] = doctors;
  const doctorsJsonLd = buildCollectionPageJsonLd({
    path: "/doctors",
    name: "فريق الأطباء في Rejuvira Center",
    description:
      "ملفات أطباء بتخصصات الجلدية والتجميل الطبي داخل Rejuvira Center في الرياض.",
  });

  return (
    <div className="relative z-10 min-h-screen animate-fade-in">
      <Script
        id="doctors-collection-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorsJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        {/* ═══ HERO + FEATURED ═══ */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 lg:p-12">
            <p className="eyebrow"><span className="lang-ar">فريقنا الطبي</span><span className="lang-en">Medical Team</span></p>
            <h1 className="balanced-text mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] text-ink">
              <span className="lang-ar">ملفات الأطباء والتخصصات المتاحة بصورة مباشرة وواضحة.</span>
              <span className="lang-en">Doctor profiles and specialties presented clearly.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-soft">
              <span className="lang-ar">يوضح هذا القسم تخصص كل طبيب، سنوات الخبرة، والخدمات المرتبطة به دون عناصر مشتتة لا تخدم قرار الاختيار.</span>
              <span className="lang-en">Review each doctor's specialty, experience, and related services without distracting content.</span>
            </p>

            {/* Stats row */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "أطباء مختارون", labelEn: "Selected doctors", value: doctors.length },
                { label: "تخصصات دقيقة", labelEn: "Specialties", value: new Set(doctors.map((d) => d.specialty)).size },
                { label: "لغات الخدمة", labelEn: "Service languages", value: new Set(doctors.flatMap((d) => d.languages)).size },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface-panel rounded-[1.8rem] p-6 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <p className="text-sm font-medium text-ink-soft"><span className="lang-ar">{stat.label}</span><span className="lang-en">{stat.labelEn}</span></p>
                  <p className="mt-2 font-serif text-3xl text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
          </article>

          {featuredDoctor ? (
            <article className="surface-panel overflow-hidden rounded-[2.5rem] p-5">
              <div className="grid h-full gap-5 lg:grid-cols-[0.84fr_1.16fr]">
                <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem]">
                  <Image
                    src={mediaSelections.doctorsHero || featuredDoctor.coverImageUrl}
                    alt={featuredDoctor.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-all duration-700 hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-surface p-8">
                  <div>
                    <p className="eyebrow"><span className="lang-ar">الطبيب المميز</span><span className="lang-en">Featured Doctor</span></p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em] text-ink">
                      {featuredDoctor.name}
                    </h2>
                    <p className="mt-3 font-serif text-lg text-ink-soft">
                      {featuredDoctor.title}
                    </p>
                    <p className="mt-5 text-base leading-8 text-ink-soft">
                      {featuredDoctor.summary}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-line bg-surface p-5 text-sm">
                      <span className="eyebrow block"><span className="lang-ar">التخصص</span><span className="lang-en">Specialty</span></span>
                      <span className="mt-2 block font-medium text-ink">{featuredDoctor.specialty}</span>
                    </div>
                    <div className="rounded-[1.5rem] border border-line bg-surface p-5 text-sm">
                      <span className="eyebrow block"><span className="lang-ar">سنوات الخبرة</span><span className="lang-en">Experience</span></span>
                      <span className="mt-2 block font-medium text-ink">{featuredDoctor.yearsExperience} <span className="lang-ar">سنوات خبرة</span><span className="lang-en">years</span></span>
                    </div>
                  </div>
                  <Link
                    href={`/doctors/${featuredDoctor.slug}`}
                    className="btn-primary self-start"
                  >
                    <span className="lang-ar">اكتشفي ملف الطبيب</span>
                    <span className="lang-en">View doctor profile</span>
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        {/* ═══ DOCTORS GRID ═══ */}
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {otherDoctors.map((doctor) => (
            <article
              key={doctor.id}
              className="surface-panel overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="group relative h-80 overflow-hidden">
                <Image
                  src={doctor.coverImageUrl}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 1280px) 50vw, 30vw"
                  className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
                    {doctor.yearsExperience} <span className="lang-ar">سنوات خبرة</span><span className="lang-en">years</span>
                  </Badge>
                  <Badge variant="outline" size="md">
                    {doctor.languages.join(" / ")}
                  </Badge>
                </div>
                <p className="mt-5 text-base leading-7 text-ink-soft">
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
