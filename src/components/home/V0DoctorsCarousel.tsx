"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import type { ReactNode } from "react";

import type { DoctorRecord } from "@/lib/content-repository";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSnapCarousel } from "@/lib/use-snap-carousel";

type V0DoctorsCarouselProps = {
  doctors: readonly DoctorRecord[];
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
      <path d="m12 2 3 6.91 7.1.62-5.4 4.72 1.66 7.05L12 17.77 5.64 21.3 7.3 14.25 1.9 9.53 9 8.91Z" />
    </svg>
  );
}

function ArrowIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  if (dir === "left") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const defaultEyebrow = (
  <>
    <span className="lang-ar">فريقنا الطبي المتميز</span>
    <span className="lang-en">Featured specialists</span>
  </>
);

const defaultTitle = (
  <>
    <span className="lang-ar">أطباء واستشاريون يفهمون التفاصيل</span>
    <span className="lang-en">Physicians who understand the details</span>
  </>
);

const defaultDescription = (
  <>
    <span className="lang-ar">
      كل ملف يبرز التخصص وأعوام الخبرة واللغات والخدمات المرتبطة — بصياغة هادئة كما ستجدينها في العيادة.
    </span>
    <span className="lang-en">
      Each profile highlights specialty, experience, languages, and related services — presented as you would find them in the clinic.
    </span>
  </>
);

export function V0DoctorsCarousel({
  doctors,
  eyebrow = defaultEyebrow,
  title = defaultTitle,
  description = defaultDescription,
}: V0DoctorsCarouselProps) {
  const { lang } = useLanguage();
  const slides = useMemo(() => doctors.slice(0, 8), [doctors]);
  const {
    ref,
    index,
    canPrev,
    canNext,
    next,
    prev,
    scrollTo,
    slideProps,
    viewportProps,
  } = useSnapCarousel(slides.length, {
    autoplayMs: 6500,
    autoplayResumeAfterMs: 9000,
    loop: true,
    snap: "start",
    direction: "rtl",
  });

  if (slides.length === 0) return null;

  const prevLabel = lang === "en" ? "Previous doctor" : "السابق";
  const nextLabel = lang === "en" ? "Next doctor" : "التالي";
  const dotSheet = lang === "en" ? "Choose doctor slide" : "اختيار البطاقة";

  return (
    <section className="rv-doctors-section" aria-labelledby="rv-doctors-heading">
      <header className="rv-doctors-head">
        <span className="rv-v0-pill">{eyebrow}</span>
        <h2 id="rv-doctors-heading">{title}</h2>
        <p>{description}</p>
      </header>

      <div className="rv-doctors-shell">
        <button
          type="button"
          className="rv-doctors-nav rv-doctors-nav-prev focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={prevLabel}
          onClick={prev}
          disabled={!canPrev}
        >
          <ArrowIcon dir="left" />
        </button>

        <div
          ref={ref}
          className="rv-doctors-viewport"
          aria-labelledby="rv-doctors-heading"
          {...viewportProps}
        >
          <ul className="rv-doctors-track">
            {slides.map((doctor, i) => (
              <li key={doctor.id} className="rv-doctors-slide" {...slideProps(i)}>
                <Link
                  href={(`/doctors/${doctor.slug}`) as Route}
                  className="rv-doctor-card"
                >
                  <span className="rv-doctor-card-photo">
                    <Image
                      src={doctor.photoUrl || doctor.coverImageUrl}
                      alt={doctor.name}
                      fill
                      sizes="(max-width: 720px) 78vw, (max-width: 1100px) 38vw, 22rem"
                      className="object-cover object-top"
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                    {doctor.featured && doctor.slug === "loai-alsalmi" ? (
                      <span className="rv-doctor-card-top-rated">
                        <StarIcon />
                        <span className="lang-ar">مميز</span>
                        <span className="lang-en">Featured</span>
                      </span>
                    ) : null}
                    <span className="rv-doctor-card-exp text-[10px]" aria-hidden>
                      <span className="lang-ar">{doctor.yearsExperience}+ سنة</span>
                      <span className="lang-en">{doctor.yearsExperience}+ yrs</span>
                    </span>
                  </span>
                  <div className="rv-doctor-card-body">
                    <small>{doctor.specialty}</small>
                    <strong>{doctor.name}</strong>
                    <span className="rv-doctor-card-title">{doctor.title}</span>

                    {doctor.languages.length > 0 ? (
                      <ul
                        className="rv-doctor-card-langs"
                        aria-label={lang === "en" ? "Languages" : "اللغات"}
                      >
                        {doctor.languages.slice(0, 3).map((code) => (
                          <li key={code}>{code}</li>
                        ))}
                      </ul>
                    ) : null}

                    <span className="rv-doctor-card-cta">
                      <span className="lang-ar">الملف الطبي</span>
                      <span className="lang-en">Profile</span>
                      <span aria-hidden> ←</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="rv-doctors-nav rv-doctors-nav-next focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={nextLabel}
          onClick={next}
          disabled={!canNext}
        >
          <ArrowIcon dir="right" />
        </button>
      </div>

      <div className="rv-doctors-dots" role="tablist" aria-label={dotSheet}>
        {slides.map((doctor, i) => (
          <button
            key={doctor.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? "is-active" : ""}
            aria-label={lang === "en" ? `${doctor.name} slide` : `بطاقة ${doctor.name}`}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>

      <div className="rv-doctors-foot">
        <Link href="/doctors" className="rv-doctors-all">
          <span className="lang-ar">استعرضي جميع الأطباء</span>
          <span className="lang-en">View all doctors</span>
          <span aria-hidden> ←</span>
        </Link>
      </div>
    </section>
  );
}
