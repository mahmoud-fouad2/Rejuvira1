"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

  const allGroups: CategoryGroup[] = [
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
  ];

  const visibleGroups =
    activeTab === ALL_KEY
      ? allGroups
      : allGroups.filter((group) => group.category.id === activeTab);

  const totalServices = allGroups.reduce(
    (sum, group) => sum + group.services.length,
    0,
  );

  return (
    <div className="flex flex-col gap-10">
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
          <span className="services-tab__count">{totalServices}</span>
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

      <div className="flex flex-col gap-16">
        {visibleGroups.map(({ category, services }) => (
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="service-card__category-chip">{service.category}</span>
      </div>

      <div className="service-card__body">
        <h3 className="text-ink font-serif text-xl leading-snug tracking-[-0.015em]">
          {service.name}
        </h3>
        <p className="text-ink-soft mt-2.5 line-clamp-2 text-sm leading-6">
          {service.excerpt}
        </p>

        {benefits.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {benefits.map((benefit) => (
              <span
                key={benefit}
                className="border-line bg-canvas text-ink-faint inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px]"
              >
                <span className="bg-gold inline-block h-1 w-1 rounded-full" />
                {benefit}
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
