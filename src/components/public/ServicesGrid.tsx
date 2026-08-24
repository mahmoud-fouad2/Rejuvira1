"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

import type {
  ServiceCategoryRecord,
  ServiceRecord,
} from "@/lib/content-repository";

type CategoryLike = {
  id: string;
  name: string;
  nameEn?: string | null;
};

type CategoryGroup = {
  category: CategoryLike;
  services: readonly ServiceRecord[];
};

type Props = {
  categoryGroups: ReadonlyArray<{
    category: ServiceCategoryRecord;
    services: readonly ServiceRecord[];
  }>;
  remainingServices: readonly ServiceRecord[];
};

const ALL_KEY = "__all__";

export function ServicesGrid({ categoryGroups, remainingServices }: Props) {
  const [activeTab, setActiveTab] = useState<string>(ALL_KEY);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allGroups: CategoryGroup[] = useMemo(
    () => [
      ...categoryGroups.map((group) => ({
        category: {
          id: group.category.id,
          name: group.category.name,
          nameEn: group.category.nameEn ?? null,
        },
        services: group.services,
      })),
      ...(remainingServices.length > 0
        ? [
            {
              category: {
                id: "uncategorized",
                name: "خدمات أخرى",
                nameEn: "Other services",
              },
              services: remainingServices,
            },
          ]
        : []),
    ],
    [categoryGroups, remainingServices],
  );

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    const tabFiltered =
      activeTab === ALL_KEY
        ? allGroups
        : allGroups.filter((group) => group.category.id === activeTab);

    if (!cleanQuery) return tabFiltered;

    return tabFiltered
      .map((group) => ({
        ...group,
        services: group.services.filter((service) => {
          const searchable = [
            service.name,
            service.nameEn ?? "",
            service.category,
            service.categoryEn ?? "",
            service.excerpt,
            service.excerptEn ?? "",
            ...(service.keywordsAr ?? []),
            ...(service.keywordsEn ?? []),
            ...(service.benefits ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return searchable.includes(cleanQuery);
        }),
      }))
      .filter((group) => group.services.length > 0);
  }, [activeTab, allGroups, cleanQuery]);

  const totalServices = allGroups.reduce(
    (sum, group) => sum + group.services.length,
    0,
  );

  const matchedCount = filteredGroups.reduce(
    (sum, group) => sum + group.services.length,
    0,
  );

  return (
    <div className="flex flex-col gap-10">
      {/* ── Search & Filter Controls ─────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن خدمة (مثل: شد وجه، ليزر، فيلر...)"
            className="w-full min-h-[46px] ps-10 pe-10 rounded-2xl border border-purple-900/15 bg-surface text-ink text-sm shadow-sm placeholder:text-ink-faint focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 end-3 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              aria-label="مسح البحث"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>

        <div
          className="services-tab-strip"
          role="tablist"
          aria-label="أقسام الخدمات"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === ALL_KEY}
            className={`services-tab ${activeTab === ALL_KEY ? "services-tab--active" : ""}`}
            onClick={() => setActiveTab(ALL_KEY)}
          >
            <span className="lang-ar">كل الخدمات</span>
            <span className="lang-en">All services</span>
            <span className="services-tab__count">
              {cleanQuery ? matchedCount : totalServices}
            </span>
          </button>

          {allGroups.map(({ category }) => (
            <button
              type="button"
              key={category.id}
              role="tab"
              aria-selected={activeTab === category.id}
              className={`services-tab ${activeTab === category.id ? "services-tab--active" : ""}`}
              onClick={() => setActiveTab(category.id)}
            >
              <span className="lang-ar">{category.name}</span>
              <span className="lang-en">{category.nameEn ?? category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Services Grid / Groups ──────────────────────── */}
      {filteredGroups.length > 0 ? (
        <div className="flex flex-col gap-16">
          {filteredGroups.map(({ category, services }) => (
            <section key={category.id}>
              {activeTab === ALL_KEY ? (
                <div className="mb-6 flex items-center gap-4">
                  <div>
                    <p className="eyebrow">
                      <span className="lang-ar">قسم</span>
                      <span className="lang-en">Category</span>
                    </p>
                    <h2 className="text-ink mt-1.5 font-serif text-3xl leading-tight tracking-[-0.02em]">
                      <span className="lang-ar">{category.name}</span>
                      <span className="lang-en">
                        {category.nameEn ?? category.name}
                      </span>
                    </h2>
                  </div>
                  <div className="border-line h-px flex-1 border-t" />
                  <span className="border-line bg-surface text-ink-faint rounded-full border px-3 py-1 text-xs">
                    {services.length}
                  </span>
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="surface-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-ink font-serif text-2xl">
            <span className="lang-ar">لا توجد خدمات مطابقة لبحثك</span>
            <span className="lang-en">No services matched your search</span>
          </p>
          <p className="text-ink-soft text-sm max-w-md">
            <span className="lang-ar">
              جرّب استخدام كلمات أخرى مثل &quot;نضارة&quot; أو &quot;شد&quot; أو اختر من الأقسام أعلاه.
            </span>
            <span className="lang-en">
              Try searching with different terms or select from the categories above.
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveTab(ALL_KEY);
            }}
            className="btn-secondary mt-2"
          >
            <span className="lang-ar">عرض كل الخدمات</span>
            <span className="lang-en">Show all services</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceRecord }) {
  const benefits = service.benefits.slice(0, 3);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="service-card group"
      aria-label={`تفاصيل خدمة ${service.name}`}
    >
      <div className="service-card__image rv-service-art-frame">
        <Image
          src={service.coverImageUrl}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="rv-service-art-img"
        />
        <div className="service-card__image-scrim" aria-hidden />
        <span className="service-card__category-chip">
          <span className="lang-ar">{service.category}</span>
          <span className="lang-en">
            {service.categoryEn ?? service.category}
          </span>
        </span>
        <h3 className="service-card__image-title">
          <span className="lang-ar">{service.name}</span>
          <span className="lang-en">{service.nameEn ?? service.name}</span>
        </h3>
      </div>

      <div className="service-card__body">
        <p className="text-ink-soft line-clamp-3 text-sm leading-6">
          <span className="lang-ar">{service.excerpt}</span>
          <span className="lang-en">
            {service.excerptEn ?? service.excerpt}
          </span>
        </p>

        {benefits.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {benefits.map((benefit, index) => (
              <span
                key={benefit}
                className="border-line bg-canvas text-ink-faint inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px]"
              >
                <span className="bg-gold inline-block h-1 w-1 rounded-full" />
                <span className="lang-ar">{benefit}</span>
                <span className="lang-en">
                  {service.benefitsEn?.[index] ?? benefit}
                </span>
              </span>
            ))}
          </div>
        ) : null}

        <span className="service-card__cta">
          <span className="lang-ar">عرض التفاصيل</span>
          <span className="lang-en">View details</span>
          <svg
            className="service-card__cta-arrow"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
