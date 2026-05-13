import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionIntro } from "@/components/layout/SectionIntro";
import { getRuntimeSettings, getServices, getDoctors } from "@/lib/content-repository";

import { HeroSection } from "@/components/sections/HeroSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { WhyRejuvera } from "@/components/sections/WhyRejuvera";
import { GalleryBeforeAfter } from "@/components/sections/GalleryBeforeAfter";
import { DoctorsSection } from "@/components/sections/DoctorsSection";
import { EquipmentSection } from "@/components/sections/EquipmentSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TestimonialCarousel } from "@/components/ui/new/TestimonialCarousel";

/* ═══════════════════════════════════════════════════════════
   REJUVIRA · Precision Luxury Homepage 2027
   Modular sections · Fully bilingual · CMS-driven
   ═══════════════════════════════════════════════════════════ */
export default async function HomePage() {
  const [settings, services, doctors] = await Promise.all([
    getRuntimeSettings(),
    getServices(),
    getDoctors(),
  ]);

  const { media } = settings;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--beige-warm)] text-text-primary selection:bg-purple-mid/20">
      {/* Fixed progress bar */}
      <div className="scroll-progress" />

      <SiteHeader />

      <main>
        {/* 01 — HERO · Full-screen cinematic multi-layer */}
        <HeroSection settings={settings} doctorsCount={doctors.length} />

        {/* 02 — STATS · Premium glass bar with animated counters */}
        <StatsBar />

        {/* 03 — PHILOSOPHY · Signature section */}
        <section className="py-[var(--space-section)]">
          <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8 lg:pl-6">
                <SectionIntro
                  eyebrowAr="فلسفتنا"
                  eyebrowEn="Our Philosophy"
                  titleAr={
                    <>
                      نؤمن بتوازن{" "}
                      <span className="bg-gradient-to-r from-purple-rich via-purple-mid to-purple-light bg-clip-text text-transparent">
                        الدقة العلمية
                      </span>{" "}
                      والنتيجة الطبيعية
                    </>
                  }
                  titleEn={
                    <>
                      We Believe in the Balance of{" "}
                      <span className="bg-gradient-to-r from-purple-rich via-purple-mid to-purple-light bg-clip-text text-transparent">
                        Scientific Precision
                      </span>{" "}
                      and Natural Beauty
                    </>
                  }
                />
                <div className="h-px w-16 bg-gold/50" />
                <p className="text-balance text-lg leading-9 text-text-secondary lg:text-xl lg:leading-10">
                  <span className="lang-ar">كل إجراء تجميلي في ريفيورا يبدأ بتشخيص دقيق وينتهي بنتيجة تحترم طبيعتك. لا مبالغة، لا وعود زائفة — فقط خبرة طبية حقيقية.</span>
                  <span className="lang-en">Every aesthetic procedure at Rejuvera begins with accurate diagnosis and ends with a result that respects your natural beauty.</span>
                </p>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-[3.5rem] bg-surface p-3 shadow-[0_32px_80px_rgba(44,26,74,0.1)]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.8rem]">
                    <div className="parallax-slow absolute inset-0 bg-[url('/media/about-hero.jpg')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/60 via-purple-deep/5 to-transparent" />
                    <div className="absolute bottom-6 right-6">
                      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-xl">
                        <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_16px_rgba(200,151,58,0.5)]" />
                        <span className="text-[10px] tracking-widest text-white/60 uppercase">Precision · Care · Nature</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 — SERVICES · Bento Grid + Magnetic hover */}
        <ServicesBento services={services} />

        {/* 05 — WHY REJUVENA · 3 core values */}
        <WhyRejuvera />

        {/* 06 — GALLERY · Before/After slider full-width */}
        <GalleryBeforeAfter media={media} />

        {/* 07 — DOCTORS · Stacked cards with hover expansion */}
        <DoctorsSection doctors={doctors} />

        {/* 08 — TESTIMONIALS · Auto-rotate carousel */}
        <section className="py-[var(--space-section)]">
          <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
            <SectionIntro
              className="mb-16"
              eyebrowAr="آراء عميلاتنا"
              eyebrowEn="Client Testimonials"
              titleAr="ثقة تصنع الفرق"
              titleEn="Trust Makes the Difference"
            />
            <TestimonialCarousel />
          </div>
        </section>

        {/* 09 — EQUIPMENT · Medical devices showcase */}
        <EquipmentSection />

        {/* 10 — CTA · Full-width purple dark with gold */}
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
