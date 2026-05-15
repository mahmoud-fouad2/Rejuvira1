"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type {
  DeviceRecord,
  DoctorRecord,
  ServiceRecord,
} from "@/lib/content-repository";

type SiteMegaMenuProps = {
  triggerLabel: string;
  services: readonly ServiceRecord[];
  doctors: readonly DoctorRecord[];
  devices: readonly DeviceRecord[];
};

type Column = {
  titleAr: string;
  titleEn: string;
  items: ReadonlyArray<{
    title: string;
    subtitle: string;
    href: Route;
    image: string;
  }>;
};

const ChevronIcon = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className="rv-mega-trigger-chev"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function SiteMegaMenu({
  triggerLabel,
  services,
  doctors,
  devices,
}: SiteMegaMenuProps) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Close on outside click and Escape; restore focus to trigger.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const columns: Column[] = [
    {
      titleAr: "خدماتنا",
      titleEn: "Services",
      items: services.slice(0, 4).map((service) => ({
        title: service.name,
        subtitle: service.category,
        href: `/services/${service.slug}` as Route,
        image: service.coverImageUrl,
      })),
    },
    {
      titleAr: "الأطباء",
      titleEn: "Doctors",
      items: doctors.slice(0, 4).map((doctor) => ({
        title: doctor.name,
        subtitle: doctor.specialty,
        href: `/doctors/${doctor.slug}` as Route,
        image: doctor.photoUrl || doctor.coverImageUrl,
      })),
    },
    {
      titleAr: "الأجهزة",
      titleEn: "Devices",
      items: devices.slice(0, 4).map((device) => ({
        title: device.name,
        subtitle: device.certifications[0] ?? "تقنية معتمدة",
        href: "/devices" as Route,
        image: device.imageUrl,
      })),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="rv-mega-shell"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <button
        type="button"
        className="rv-mega-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span>{lang === "en" ? "Services" : triggerLabel}</span>
        {ChevronIcon}
      </button>

      <div
        className="rv-mega-panel"
        data-open={open || undefined}
        role="menu"
        aria-label={lang === "en" ? "Services mega menu" : triggerLabel}
      >
        <div className="rv-mega-grid">
          {columns.map((column) => (
            <div key={`${column.titleAr}-${column.titleEn}`} className="rv-mega-col">
              <p className="rv-mega-col-title">
                <span className="lang-ar">{column.titleAr}</span>
                <span className="lang-en">{column.titleEn}</span>
              </p>
              {column.items.length === 0 ? (
                <p className="text-xs text-[color:var(--rv-muted)]">
                  <span className="lang-ar">لا توجد عناصر منشورة بعد.</span>
                  <span className="lang-en">No published items yet.</span>
                </p>
              ) : (
                column.items.map((item) => (
                  <Link
                    key={`${column.titleAr}-${item.title}`}
                    href={item.href}
                    role="menuitem"
                    className="rv-mega-link"
                    onClick={() => setOpen(false)}
                  >
                    <span className="rv-mega-thumb">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="42px"
                        loading="lazy"
                      />
                    </span>
                    <span className="rv-mega-link-text">
                      <span className="rv-mega-link-title">{item.title}</span>
                      <span className="rv-mega-link-sub">{item.subtitle}</span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          ))}

          {/* Feature CTA column */}
          <div className="rv-mega-feature" role="presentation">
            <p className="rv-mega-feature-eyebrow">
              <span className="lang-ar">احجزي استشارتك</span>
              <span className="lang-en">Book a consultation</span>
            </p>
            <div>
              <p className="rv-mega-feature-title">
                <span className="lang-ar">خطة طبية واضحة تبدأ من تقييم دقيق للحالة</span>
                <span className="lang-en">A clear plan begins with a careful assessment</span>
              </p>
              <p style={{ marginTop: "0.45rem", fontSize: "0.82rem", opacity: 0.86, lineHeight: 1.55 }}>
                <span className="lang-ar">
                  أرسلي طلبك ليصلك تأكيد من فريق الاستقبال خلال ساعات العمل.
                </span>
                <span className="lang-en">
                  Send a request and the front desk will confirm during business hours.
                </span>
              </p>
            </div>
            <Link
              href="/contact"
              className="rv-mega-feature-cta"
              onClick={() => setOpen(false)}
            >
              <span className="lang-ar">ابدئي الآن</span>
              <span className="lang-en">Get started</span>
              <span aria-hidden>←</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
