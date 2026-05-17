import Link from "next/link";

/**
 * Final CTA — deep clinical backdrop with inset glass panel (2026+ treatment).
 */
export function FinalCTA() {
  return (
    <section className="bg-purple-deep noise-overlay relative overflow-hidden py-[var(--space-section)]">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[min(60vw,42rem)] w-[min(60vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(72%_0.12_75_/_0.06),transparent_68%)]" />
      <div className="via-gold/25 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="via-gold/12 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,oklch(22%_0.12_295_/_0.12)_45%,transparent_90%)] opacity-60" />

      <div className="relative mx-auto max-w-[var(--narrow-width)] px-6">
        <div className="rounded-[2.75rem] border border-white/[0.09] bg-white/[0.045] px-8 py-14 shadow-[0_40px_100px_oklch(0%_0_0_/_0.35)] backdrop-blur-md md:px-14 md:py-16">
          <div className="text-center">
            <span className="text-gold/55 inline-flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.42em] uppercase">
              <span className="to-gold/40 h-px w-10 bg-gradient-to-l from-transparent" />
              <span className="lang-ar">ابدئي رحلتك</span>
              <span className="lang-en">Begin Your Journey</span>
              <span className="to-gold/40 h-px w-10 bg-gradient-to-r from-transparent" />
            </span>

            <h2 className="scroll-reveal heading-serif text-cream mt-8 leading-[1.06] font-[200] tracking-[-0.04em] text-[var(--text-display)]">
              <span className="lang-ar">
                ابدئي رحلتك نحو
                <br />
                <span className="from-gold via-gold-light to-gold bg-gradient-to-r bg-clip-text text-transparent">
                  النسخة الأفضل من نفسك
                </span>
              </span>
              <span className="lang-en">
                Start Your Journey Toward
                <br />
                <span className="from-gold via-gold-light to-gold bg-gradient-to-r bg-clip-text text-transparent">
                  The Best Version of You
                </span>
              </span>
            </h2>

            <p className="text-beige/55 mx-auto mt-10 max-w-xl text-lg leading-9 text-balance lg:text-xl lg:leading-10">
              <span className="lang-ar">
                فريقنا الطبي جاهز للإجابة عن كل استفساراتك وتوجيهك نحو الخطة
                الأنسب لاحتياجاتك الفردية.
              </span>
              <span className="lang-en">
                Our medical team is ready to answer your questions and guide you
                to the plan that fits your goals.
              </span>
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-5">
              <Link href="/contact" className="btn-gold group text-base">
                <span className="lang-ar">احجزي استشارتك المجانية</span>
                <span className="lang-en">Book Free Consultation</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="rtl-flip transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/services"
                className="btn-glass text-beige/65 hover:border-gold/35 hover:text-cream border-white/18 hover:bg-white/12"
              >
                <span className="lang-ar">استعرضي الخدمات</span>
                <span className="lang-en">View Services</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
