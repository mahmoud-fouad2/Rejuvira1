import { SectionIntro } from "@/components/layout/SectionIntro";

/**
 * Why Rejuvera — 3 core values with elegant icons
 * Clean, minimal cards with subtle hover
 */
const values = [
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-purple-mid"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    titleAr: "نتائج طبيعية",
    titleEn: "Natural Results",
    descAr: "تحسين يحترم ملامحك الطبيعية دون مبالغة، بتقنيات دقيقة وآمنة.",
    descEn:
      "Enhancement that respects your natural features, with precise and safe techniques.",
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-purple-mid"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    titleAr: "رعاية شخصية",
    titleEn: "Personalized Care",
    descAr: "كل خطة علاجية تُصمم خصيصاً لتناسب احتياجاتك الفردية وتوقعاتك.",
    descEn:
      "Every treatment plan is tailored specifically to your individual needs and expectations.",
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-purple-mid"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    titleAr: "خبرة موثقة",
    titleEn: "Documented Expertise",
    descAr: "فريق طبي متخصص يشرف على كل خطوة، مع متابعة دقيقة للنتائج.",
    descEn:
      "A specialist medical team oversees every step, with careful follow-up on results.",
  },
];

export function WhyRejuvera() {
  return (
    <section className="py-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
        <SectionIntro
          className="mb-16"
          eyebrowAr="لماذا ريفيورا"
          eyebrowEn="Why Rejuvera"
          titleAr="ثلاثة أسباب تمنحك الثقة"
          titleEn="Three Reasons for Your Confidence"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.titleAr}
              className="surface-panel group px-8 py-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="bg-purple-ghost/50 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                {v.icon}
              </div>
              <h3 className="heading-serif text-2xl font-[200] tracking-[-0.02em]">
                <span className="lang-ar">{v.titleAr}</span>
                <span className="lang-en">{v.titleEn}</span>
              </h3>
              <p className="text-text-secondary mt-4 text-sm leading-8">
                <span className="lang-ar">{v.descAr}</span>
                <span className="lang-en">{v.descEn}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
