import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { getMediaSelections, getServices } from "@/lib/content-repository";
import { buildCollectionPageJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "services", path: "/services" });
}

export default async function ServicesPage() {
  const [services, mediaSelections] = await Promise.all([
    getServices(),
    getMediaSelections(),
  ]);
  const [featuredService, ...otherServices] = services;
  const categoryCount = new Set(services.map((s) => s.category)).size;

  const collectionJsonLd = buildCollectionPageJsonLd({
    path: "/services",
    name: "خدمات Rejuvira Center الطبية والتجميلية",
    description:
      "خدمات معتمدة في الجلدية والتجميل الطبي بإشراف أطباء داخل مركز ريجوفيرا في الرياض.",
  });

  return (
    <div className="relative z-10 min-h-screen animate-fade-in">
      <Script
        id="services-collection-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        {/* ═══ HERO + FEATURED ═══ */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 lg:p-12">
            <p className="eyebrow">الخدمات</p>
            <h1 className="balanced-text mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] text-ink">
              خدمات علاجية وتجميلية مصاغة لتسهيل الاختيار بثقة ووضوح.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-soft">
              يعرض هذا القسم كل خدمة مع تعريف مهني مختصر، فئتها، وأبرز فوائدها، بما يساعد على المقارنة قبل طلب الاستشارة.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "الخدمات المتاحة", value: services.length },
                { label: "الأقسام", value: categoryCount },
                { label: "مناسبة لـ", value: "بشرة ووجه" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface-panel rounded-[1.8rem] p-6 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <p className="text-sm font-medium text-ink-soft">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-serif text-3xl text-ink">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {featuredService ? (
            <article className="surface-panel overflow-hidden rounded-[2.5rem] p-5">
              <div className="grid h-full gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem]">
                  <Image
                    src={
                      mediaSelections.servicesHero ||
                      featuredService.coverImageUrl
                    }
                    alt={featuredService.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover transition-all duration-700 hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-surface p-8">
                  <div>
                    <p className="eyebrow">الخدمة المميزة</p>
                    <h2 className="mt-4 font-serif text-4xl leading-snug tracking-[-0.02em] text-ink">
                      {featuredService.name}
                    </h2>
                    <Badge variant="gold" size="md" className="mt-3">
                      {featuredService.category}
                    </Badge>
                    <p className="mt-5 text-base leading-8 text-ink-soft">
                      {featuredService.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredService.benefits.slice(0, 3).map((benefit) => (
                      <Badge key={benefit} variant="outline" size="md">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    href={`/services/${featuredService.slug}`}
                    className="btn-primary self-start"
                  >
                    تفاصيل الخدمة المميزة
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        {/* ═══ SERVICES GRID ═══ */}
        <section className="grid gap-6 xl:grid-cols-2">
          {otherServices.map((service, i) => (
            <article
              key={service.id}
              className="surface-panel overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] lg:grid lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div
                className="relative min-h-[22rem] overflow-hidden"
                style={{ animationDelay: `${100 + 100 * i}ms` }}
              >
                <Image
                  src={service.coverImageUrl}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-all duration-700 hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <p className="eyebrow text-ink-soft">{service.category}</p>
                <h2 className="mt-4 font-serif text-3xl leading-[1.2] tracking-[-0.02em] text-ink">
                  {service.name}
                </h2>
                <p className="mt-4 text-base leading-7 text-ink-soft">
                  {service.excerpt}
                </p>

                {/* Benefits */}
                {service.benefits.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.benefits.slice(0, 3).map((benefit) => (
                      <div
                        key={benefit}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-ink-soft"
                      >
                        <span className="h-1 w-1 rounded-full bg-gold" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/services/${service.slug}`}
                  className="btn-primary mt-8 self-start"
                >
                  تفاصيل الخدمة
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
