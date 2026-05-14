"use client";

import Image from "next/image";
import Link from "next/link";

import { SectionIntro } from "@/components/layout/SectionIntro";
import { MagneticCard } from "@/components/ui/new/MagneticCard";

interface Service {
  id: string;
  slug: string;
  name: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
}

/**
 * Services Bento Grid — Desktop: bento layout, Mobile: horizontal scroll
 * Cards have magnetic hover effect
 */
export function ServicesBento({ services }: { services: Service[] }) {
  // Take first 5 for bento layout
  const items = services.slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section id="services" className="scroll-mt-32 py-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
        <SectionIntro
          className="mb-16"
          eyebrowAr="خدماتنا المميزة"
          eyebrowEn="Signature Treatments"
          titleAr="أحدث التقنيات في مكان واحد"
          titleEn="Cutting-Edge Technology Under One Roof"
        />

        {/* Desktop Bento Grid (hidden on mobile) */}
        <div className="desktop-only">
          <div className="grid grid-cols-3 gap-5" style={{ gridTemplateRows: "1fr 1fr" }}>
            {/* First service — large (spans 2 rows, 1 col) */}
            {items[0] && (
              <div className="row-span-2">
                <MagneticCard className="service-card h-full">
                  <Link href={`/services/${items[0].slug}`} className="group block h-full">
                    <div className="relative h-full min-h-[500px] overflow-hidden rounded-[2rem]">
                      <Image src={items[0].coverImageUrl} alt={items[0].name} fill sizes="40vw" className="scale-105 object-cover transition-all duration-[1.8s] group-hover:scale-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/80 via-purple-deep/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-8">
                        <p className="text-[10px] tracking-widest text-gold-light/70 uppercase">{items[0].category}</p>
                        <h3 className="mt-2 heading-serif text-3xl font-light tracking-[-0.02em] text-white">{items[0].name}</h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/60">{items[0].excerpt}</p>
                      </div>
                    </div>
                  </Link>
                </MagneticCard>
              </div>
            )}

            {/* Remaining services — 2x2 grid */}
            <div className="col-span-2 grid grid-cols-2 gap-5">
              {items.slice(1).map((svc) => (
                <MagneticCard key={svc.id} className="service-card">
                  <Link href={`/services/${svc.slug}`} className="group block h-full">
                    <div className="relative h-full min-h-[240px] overflow-hidden rounded-[2rem]">
                      <Image src={svc.coverImageUrl} alt={svc.name} fill sizes="25vw" className="scale-105 object-cover transition-all duration-[1.8s] group-hover:scale-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/80 via-purple-deep/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p className="text-[10px] tracking-widest text-gold-light/70 uppercase">{svc.category}</p>
                        <h3 className="mt-1 heading-serif text-xl font-light tracking-[-0.02em] text-white">{svc.name}</h3>
                      </div>
                    </div>
                  </Link>
                </MagneticCard>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="mobile-only flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {items.map((svc, i) => (
            <Link key={svc.id} href={`/services/${svc.slug}`}
              className="group relative flex-shrink-0 w-[280px] snap-start overflow-hidden rounded-[2rem] bg-surface"
              style={{ animation: `fadeUp 0.7s ${0.08 * i}s var(--ease-out) both` }}>
              <div className="relative h-64 overflow-hidden">
                <Image src={svc.coverImageUrl} alt={svc.name} fill sizes="280px" className="scale-105 object-cover transition-all duration-[1.5s] group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/70 via-purple-deep/5 to-transparent" />
                <div className="absolute bottom-0 right-0 p-6">
                  <p className="text-[10px] tracking-widest text-gold-light/70 uppercase">{svc.category}</p>
                  <h3 className="mt-1 heading-serif text-xl font-light text-white">{svc.name}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="line-clamp-2 text-sm leading-7 text-text-secondary">{svc.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-[400] text-purple-mid transition-all group-hover:gap-3">
                  <span className="lang-ar">اكتشفي الخدمة</span>
                  <span className="lang-en">Discover</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        {services.length > 5 && (
          <div className="mt-12 text-center">
            <Link href="/services" className="btn-primary">
              <span className="lang-ar">عرض جميع الخدمات ({services.length})</span>
              <span className="lang-en">View All Services ({services.length})</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl-flip"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
