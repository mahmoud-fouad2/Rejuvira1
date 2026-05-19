"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  excerpt: string;
  description: string;
  coverImageUrl: string;
  benefits: string[];
};

type Category = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug?: string;
  description?: string | null;
};

type CategoryGroup = {
  category: Category;
  services: Service[];
};

type Props = {
  categoryGroups: CategoryGroup[];
  remainingServices: Service[];
};

const ALL_KEY = "__all__";

export function ServicesGrid({ categoryGroups, remainingServices }: Props) {
  const [activeTab, setActiveTab] = useState<string>(ALL_KEY);

  const allGroups: CategoryGroup[] = [
    ...categoryGroups,
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
      : allGroups.filter((g) => g.category.id === activeTab);

  const totalServices = allGroups.reduce((s, g) => s + g.services.length, 0);

  return (
    <div className="flex flex-col gap-10">
      {/* ── Tab strip ─────────────────────────────────── */}
      <div className="services-tab-strip" role="tablist" aria-label="أقسام الخدمات">
        <button
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

      {/* ── Category sections ─────────────────────────── */}
      <div className="flex flex-col gap-16">
        {visibleGroups.map(({ category, services }) => (
          <section key={category.id}>
            {activeTab === ALL_KEY && (
              <div className="mb-6 flex items-center gap-4">
                <div>
                  <p className="eyebrow">
                    <span className="lang-ar">قسم</span>
                    <span className="lang-en">Category</span>
                  </p>
                  <h2 className="text-ink mt-1.5 font-serif text-3xl leading-tight tracking-[-0.02em]">
                    <span className="lang-ar">{category.name}</span>
                    <span className="lang-en">{category.nameEn ?? category.name}</span>
                  </h2>
                </div>
                <div className="border-line h-px flex-1 border-t" />
                <span className="border-line bg-surface text-ink-faint rounded-full border px-3 py-1 text-xs">
                  {services.length}
                </span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card group">
      {/* Image */}
      <div className="service-card__image">
        <Image
          src={service.coverImageUrl}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="service-card__category-chip">
          {service.category}
        </span>
      </div>

      {/* Body */}
      <div className="service-card__body">
        <h3 className="text-ink font-serif text-xl leading-snug tracking-[-0.015em]">
          {service.name}
        </h3>
        <p className="text-ink-soft mt-2.5 line-clamp-2 text-sm leading-6">
          {service.excerpt}
        </p>

        {service.benefits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {service.benefits.slice(0, 3).map((b) => (
              <span
                key={b}
                className="border-line bg-canvas text-ink-faint inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px]"
              >
                <span className="bg-gold inline-block h-1 w-1 rounded-full" />
                {b}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/services/${service.slug}`}
          className="service-card__cta"
          aria-label={`تفاصيل خدمة ${service.name}`}
        >
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
        </Link>
      </div>
    </article>
  );
}
