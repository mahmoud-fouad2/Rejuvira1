import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { ServicesGrid } from "@/components/public/ServicesGrid";
import {
  getMediaSelections,
  getServiceCategories,
  getServices,
} from "@/lib/content-repository";
import { buildCollectionPageJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "services", path: "/services" });
}

export default async function ServicesPage() {
  const [allServices, allCategories, mediaSelections] = await Promise.all([
    getServices(),
    getServiceCategories(),
    getMediaSelections(),
  ]);
  const services = allServices.filter(
    (service) => service.status === ContentStatus.PUBLISHED,
  );
  const categories = allCategories.filter(
    (category) => category.status === ContentStatus.PUBLISHED,
  );
  const [featuredService] = services;
  const categoryCount = new Set(services.map((s) => s.category)).size;
  const categoryGroups = categories
    .map((category) => ({
      category,
      services: services.filter(
        (service) =>
          service.categoryId === category.id ||
          service.categorySlug === category.slug ||
          service.category === category.name,
      ),
    }))
    .filter((group) => group.services.length > 0);
  const groupedServiceIds = new Set(
    categoryGroups.flatMap((group) =>
      group.services.map((service) => service.id),
    ),
  );
  const remainingServices = services.filter(
    (service) => !groupedServiceIds.has(service.id),
  );

  const collectionJsonLd = buildCollectionPageJsonLd({
    path: "/services",
    name: "خدمات Rejuvera Center الطبية والتجميلية",
    description:
      "خدمات معتمدة في الجلدية والتجميل الطبي بإشراف أطباء داخل مركز ريجوفيرا في الرياض.",
  });

  return (
    <div className="animate-fade-in relative z-10 min-h-screen">
      <script
        id="services-collection-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        {/* ═══ HERO + FEATURED ═══ */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 lg:p-12">
            <p className="eyebrow">
              <span className="lang-ar">الخدمات</span>
              <span className="lang-en">Services</span>
            </p>
            <h1 className="balanced-text text-ink mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">
                خدمات طبية وتجميلية متكاملة لوجهك وجسمك.
              </span>
              <span className="lang-en">
                Integrated medical aesthetic services for face and body.
              </span>
            </h1>
            <p className="text-ink-soft mt-5 max-w-3xl text-lg leading-8">
              <span className="lang-ar">
                يضم المركز خدمات طبية وتجميلية متكاملة، تشمل العناية بالبشرة،
                الليزر، الحقن، وتجميل الجسم — موضحة بتفاصيل واضحة تساعد على
                الاختيار.
              </span>
              <span className="lang-en">
                Explore skin care, laser, injectables, and body aesthetic
                services with clear details that support confident choices.
              </span>
            </p>

            {/* Stats row */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "الخدمات المتاحة",
                  labelEn: "Available services",
                  value: services.length,
                },
                {
                  label: "الأقسام",
                  labelEn: "Categories",
                  value: categoryCount,
                },
                {
                  label: "تغطي الوجه والجسم",
                  labelEn: "Face and body",
                  value: "وجه وجسم",
                  valueEn: "Face & body",
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
                    <span className="lang-ar">{stat.value}</span>
                    <span className="lang-en">
                      {"valueEn" in stat ? stat.valueEn : stat.value}
                    </span>
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
                <div className="bg-surface flex flex-col justify-between gap-5 rounded-[2rem] p-8">
                  <div>
                    <p className="eyebrow">
                      <span className="lang-ar">الخدمة المميزة</span>
                      <span className="lang-en">Featured Service</span>
                    </p>
                    <h2 className="text-ink mt-4 font-serif text-4xl leading-snug tracking-[-0.02em]">
                      {featuredService.name}
                    </h2>
                    <Badge variant="gold" size="md" className="mt-3">
                      {featuredService.category}
                    </Badge>
                    <p className="text-ink-soft mt-5 text-base leading-8">
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
                    <span className="lang-ar">تفاصيل الخدمة المميزة</span>
                    <span className="lang-en">View featured service</span>
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        {/* ═══ SERVICES BY CATEGORY ═══ */}
        <ServicesGrid
          categoryGroups={categoryGroups}
          remainingServices={remainingServices}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
