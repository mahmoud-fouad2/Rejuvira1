import type { ReactNode } from "react";

type SectionIntroProps = {
  eyebrowAr: string;
  eyebrowEn: string;
  titleAr: ReactNode;
  titleEn: ReactNode;
  leadAr?: ReactNode;
  leadEn?: ReactNode;
  className?: string;
  /** extra margin below block (e.g. testimonials grid) */
  titleClassName?: string;
};

/**
 * Unified section header for public pages — rhythm, bilingual labels, trust-forward typography.
 */
export function SectionIntro({
  eyebrowAr,
  eyebrowEn,
  titleAr,
  titleEn,
  leadAr,
  leadEn,
  className = "",
  titleClassName = "",
}: SectionIntroProps) {
  return (
    <header className={`max-w-2xl ${className}`}>
      <p className="section-intro-eyebrow">
        <span className="lang-ar">{eyebrowAr}</span>
        <span className="lang-en">{eyebrowEn}</span>
      </p>
      <h2
        className={`section-intro-title scroll-reveal heading-serif ${titleClassName}`}
      >
        <span className="lang-ar">{titleAr}</span>
        <span className="lang-en">{titleEn}</span>
      </h2>
      {(leadAr || leadEn) && (
        <p className="section-intro-lead text-text-secondary text-lg leading-9 text-pretty lg:text-xl lg:leading-10">
          {leadAr ? <span className="lang-ar">{leadAr}</span> : null}
          {leadEn ? <span className="lang-en">{leadEn}</span> : null}
        </p>
      )}
    </header>
  );
}
