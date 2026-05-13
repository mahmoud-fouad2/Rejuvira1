"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SectionIntro } from "@/components/layout/SectionIntro";

interface Doctor {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  summary: string;
  yearsExperience: number;
  coverImageUrl: string;
  photoUrl: string;
}

/**
 * Doctors Section — Stacked cards with hover expansion
 */
export function DoctorsSection({ doctors }: { doctors: Doctor[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (doctors.length === 0) return null;

  return (
    <section className="py-[var(--space-section)] bg-[var(--beige-warm)]">
      <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
        <div className="mb-16 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionIntro
            eyebrowAr="فريقنا الطبي"
            eyebrowEn="Our Medical Team"
            titleAr="خبراء يجمعون بين العلم والاهتمام"
            titleEn="Experts Combining Science & Care"
          />
          <Link href="/doctors" className="desktop-only shrink-0 self-end text-sm font-[400] text-purple-mid transition-colors hover:text-purple-rich">
            <span className="lang-ar">جميع الأطباء</span>
            <span className="lang-en">All Doctors</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline rtl-flip mr-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Desktop: Stacked cards */}
        <div className="desktop-only grid grid-cols-4 gap-5">
          {doctors.slice(0, 4).map((doc) => {
            const isHovered = hoveredId === doc.id;
            return (
              <Link
                key={doc.id}
                href={`/doctors/${doc.slug}`}
                className="group relative overflow-hidden rounded-[2.8rem] bg-surface transition-all duration-500"
                style={{
                  boxShadow: isHovered ? "0 32px 80px rgba(44,26,74,0.1)" : "0 12px 40px rgba(44,26,74,0.04)",
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  gridColumn: isHovered ? "span 2" : "span 1",
                }}
                onMouseEnter={() => setHoveredId(doc.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={doc.coverImageUrl} alt={doc.name} fill sizes="280px" className="scale-105 object-cover transition-all duration-[1.5s] group-hover:scale-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/80 via-purple-deep/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <p className="text-[10px] tracking-widest text-gold-light/70 uppercase">{doc.specialty}</p>
                    <h3 className="mt-2 font-display-en text-2xl font-[200] tracking-[-0.02em] text-white">{doc.name}</h3>
                    {isHovered && (
                      <div className="mt-4 animate-fade-up">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                          {doc.yearsExperience} <span className="lang-ar">سنة خبرة</span><span className="lang-en">Years Exp.</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {isHovered && (
                  <div className="p-6 animate-fade-up">
                    <p className="line-clamp-3 text-sm leading-7 text-text-secondary">{doc.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-[400] text-purple-mid">
                      <span className="lang-ar">عرض الملف الطبي</span>
                      <span className="lang-en">View Profile</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="mobile-only flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {doctors.slice(0, 4).map((doc) => (
            <Link key={doc.id} href={`/doctors/${doc.slug}`} className="group relative flex-shrink-0 w-[260px] snap-start">
              <div className="overflow-hidden rounded-[2.4rem] bg-surface shadow-[0_12px_40px_rgba(44,26,74,0.04)]">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={doc.coverImageUrl} alt={doc.name} fill sizes="260px" className="scale-105 object-cover transition-all duration-[1.5s] group-hover:scale-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/80 via-purple-deep/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[10px] tracking-widest text-gold-light/70 uppercase">{doc.specialty}</p>
                    <h3 className="mt-1 font-display-en text-xl font-[200] text-white">{doc.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <span className="inline-flex items-center gap-2 text-xs text-purple-mid">
                    {doc.yearsExperience} <span className="lang-ar">سنة خبرة</span><span className="lang-en">Years Exp.</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center mobile-only">
          <Link href="/doctors" className="btn-primary">
            <span className="lang-ar">جميع الأطباء</span>
            <span className="lang-en">All Doctors</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl-flip"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
