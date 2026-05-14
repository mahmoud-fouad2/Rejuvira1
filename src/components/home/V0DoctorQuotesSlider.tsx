"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import type { DoctorRecord, HomePageSettings } from "@/lib/content-repository";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSnapCarousel } from "@/lib/use-snap-carousel";

type V0DoctorQuotesSliderProps = {
  homepage: HomePageSettings;
  doctors: readonly DoctorRecord[];
};

export function V0DoctorQuotesSlider({ homepage, doctors }: V0DoctorQuotesSliderProps) {
  const { lang } = useLanguage();
  const slides = doctors.filter((d) => d.summary.trim().length > 0);
  const {
    ref,
    next,
    prev,
    slideProps,
    viewportProps,
  } = useSnapCarousel(slides.length, {
    autoplayMs: 6500,
    autoplayResumeAfterMs: 8000,
    loop: true,
    snap: "center",
    direction: "rtl",
  });

  if (slides.length === 0) return null;

  const prevLabel = lang === "en" ? "Previous quote" : "المقولة السابقة";
  const nextLabel = lang === "en" ? "Next quote" : "المقولة التالية";

  return (
    <section className="rv-v0-section rv-v0-doctor-quotes-section" aria-labelledby="rv-doctor-quotes-heading">
      <div className="rv-v0-section-title">
        <span className="rv-v0-pill">
          <span className="lang-ar">{homepage.quotesEyebrow}</span>
          <span className="lang-en">{homepage.quotesEyebrowEn}</span>
        </span>
        <h2 id="rv-doctor-quotes-heading">
          <span className="lang-ar">{homepage.quotesTitle}</span>
          <span className="lang-en">{homepage.quotesTitleEn}</span>
        </h2>
        <p>
          <span className="lang-ar">{homepage.quotesDescription}</span>
          <span className="lang-en">{homepage.quotesDescriptionEn}</span>
        </p>
      </div>

      <div className="rv-v0-doc-quotes-shell">
        <button
          type="button"
          className="rv-v0-doc-quotes-nav rv-v0-doc-quotes-nav-prev focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={prevLabel}
          onClick={prev}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div ref={ref} className="rv-v0-doc-quotes-viewport" {...viewportProps}>
          {slides.map((doctor, i) => (
            <article key={doctor.id} className="rv-v0-doc-quote-slide" {...slideProps(i)}>
              <div className="rv-v0-doc-quote-card">
                <span className="rv-v0-doc-quote-mark" aria-hidden>
                  ”
                </span>
                <p className="rv-v0-doc-quote-text">{doctor.summary}</p>
                <footer className="rv-v0-doc-quote-footer">
                  <div className="rv-v0-doc-quote-avatar">
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      width={52}
                      height={52}
                      sizes="52px"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="rv-v0-doc-quote-meta">
                    <strong>{doctor.name}</strong>
                    <span>{doctor.title}</span>
                    <Link href={(`/doctors/${doctor.slug}`) as Route} className="rv-v0-doc-quote-link">
                      <span className="lang-ar">الملف الطبي</span>
                      <span className="lang-en">Profile</span>
                      <span aria-hidden> ←</span>
                    </Link>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="rv-v0-doc-quotes-nav rv-v0-doc-quotes-nav-next focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
          aria-label={nextLabel}
          onClick={next}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
