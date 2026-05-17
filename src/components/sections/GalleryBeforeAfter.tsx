"use client";

import { BeforeAfterSlider } from "@/components/ui/new/BeforeAfterSlider";
import Image from "next/image";

import { SectionIntro } from "@/components/layout/SectionIntro";

/**
 * Gallery Before/After — full-width slider with reveal
 * Uses the draggable BeforeAfterSlider component
 */
export function GalleryBeforeAfter({ media }: { media: any }) {
  return (
    <section id="gallery" className="scroll-mt-32 py-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
        <SectionIntro
          className="mb-16"
          eyebrowAr="نتائج حقيقية"
          eyebrowEn="Real Results"
          titleAr="الفرق واضح — بين أيدٍ أمينة"
          titleEn="The Difference is Clear — In Safe Hands"
        />

        {/* Full-width slider */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <BeforeAfterSlider
            beforeSrc={media.aboutHero}
            afterSrc={media.servicesHero}
            beforeLabel="قبل"
            afterLabel="بعد"
            className="lg:aspect-auto lg:h-full"
          />

          <div className="grid gap-6">
            {/* Side cards */}
            {[
              {
                src: media.servicesHero,
                labelAr: "نحت القوام",
                labelEn: "Body Contouring",
                descAr: "نتائج نحت ثلاثي الأبعاد",
                descEn: "3D body sculpting results",
              },
              {
                src: media.aboutHero,
                labelAr: "تجديد البشرة",
                labelEn: "Skin Rejuvenation",
                descAr: "إشراقة ونضارة تدوم",
                descEn: "Lasting radiance and glow",
              },
            ].map((item) => (
              <div
                key={item.labelAr}
                className="group bg-surface relative overflow-hidden rounded-[2.4rem] shadow-[0_12px_40px_rgba(44,26,74,0.04)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="30vw"
                    className="scale-105 object-cover transition-all duration-700 group-hover:scale-100"
                  />
                  <div className="from-purple-deep/50 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <div className="absolute right-6 bottom-5">
                    <p className="text-sm font-[400] text-white/90">
                      <span className="lang-ar">{item.labelAr}</span>
                      <span className="lang-en">{item.labelEn}</span>
                    </p>
                    <p className="text-xs text-white/50">
                      <span className="lang-ar">{item.descAr}</span>
                      <span className="lang-en">{item.descEn}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
